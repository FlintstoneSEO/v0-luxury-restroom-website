-- Phase 1 quote request schema alignment migration.
-- Run manually in Supabase SQL editor if your project is not wired to CLI migrations.
-- Safe to run multiple times because of IF NOT EXISTS / ADD COLUMN IF NOT EXISTS usage.

create extension if not exists pgcrypto;

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  event_date date not null,
  event_type text not null,
  event_location text not null,
  guest_count int not null,
  event_start_time text,
  event_end_time text,
  event_notes text,
  has_electrical_access boolean not null default false,
  has_water_access boolean not null default false,
  setup_notes text,
  base_price numeric not null default 0,
  delivery_fee numeric not null default 0,
  add_ons_total numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  deposit_amount numeric not null default 0,
  remaining_balance numeric not null default 0,
  status text not null default 'new',
  internal_notes text,
  customer_notes text,
  approval_token text,
  quote_sent_at timestamptz,
  customer_approved_at timestamptz,
  agreement_status text not null default 'not_sent',
  agreement_document_url text,
  signed_agreement_url text,
  agreement_provider_reference_id text,
  agreement_sent_at timestamptz,
  agreement_signed_at timestamptz,
  deposit_status text not null default 'due',
  deposit_payment_link text,
  deposit_due_date date,
  deposit_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quote_requests add column if not exists customer_phone text;
alter table quote_requests add column if not exists customer_email text;
alter table quote_requests add column if not exists event_location text;
alter table quote_requests add column if not exists event_notes text;
alter table quote_requests add column if not exists has_electrical_access boolean not null default false;
alter table quote_requests add column if not exists has_water_access boolean not null default false;
alter table quote_requests add column if not exists setup_notes text;
alter table quote_requests add column if not exists delivery_fee numeric not null default 0;
alter table quote_requests add column if not exists add_ons_total numeric not null default 0;
alter table quote_requests add column if not exists discount numeric not null default 0;
alter table quote_requests add column if not exists tax numeric not null default 0;
alter table quote_requests add column if not exists total numeric not null default 0;
alter table quote_requests add column if not exists remaining_balance numeric not null default 0;
alter table quote_requests add column if not exists approval_token text;
alter table quote_requests add column if not exists quote_sent_at timestamptz;
alter table quote_requests add column if not exists customer_approved_at timestamptz;
alter table quote_requests add column if not exists signed_agreement_url text;

create index if not exists idx_quote_requests_status on quote_requests (status);
create index if not exists idx_quote_requests_event_date on quote_requests (event_date);
create index if not exists idx_quote_requests_customer_email on quote_requests (customer_email);
create index if not exists idx_quote_requests_approval_token on quote_requests (approval_token);
