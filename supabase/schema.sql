create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique,
  first_name text,
  last_name text,
  phone text,
  email text,
  event_date date,
  event_type text,
  event_location text,
  guest_count int,
  start_time text,
  end_time text,
  power_available text,
  water_available text,
  ada_needed text,
  trailer_interest text,
  rental_type text,
  referral_source text,
  details text,
  source_page text,
  status text default 'new',
  base_price numeric,
  travel_fee numeric,
  utility_fee numeric,
  after_hours_fee numeric,
  total_price numeric,
  deposit_amount numeric,
  final_balance numeric,
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
create table if not exists proposal_records (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references quote_requests(id) on delete cascade,
  proposal_url text,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now()
);
