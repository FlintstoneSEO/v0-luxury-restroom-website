create extension if not exists pgcrypto;

create table if not exists public.quote_approval_tokens (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (quote_request_id, token_hash)
);

create index if not exists idx_quote_approval_tokens_token_hash
  on public.quote_approval_tokens(token_hash);

create index if not exists idx_quote_approval_tokens_quote_request_id
  on public.quote_approval_tokens(quote_request_id);
