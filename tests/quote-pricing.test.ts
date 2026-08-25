import { describe, expect, it } from 'vitest';
import {
  calculateQuoteFinancials,
  isFinancialSnapshotConsistent,
} from '@/lib/pricing-engine';
import { normalizeOptionPricing } from '@/lib/quotes/quote-options';
import { isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';
import { quoteRequestUpdateSchema } from '@/lib/quotes/schema';

const exampleCharges = {
  base_price: 1375,
  utility_fee: 225,
  rush_booking_fee: 250,
};

describe('canonical quote financials', () => {
  it('applies 6% Michigan tax and a 40% deposit to the supplied example', () => {
    const result = calculateQuoteFinancials({
      ...exampleCharges,
      sales_tax_percentage: 6,
      deposit_percentage: 40,
    });

    expect(result).toMatchObject({
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
    });
  });

  it('applies discounts before tax', () => {
    const result = calculateQuoteFinancials({
      ...exampleCharges,
      discount_amount: 100,
      sales_tax_percentage: 6,
      deposit_percentage: 40,
    });

    expect(result).toMatchObject({
      subtotal: 1850,
      discount_amount: 100,
      pretax_total: 1750,
      sales_tax_amount: 105,
      total_price: 1855,
      deposit_amount: 742,
      final_balance: 1113,
    });
  });

  it('rounds tax, deposit, and balance to cents', () => {
    const result = calculateQuoteFinancials({
      base_price: 10.11,
      sales_tax_percentage: 6,
      deposit_percentage: 40,
    });

    expect(result.sales_tax_amount).toBe(0.61);
    expect(result.total_price).toBe(10.72);
    expect(result.deposit_amount).toBe(4.29);
    expect(result.final_balance).toBe(6.43);
  });

  it('keeps standard quotes and equivalent quote options identical', () => {
    const standard = calculateQuoteFinancials({
      ...exampleCharges,
      discount_amount: 100,
      sales_tax_percentage: 6,
      deposit_percentage: 40,
    });
    const option = normalizeOptionPricing({
      ...exampleCharges,
      discount_amount: 100,
      sales_tax_percentage: 6,
      deposit_percentage: 40,
      total_price: 1,
      sales_tax_amount: 999,
      deposit_amount: 1,
    });

    expect(option).toMatchObject(standard);
  });

  it('validates a persisted tax-inclusive financial snapshot', () => {
    expect(isFinancialSnapshotConsistent({
      pretax_total: 1850,
      sales_tax_amount: 111,
      total_price: 1961,
      deposit_percentage: 40,
      deposit_amount: 784.4,
      final_balance: 1176.6,
    })).toBe(true);
  });
});

describe('historical quote protection', () => {
  it('locks sent, approved, and payment-stage quotes', () => {
    expect(isQuoteFinanciallyLocked({ status: 'quote_sent' })).toBe(true);
    expect(isQuoteFinanciallyLocked({ status: 'pending_review', quote_sent_at: '2026-07-01T12:00:00Z' })).toBe(true);
    expect(isQuoteFinanciallyLocked({ status: 'customer_approved' })).toBe(true);
    expect(isQuoteFinanciallyLocked({ status: 'agreement_signed' })).toBe(true);
    expect(isQuoteFinanciallyLocked({ status: 'deposit_pending' })).toBe(true);
  });

  it('allows unsent drafts and pending-review quotes to be recalculated', () => {
    expect(isQuoteFinanciallyLocked({ status: 'draft_quote' })).toBe(false);
    expect(isQuoteFinanciallyLocked({ status: 'pending_review' })).toBe(false);

    const recalculatedDraft = calculateQuoteFinancials({
      ...exampleCharges,
      sales_tax_percentage: 6,
      deposit_percentage: 40,
    });
    expect(recalculatedDraft).toMatchObject({
      tax_rate: 0.06,
      total_price: 1961,
      deposit_percentage: 40,
      deposit_amount: 784.4,
    });
  });

  it('strips browser-provided derived totals from admin update input', () => {
    const parsed = quoteRequestUpdateSchema.parse({
      id: '00000000-0000-4000-8000-000000000001',
      base_price: 1850,
      subtotal: 1,
      total_price: 1,
      deposit_amount: 1,
      final_balance: 0,
    });

    expect(parsed).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      base_price: 1850,
    });
  });

  it('accepts Supabase offset timestamps when updating a quote status', () => {
    const parsed = quoteRequestUpdateSchema.parse({
      id: '00000000-0000-4000-8000-000000000001',
      status: 'booked',
      agreement_status: 'sent',
      agreement_sent_at: '2026-08-09T18:30:00.000+00:00',
    });

    expect(parsed).toMatchObject({
      status: 'booked',
      agreement_status: 'sent',
      agreement_sent_at: '2026-08-09T18:30:00.000+00:00',
    });
  });
});
