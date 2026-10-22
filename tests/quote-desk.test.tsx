import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QuoteDeskSummary } from '@/components/admin/quote-desk-summary';
import { mockQuoteRequests } from '@/lib/quotes/mockQuotes';
import { calculateQuoteFinancials } from '@/lib/pricing-engine';

const fees = { base_price: 1450, travel_fee: 125, utility_fee: 150, after_hours_fee: 0, cleaning_fee: 75, damage_waiver_fee: 50, rush_booking_fee: 0, is_manual_override: false };
const pricing = calculateQuoteFinancials({ ...fees, sales_tax_percentage: 6, deposit_percentage: 40 });
const quote = { ...mockQuoteRequests[0], status: 'under_review' as const };
const view = (changes = {}, warnings = {}) => renderToStaticMarkup(<QuoteDeskSummary quote={{...quote, ...changes}} form={fees} pricing={pricing} otherBookingOwnsDate={false} fallbackDistance={false} distanceMessage="Check fallback mileage" financiallyLocked={false} onReviewPricing={() => {}} {...warnings} />);
describe('Quote Desk financial and reservation context', () => {
  it('displays the existing engine totals and rate units accurately', () => {
    const html = view();
    expect(html).toContain('$1,961.00');
    expect(html).toContain('$784.40');
    expect(html).toContain('$1,176.60');
    expect(html).toContain('Sales tax (6%)');
  });
  it('keeps pending requests unreserved and honors customer approval as an existing blocking status', () => {
    expect(view()).toContain('Request only · Date not reserved');
    expect(view({status: 'customer_approved', agreement_status: 'not_sent', deposit_status: 'not_requested'})).toContain('Reserved date');
  });
  it('excludes test bookings and distinguishes another booking from this request', () => {
    expect(view({status: 'booked', is_test_quote: true})).toContain('Test quote · No real reservation');
    expect(view({}, {otherBookingOwnsDate: true})).toContain('Date already reserved');
    expect(view({status: 'cancelled'})).toContain('No reservation from this quote');
  });
  it('retains distance and lock warnings and uses the latest actual timestamp', () => {
    const html = view({created_at:'2027-09-01T12:00:00Z', agreement_signed_at:'2027-09-09T12:00:00Z'}, {fallbackDistance:true, financiallyLocked:true});
    expect(html).toContain('Check fallback mileage');
    expect(html).toContain('Pricing is locked');
    expect(html).toContain('Agreement signed');
    expect(html).not.toContain('Request received ·');
  });
});
