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
  total_price numeric not null default 0,
  deposit_amount numeric not null default 0,
  final_balance numeric not null default 0,
  calculated_breakdown jsonb,
  needs_manual_distance_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quote_requests
  add column if not exists selected_quote_option_id uuid references quote_options(id);

create index if not exists quote_options_quote_request_id_idx on quote_options(quote_request_id);
create index if not exists quote_options_status_idx on quote_options(status);
create index if not exists quote_requests_selected_quote_option_id_idx on quote_requests(selected_quote_option_id);

alter table quote_options enable row level security;
