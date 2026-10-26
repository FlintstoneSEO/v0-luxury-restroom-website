
-- Drop existing minimal table and recreate with full schema
DROP TABLE IF EXISTS public.quote_requests CASCADE;

-- Full quote_requests table
CREATE TABLE public.quote_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ DEFAULT now(),
  quote_number         TEXT UNIQUE,
  customer_name        TEXT NOT NULL,
  phone                TEXT NOT NULL,
  email                TEXT NOT NULL,
  event_date           DATE NOT NULL,
  event_type           TEXT NOT NULL,
  guest_count          INTEGER NOT NULL,
  event_address        TEXT NOT NULL,
  city                 TEXT NOT NULL,
  state                TEXT NOT NULL DEFAULT 'MI',
  zip_code             TEXT NOT NULL,
  event_start_time     TEXT NOT NULL,
  event_end_time       TEXT NOT NULL,
  has_power            BOOLEAN NOT NULL DEFAULT false,
  has_water            BOOLEAN NOT NULL DEFAULT false,
  additional_notes     TEXT,
  distance_miles       NUMERIC(8,2),
  base_price           NUMERIC(10,2),
  travel_fee           NUMERIC(10,2) DEFAULT 0,
  utility_fee          NUMERIC(10,2) DEFAULT 0,
  after_hours_fee      NUMERIC(10,2) DEFAULT 0,
  total_price          NUMERIC(10,2),
  status               TEXT NOT NULL DEFAULT 'pending',
  deposit_amount       NUMERIC(10,2),
  final_balance        NUMERIC(10,2),
  calculated_breakdown JSONB,

  -- Columns added directly to production before its migration history was
  -- complete. Keeping them in this already-applied baseline makes fresh
  -- preview branches reproduce the live schema without reapplying DDL to
  -- production.
  customer_phone text,
  customer_email text,
  event_location text,
  event_notes text,
  has_electrical_access boolean not null default false,
  has_water_access boolean not null default false,
  setup_notes text,
  delivery_fee numeric not null default 0,
  add_ons_total numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  remaining_balance numeric not null default 0,
  approval_token text,
  quote_sent_at timestamptz,
  customer_approved_at timestamptz,
  signed_agreement_url text,
  agreement_status text default 'not_sent',
  agreement_document_url text,
  signed_document_url text,
  agreement_provider_reference_id text,
  agreement_sent_at timestamptz,
  agreement_signed_at timestamptz,
  deposit_status text default 'due',
  deposit_payment_link text,
  deposit_due_date date,
  deposit_paid_at timestamptz,
  deposit_paid_amount numeric,
  deposit_transaction_reference text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  internal_notes text,
  customer_notes text,
  customer_response text,
  customer_response_type text,
  customer_response_at timestamptz,
  quote_expires_at date,
  is_manual_override boolean default false,
  cleaning_fee numeric not null default 0,
  damage_waiver_fee numeric not null default 0,
  rush_booking_fee numeric not null default 0,
  distance_surcharge numeric not null default 0,
  discount_amount numeric not null default 0,
  subtotal numeric not null default 0,
  updated_at timestamptz default now()
);

-- Auto-generate quote number on insert
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num   INTEGER;
  new_quote_number TEXT;
BEGIN
  year_part := to_char(now(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.quote_requests
  WHERE to_char(created_at, 'YYYY') = year_part;
  new_quote_number := 'SL-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.quote_number := new_quote_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quote_number
  BEFORE INSERT ON public.quote_requests
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL)
  EXECUTE FUNCTION generate_quote_number();

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.quote_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON public.quote_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- pricing_settings table
CREATE TABLE IF NOT EXISTS public.pricing_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT UNIQUE NOT NULL,
  setting_value NUMERIC(10,2) NOT NULL,
  description   TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public reads on pricing_settings" ON public.pricing_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated updates on pricing_settings" ON public.pricing_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed default pricing values
INSERT INTO public.pricing_settings (setting_key, setting_value, description) VALUES
  ('base_price_100_guests',   650.00,  'Base rental price for up to 100 guests'),
  ('base_price_150_guests',   750.00,  'Base rental price for up to 150 guests'),
  ('base_price_200_guests',   900.00,  'Base rental price for up to 200 guests'),
  ('base_price_200_plus',    1100.00,  'Base rental price for 200+ guests'),
  ('included_miles',           30.00,  'Miles included before travel fee kicks in'),
  ('travel_rate_per_mile',      2.50,  'Additional cost per mile beyond included miles'),
  ('generator_fee',           150.00,  'Fee when no dedicated power is available'),
  ('water_fee',               100.00,  'Fee when no water connection is available'),
  ('after_hours_hourly_rate',  75.00,  'Hourly rate for events running past 10 PM'),
  ('after_hours_cutoff_hour',  22.00,  'Hour (24h) after which after-hours rate applies (22 = 10 PM)'),
  ('deposit_percentage',       25.00,  'Deposit percentage of total price required to book')
ON CONFLICT (setting_key) DO NOTHING;
