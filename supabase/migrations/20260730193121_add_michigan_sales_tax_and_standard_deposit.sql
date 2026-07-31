-- Add persisted Michigan sales-tax fields and a per-quote deposit percentage
-- snapshot. Historical customer-facing totals are intentionally not changed.

alter table public.quote_requests
  add column if not exists pretax_total numeric not null default 0,
  add column if not exists taxable_amount numeric not null default 0,
  add column if not exists tax_rate numeric not null default 0,
  add column if not exists sales_tax_amount numeric not null default 0,
  add column if not exists deposit_percentage numeric not null default 0;

alter table public.quote_options
  add column if not exists pretax_total numeric not null default 0,
  add column if not exists taxable_amount numeric not null default 0,
  add column if not exists tax_rate numeric not null default 0,
  add column if not exists sales_tax_amount numeric not null default 0,
  add column if not exists deposit_percentage numeric not null default 0;

-- Grandfather existing quotes at zero tax. pretax_total records the safest
-- canonical tax-free total available without modifying total_price, deposit,
-- or final balance. The JSON-key predicate keeps this backfill rerun-safe for
-- rows created by the tax-aware application.
update public.quote_requests
set
  pretax_total = greatest(
    0,
    coalesce(
      total_price,
      greatest(0, coalesce(subtotal, 0) - coalesce(discount_amount, 0)),
      subtotal,
      0
    )
  ),
  taxable_amount = 0,
  tax_rate = 0,
  sales_tax_amount = 0,
  deposit_percentage = case
    when coalesce(calculated_breakdown->'details'->>'deposit_percentage', '') ~ '^[0-9]+([.][0-9]+)?$'
      then (calculated_breakdown->'details'->>'deposit_percentage')::numeric
    when coalesce(total_price, 0) > 0
      then round((coalesce(deposit_amount, 0) / total_price) * 100, 4)
    else 0
  end
where not coalesce(calculated_breakdown ? 'sales_tax_amount', false);

update public.quote_options
set
  pretax_total = greatest(
    0,
    coalesce(
      total_price,
      greatest(0, coalesce(subtotal, 0) - coalesce(discount_amount, 0)),
      subtotal,
      0
    )
  ),
  taxable_amount = 0,
  tax_rate = 0,
  sales_tax_amount = 0,
  deposit_percentage = case
    when coalesce(calculated_breakdown->'details'->>'deposit_percentage', '') ~ '^[0-9]+([.][0-9]+)?$'
      then (calculated_breakdown->'details'->>'deposit_percentage')::numeric
    when coalesce(total_price, 0) > 0
      then round((coalesce(deposit_amount, 0) / total_price) * 100, 4)
    else 0
  end
where not coalesce(calculated_breakdown ? 'sales_tax_amount', false);

create table if not exists public.pricing_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value numeric,
  description text,
  updated_at timestamptz default now()
);

insert into public.pricing_settings (setting_key, setting_value, description, updated_at)
values
  ('sales_tax_percentage', 6, 'Michigan sales tax percentage applied after discounts', now()),
  ('deposit_percentage', 40, 'Standard deposit percentage applied to the tax-inclusive total', now())
on conflict (setting_key) do update
set
  setting_value = excluded.setting_value,
  description = excluded.description,
  updated_at = excluded.updated_at;
