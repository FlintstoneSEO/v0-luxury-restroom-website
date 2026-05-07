import { defaultPricing } from '@/lib/pricing/defaultPricing';

export interface CalculateQuoteInput {
  guestCount: number;
  basePrice?: number;
  deliveryFee?: number;
  addOnsTotal?: number;
  discount?: number;
  tax?: number;
  depositAmount?: number;
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
  const tax = input.tax ?? 0;

  const subtotal = basePrice + deliveryFee + addOnsTotal - discount;
  const total = Math.max(0, subtotal + tax);

  const depositAmount =
    input.depositAmount ??
    Math.min(total, Math.max(defaultPricing.defaultDepositAmount, Number((total * defaultPricing.defaultDepositPercentage).toFixed(2))));

  const remainingBalance = Math.max(0, Number((total - depositAmount).toFixed(2)));

  return {
    basePrice,
    deliveryFee,
    addOnsTotal,
    discount,
    tax,
    total: Number(total.toFixed(2)),
    depositAmount: Number(depositAmount.toFixed(2)),
    remainingBalance,
  };
}
