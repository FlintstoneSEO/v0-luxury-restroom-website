import { QuoteStatus } from '@/lib/quotes/types';

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  draft_quote: 'Draft Quote',
  sent_to_customer: 'Sent to Customer',
  customer_approved: 'Customer Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
  expired: 'Expired',
};

export const quoteStatusBadgeStyles: Record<QuoteStatus, string> = {
  new: 'bg-slate-100 text-slate-800',
  under_review: 'bg-blue-100 text-blue-800',
  draft_quote: 'bg-violet-100 text-violet-800',
  sent_to_customer: 'bg-amber-100 text-amber-800',
  customer_approved: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-zinc-200 text-zinc-900',
  declined: 'bg-rose-100 text-rose-800',
  expired: 'bg-orange-100 text-orange-800',
};

export function canEditQuote(status: QuoteStatus): boolean {
  return ['new', 'under_review', 'draft_quote'].includes(status);
}

export function canSendQuote(status: QuoteStatus): boolean {
  return ['new', 'under_review', 'draft_quote'].includes(status);
}

export function isActiveQuote(status: QuoteStatus): boolean {
  return ['new', 'under_review', 'draft_quote', 'sent_to_customer', 'customer_approved'].includes(status);
}

export function isCompletedQuote(status: QuoteStatus): boolean {
  return ['completed', 'cancelled', 'declined', 'expired'].includes(status);
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  return quoteStatusLabels[status] ?? 'Unknown';
}
