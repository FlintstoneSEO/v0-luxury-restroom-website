import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import QuoteApprovalClient from '@/app/quote/[token]/quote-approval-client';
import { quoteSentTemplate } from '@/lib/email/templates';

const quote = {
  id: '00000000-0000-4000-8000-000000000001',
  quote_number: 'SLE-TEST',
  customer_name: 'Test Customer',
  email: 'test@example.com',
  event_date: '2026-10-10',
  event_type: 'Wedding',
  event_address: '123 Main St',
  city: 'Lansing',
  state: 'MI',
  zip_code: '48933',
  guest_count: 100,
  event_start_time: '16:00',
  event_end_time: '22:00',
  has_power: true,
  has_water: true,
  base_price: 1375,
  travel_fee: 0,
  utility_fee: 225,
  after_hours_fee: 0,
  cleaning_fee: 0,
  damage_waiver_fee: 0,
  rush_booking_fee: 250,
  subtotal: 1850,
  discount_amount: 0,
  pretax_total: 1850,
  taxable_amount: 1850,
  tax_rate: 0.06,
  sales_tax_amount: 111,
  total_price: 1961,
  deposit_percentage: 40,
  deposit_amount: 784.4,
  final_balance: 1176.6,
  status: 'quote_sent',
  created_at: '2026-07-30T12:00:00Z',
};

describe('quote email presentation', () => {
  it('renders tax and the tax-inclusive total in HTML and text', () => {
    const email = quoteSentTemplate({
      customerName: quote.customer_name,
      eventDate: 'Saturday, October 10, 2026',
      eventType: quote.event_type,
      guestCount: String(quote.guest_count),
      eventLocation: `${quote.city}, ${quote.state}`,
      quoteSubtotal: quote.subtotal,
      quotePretaxTotal: quote.pretax_total,
      quoteTaxRate: quote.tax_rate,
      quoteSalesTaxAmount: quote.sales_tax_amount,
      quoteTotal: quote.total_price,
      approvalLink: 'https://example.com/quote/token',
    });

    expect(email.html).toContain('Michigan Sales Tax (6%)');
    expect(email.html).toContain('$111.00');
    expect(email.html).toContain('Estimated Total Including Sales Tax');
    expect(email.text).toContain('Michigan Sales Tax (6%): $111.00');
    expect(email.text).toContain('Estimated Total Including Sales Tax: $1,961.00');
  });
});

describe('customer quote presentation', () => {
  it('shows the persisted tax, tax-inclusive total, deposit, and balance', () => {
    const html = renderToStaticMarkup(
      <QuoteApprovalClient
        quote={quote}
        token="test-token"
        alreadyResponded={false}
        options={[]}
        publicSiteOrigin="https://example.com"
      />
    );

    expect(html).toContain('Michigan Sales Tax (6%)');
    expect(html).toContain('$111.00');
    expect(html).toContain('Total Including Sales Tax');
    expect(html).toContain('$784.40');
    expect(html).toContain('$1,176.60');
  });

  it('does not claim 6% tax for a grandfathered quote', () => {
    const historicalQuote = {
      ...quote,
      tax_rate: 0,
      sales_tax_amount: 0,
      pretax_total: 1850,
      total_price: 1850,
      deposit_percentage: 25,
      deposit_amount: 462.5,
      final_balance: 1387.5,
    };
    const html = renderToStaticMarkup(
      <QuoteApprovalClient
        quote={historicalQuote}
        token="historical-token"
        alreadyResponded={false}
        options={[]}
        publicSiteOrigin="https://example.com"
      />
    );

    expect(html).not.toContain('Michigan Sales Tax (6%)');
    expect(html).toContain('Deposit Required (25%)');
  });
});
