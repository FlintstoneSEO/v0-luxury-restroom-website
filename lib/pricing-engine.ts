import { parseLocalDateOnly } from './date-only';
import { PriceBreakdown, PricingSettings, QuoteFormData, QuoteLineItem } from './types/quote';

export const DEFAULT_PRICING: PricingSettings = {
  event_time_policy_enabled: 0,
  extra_hours_enabled: 0,
  included_event_hours: 8,
  additional_event_hourly_rate: 100,
  duration_rounding: 1,
  after_hours_rounding: 1,
  after_hours_max_hours: 4,
  stack_hourly_charges: 1,
  cleaning_included: 0,
  damage_waiver_included: 0,
  generator_included: 0,
  water_included: 0,
  service_review_guest_threshold: 0,
  service_review_hour_threshold: 0,
  rush_booking_window_days: 14,
  base_price_100_guests: 650,
  base_price_150_guests: 750,
  base_price_200_guests: 900,
  base_price_200_plus: 1100,
  included_miles: 30,
  travel_rate_per_mile: 2.5,
  generator_fee: 150,
  water_fee: 100,
  after_hours_hourly_rate: 75,
  after_hours_cutoff_hour: 22,
  damage_waiver_fee: 75,
  rush_booking_fee: 250,
  cleaning_fee: 125,
  extra_day_fee: 275,
  sales_tax_percentage: 6,
  deposit_percentage: 40,
};

export const roundCurrency = (value: number): number =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export type QuoteFinancialInput = {
  extra_hours_fee?: number | null;
  base_price?: number | null;
  travel_fee?: number | null;
  utility_fee?: number | null;
  after_hours_fee?: number | null;
  cleaning_fee?: number | null;
  damage_waiver_fee?: number | null;
  rush_booking_fee?: number | null;
  discount_amount?: number | null;
  sales_tax_percentage?: number | null;
  deposit_percentage?: number | null;
};

export type QuoteFinancialTotals = {
  subtotal: number;
  discount_amount: number;
  pretax_total: number;
  taxable_amount: number;
  tax_rate: number;
  sales_tax_amount: number;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  final_balance: number;
};

export type StoredFinancialSnapshot = {
  pretax_total: number;
  sales_tax_amount: number;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  final_balance: number;
};

function nonNegativeCurrency(value: number | null | undefined): number {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? Math.max(0, roundCurrency(numericValue)) : 0;
}

function nonNegativePercentage(value: number | null | undefined, fallback: number): number {
  const numericValue = Number(value ?? fallback);
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : fallback;
}

export function calculateQuoteFinancials(input: QuoteFinancialInput): QuoteFinancialTotals {
  const subtotal = roundCurrency(
    nonNegativeCurrency(input.extra_hours_fee) +
      nonNegativeCurrency(input.base_price) +
      nonNegativeCurrency(input.travel_fee) +
      nonNegativeCurrency(input.utility_fee) +
      nonNegativeCurrency(input.after_hours_fee) +
      nonNegativeCurrency(input.cleaning_fee) +
      nonNegativeCurrency(input.damage_waiver_fee) +
      nonNegativeCurrency(input.rush_booking_fee)
  );
  const discountAmount = nonNegativeCurrency(input.discount_amount);
  const pretaxTotal = roundCurrency(Math.max(0, subtotal - discountAmount));
  const taxableAmount = pretaxTotal;
  const salesTaxPercentage = nonNegativePercentage(
    input.sales_tax_percentage,
    DEFAULT_PRICING.sales_tax_percentage
  );
  const taxRate = salesTaxPercentage / 100;
  const salesTaxAmount = roundCurrency(taxableAmount * taxRate);
  const totalPrice = roundCurrency(pretaxTotal + salesTaxAmount);
  const depositPercentage = nonNegativePercentage(
    input.deposit_percentage,
    DEFAULT_PRICING.deposit_percentage
  );
  const depositAmount = roundCurrency((totalPrice * depositPercentage) / 100);
  const finalBalance = roundCurrency(Math.max(0, totalPrice - depositAmount));

  return {
    subtotal,
    discount_amount: discountAmount,
    pretax_total: pretaxTotal,
    taxable_amount: taxableAmount,
    tax_rate: taxRate,
    sales_tax_amount: salesTaxAmount,
    total_price: totalPrice,
    deposit_percentage: depositPercentage,
    deposit_amount: depositAmount,
    final_balance: finalBalance,
  };
}

export function isFinancialSnapshotConsistent(snapshot: StoredFinancialSnapshot): boolean {
  const expectedTotal = roundCurrency(
    Number(snapshot.pretax_total ?? 0) + Number(snapshot.sales_tax_amount ?? 0)
  );
  const expectedDeposit = roundCurrency(
    (Number(snapshot.total_price ?? 0) * Number(snapshot.deposit_percentage ?? 0)) / 100
  );
  const expectedBalance = roundCurrency(
    Math.max(0, Number(snapshot.total_price ?? 0) - Number(snapshot.deposit_amount ?? 0))
  );

  return (
    Math.abs(expectedTotal - Number(snapshot.total_price ?? 0)) < 0.005 &&
    Math.abs(expectedDeposit - Number(snapshot.deposit_amount ?? 0)) < 0.005 &&
    Math.abs(expectedBalance - Number(snapshot.final_balance ?? 0)) < 0.005
  );
}

export function validateQuoteFormData(data: QuoteFormData): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (!data.customer_name || data.customer_name.trim().length < 2) errors.customer_name = ['Please enter your full name'];
  if (!data.email || !data.email.includes('@')) errors.email = ['Please enter a valid email address'];
  if (!data.phone || data.phone.replace(/\D/g, '').length < 10) errors.phone = ['Please enter a valid phone number'];
  if (!data.event_type) errors.event_type = ['Please select an event type'];
  if (!data.guest_count || data.guest_count < 1) errors.guest_count = ['Please enter the expected number of guests'];
  if (!data.event_address) errors.event_address = ['Please enter the event address'];
  if (!data.city) errors.city = ['Please enter the city'];
  if (!data.zip_code || data.zip_code.length < 5) errors.zip_code = ['Please enter a valid ZIP code'];
  if (!data.event_start_time) errors.event_start_time = ['Please select a start time'];
  if (!data.event_end_time) errors.event_end_time = ['Please select an end time'];

  if (!data.event_date) {
    errors.event_date = ['Please select an event date'];
  } else {
    const eventDate = parseLocalDateOnly(data.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) errors.event_date = ['Event date must be in the future'];
  }

  return errors;
}

export function getBasePrice(guestCount: number, settings: PricingSettings = DEFAULT_PRICING): number {
  if (guestCount <= 100) return settings.base_price_100_guests;
  if (guestCount <= 150) return settings.base_price_150_guests;
  if (guestCount <= 200) return settings.base_price_200_guests;
  return settings.base_price_200_plus;
}

export function getGuestTier(guestCount: number): string {
  if (guestCount <= 100) return 'Up to 100 guests';
  if (guestCount <= 150) return '101-150 guests';
  if (guestCount <= 200) return '151-200 guests';
  return '200+ guests';
}

export function calculateTravelFee(distanceMiles: number, settings: PricingSettings = DEFAULT_PRICING): { fee: number; extraMiles: number } {
  const extraMiles = Math.max(0, distanceMiles - settings.included_miles);
  return { fee: roundCurrency(extraMiles * settings.travel_rate_per_mile), extraMiles };
}

export function calculateUtilityFee(hasPower: boolean, hasWater: boolean, settings: PricingSettings = DEFAULT_PRICING): { fee: number; generatorNeeded: boolean; waterNeeded: boolean } {
  const generatorNeeded = !hasPower;
  const waterNeeded = !hasWater;
  const fee = (generatorNeeded && !settings.generator_included ? settings.generator_fee : 0) + (waterNeeded && !settings.water_included ? settings.water_fee : 0);
  return { fee, generatorNeeded, waterNeeded };
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const normalized = timeStr.trim().toLowerCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2] ?? '0', 10);
  const meridiem = match[3];

  if (meridiem === 'pm' && hours !== 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;

  return { hours, minutes };
}

export function calculateAfterHoursFee(endTime: string, settings: PricingSettings = DEFAULT_PRICING): { fee: number; hoursCount: number } {
  const parsed = parseTime(endTime);
  const cutoffHour = settings.after_hours_cutoff_hour;
  const cutoffMinutes = cutoffHour * 60;

  const overnightContinuationHours = new Set([0, 1, 2, 3, 4]);
  const isOvernightContinuation = overnightContinuationHours.has(parsed.hours);

  const sameDayEndMinutes = (parsed.hours % 24) * 60 + parsed.minutes;

  if (!isOvernightContinuation && sameDayEndMinutes <= cutoffMinutes) {
    return { fee: 0, hoursCount: 0 };
  }

  const endMinutes = isOvernightContinuation ? sameDayEndMinutes + 24 * 60 : sameDayEndMinutes;
  const afterHoursMinutes = endMinutes - cutoffMinutes;

  if (afterHoursMinutes <= 0) {
    return { fee: 0, hoursCount: 0 };
  }

  const rounded = settings.after_hours_rounding === 0 ? afterHoursMinutes / 60 : Math.ceil(afterHoursMinutes / 60);
  const cap = settings.after_hours_max_hours ?? 4;
  const hoursCount = cap > 0 ? Math.min(cap, rounded) : rounded;
  return { fee: roundCurrency(hoursCount * settings.after_hours_hourly_rate), hoursCount };
}

export function calculateRushBookingFee(eventDate: string, now = new Date(), settings: PricingSettings = DEFAULT_PRICING): { fee: number; daysOut: number | null } {
  const parsed = parseLocalDateOnly(eventDate);
  if (Number.isNaN(parsed.getTime())) return { fee: 0, daysOut: null };
  const eventOrdinal = Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const todayOrdinal = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysOut = Math.round((eventOrdinal - todayOrdinal) / (1000 * 60 * 60 * 24));
  return { fee: daysOut <= (settings.rush_booking_window_days ?? 14) ? settings.rush_booking_fee : 0, daysOut };
}

/** Extra event hours live in the existing immutable JSON snapshot, not a fee column. */
export function getExtraHoursFee(breakdown: unknown): number {
  if (!breakdown || typeof breakdown !== 'object') return 0;
  return nonNegativeCurrency(Number((breakdown as Record<string, unknown>).extra_hours_fee ?? 0));
}

export function getStoredServiceReviewReasons(breakdown: unknown): string[] {
  if (!breakdown || typeof breakdown !== 'object') return [];
  const details = (breakdown as { details?: { service_review_reasons?: unknown } }).details;
  return Array.isArray(details?.service_review_reasons) ? details.service_review_reasons.filter((value): value is string => typeof value === 'string') : [];
}

export function getServiceReviewReasons(guests: number, hours: number | null, settings: PricingSettings): string[] {
  const reasons: string[] = [];
  if ((settings.service_review_guest_threshold ?? 0) > 0 && guests > settings.service_review_guest_threshold!) reasons.push(`More than ${settings.service_review_guest_threshold} guests: review pumping and water service.`);
  if ((settings.service_review_hour_threshold ?? 0) > 0 && hours !== null && hours > settings.service_review_hour_threshold!) reasons.push(`More than ${settings.service_review_hour_threshold} event hours: review pumping and water service.`);
  return reasons;
}

export function eventTimeMinutes(time: string): number {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(time)) throw new Error('Enter valid event start and end times.');
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function calculateEventTimeCharges(start: string | undefined, end: string, settings: PricingSettings) {
  let eventHours: number | null = null;
  let startMinutes = 0;
  let endMinutes = 0;
  if (start) {
    try {
      startMinutes = eventTimeMinutes(start);
      endMinutes = eventTimeMinutes(end);
      if (endMinutes < startMinutes) endMinutes += 1440;
      eventHours = (endMinutes - startMinutes) / 60;
    } catch (error) {
      // Historical end-time quotes did not require a parseable start time.
      if (settings.event_time_policy_enabled) throw error;
    }
  }
  if (!settings.event_time_policy_enabled) {
    const legacy = calculateAfterHoursFee(end, settings);
    return { eventHours, afterHoursFee: legacy.fee, afterHoursCount: legacy.hoursCount, extraHoursFee: 0, extraHoursCount: 0 };
  }
  if (eventHours === null || eventHours <= 0) throw new Error('Scheduled-use pricing needs different start and end times. Multi-day events require a separate quote.');
  const roundHours = (hours: number, rounding: number | undefined) => rounding === 0 ? hours : Math.ceil(hours);
  const extraHoursCount = settings.extra_hours_enabled ? roundHours(Math.max(0, eventHours - (settings.included_event_hours ?? 8)), settings.duration_rounding) : 0;
  // Late-night service continues through the end of an overnight event. A late start
  // never charges time before guests arrive. An earlier end explicitly means next day.
  const lateHours = Math.max(0, endMinutes - Math.max(startMinutes, settings.after_hours_cutoff_hour * 60)) / 60;
  let afterHoursCount = roundHours(lateHours, settings.after_hours_rounding);
  const cap = settings.after_hours_max_hours ?? 4;
  if (cap > 0) afterHoursCount = Math.min(cap, afterHoursCount);
  let extraHoursFee = roundCurrency(extraHoursCount * (settings.additional_event_hourly_rate ?? 100));
  let afterHoursFee = roundCurrency(afterHoursCount * settings.after_hours_hourly_rate);
  if (settings.stack_hourly_charges === 0) {
    if (extraHoursFee >= afterHoursFee) afterHoursFee = 0;
    else extraHoursFee = 0;
  }
  return { eventHours, extraHoursCount, afterHoursCount, extraHoursFee, afterHoursFee };
}

export function calculateQuotePrice(
  guestCount: number,
  distanceMiles: number,
  hasPower: boolean,
  hasWater: boolean,
  endTime: string,
  eventDate: string,
  settings: PricingSettings = DEFAULT_PRICING,
  startTime?: string
): PriceBreakdown {
  const basePrice = getBasePrice(guestCount, settings);
  const { fee: travelFee, extraMiles } = calculateTravelFee(distanceMiles, settings);
  const { fee: utilityFee, generatorNeeded, waterNeeded } = calculateUtilityFee(hasPower, hasWater, settings);
  const timeCharges = calculateEventTimeCharges(startTime, endTime, settings);
  const { afterHoursFee, afterHoursCount, extraHoursFee } = timeCharges;
  const { fee: rushBookingFee, daysOut } = calculateRushBookingFee(eventDate, new Date(), settings);
  const cleaningFee = settings.cleaning_included ? 0 : settings.cleaning_fee;
  const damageWaiverFee = settings.damage_waiver_included ? 0 : settings.damage_waiver_fee;

  const lineItems: QuoteLineItem[] = [
    { code: 'base_rental', label: `Base rental (${getGuestTier(guestCount)})`, quantity: 1, unit_price: basePrice, total: basePrice },
    { code: 'extra_hours', label: 'Additional event hours', quantity: timeCharges.extraHoursCount, unit_price: settings.additional_event_hourly_rate ?? 100, total: extraHoursFee },
    { code: 'travel', label: 'Travel', quantity: extraMiles, unit_price: settings.travel_rate_per_mile, total: travelFee },
    { code: 'utilities', label: 'Utilities', quantity: 1, unit_price: utilityFee, total: utilityFee },
    { code: 'after_hours', label: 'After hours', quantity: afterHoursCount, unit_price: settings.after_hours_hourly_rate, total: afterHoursFee },
    { code: 'cleaning', label: 'Cleaning fee', quantity: 1, unit_price: cleaningFee, total: cleaningFee },
    { code: 'damage_waiver', label: 'Damage waiver', quantity: 1, unit_price: damageWaiverFee, total: damageWaiverFee },
    { code: 'rush_booking', label: 'Rush booking', quantity: rushBookingFee > 0 ? 1 : 0, unit_price: rushBookingFee, total: rushBookingFee },
  ];

  const financials = calculateQuoteFinancials({
    extra_hours_fee: extraHoursFee,
    base_price: basePrice,
    travel_fee: travelFee,
    utility_fee: utilityFee,
    after_hours_fee: afterHoursFee,
    cleaning_fee: cleaningFee,
    damage_waiver_fee: damageWaiverFee,
    rush_booking_fee: rushBookingFee,
    discount_amount: 0,
    sales_tax_percentage: settings.sales_tax_percentage,
    deposit_percentage: settings.deposit_percentage,
  });

  return {
    extra_hours_fee: extraHoursFee,
    base_price: basePrice,
    travel_fee: travelFee,
    utility_fee: utilityFee,
    after_hours_fee: afterHoursFee,
    cleaning_fee: cleaningFee,
    damage_waiver_fee: damageWaiverFee,
    rush_booking_fee: rushBookingFee,
    ...financials,
    line_items: lineItems,
    details: {
      event_hours: timeCharges.eventHours,
      extra_hours_count: timeCharges.extraHoursCount,
      time_policy: settings.event_time_policy_enabled ? 'scheduled_use' : 'legacy_end_time',
      service_review_reasons: getServiceReviewReasons(guestCount, timeCharges.eventHours, settings),
      guest_tier: getGuestTier(guestCount),
      distance_miles: distanceMiles,
      extra_miles: extraMiles,
      generator_needed: generatorNeeded,
      water_needed: waterNeeded,
      after_hours_count: afterHoursCount,
      rush_days_out: daysOut,
      sales_tax_percentage: settings.sales_tax_percentage,
      deposit_percentage: settings.deposit_percentage,
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
