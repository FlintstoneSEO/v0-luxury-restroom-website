import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QuoteWorkbench, quoteReviewLabel, needsDistanceReview, recordedQuoteMilestones } from '@/components/admin/quote-workbench';
import { BookingOutlook } from '@/components/admin/booking-outlook';
import { mockQuoteRequests } from '@/lib/quotes/mockQuotes';
import { QUOTE_STATUSES } from '@/lib/quotes/types';

const quote = { ...mockQuoteRequests[0], event_date: '2099-06-01' };

describe('read-only operational context', () => {
  it('never infers earlier milestones from a later booking status', () => {
    const milestones = recordedQuoteMilestones({ ...quote, status: 'booked', quote_sent_at: null, approved_at: undefined, agreement_status: 'not_sent', deposit_status: 'not_requested', agreement_sent_at: undefined });
    expect(milestones.find(item => item.label === 'Booked')?.complete).toBe(true);
    expect(milestones.find(item => item.label === 'Quote sent')?.complete).toBe(false);
    expect(milestones.find(item => item.label === 'Approved')?.complete).toBe(false);
    expect(milestones.find(item => item.label === 'Agreement')?.complete).toBe(false);
    expect(milestones.find(item => item.label === 'Deposit')?.complete).toBe(false);
  });
  it('gives review guidance for all known statuses without offering a send action', () => {
    for (const status of QUOTE_STATUSES) {
      expect(quoteReviewLabel({ ...quote, status })).toMatch(/^Review /);
    }
    expect(quoteReviewLabel({ ...quote, status: 'unknown' as typeof quote.status })).toBe('Open full quote');
  });
  it('keeps fallback distance review ahead of lifecycle guidance', () => {
    const fallback = { ...quote, calculated_breakdown: { details: { distance_calculation_status: 'fallback' } } };
    expect(needsDistanceReview(fallback)).toBe(true);
    expect(quoteReviewLabel(fallback)).toBe('Review distance');
  });
  it('renders independent tracking and pricing protections without mutable controls', () => {
    const html = renderToStaticMarkup(<QuoteWorkbench quote={{ ...quote, agreement_status: 'signed', deposit_status: 'due', is_manual_override: true, needs_manual_distance_review: true }} onBack={() => {}} />);
    expect(html).toContain('Signed');
    expect(html).toContain('Due');
    expect(html).toContain('Manual distance review needed');
    expect(html).toContain('Manual pricing override');
    expect(html).toContain('Customer-facing pricing is locked');
    expect(html).toContain(`/admin/quotes/${quote.id}`);
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('Send agreement');
  });
  it('distinguishes pending requests from reservations and excludes test bookings', () => {
    const pending = { ...quote, status: 'pending_review' as const };
    const html = renderToStaticMarkup(<BookingOutlook quotes={[pending, { ...quote, id: 'test', is_test_quote: true, status: 'booked' }]} />);
    expect(html).toContain('No upcoming reserved dates');
    expect(html).toContain('Not reserved by request');
    const approved = renderToStaticMarkup(<BookingOutlook quotes={[{ ...quote, status: 'customer_approved' }]} />);
    expect(approved).toContain('Reserved date');
    expect(approved).not.toContain('Not reserved by request');
  });
});
