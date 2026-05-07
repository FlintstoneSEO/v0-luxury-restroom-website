-- Phase 2: Add detailed fee columns to quote_requests table
-- Adds individual fee tracking for better pricing breakdown

alter table quote_requests add column if not exists travel_fee numeric not null default 0;
alter table quote_requests add column if not exists utility_fee numeric not null default 0;
alter table quote_requests add column if not exists after_hours_fee numeric not null default 0;
alter table quote_requests add column if not exists cleaning_fee numeric not null default 0;
alter table quote_requests add column if not exists damage_waiver_fee numeric not null default 0;
alter table quote_requests add column if not exists rush_booking_fee numeric not null default 0;
alter table quote_requests add column if not exists distance_miles numeric;
alter table quote_requests add column if not exists distance_surcharge numeric not null default 0;
alter table quote_requests add column if not exists discount_amount numeric not null default 0;
alter table quote_requests add column if not exists deposit_paid_amount numeric;
alter table quote_requests add column if not exists customer_response text;
alter table quote_requests add column if not exists customer_response_type text;
alter table quote_requests add column if not exists customer_response_at timestamptz;
alter table quote_requests add column if not exists quote_expires_at timestamptz;
alter table quote_requests add column if not exists deposit_due_date date;
alter table quote_requests add column if not exists deposit_transaction_reference text;
alter table quote_requests add column if not exists final_balance numeric;
alter table quote_requests add column if not exists is_manual_override boolean default false;
alter table quote_requests add column if not exists has_power boolean default false;
alter table quote_requests add column if not exists has_water boolean default false;
alter table quote_requests add column if not exists deposit_paid_amount numeric;
