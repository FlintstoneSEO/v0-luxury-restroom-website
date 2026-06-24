alter table public.quote_requests
  add column if not exists dropbox_sign_request_id text,
  add column if not exists dropbox_sign_signature_id text,
  add column if not exists agreement_sent_at timestamptz,
  add column if not exists agreement_signed_at timestamptz,
  add column if not exists signed_agreement_url text,
  add column if not exists square_customer_id text,
  add column if not exists square_deposit_invoice_id text,
  add column if not exists square_deposit_invoice_url text,
  add column if not exists square_final_invoice_id text,
  add column if not exists square_final_invoice_url text,
  add column if not exists deposit_paid_at timestamptz,
  add column if not exists final_balance_paid_at timestamptz;
