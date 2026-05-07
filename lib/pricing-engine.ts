import { PriceBreakdown, PricingSettings, QuoteFormData, QuoteLineItem } from './types/quote';

export const DEFAULT_PRICING: PricingSettings = {
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
  deposit_percentage: 25,
};

const RUSH_BOOKING_WINDOW_DAYS = 14;
const roundMoney = (value: number): number => Math.round(value * 100) / 100;

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
    const eventDate = new Date(data.event_date);
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
  return { fee: roundMoney(extraMiles * settings.travel_rate_per_mile), extraMiles };
}

export function calculateUtilityFee(hasPower: boolean, hasWater: boolean, settings: PricingSettings = DEFAULT_PRICING): { fee: number; generatorNeeded: boolean; waterNeeded: boolean } {
  const generatorNeeded = !hasPower;
  const waterNeeded = !hasWater;
  const fee = (generatorNeeded ? settings.generator_fee : 0) + (waterNeeded ? settings.water_fee : 0);
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

  let endMinutes = (parsed.hours % 24) * 60 + parsed.minutes;
  if (endMinutes <= cutoffMinutes) endMinutes += 24 * 60;

  const afterHoursMinutes = endMinutes - cutoffMinutes;
  if (afterHoursMinutes <= 0) return { fee: 0, hoursCount: 0 };

  const hoursCount = Math.min(4, Math.ceil(afterHoursMinutes / 60));
  return { fee: roundMoney(hoursCount * settings.after_hours_hourly_rate), hoursCount };
}

export function calculateRushBookingFee(eventDate: string, now = new Date(), settings: PricingSettings = DEFAULT_PRICING): { fee: number; daysOut: number | null } {
  const parsed = new Date(eventDate);
  if (Number.isNaN(parsed.getTime())) return { fee: 0, daysOut: null };
  const daysOut = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { fee: daysOut <= RUSH_BOOKING_WINDOW_DAYS ? settings.rush_booking_fee : 0, daysOut };
}

export function calculateQuotePrice(
  guestCount: number,
  distanceMiles: number,
  hasPower: boolean,
  hasWater: boolean,
  endTime: string,
  eventDate: string,
  settings: PricingSettings = DEFAULT_PRICING
): PriceBreakdown {
  const basePrice = getBasePrice(guestCount, settings);
  const { fee: travelFee, extraMiles } = calculateTravelFee(distanceMiles, settings);
  const { fee: utilityFee, generatorNeeded, waterNeeded } = calculateUtilityFee(hasPower, hasWater, settings);
  const { fee: afterHoursFee, hoursCount: afterHoursCount } = calculateAfterHoursFee(endTime, settings);
  const { fee: rushBookingFee, daysOut } = calculateRushBookingFee(eventDate, new Date(), settings);
  const cleaningFee = settings.cleaning_fee;
  const damageWaiverFee = settings.damage_waiver_fee;

  const lineItems: QuoteLineItem[] = [
    { code: 'base_rental', label: `Base rental (${getGuestTier(guestCount)})`, quantity: 1, unit_price: basePrice, total: basePrice },
    { code: 'travel', label: 'Travel', quantity: extraMiles, unit_price: settings.travel_rate_per_mile, total: travelFee },
    { code: 'utilities', label: 'Utilities', quantity: 1, unit_price: utilityFee, total: utilityFee },
    { code: 'after_hours', label: 'After hours', quantity: afterHoursCount, unit_price: settings.after_hours_hourly_rate, total: afterHoursFee },
    { code: 'cleaning', label: 'Cleaning fee', quantity: 1, unit_price: cleaningFee, total: cleaningFee },
    { code: 'damage_waiver', label: 'Damage waiver', quantity: 1, unit_price: damageWaiverFee, total: damageWaiverFee },
    { code: 'rush_booking', label: 'Rush booking', quantity: rushBookingFee > 0 ? 1 : 0, unit_price: rushBookingFee, total: rushBookingFee },
  ];

  const subtotal = roundMoney(basePrice + travelFee + utilityFee + afterHoursFee + cleaningFee + damageWaiverFee + rushBookingFee);
  const depositAmount = roundMoney((subtotal * settings.deposit_percentage) / 100);
  const finalBalance = roundMoney(subtotal - depositAmount);

  return {
    base_price: basePrice,
    travel_fee: travelFee,
    utility_fee: utilityFee,
    after_hours_fee: afterHoursFee,
    cleaning_fee: cleaningFee,
    damage_waiver_fee: damageWaiverFee,
    rush_booking_fee: rushBookingFee,
    subtotal,
    total_price: subtotal,
    deposit_amount: depositAmount,
    final_balance: finalBalance,
    line_items: lineItems,
    details: {
      guest_tier: getGuestTier(guestCount),
      distance_miles: distanceMiles,
      extra_miles: extraMiles,
      generator_needed: generatorNeeded,
      water_needed: waterNeeded,
      after_hours_count: afterHoursCount,
      rush_days_out: daysOut,
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
