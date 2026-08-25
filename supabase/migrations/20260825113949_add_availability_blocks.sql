-- Operational availability commitments that are independent of customer quotes.
-- The version matches the migration already recorded by the connected project.
-- Date ranges are inclusive and remain separate from quote_requests.

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date not null,
  end_date date not null,
  block_type text not null,
  availability_effect text not null,
  organization_name text,
  notes text,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  cancelled_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  conflict_override_at timestamptz,
  conflict_override_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_blocks_title_length
    check (length(btrim(title)) between 1 and 160),
  constraint availability_blocks_valid_range
    check (end_date >= start_date),
  constraint availability_blocks_reasonable_range
    check ((end_date - start_date) <= 366),
  constraint availability_blocks_type_check
    check (block_type in (
      'partner_booking',
      'maintenance',
      'owner_unavailable',
      'equipment_unavailable',
      'other'
    )),
  constraint availability_blocks_effect_check
    check (availability_effect in ('hard_block', 'soft_hold')),
  constraint availability_blocks_status_check
    check (status in ('active', 'cancelled'))
);

create index if not exists availability_blocks_active_range_idx
  on public.availability_blocks (start_date, end_date)
  where status = 'active';

create index if not exists availability_blocks_upcoming_idx
  on public.availability_blocks (end_date, start_date)
  where status = 'active';

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

  -- Use the same per-date lock namespace as quote booking transitions.
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

-- Preserve one real quote booking per date, but allow pending leads to be
-- captured on dates that already have a booking or an operational block.
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
