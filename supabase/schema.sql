create extension if not exists pgcrypto;

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique,
  customer_name text,
  phone text,
  email text,
  event_date date,
  event_type text,
  guest_count int,
  event_address text,
  city text,
  state text,
  zip_code text,
  event_start_time text,
  event_end_time text,
  has_power boolean,
  has_water boolean,
  additional_notes text,
  distance_miles numeric,

  base_price numeric,
  travel_fee numeric,
  utility_fee numeric,
  after_hours_fee numeric,
  cleaning_fee numeric,
  damage_waiver_fee numeric,
  rush_booking_fee numeric,
  subtotal numeric,
  pretax_total numeric not null default 0,
  taxable_amount numeric not null default 0,
  tax_rate numeric not null default 0,
  sales_tax_amount numeric not null default 0,
  total_price numeric,

  status text default 'pending_review',
  calculated_breakdown jsonb,
  needs_manual_distance_review boolean not null default false,

  approval_token_hash text,
  approval_token_expires_at timestamptz,
  approval_token_used_at timestamptz,

  agreement_status text default 'not_sent',
  agreement_sent_at timestamptz,
  agreement_viewed_at timestamptz,
  agreement_signed_at timestamptz,
  agreement_document_url text,
  signed_document_url text,
  agreement_provider_reference_id text,

  deposit_amount numeric,
  deposit_percentage numeric not null default 0,
  deposit_status text default 'due',
  deposit_due_date date,
  deposit_paid_at timestamptz,
  deposit_paid_amount numeric,
  deposit_transaction_reference text,
  deposit_payment_link text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  final_balance numeric,
  discount_amount numeric default 0,
  quote_expires_at date,
  internal_notes text,
  customer_notes text,
  is_manual_override boolean default false,
  is_test_quote boolean not null default false,
  test_label text,
  test_source_quote_id uuid references quote_requests(id) on delete set null,
  approved_at timestamptz,
  customer_response text,
  customer_response_type text,
  customer_response_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create index if not exists quote_requests_is_test_quote_idx on quote_requests(is_test_quote);
create index if not exists quote_requests_test_source_quote_id_idx on quote_requests(test_source_quote_id);

create table if not exists quote_options (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references quote_requests(id) on delete cascade,
  option_label text not null,
  option_description text,
  is_recommended boolean not null default false,
  status text not null default 'draft',
  has_power boolean,
  has_water boolean,
  distance_miles numeric,
  base_price numeric not null default 0,
  travel_fee numeric not null default 0,
  utility_fee numeric not null default 0,
  after_hours_fee numeric not null default 0,
  cleaning_fee numeric not null default 0,
  damage_waiver_fee numeric not null default 0,
  rush_booking_fee numeric not null default 0,
  subtotal numeric not null default 0,
  discount_amount numeric not null default 0,
  pretax_total numeric not null default 0,
  taxable_amount numeric not null default 0,
  tax_rate numeric not null default 0,
  sales_tax_amount numeric not null default 0,
  total_price numeric not null default 0,
  deposit_percentage numeric not null default 0,
  deposit_amount numeric not null default 0,
  final_balance numeric not null default 0,
  calculated_breakdown jsonb,
  needs_manual_distance_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quote_requests
  add column if not exists selected_quote_option_id uuid references quote_options(id);

create table if not exists quote_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references quote_requests(id) on delete cascade,
  old_status text,
  new_status text,
  changed_at timestamptz default now(),
  changed_by text,
  note text
);

create table if not exists quote_agreements (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references quote_requests(id) on delete cascade,
  agreement_provider text,
  agreement_external_id text,
  agreement_document_url text,
  signed_document_url text,
  agreement_provider_reference_id text,
  status text default 'not_sent',
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists quote_deposits (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references quote_requests(id) on delete cascade,
  amount_due numeric not null,
  amount_paid numeric default 0,
  due_date date,
  paid_at timestamptz,
  payment_provider text,
  payment_reference text,
  status text default 'due',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists quote_approval_tokens (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references quote_requests(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now(),
  unique (quote_request_id, token_hash)
);


create table if not exists pricing_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value numeric,
  description text,
  updated_at timestamptz default now()
);

insert into pricing_settings (setting_key, setting_value, description, updated_at)
values
  ('sales_tax_percentage', 6, 'Michigan sales tax percentage applied after discounts', now()),
  ('deposit_percentage', 40, 'Standard deposit percentage applied to the tax-inclusive total', now())
on conflict (setting_key) do update
set
  setting_value = excluded.setting_value,
  description = excluded.description,
  updated_at = excluded.updated_at;

create index if not exists idx_quote_requests_status on quote_requests(status);
create index if not exists idx_quote_requests_event_date on quote_requests(event_date);
create index if not exists idx_quote_requests_email on quote_requests(email);
create index if not exists idx_quote_requests_approval_token_hash on quote_requests(approval_token_hash);
create index if not exists idx_quote_approval_tokens_token_hash on quote_approval_tokens(token_hash);
create index if not exists idx_quote_approval_tokens_quote_request_id on quote_approval_tokens(quote_request_id);
create index if not exists idx_quote_status_history_quote_request_id on quote_status_history(quote_request_id);

create index if not exists quote_options_quote_request_id_idx on quote_options(quote_request_id);
create index if not exists quote_options_status_idx on quote_options(status);
create index if not exists quote_requests_selected_quote_option_id_idx on quote_requests(selected_quote_option_id);
alter table quote_options enable row level security;

create table if not exists availability_blocks (
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
  constraint availability_blocks_title_length check (length(btrim(title)) between 1 and 160),
  constraint availability_blocks_valid_range check (end_date >= start_date),
  constraint availability_blocks_reasonable_range check ((end_date - start_date) <= 366),
  constraint availability_blocks_type_check check (block_type in ('partner_booking', 'maintenance', 'owner_unavailable', 'equipment_unavailable', 'other')),
  constraint availability_blocks_effect_check check (availability_effect in ('hard_block', 'soft_hold')),
  constraint availability_blocks_status_check check (status in ('active', 'cancelled')),
  constraint availability_blocks_partner_name_required check (
    block_type <> 'partner_booking'
    or length(btrim(coalesce(organization_name, ''))) > 0
  )
);

create index if not exists availability_blocks_active_range_idx
  on availability_blocks (start_date, end_date)
  where status = 'active';
create index if not exists availability_blocks_upcoming_idx
  on availability_blocks (end_date, start_date)
  where status = 'active';
alter table availability_blocks enable row level security;
revoke all on table availability_blocks from anon, authenticated;
grant select, insert, update, delete on table availability_blocks to service_role;
