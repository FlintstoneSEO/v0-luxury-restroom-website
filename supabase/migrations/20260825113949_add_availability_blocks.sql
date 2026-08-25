-- Manual operational commitments that participate in the existing
-- one-trailer availability model without pretending to be customer quotes.
create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date not null,
  end_date date not null,
  block_type text not null,
  availability_effect text not null,
  status text not null default 'active',
  organization_name text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint availability_blocks_valid_range check (end_date >= start_date),
  constraint availability_blocks_title_not_blank check (length(btrim(title)) > 0),
  constraint availability_blocks_type_valid check (
    block_type in ('partner_booking', 'maintenance', 'owner_unavailable', 'operational', 'other')
  ),
  constraint availability_blocks_effect_valid check (
    availability_effect in ('hard_block', 'soft_hold')
  ),
  constraint availability_blocks_status_valid check (status in ('active', 'cancelled')),
  constraint availability_blocks_partner_name_required check (
    block_type <> 'partner_booking'
    or length(btrim(coalesce(organization_name, ''))) > 0
  )
);

create index if not exists availability_blocks_active_dates_idx
  on public.availability_blocks (start_date, end_date)
  where status = 'active';

create index if not exists availability_blocks_upcoming_idx
  on public.availability_blocks (start_date)
  where status = 'active';

create index if not exists availability_blocks_created_by_idx
  on public.availability_blocks (created_by)
  where created_by is not null;

create index if not exists availability_blocks_updated_by_idx
  on public.availability_blocks (updated_by)
  where updated_by is not null;

alter table public.availability_blocks enable row level security;
revoke all on table public.availability_blocks from anon, authenticated;
grant select, insert, update, delete on table public.availability_blocks to service_role;

comment on table public.availability_blocks is
  'Admin-managed inclusive date ranges for partner commitments, maintenance, holds, and other operational unavailability.';
comment on column public.availability_blocks.availability_effect is
  'hard_block prevents reservation; soft_hold warns admins without preventing reservation.';

-- Keep pending-lead behavior for already-booked customer dates, while allowing
-- pending leads on manual blocks. Any quote that becomes reservation-blocking
-- must also be rejected when an active hard block covers its event date.
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
    'pending',
    'pending_review',
    'new',
    'under_review',
    'draft_quote',
    'quote_sent',
    'sent_to_customer',
    'change_requested'
  ) and exists (
    select 1
    from public.quote_requests blocking_quote
    where blocking_quote.event_date = new.event_date
      and blocking_quote.id <> new.id
      and coalesce(blocking_quote.is_test_quote, false) = false
      and blocking_quote.status in (
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
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'EVENT_DATE_ALREADY_BOOKED';
  end if;

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
    from public.availability_blocks availability_block
    where availability_block.status = 'active'
      and availability_block.availability_effect = 'hard_block'
      and new.event_date between availability_block.start_date and availability_block.end_date
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'EVENT_DATE_ALREADY_BOOKED';
  end if;

  return new;
end
$$;

revoke execute on function public.enforce_quote_event_date_availability()
  from public, anon, authenticated;

-- Replace the customer approval transaction so a hard manual block is checked
-- under the same date advisory lock as the existing quote-vs-quote invariant.
create or replace function public.submit_quote_response(
  p_token_id uuid,
  p_quote_id uuid,
  p_response_type text,
  p_comments text,
  p_selected_quote_option_id uuid,
  p_now timestamptz
)
returns table (
  result_ok boolean,
  result_code text,
  result_message text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  token_row public.quote_approval_tokens%rowtype;
  quote_row public.quote_requests%rowtype;
  selected_option public.quote_options%rowtype;
  previous_status text;
  next_status text;
  response_event_type text;
  response_note text;
  has_active_options boolean;
begin
  select *
  into token_row
  from public.quote_approval_tokens
  where id = p_token_id
    and quote_request_id = p_quote_id
  for update;

  if not found then
    return query select false, 'INVALID_TOKEN'::text, 'Invalid or expired quote link'::text;
    return;
  end if;

  if token_row.expires_at <= p_now then
    return query select false, 'TOKEN_EXPIRED'::text, 'This quote link has expired'::text;
    return;
  end if;

  if token_row.used_at is not null then
    return query select false, 'TOKEN_ALREADY_USED'::text, 'You have already responded to this quote'::text;
    return;
  end if;

  select *
  into quote_row
  from public.quote_requests
  where id = p_quote_id
  for update;

  if not found then
    return query select false, 'QUOTE_NOT_FOUND'::text, 'Quote not found'::text;
    return;
  end if;

  previous_status := quote_row.status;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(quote_row.event_date::text, 0)
  );

  if p_response_type = 'approved' then
    next_status := 'customer_approved';
    response_event_type := 'quote_approved';
  elsif p_response_type = 'change_requested' then
    next_status := 'change_requested';
    response_event_type := 'quote_change_requested';
  elsif p_response_type = 'declined' then
    next_status := 'declined';
    response_event_type := 'quote_declined';
  else
    return query select false, 'INVALID_RESPONSE'::text, 'Invalid response'::text;
    return;
  end if;

  if p_response_type = 'approved' and coalesce(quote_row.is_test_quote, false) = false then
    if exists (
      select 1
      from public.quote_requests other_quote
      where other_quote.event_date = quote_row.event_date
        and other_quote.id <> quote_row.id
        and coalesce(other_quote.is_test_quote, false) = false
        and other_quote.status in (
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
    ) or exists (
      select 1
      from public.availability_blocks availability_block
      where availability_block.status = 'active'
        and availability_block.availability_effect = 'hard_block'
        and quote_row.event_date between availability_block.start_date and availability_block.end_date
    ) then
      return query select
        false,
        'EVENT_DATE_ALREADY_BOOKED'::text,
        'This event date is no longer available. Please contact Signature Luxe to discuss another date.'::text;
      return;
    end if;
  end if;

  select exists (
    select 1
    from public.quote_options
    where quote_request_id = quote_row.id
      and status <> 'deleted'
  )
  into has_active_options;

  if p_response_type = 'approved' and has_active_options then
    if p_selected_quote_option_id is null then
      return query select false, 'OPTION_REQUIRED'::text, 'Please choose a quote option before approving'::text;
      return;
    end if;

    select *
    into selected_option
    from public.quote_options
    where id = p_selected_quote_option_id
      and quote_request_id = quote_row.id
      and status <> 'deleted'
    for update;

    if not found then
      return query select false, 'INVALID_OPTION'::text, 'Selected quote option is invalid'::text;
      return;
    end if;
  end if;

  update public.quote_requests
  set
    status = next_status,
    customer_response = nullif(btrim(p_comments), ''),
    customer_response_type = p_response_type,
    customer_response_at = p_now,
    updated_at = p_now,
    approved_at = case when p_response_type = 'approved' then p_now else approved_at end,
    agreement_status = case
      when p_response_type = 'approved' then 'ready_to_send'
      else agreement_status
    end
  where id = quote_row.id;

  if p_response_type = 'approved' and selected_option.id is not null then
    update public.quote_requests
    set
      selected_quote_option_id = selected_option.id,
      base_price = selected_option.base_price,
      travel_fee = selected_option.travel_fee,
      utility_fee = selected_option.utility_fee,
      after_hours_fee = selected_option.after_hours_fee,
      cleaning_fee = selected_option.cleaning_fee,
      damage_waiver_fee = selected_option.damage_waiver_fee,
      rush_booking_fee = selected_option.rush_booking_fee,
      subtotal = selected_option.subtotal,
      discount_amount = selected_option.discount_amount,
      pretax_total = selected_option.pretax_total,
      taxable_amount = selected_option.taxable_amount,
      tax_rate = selected_option.tax_rate,
      sales_tax_amount = selected_option.sales_tax_amount,
      total_price = selected_option.total_price,
      deposit_percentage = selected_option.deposit_percentage,
      deposit_amount = selected_option.deposit_amount,
      final_balance = selected_option.final_balance,
      calculated_breakdown = selected_option.calculated_breakdown
    where id = quote_row.id;

    update public.quote_options
    set
      status = case
        when id = selected_option.id then 'selected'
        else 'not_selected'
      end,
      updated_at = p_now
    where quote_request_id = quote_row.id
      and status <> 'deleted';

    response_note := 'Customer approved ' || selected_option.option_label ||
      case
        when nullif(selected_option.option_description, '') is not null
          then ': ' || selected_option.option_description
        else ''
      end;
  else
    response_note := coalesce(
      nullif(btrim(p_comments), ''),
      'Customer ' || replace(p_response_type, '_', ' ')
    );
  end if;

  update public.quote_approval_tokens
  set used_at = p_now
  where id = token_row.id;

  insert into public.quote_link_events (
    quote_request_id,
    token_id,
    event_type
  ) values (
    quote_row.id,
    token_row.id,
    response_event_type
  );

  insert into public.quote_status_history (
    quote_request_id,
    old_status,
    new_status,
    changed_at,
    changed_by,
    note
  ) values (
    quote_row.id,
    previous_status,
    next_status,
    p_now,
    'customer',
    response_note
  );

  return query select true, null::text, 'Response submitted successfully'::text;
exception
  when unique_violation then
    if p_response_type = 'approved' then
      return query select
        false,
        'EVENT_DATE_ALREADY_BOOKED'::text,
        'This event date is no longer available. Please contact Signature Luxe to discuss another date.'::text;
      return;
    end if;
    raise;
end
$$;

revoke execute on function public.submit_quote_response(
  uuid, uuid, text, text, uuid, timestamptz
) from public, anon, authenticated;

grant execute on function public.submit_quote_response(
  uuid, uuid, text, text, uuid, timestamptz
) to service_role;
