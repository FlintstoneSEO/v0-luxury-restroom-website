const FINANCIALLY_LOCKED_STATUSES = new Set([
  'quote_sent',
  'sent_to_customer',
  'customer_approved',
  'change_requested',
  'agreement_pending',
  'agreement_sent',
  'agreement_signed',
  'deposit_pending',
  'deposit_paid',
  'booked',
  'confirmed',
  'completed',
  'cancelled',
  'declined',
  'expired',
]);

export type FinancialLockFields = {
  status?: string | null;
  quote_sent_at?: string | null;
  approved_at?: string | null;
  customer_response_at?: string | null;
  customer_response_type?: string | null;
  agreement_status?: string | null;
  deposit_status?: string | null;
};

export function isQuoteFinanciallyLocked(quote: FinancialLockFields): boolean {
  return Boolean(
    quote.quote_sent_at ||
      quote.approved_at ||
      quote.customer_response_at ||
      quote.customer_response_type ||
      FINANCIALLY_LOCKED_STATUSES.has(String(quote.status ?? '')) ||
      ['sent', 'signed'].includes(String(quote.agreement_status ?? '')) ||
      ['invoice_sent', 'pending', 'paid', 'overdue', 'refunded'].includes(
        String(quote.deposit_status ?? '')
      )
  );
}

export function financialLockMessage(): string {
  return 'This quote has already been customer-facing. Start an explicit financial revision before changing or recalculating pricing.';
}
