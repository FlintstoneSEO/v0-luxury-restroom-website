import { QuoteStatus } from '@/lib/quotes/types';

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  quote_sent: 'Quote Sent',
  customer_approved: 'Customer Approved',
  agreement_pending: 'Agreement Pending',
  deposit_pending: 'Deposit Pending',
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

export const quoteStatusBadgeStyles: Record<QuoteStatus, string> = {
  new: 'bg-slate-100 text-slate-800',
  under_review: 'bg-blue-100 text-blue-800',
  quote_sent: 'bg-amber-100 text-amber-800',
  customer_approved: 'bg-emerald-100 text-emerald-800',
  agreement_pending: 'bg-indigo-100 text-indigo-800',
  deposit_pending: 'bg-orange-100 text-orange-800',
  booked: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-zinc-200 text-zinc-900',
  declined: 'bg-rose-100 text-rose-800',
};

export function canEditQuote(status: QuoteStatus): boolean {
  return ['new', 'under_review'].includes(status);
}

export function canSendQuote(status: QuoteStatus): boolean {
  return ['new', 'under_review'].includes(status);
}

export function isActiveQuote(status: QuoteStatus): boolean {
  return ['new', 'under_review', 'quote_sent', 'customer_approved', 'agreement_pending', 'deposit_pending', 'booked'].includes(status);
}

export function isCompletedQuote(status: QuoteStatus): boolean {
  return ['completed', 'cancelled', 'declined'].includes(status);
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  return quoteStatusLabels[status] ?? 'Unknown';
}
