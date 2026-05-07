import { QuoteStatus } from '@/lib/quotes/types';

export const quoteStatusLabels: Partial<Record<QuoteStatus, string>> = {
  pending_review: 'Pending Review',
  new: 'New',
  under_review: 'Under Review',
  draft_quote: 'Draft Quote',
  quote_sent: 'Quote Sent',
  sent_to_customer: 'Sent to Customer',
  customer_approved: 'Customer Approved',
  change_requested: 'Change Requested',
  agreement_pending: 'Agreement Pending',
  agreement_sent: 'Agreement Sent',
  agreement_signed: 'Agreement Signed',
  deposit_pending: 'Deposit Pending',
  deposit_paid: 'Deposit Paid',
  booked: 'Booked',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
  expired: 'Expired',
};

export const quoteStatusBadgeStyles: Partial<Record<QuoteStatus, string>> = {
  pending_review: 'bg-slate-100 text-slate-800',
  new: 'bg-slate-100 text-slate-800',
  under_review: 'bg-blue-100 text-blue-800',
  draft_quote: 'bg-violet-100 text-violet-800',
  quote_sent: 'bg-amber-100 text-amber-800',
  sent_to_customer: 'bg-amber-100 text-amber-800',
  customer_approved: 'bg-emerald-100 text-emerald-800',
  change_requested: 'bg-yellow-100 text-yellow-800',
  agreement_pending: 'bg-indigo-100 text-indigo-800',
  agreement_sent: 'bg-indigo-100 text-indigo-800',
  agreement_signed: 'bg-cyan-100 text-cyan-800',
  deposit_pending: 'bg-orange-100 text-orange-800',
  deposit_paid: 'bg-green-100 text-green-800',
  booked: 'bg-green-100 text-green-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-zinc-200 text-zinc-900',
  declined: 'bg-rose-100 text-rose-800',
  expired: 'bg-red-100 text-red-700',
};

export function canEditQuote(status: QuoteStatus): boolean {
  return ['pending_review', 'new', 'under_review', 'draft_quote', 'change_requested'].includes(status);
}

export function canSendQuote(status: QuoteStatus): boolean {
  return ['pending_review', 'new', 'under_review', 'draft_quote', 'change_requested'].includes(status);
}

export function isActiveQuote(status: QuoteStatus): boolean {
  return ['pending_review', 'new', 'under_review', 'draft_quote', 'quote_sent', 'sent_to_customer', 'customer_approved', 'agreement_pending', 'agreement_sent', 'deposit_pending', 'booked', 'confirmed'].includes(status);
}

export function isCompletedQuote(status: QuoteStatus): boolean {
  return ['completed', 'cancelled', 'declined', 'expired'].includes(status);
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  return quoteStatusLabels[status] ?? status.replace(/_/g, ' ');
}
