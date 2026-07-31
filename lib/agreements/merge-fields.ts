import { formatLocalDateOnly } from '@/lib/date-only';
import type { QuoteRequestRow } from '@/lib/quotes/types';

function money(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(amount) ? amount : 0);
}

function date(value: unknown) {
  if (!value) return '';
  const dateString = String(value);

  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? formatLocalDateOnly(dateString) : dateString;
}

export function buildAgreementMergeFields(quote: QuoteRequestRow) {
  return {
    quote_id: quote.id,
    quote_number: quote.quote_number ?? quote.id.slice(0, 8),
    customer_name: quote.customer_name,
    customer_email: quote.email,
    customer_phone: quote.phone,
    event_date: date(quote.event_date),
    event_type: quote.event_type,
    guest_count: String(quote.guest_count ?? ''),
    event_address: [quote.event_address, quote.city, quote.state, quote.zip_code].filter(Boolean).join(', '),
    event_start_time: quote.event_start_time ?? '',
    event_end_time: quote.event_end_time ?? '',
    has_power: quote.has_power ? 'Yes' : 'No',
    has_water: quote.has_water ? 'Yes' : 'No',
    additional_notes: quote.additional_notes ?? '',
    subtotal: money(quote.subtotal),
    discount_amount: money(quote.discount_amount),
    pretax_total: money(quote.pretax_total),
    sales_tax_amount: money(quote.sales_tax_amount),
    total_price: money(quote.total_price),
    deposit_percentage: String(quote.deposit_percentage ?? ''),
    deposit_amount: money(quote.deposit_amount),
    final_balance: money(quote.final_balance),
  };
}

export function toDropboxSignCustomFields(fields: Record<string, string>) {
  return Object.entries(fields).map(([name, value]) => ({ name, value }));
}
