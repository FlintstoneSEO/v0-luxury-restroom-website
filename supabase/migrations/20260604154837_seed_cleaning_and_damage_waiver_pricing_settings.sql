insert into public.pricing_settings (setting_key, setting_value, description)
values
  ('cleaning_fee', 125, 'Standard cleaning fee applied to quote calculations'),
  ('damage_waiver_fee', 75, 'Standard damage waiver fee applied to quote calculations')
on conflict (setting_key) do update
set
  setting_value = excluded.setting_value,
  description = excluded.description,
  updated_at = now();
