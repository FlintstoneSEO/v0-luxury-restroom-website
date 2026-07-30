import { defaultPricing } from '@/lib/pricing/defaultPricing';
import { calculateQuoteFinancials } from '@/lib/pricing-engine';

export interface CalculateQuoteInput {
  guestCount: number;
  basePrice?: number;
  deliveryFee?: number;
  addOnsTotal?: number;
  discount?: number;
}

export interface CalculatedQuoteTotals {
  basePrice: number;
  deliveryFee: number;
  addOnsTotal: number;
  discount: number;
  tax: number;
  total: number;
  depositAmount: number;
  remainingBalance: number;
}

function getTierBasePrice(guestCount: number): number {
  const tier = defaultPricing.guestCountTiers.find((item) => item.maxGuests === null || guestCount <= item.maxGuests);
  return tier?.basePrice ?? 0;
}

export function calculateQuote(input: CalculateQuoteInput): CalculatedQuoteTotals {
  const basePrice = input.basePrice ?? getTierBasePrice(input.guestCount);
  const deliveryFee = input.deliveryFee ?? defaultPricing.deliveryFee;
  const addOnsTotal = input.addOnsTotal ?? 0;
  const discount = input.discount ?? 0;
  const financials = calculateQuoteFinancials({
    base_price: basePrice,
    travel_fee: deliveryFee,
    utility_fee: addOnsTotal,
    discount_amount: discount,
    sales_tax_percentage: defaultPricing.salesTaxPercentage,
    deposit_percentage: defaultPricing.defaultDepositPercentage * 100,
  });

  return {
    basePrice,
    deliveryFee,
    addOnsTotal,
    discount,
    tax: financials.sales_tax_amount,
    total: financials.total_price,
    depositAmount: financials.deposit_amount,
    remainingBalance: financials.final_balance,
  };
}
