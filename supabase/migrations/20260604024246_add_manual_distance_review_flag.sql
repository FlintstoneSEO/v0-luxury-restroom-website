alter table quote_requests
  add column if not exists needs_manual_distance_review boolean not null default false;

update quote_requests
set needs_manual_distance_review = true
where coalesce(calculated_breakdown->'details'->>'distance_calculation_status', '') = 'fallback';
