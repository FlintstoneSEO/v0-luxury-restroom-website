alter table public.quote_approval_tokens
  add column if not exists first_viewed_at timestamptz,
  add column if not exists last_viewed_at timestamptz,
  add column if not exists view_count integer not null default 0;

alter table public.quote_requests
  add column if not exists quote_viewed_at timestamptz,
  add column if not exists quote_view_count integer not null default 0;

create table if not exists public.quote_link_events (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  token_id uuid references public.quote_approval_tokens(id) on delete set null,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_quote_link_events_quote_request_id
  on public.quote_link_events(quote_request_id);

create index if not exists idx_quote_link_events_created_at
  on public.quote_link_events(created_at);

alter table public.quote_link_events enable row level security;
