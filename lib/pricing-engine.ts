import { PricingSettings, PriceBreakdown } from './types/quote';

const DEFAULT_PRICING: PricingSettings = {
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
  deposit_percentage: 25,
};

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

export function calculateTravelFee(
  distanceMiles: number,
  settings: PricingSettings = DEFAULT_PRICING
): { fee: number; extraMiles: number } {
  const extraMiles = Math.max(0, distanceMiles - settings.included_miles);
  const fee = extraMiles * settings.travel_rate_per_mile;
  return { fee: Math.round(fee * 100) / 100, extraMiles };
}

export function calculateUtilityFee(
  hasPower: boolean,
  hasWater: boolean,
  settings: PricingSettings = DEFAULT_PRICING
): { fee: number; generatorNeeded: boolean; waterNeeded: boolean } {
  let fee = 0;
  const generatorNeeded = !hasPower;
  const waterNeeded = !hasWater;
  
  if (generatorNeeded) fee += settings.generator_fee;
  if (waterNeeded) fee += settings.water_fee;
  
  return { fee, generatorNeeded, waterNeeded };
}

export function parseTime(timeStr: string): number {
  // Parse time string like "14:00" or "2:00 PM" to hour number
  if (timeStr.includes(':')) {
    const [hours, minutesPart] = timeStr.split(':');
    let hour = parseInt(hours, 10);
    
    // Check for AM/PM
    if (minutesPart) {
      const isPM = minutesPart.toLowerCase().includes('pm');
      const isAM = minutesPart.toLowerCase().includes('am');
      
      if (isPM && hour !== 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
    }
    
    return hour;
  }
  return parseInt(timeStr, 10);
}

export function calculateAfterHoursFee(
  endTime: string,
  settings: PricingSettings = DEFAULT_PRICING
): { fee: number; hoursCount: number } {
  const endHour = parseTime(endTime);
  const cutoffHour = settings.after_hours_cutoff_hour;
  
  if (endHour <= cutoffHour) {
    return { fee: 0, hoursCount: 0 };
  }
  
  // Calculate hours past cutoff (handle midnight crossing)
  let hoursCount = endHour > cutoffHour ? endHour - cutoffHour : (24 - cutoffHour) + endHour;
  
  // Cap at reasonable max (4 hours)
  hoursCount = Math.min(hoursCount, 4);
  
  const fee = hoursCount * settings.after_hours_hourly_rate;
  return { fee, hoursCount };
}

export function calculateQuotePrice(
  guestCount: number,
  distanceMiles: number,
  hasPower: boolean,
  hasWater: boolean,
  endTime: string,
  settings: PricingSettings = DEFAULT_PRICING
): PriceBreakdown {
  const basePrice = getBasePrice(guestCount, settings);
  const { fee: travelFee, extraMiles } = calculateTravelFee(distanceMiles, settings);
  const { fee: utilityFee, generatorNeeded, waterNeeded } = calculateUtilityFee(hasPower, hasWater, settings);
  const { fee: afterHoursFee, hoursCount: afterHoursCount } = calculateAfterHoursFee(endTime, settings);
  
  const totalPrice = basePrice + travelFee + utilityFee + afterHoursFee;
  const depositAmount = Math.round((totalPrice * settings.deposit_percentage / 100) * 100) / 100;
  const finalBalance = Math.round((totalPrice - depositAmount) * 100) / 100;
  
  return {
    base_price: basePrice,
    travel_fee: travelFee,
    utility_fee: utilityFee,
    after_hours_fee: afterHoursFee,
    total_price: totalPrice,
    deposit_amount: depositAmount,
    final_balance: finalBalance,
    details: {
      guest_tier: getGuestTier(guestCount),
      distance_miles: distanceMiles,
      extra_miles: extraMiles,
      generator_needed: generatorNeeded,
      water_needed: waterNeeded,
      after_hours_count: afterHoursCount,
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
