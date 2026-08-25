-- Reconcile the initially deployed availability_blocks migration with the
-- version recorded by the connected production project.
-- audited admin CRUD, conflict override, and lead-capture implementation.

alter table public.availability_blocks
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists conflict_override_at timestamptz,
  add column if not exists conflict_override_by uuid references auth.users(id) on delete set null;

alter table public.availability_blocks
  drop constraint if exists availability_blocks_title_not_blank,
  drop constraint if exists availability_blocks_title_length,
  drop constraint if exists availability_blocks_type_valid,
  drop constraint if exists availability_blocks_type_check,
  drop constraint if exists availability_blocks_reasonable_range,
  drop constraint if exists availability_blocks_partner_name_required;

alter table public.availability_blocks
  add constraint availability_blocks_title_length
    check (length(btrim(title)) between 1 and 160),
  add constraint availability_blocks_type_check
    check (block_type in (
      'partner_booking',
      'maintenance',
      'owner_unavailable',
      'equipment_unavailable',
      'other'
    )),
  add constraint availability_blocks_reasonable_range
    check ((end_date - start_date) <= 366),
  add constraint availability_blocks_partner_name_required
    check (
      block_type <> 'partner_booking'
      or length(btrim(coalesce(organization_name, ''))) > 0
    );

create index if not exists availability_blocks_cancelled_by_idx
  on public.availability_blocks (cancelled_by)
  where cancelled_by is not null;

create index if not exists availability_blocks_conflict_override_by_idx
  on public.availability_blocks (conflict_override_by)
  where conflict_override_by is not null;

alter table public.availability_blocks enable row level security;
revoke all on table public.availability_blocks from anon, authenticated;
grant select, insert, update, delete on table public.availability_blocks to service_role;

create or replace function public.validate_availability_block_commitment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  lock_date date;
begin
  if new.status <> 'active' or new.availability_effect <> 'hard_block' then
    return new;
  end if;

  for lock_date in
    select day_value::date
    from pg_catalog.generate_series(
      new.start_date::timestamp,
      new.end_date::timestamp,
      interval '1 day'
    ) as day_value
    order by day_value
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(lock_date::text, 0)
    );
  end loop;

  if new.conflict_override_at is null and (
    exists (
      select 1
      from public.quote_requests quote_row
      where quote_row.event_date between new.start_date and new.end_date
        and coalesce(quote_row.is_test_quote, false) = false
        and quote_row.status in (
          'customer_approved',
          'agreement_pending',
          'agreement_sent',
          'agreement_signed',
          'deposit_pending',
          'deposit_paid',
          'booked',
          'confirmed',
          'completed'
        )
    )
    or exists (
      select 1
      from public.availability_blocks other_block
      where other_block.id <> new.id
        and other_block.status = 'active'
        and other_block.availability_effect = 'hard_block'
        and other_block.start_date <= new.end_date
        and other_block.end_date >= new.start_date
    )
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'BLOCKING_COMMITMENT_CONFLICT';
  end if;

  return new;
end
$$;

drop trigger if exists validate_availability_block_commitment_trigger
  on public.availability_blocks;

create trigger validate_availability_block_commitment_trigger
before insert or update of start_date, end_date, availability_effect, status, conflict_override_at
on public.availability_blocks
for each row
execute function public.validate_availability_block_commitment();

revoke execute on function public.validate_availability_block_commitment()
  from public, anon, authenticated;

-- Pending quote requests remain valid leads even when another commitment owns
-- the date. Only transitions into reservation-blocking workflow states fail.
create or replace function public.enforce_quote_event_date_availability()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.event_date is null or coalesce(new.is_test_quote, false) then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.event_date::text, 0)
  );

  if new.status in (
    'customer_approved',
    'agreement_pending',
    'agreement_sent',
    'agreement_signed',
    'deposit_pending',
    'deposit_paid',
    'booked',
    'confirmed',
    'completed'
  ) and exists (
    select 1
    from public.availability_blocks blocking_record
    where blocking_record.status = 'active'
      and blocking_record.availability_effect = 'hard_block'
      and new.event_date between blocking_record.start_date and blocking_record.end_date
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'EVENT_DATE_BLOCKED';
  end if;

  return new;
end
$$;

drop trigger if exists enforce_quote_event_date_availability_trigger
  on public.quote_requests;

create trigger enforce_quote_event_date_availability_trigger
before insert or update of event_date, status, is_test_quote
on public.quote_requests
for each row
execute function public.enforce_quote_event_date_availability();

revoke execute on function public.enforce_quote_event_date_availability()
  from public, anon, authenticated;

comment on column public.availability_blocks.conflict_override_at is
  'Set only after an admin explicitly confirms an overlapping hard commitment.';
