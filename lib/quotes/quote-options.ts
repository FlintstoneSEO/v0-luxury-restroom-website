import { buildQuoteCalculation } from '@/lib/quotes/build-quote-calculation';
import { getPricingSettings } from '@/lib/quotes/build-quote-calculation';
import { calculateQuotePrice, DEFAULT_PRICING } from '@/lib/pricing-engine';
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
  'total_price',
  'deposit_amount',
  'final_balance',
] as const;

type MoneyField = (typeof MONEY_FIELDS)[number];

type OptionPricingInput = Partial<Record<MoneyField, number | null>> & { deposit_percentage?: number | null };

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeOptionPricing(input: OptionPricingInput) {
  const output: Record<MoneyField, number> = {} as Record<MoneyField, number>;

  for (const field of MONEY_FIELDS) {
    const value = Number(input[field] ?? 0);
    output[field] = Number.isFinite(value) ? Math.max(0, roundMoney(value)) : 0;
  }

  output.subtotal = roundMoney(
    output.base_price +
      output.travel_fee +
      output.utility_fee +
      output.after_hours_fee +
      output.cleaning_fee +
      output.damage_waiver_fee +
      output.rush_booking_fee
  );
  output.total_price = roundMoney(Math.max(0, output.subtotal - output.discount_amount));

  const depositPercentage = Number(input.deposit_percentage ?? DEFAULT_PRICING.deposit_percentage);
  output.deposit_amount = roundMoney(output.total_price * (Number.isFinite(depositPercentage) ? depositPercentage : DEFAULT_PRICING.deposit_percentage) / 100);

  output.final_balance = roundMoney(Math.max(0, output.total_price - output.deposit_amount));

  return output;
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
  const recalculatedTotals = calculateQuotePrice(
    optionInput.guest_count,
    calculation.distanceMiles,
    optionInput.has_power,
    optionInput.has_water,
    optionInput.event_end_time,
    optionInput.event_date,
    pricingSettings
  );
  const normalized = normalizeOptionPricing({
    ...calculation.priceBreakdown,
    discount_amount: discountAmount,
    deposit_percentage: pricingSettings.deposit_percentage,
  });

  return {
    ...normalized,
    distance_miles: calculation.distanceMiles,
    calculated_breakdown: {
      ...calculation.priceBreakdown,
      ...normalized,
      line_items: recalculatedTotals.line_items,
    },
    needs_manual_distance_review: calculation.distanceCalculationStatus === 'fallback',
  };
}
