import { describe, expect, it } from 'vitest';
import {
  BOOKING_BLOCKING_STATUSES,
  getAvailabilitySummaries,
  getBookedDateState,
  isBookingBlockingStatus,
  isRealQuote,
} from '@/lib/availability';
import {
  addDaysToDateOnly,
  getMinimumEventDate,
  isValidDateOnly,
} from '@/lib/date-only';

describe('availability rules', () => {
  it('uses the approved booking-blocking statuses', () => {
    expect(BOOKING_BLOCKING_STATUSES).toEqual([
      'customer_approved',
      'agreement_pending',
      'agreement_sent',
      'agreement_signed',
      'deposit_pending',
      'deposit_paid',
      'booked',
      'confirmed',
      'completed',
    ]);
    expect(isBookingBlockingStatus('quote_sent')).toBe(false);
    expect(isBookingBlockingStatus('cancelled')).toBe(false);
  });

  it('excludes test quotes and identifies the booking owner', () => {
    const quotes = [
      { id: 'pending', event_date: '2026-09-26', status: 'pending_review' },
      { id: 'owner', event_date: '2026-09-26', status: 'customer_approved' },
      {
        id: 'test',
        event_date: '2026-09-26',
        status: 'booked',
        is_test_quote: true,
      },
    ];

    const state = getBookedDateState(quotes, '2026-09-26');
    expect(state.state).toBe('booked');
    expect(state.summary.bookingOwner?.id).toBe('owner');
    expect(state.summary.blockingBookingCount).toBe(1);
    expect(isRealQuote(quotes[2])).toBe(false);
  });

  it('detects multiple requests and blocking conflicts by date', () => {
    const summaries = getAvailabilitySummaries([
      { id: 'one', event_date: '2026-10-03', status: 'pending_review' },
      { id: 'two', event_date: '2026-10-03', status: 'quote_sent' },
      { id: 'a', event_date: '2026-10-04', status: 'booked' },
      { id: 'b', event_date: '2026-10-04', status: 'confirmed' },
    ]);

    expect(summaries.get('2026-10-03')?.hasMultipleRequests).toBe(true);
    expect(summaries.get('2026-10-04')?.hasBookingConflict).toBe(true);
  });
});

describe('date-only rules', () => {
  it('validates real calendar dates', () => {
    expect(isValidDateOnly('2026-02-28')).toBe(true);
    expect(isValidDateOnly('2026-02-30')).toBe(false);
    expect(isValidDateOnly('09/26/2026')).toBe(false);
  });

  it('enforces a minimum of seven calendar days', () => {
    const now = new Date(2026, 6, 30, 23, 30);
    expect(getMinimumEventDate(now)).toBe('2026-08-06');
    expect(addDaysToDateOnly('2026-12-29', 7)).toBe('2027-01-05');
  });
});
