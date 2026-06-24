import type { QuoteRequest } from '@/lib/types/quote'

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value ?? 0))
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function buildAgreementMergeFields(quote: QuoteRequest) {
  const location = [quote.event_address, quote.city, quote.state, quote.zip_code]
    .filter(Boolean)
    .join(', ')

  return {
    quote_id: quote.id,
    quote_number: quote.quote_number,
    customer_name: quote.customer_name,
    customer_email: quote.email,
    customer_phone: quote.phone,
    event_date: formatDate(quote.event_date),
    event_type: quote.event_type,
    guest_count: String(quote.guest_count),
    event_address: location,
    event_start_time: quote.event_start_time,
    event_end_time: quote.event_end_time,
    has_power: quote.has_power ? 'Yes' : 'No',
    has_water: quote.has_water ? 'Yes' : 'No',
    total_price: formatCurrency(quote.total_price),
    deposit_amount: formatCurrency(quote.deposit_amount),
    final_balance: formatCurrency(quote.final_balance),
  }
}

export function toDropboxSignCustomFields(fields: Record<string, string>) {
  return Object.entries(fields).map(([name, value]) => ({
    name,
    value,
  }))
}
