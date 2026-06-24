import type { QuoteRequestRow } from '@/lib/quotes/types';

function cfg() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) throw new Error('Missing Square configuration');
  const env = process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  return { accessToken, locationId, baseUrl: env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com' };
}

async function squareFetch<T>(path: string, init: RequestInit): Promise<T> {
  const { accessToken, baseUrl } = cfg();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Square-Version': '2026-06-18', ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[square] API request failed', { path, status: res.status, errors: body.errors });
    throw new Error('Square request failed');
  }
  return body as T;
}

function cents(value: unknown) { return Math.max(0, Math.round(Number(value ?? 0) * 100)); }

export async function createSquareDepositInvoice(quote: QuoteRequestRow) {
  const { locationId } = cfg();
  const customerBody = await squareFetch<{ customer: { id: string } }>('/v2/customers', {
    method: 'POST',
    body: JSON.stringify({ given_name: quote.customer_name, email_address: quote.email, phone_number: quote.phone, reference_id: quote.id }),
  });
  const amount = cents(quote.deposit_amount);
  if (amount <= 0) throw new Error('Quote deposit amount must be greater than zero');
  const invoiceBody = await squareFetch<{ invoice: { id: string; public_url?: string; version?: number } }>('/v2/invoices', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: `deposit-${quote.id}-${Date.now()}`,
      invoice: {
        location_id: locationId,
        primary_recipient: { customer_id: customerBody.customer.id },
        delivery_method: 'EMAIL',
        payment_requests: [{ request_type: 'BALANCE', due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), fixed_amount_requested_money: { amount, currency: 'USD' } }],
        title: `Signature Luxe deposit - Quote ${quote.quote_number ?? quote.id.slice(0, 8)}`,
        description: `Deposit invoice for Signature Luxe rental agreement. quote_id:${quote.id}`,
        accepted_payment_methods: { card: true, square_gift_card: false, bank_account: false, buy_now_pay_later: false, cash_app_pay: false },
        custom_fields: [{ label: 'quote_id', value: quote.id }],
      },
    }),
  });
  await squareFetch(`/v2/invoices/${invoiceBody.invoice.id}/publish`, { method: 'POST', body: JSON.stringify({ idempotency_key: `publish-deposit-${quote.id}-${Date.now()}`, version: invoiceBody.invoice.version ?? 0 }) });
  return { customerId: customerBody.customer.id, invoiceId: invoiceBody.invoice.id, publicUrl: invoiceBody.invoice.public_url };
}

export function verifySquareWebhook(rawBody: string, signature: string | null, notificationUrl: string) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return true;
  if (!signature) return false;
  const crypto = require('node:crypto') as typeof import('node:crypto');
  const digest = crypto.createHmac('sha256', key).update(notificationUrl + rawBody).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
