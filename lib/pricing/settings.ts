import { DEFAULT_PRICING } from '@/lib/pricing-engine';
import type { PricingSettings } from '@/lib/types/quote';

export type SettingKey = keyof PricingSettings;
export type SettingDefinition = { key: SettingKey; label: string; help?: string; unit?: string; max?: number; integer?: boolean; options?: readonly (readonly [number, string])[] };
const yesNo = [[0, 'Add as a separate fee'], [1, 'Included in base price']] as const;
const rounding = [[1, 'Round up to the next hour'], [0, 'Prorate to the minute']] as const;
export const PRICING_SECTIONS: { id: string; title: string; description: string; fields: SettingDefinition[] }[] = [
  { id: 'guest-pricing', title: 'Guest pricing', description: 'Set the base rental price for each guest range. Included services are selected below.', fields: [
    { key: 'base_price_100_guests', label: 'Up to 100 guests', unit: '$' },
    { key: 'base_price_150_guests', label: '101–150 guests', unit: '$' },
    { key: 'base_price_200_guests', label: '151–200 guests', unit: '$' },
    { key: 'base_price_200_plus', label: '201+ guests · starting price', unit: '$', help: 'Use service-review thresholds below for larger events.' },
  ] },
  { id: 'event-hours', title: 'Event hours', description: 'Charge for scheduled guest use. Early delivery or a delayed pickup does not add event hours.', fields: [
    { key: 'event_time_policy_enabled', label: 'Time calculation', options: [[0, 'Current end-time calculation'], [1, 'Scheduled guest-use window']], help: 'Scheduled use reads both start and end. An end earlier than the start means the next day; late-night charges continue until that end. Equal times and multi-day events need a separate quote.' },
    { key: 'extra_hours_enabled', label: 'Charge for extra event hours', options: [[0, 'Off'], [1, 'On']], help: 'Applies only with the scheduled guest-use window.' },
    { key: 'included_event_hours', label: 'Included event hours', unit: 'hours', max: 24 },
    { key: 'additional_event_hourly_rate', label: 'Additional event hourly rate', unit: '$ / hour' },
    { key: 'duration_rounding', label: 'Partial extra hours', options: rounding },
    { key: 'after_hours_cutoff_hour', label: 'After-hours start', unit: 'time', max: 23, integer: true },
    { key: 'after_hours_hourly_rate', label: 'After-hours hourly rate', unit: '$ / hour' },
    { key: 'after_hours_rounding', label: 'Partial after-hours use', options: rounding },
    { key: 'after_hours_max_hours', label: 'After-hours charge limit', unit: 'hours', max: 24, help: '0 means no limit. The current default caps the charge at 4 hours.' },
    { key: 'stack_hourly_charges', label: 'When both hourly charges apply', options: [[1, 'Add both charges'], [0, 'Charge the higher total only']], help: 'For scheduled use only. Compare the full duration surcharge with the full after-hours surcharge.' },
  ] },
  { id: 'delivery', title: 'Delivery & utilities', description: 'Mileage uses the existing driving-distance calculation. Preview miles are entered manually.', fields: [
    { key: 'included_miles', label: 'Included delivery miles', unit: 'miles' },
    { key: 'travel_rate_per_mile', label: 'Additional mileage rate', unit: '$ / mile' },
    { key: 'generator_fee', label: 'Generator fee', unit: '$' },
    { key: 'generator_included', label: 'Generator pricing', options: yesNo, help: 'A separate fee applies only when power is unavailable.' },
    { key: 'water_fee', label: 'Water supply fee', unit: '$' },
    { key: 'water_included', label: 'Water supply pricing', options: yesNo, help: 'A separate fee applies only when water is unavailable. This does not include pumping or replenishment service.' },
  ] },
  { id: 'other-charges', title: 'Other charges', description: 'Keep a fee amount on file and choose whether it is already covered by the base rental.', fields: [
    { key: 'cleaning_fee', label: 'Cleaning fee', unit: '$' },
    { key: 'cleaning_included', label: 'Cleaning pricing', options: yesNo },
    { key: 'damage_waiver_fee', label: 'Damage waiver fee', unit: '$' },
    { key: 'damage_waiver_included', label: 'Damage waiver pricing', options: yesNo },
    { key: 'rush_booking_fee', label: 'Rush booking fee', unit: '$' },
    { key: 'rush_booking_window_days', label: 'Rush booking window', unit: 'days', max: 365, integer: true, help: 'Charge when the event is this many days away or sooner.' },
    { key: 'extra_day_fee', label: 'Extra day · reference rate', unit: '$', help: 'Saved for reference only. Multi-day charges are not added automatically; prepare a separate quote.' },
  ] },
  { id: 'service-review', title: 'Service review', description: 'Flag events for a pumping or water-service review. These reminders do not add a fee or block a booking.', fields: [
    { key: 'service_review_guest_threshold', label: 'Review above this guest count', unit: 'guests', integer: true, help: '0 turns this reminder off. Enter 200 to flag 201+ guests.' },
    { key: 'service_review_hour_threshold', label: 'Review above this duration', unit: 'hours', max: 24, help: '0 turns this reminder off. Uses the scheduled event length.' },
  ] },
  { id: 'tax-deposit', title: 'Tax & deposit', description: 'Tax is calculated after discounts. The deposit is a percentage of the tax-inclusive total.', fields: [
    { key: 'sales_tax_percentage', label: 'Sales tax', unit: '%', max: 100 },
    { key: 'deposit_percentage', label: 'Deposit required', unit: '%', max: 100 },
  ] },
];
export const PRICING_FIELDS = PRICING_SECTIONS.flatMap(section => section.fields);

/** Same validation on client and server; never coerce an empty value to free. */
export function validatePricingSettings(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { settings: 'Provide pricing settings as an object.' };
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    const field = PRICING_FIELDS.find(item => item.key === key);
    if (!field) { errors[key] = 'Unknown pricing setting.'; continue; }
    if (typeof value !== 'number' || !Number.isFinite(value)) errors[key] = `${field.label}: enter a number.`;
    else if (value < 0 || value > (field.max ?? 1000000)) errors[key] = `${field.label}: enter 0–${field.max ?? 1000000}.`;
    else if (field.integer && !Number.isInteger(value)) errors[key] = `${field.label}: enter a whole number.`;
    else if (field.options && !field.options.some(([option]) => option === value)) errors[key] = `${field.label}: select a listed choice.`;
  }
  if (!Object.keys(input).length) errors.settings = 'No pricing settings were provided.';
  return errors;
}

export function mergePricingSettings(rows: { setting_key: string; setting_value: unknown }[]): PricingSettings {
  const settings = { ...DEFAULT_PRICING };
  for (const row of rows) {
    if (Object.hasOwn(DEFAULT_PRICING, row.setting_key)) settings[row.setting_key as SettingKey] = Number(row.setting_value);
  }
  return settings;
}

export function formatSetting(field: SettingDefinition, value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return 'Not set';
  if (field.options) return field.options.find(([key]) => key === value)?.[1] ?? `Invalid choice (${value})`;
  if (field.unit === 'time') return value >= 0 && value <= 23 ? `${value % 12 || 12}:00 ${value < 12 ? 'AM' : 'PM'}` : `Invalid hour (${value})`;
  if (field.unit?.startsWith('$')) return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}${field.unit.slice(1)}`;
  return `${value}${field.unit === '%' ? '%' : ` ${field.unit ?? ''}`}`;
}
