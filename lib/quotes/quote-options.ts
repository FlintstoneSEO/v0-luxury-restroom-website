import { buildQuoteCalculation } from '@/lib/quotes/build-quote-calculation';
import { getPricingSettings } from '@/lib/quotes/build-quote-calculation';
import {
  calculateQuoteFinancials,
  DEFAULT_PRICING,
  QuoteFinancialInput,
} from '@/lib/pricing-engine';
import { QuoteFormData } from '@/lib/types/quote';

const MONEY_FIELDS = [
  'base_price',
  'travel_fee',
  'utility_fee',
  'after_hours_fee',
  'cleaning_fee',
  'damage_waiver_fee',
  'rush_booking_fee',
  'subtotal',
  'discount_amount',
  'pretax_total',
  'taxable_amount',
  'tax_rate',
  'sales_tax_amount',
  'total_price',
  'deposit_percentage',
  'deposit_amount',
  'final_balance',
] as const;

type MoneyField = (typeof MONEY_FIELDS)[number];

type OptionPricingInput = Partial<Record<MoneyField, number | null>> & {
  sales_tax_percentage?: number | null;
};

export function normalizeOptionPricing(input: OptionPricingInput) {
  const serviceFields: QuoteFinancialInput = {
    base_price: input.base_price,
    travel_fee: input.travel_fee,
    utility_fee: input.utility_fee,
    after_hours_fee: input.after_hours_fee,
    cleaning_fee: input.cleaning_fee,
    damage_waiver_fee: input.damage_waiver_fee,
    rush_booking_fee: input.rush_booking_fee,
    discount_amount: input.discount_amount,
    sales_tax_percentage: input.sales_tax_percentage ?? DEFAULT_PRICING.sales_tax_percentage,
    deposit_percentage: input.deposit_percentage ?? DEFAULT_PRICING.deposit_percentage,
  };

  return {
    base_price: Number(input.base_price ?? 0),
    travel_fee: Number(input.travel_fee ?? 0),
    utility_fee: Number(input.utility_fee ?? 0),
    after_hours_fee: Number(input.after_hours_fee ?? 0),
    cleaning_fee: Number(input.cleaning_fee ?? 0),
    damage_waiver_fee: Number(input.damage_waiver_fee ?? 0),
    rush_booking_fee: Number(input.rush_booking_fee ?? 0),
    ...calculateQuoteFinancials(serviceFields),
  };
}

export async function recalculateQuoteOption(quote: QuoteFormData, option: { has_power?: boolean | null; has_water?: boolean | null; discount_amount?: number | null }) {
  const optionInput: QuoteFormData = {
    ...quote,
    has_power: option.has_power ?? quote.has_power,
    has_water: option.has_water ?? quote.has_water,
  };

  const calculation = await buildQuoteCalculation(optionInput);
  const discountAmount = Number(option.discount_amount ?? 0);
  const pricingSettings = await getPricingSettings();
  const normalized = normalizeOptionPricing({
    ...calculation.priceBreakdown,
    discount_amount: discountAmount,
    sales_tax_percentage: pricingSettings.sales_tax_percentage,
    deposit_percentage: pricingSettings.deposit_percentage,
  });

  return {
    ...normalized,
    distance_miles: calculation.distanceMiles,
    calculated_breakdown: {
      ...calculation.priceBreakdown,
      ...normalized,
      details: {
        ...calculation.priceBreakdown.details,
        sales_tax_percentage: pricingSettings.sales_tax_percentage,
        deposit_percentage: pricingSettings.deposit_percentage,
      },
    },
    needs_manual_distance_review: calculation.distanceCalculationStatus === 'fallback',
  };
}
