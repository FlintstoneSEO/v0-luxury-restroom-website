create table if not exists public.quote_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_at timestamptz not null default now(),
  changed_by text,
  note text
);

create index if not exists idx_quote_status_history_quote_request_id
  on public.quote_status_history(quote_request_id);

alter table public.quote_status_history enable row level security;
