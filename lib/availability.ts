import type { QuoteStatus } from '@/lib/quotes/types';

export const BOOKING_BLOCKING_STATUSES = [
  'customer_approved',
  'agreement_pending',
  'agreement_sent',
  'agreement_signed',
  'deposit_pending',
  'deposit_paid',
  'booked',
  'confirmed',
  'completed',
] as const satisfies readonly QuoteStatus[];

export const ACTIVE_NON_BLOCKING_STATUSES = [
  'pending',
  'pending_review',
  'new',
  'under_review',
  'draft_quote',
  'quote_sent',
  'sent_to_customer',
  'change_requested',
] as const satisfies readonly QuoteStatus[];

export const CLOSED_NON_BLOCKING_STATUSES = [
  'cancelled',
  'declined',
  'expired',
] as const satisfies readonly QuoteStatus[];

export type BookingBlockingStatus = (typeof BOOKING_BLOCKING_STATUSES)[number];

export interface AvailabilityQuote {
  id: string;
  event_date: string;
  status: string;
  is_test_quote?: boolean | null;
  quote_number?: string | null;
}

export interface SameDateRequestSummary<T extends AvailabilityQuote = AvailabilityQuote> {
  eventDate: string;
  realQuotes: T[];
  activeRequests: T[];
  closedRequests: T[];
  blockingQuotes: T[];
  bookingOwner: T | null;
  activeRequestCount: number;
  blockingBookingCount: number;
  hasMultipleRequests: boolean;
  hasBookingConflict: boolean;
}

const blockingStatuses = new Set<string>(BOOKING_BLOCKING_STATUSES);
const activeStatuses = new Set<string>(ACTIVE_NON_BLOCKING_STATUSES);
const closedStatuses = new Set<string>(CLOSED_NON_BLOCKING_STATUSES);

export function isBookingBlockingStatus(status: string): status is BookingBlockingStatus {
  return blockingStatuses.has(status);
}

export function isActiveAvailabilityRequest(status: string) {
  return activeStatuses.has(status);
}

export function isClosedAvailabilityRequest(status: string) {
  return closedStatuses.has(status);
}

export function isRealQuote(quote: Pick<AvailabilityQuote, 'is_test_quote'>) {
  return quote.is_test_quote !== true;
}

export function groupQuotesByEventDate<T extends AvailabilityQuote>(quotes: T[]) {
  const grouped = new Map<string, T[]>();

  for (const quote of quotes) {
    if (!quote.event_date) continue;
    const existing = grouped.get(quote.event_date) ?? [];
    existing.push(quote);
    grouped.set(quote.event_date, existing);
  }

  return grouped;
}

export function getSameDateRequestSummary<T extends AvailabilityQuote>(
  quotes: T[],
  eventDate?: string,
): SameDateRequestSummary<T> {
  const targetDate = eventDate ?? quotes[0]?.event_date ?? '';
  const realQuotes = quotes.filter(
    (quote) => quote.event_date === targetDate && isRealQuote(quote),
  );
  const activeRequests = realQuotes.filter((quote) =>
    isActiveAvailabilityRequest(quote.status),
  );
  const closedRequests = realQuotes.filter((quote) =>
    isClosedAvailabilityRequest(quote.status),
  );
  const blockingQuotes = realQuotes.filter((quote) =>
    isBookingBlockingStatus(quote.status),
  );

  return {
    eventDate: targetDate,
    realQuotes,
    activeRequests,
    closedRequests,
    blockingQuotes,
    bookingOwner: blockingQuotes.length === 1 ? blockingQuotes[0] : null,
    activeRequestCount: activeRequests.length,
    blockingBookingCount: blockingQuotes.length,
    hasMultipleRequests: activeRequests.length > 1,
    hasBookingConflict: blockingQuotes.length > 1,
  };
}

export function getAvailabilitySummaries<T extends AvailabilityQuote>(quotes: T[]) {
  const summaries = new Map<string, SameDateRequestSummary<T>>();

  for (const [eventDate, sameDateQuotes] of groupQuotesByEventDate(quotes)) {
    summaries.set(eventDate, getSameDateRequestSummary(sameDateQuotes, eventDate));
  }

  return summaries;
}

export function getBookedDateState<T extends AvailabilityQuote>(
  quotes: T[],
  eventDate: string,
) {
  const summary = getSameDateRequestSummary(quotes, eventDate);

  if (summary.hasBookingConflict) return { state: 'conflict' as const, summary };
  if (summary.bookingOwner) return { state: 'booked' as const, summary };
  if (summary.hasMultipleRequests) return { state: 'multiple_requests' as const, summary };
  if (summary.activeRequestCount === 1) return { state: 'active_request' as const, summary };
  return { state: 'available' as const, summary };
}
