alter table public.quote_requests
  add column if not exists is_test_quote boolean not null default false,
  add column if not exists test_label text,
  add column if not exists test_source_quote_id uuid references public.quote_requests(id) on delete set null;

create index if not exists quote_requests_is_test_quote_idx on public.quote_requests(is_test_quote);
create index if not exists quote_requests_test_source_quote_id_idx on public.quote_requests(test_source_quote_id);
