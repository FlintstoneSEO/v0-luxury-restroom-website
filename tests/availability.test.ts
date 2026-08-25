import { describe, expect, it } from 'vitest';
import {
  BOOKING_BLOCKING_STATUSES,
  getAvailabilityDaySummary,
  getCombinedAvailabilitySummaries,
  getAvailabilitySummaries,
  getBookedDateState,
  isBookingBlockingStatus,
  isRealQuote,
} from '@/lib/availability';
import {
  addDaysToDateOnly,
  dateOnlyRangesOverlap,
  enumerateDateOnlyRange,
  getMinimumEventDate,
  isValidDateOnly,
} from '@/lib/date-only';
import type { AvailabilityBlock } from '@/lib/availability';

function block(overrides: Partial<AvailabilityBlock> = {}): AvailabilityBlock {
  return {
    id: 'block-1',
    title: 'Tailgate weekend',
    start_date: '2026-09-11',
    end_date: '2026-09-13',
    block_type: 'partner_booking',
    availability_effect: 'hard_block',
    status: 'active',
    created_at: '2026-08-25T12:00:00.000Z',
    updated_at: '2026-08-25T12:00:00.000Z',
    ...overrides,
  };
}

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

  it('expands a partner block across inclusive boundary dates', () => {
    const summaries = getCombinedAvailabilitySummaries([], [block()]);

    expect([...summaries.keys()]).toEqual([
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
    ]);
    expect(summaries.get('2026-09-11')?.state).toBe('partner_block');
    expect(summaries.get('2026-09-13')?.state).toBe('partner_block');
  });

  it('keeps soft holds non-blocking but visible ahead of pending requests', () => {
    const summary = getAvailabilityDaySummary(
      [{ id: 'lead', event_date: '2026-09-12', status: 'pending_review' }],
      [block({ availability_effect: 'soft_hold' })],
      '2026-09-12',
    );

    expect(summary.state).toBe('soft_hold');
    expect(summary.softHolds).toHaveLength(1);
    expect(summary.hasBlockingConflict).toBe(false);
    expect(summary.activeRequestCount).toBe(1);
  });

  it('warns on a pending request and treats a confirmed quote plus hard block as a conflict', () => {
    const pending = getAvailabilityDaySummary(
      [{ id: 'lead', event_date: '2026-09-12', status: 'quote_sent' }],
      [block()],
      '2026-09-12',
    );
    const confirmed = getAvailabilityDaySummary(
      [{ id: 'booking', event_date: '2026-09-12', status: 'confirmed' }],
      [block()],
      '2026-09-12',
    );

    expect(pending.state).toBe('partner_block');
    expect(pending.hasBlockingConflict).toBe(false);
    expect(confirmed.state).toBe('conflict');
    expect(confirmed.hasBlockingConflict).toBe(true);
  });

  it('treats overlapping hard blocks as an administrative conflict', () => {
    const summary = getAvailabilityDaySummary(
      [],
      [block(), block({ id: 'block-2', block_type: 'maintenance' })],
      '2026-09-12',
    );

    expect(summary.state).toBe('conflict');
    expect(summary.blockingCommitmentCount).toBe(2);
  });

  it('ignores cancelled blocks and still summarizes historical dates deterministically', () => {
    const summary = getAvailabilityDaySummary(
      [],
      [block({ status: 'cancelled' })],
      '2025-09-12',
    );
    expect(summary.state).toBe('available');
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

  it('enumerates inclusive ranges without timezone conversion', () => {
    expect(enumerateDateOnlyRange('2026-12-31', '2027-01-02')).toEqual([
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
    expect(dateOnlyRangesOverlap('2026-09-11', '2026-09-13', '2026-09-13', '2026-09-15')).toBe(true);
    expect(dateOnlyRangesOverlap('2026-09-11', '2026-09-12', '2026-09-13', '2026-09-15')).toBe(false);
  });
});
