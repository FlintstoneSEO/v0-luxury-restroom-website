alter table public.quote_requests
  add column if not exists dropbox_sign_request_id text,
  add column if not exists dropbox_sign_signature_id text,
  add column if not exists square_customer_id text,
  add column if not exists square_deposit_invoice_id text,
  add column if not exists square_deposit_invoice_url text,
  add column if not exists square_final_invoice_id text,
  add column if not exists square_final_invoice_url text,
  add column if not exists final_balance_paid_at timestamptz;

create index if not exists idx_quote_requests_dropbox_sign_request_id
  on public.quote_requests (dropbox_sign_request_id)
  where dropbox_sign_request_id is not null;

create index if not exists idx_quote_requests_dropbox_sign_signature_id
  on public.quote_requests (dropbox_sign_signature_id)
  where dropbox_sign_signature_id is not null;

create index if not exists idx_quote_requests_square_deposit_invoice_id
  on public.quote_requests (square_deposit_invoice_id)
  where square_deposit_invoice_id is not null;

create index if not exists idx_quote_requests_square_customer_id
  on public.quote_requests (square_customer_id)
  where square_customer_id is not null;
