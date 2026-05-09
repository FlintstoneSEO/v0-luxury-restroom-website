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
  total_price numeric,

  status text default 'pending_review',
  calculated_breakdown jsonb,

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
  approved_at timestamptz,
  customer_response text,
  customer_response_type text,
  customer_response_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create index if not exists idx_quote_requests_status on quote_requests(status);
create index if not exists idx_quote_requests_event_date on quote_requests(event_date);
create index if not exists idx_quote_requests_email on quote_requests(email);
create index if not exists idx_quote_requests_approval_token_hash on quote_requests(approval_token_hash);
create index if not exists idx_quote_approval_tokens_token_hash on quote_approval_tokens(token_hash);
create index if not exists idx_quote_approval_tokens_quote_request_id on quote_approval_tokens(quote_request_id);
create index if not exists idx_quote_status_history_quote_request_id on quote_status_history(quote_request_id);
