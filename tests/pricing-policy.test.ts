import { describe, expect, it } from 'vitest';
import { calculateEventTimeCharges, calculateQuotePrice, DEFAULT_PRICING, getExtraHoursFee } from '@/lib/pricing-engine';
import { normalizeOptionPricing } from '@/lib/quotes/quote-options';
import { mergePricingSettings, PRICING_FIELDS, validatePricingSettings } from '@/lib/pricing/settings';

const policy = { ...DEFAULT_PRICING, event_time_policy_enabled: 1, extra_hours_enabled: 1, base_price_100_guests: 1175, after_hours_max_hours: 0 };
describe('scheduled guest-use pricing', () => {
  it.each([
    ['14:00', '22:00', 0, 0], ['12:00', '22:00', 200, 0],
    ['16:00', '23:00', 0, 75], ['14:00', '23:00', 100, 75],
    ['16:00', '01:00', 100, 225], ['23:00', '01:00', 0, 150],
    ['12:00', '00:00', 400, 150], ['10:00', '20:00', 200, 0],
  ])('%s to %s produces separate duration and late-night fees', (start, end, extra, late) => {
    expect(calculateEventTimeCharges(start, end, policy)).toMatchObject({ extraHoursFee: extra, afterHoursFee: late });
  });
  it('rounds and prorates the two hourly charges independently', () => {
    expect(calculateEventTimeCharges('14:00', '22:30', policy)).toMatchObject({ extraHoursFee: 100, afterHoursFee: 75 });
    expect(calculateEventTimeCharges('14:00', '22:30', { ...policy, duration_rounding: 0, after_hours_rounding: 0 })).toMatchObject({ extraHoursFee: 50, afterHoursFee: 37.5 });
    expect(calculateEventTimeCharges('14:00', '22:30', { ...policy, duration_rounding: 0 })).toMatchObject({ extraHoursFee: 50, afterHoursFee: 75 });
  });
  it('caps only after-hours and can choose the higher surcharge', () => {
    expect(calculateEventTimeCharges('14:00', '03:00', { ...policy, after_hours_max_hours: 2 })).toMatchObject({ extraHoursFee: 500, afterHoursFee: 150 });
    expect(calculateEventTimeCharges('14:00', '23:00', { ...policy, stack_hourly_charges: 0 })).toMatchObject({ extraHoursFee: 100, afterHoursFee: 0 });
    expect(calculateEventTimeCharges('16:00', '01:00', { ...policy, stack_hourly_charges: 0 })).toMatchObject({ extraHoursFee: 0, afterHoursFee: 225 });
  });
  it('keeps existing default end-time behavior with no extra duration fee', () => {
    expect(calculateEventTimeCharges('2 PM', '11 PM', DEFAULT_PRICING)).toMatchObject({ extraHoursFee: 0, afterHoursFee: 75 });
    expect(calculateEventTimeCharges('12:00', '03:00', DEFAULT_PRICING)).toMatchObject({ extraHoursFee: 0, afterHoursFee: 300 });
    expect(calculateEventTimeCharges('12:00', '22:00', DEFAULT_PRICING)).toMatchObject({ extraHoursFee: 0, afterHoursFee: 0 });
  });
  it('rejects ambiguous equal times and invalid times in scheduled mode', () => {
    expect(() => calculateEventTimeCharges('14:00', '14:00', policy)).toThrow();
    expect(() => calculateEventTimeCharges(undefined, '23:00', policy)).toThrow();
    expect(() => calculateEventTimeCharges('25:00', '23:00', policy)).toThrow();
    expect(() => calculateEventTimeCharges('14:99', '23:00', policy)).toThrow();
  });
  it('includes every item exactly once in tax, deposit and option financials', () => {
    const result = calculateQuotePrice(100, 0, true, true, '23:00', '2099-01-01', { ...policy, cleaning_included: 1, damage_waiver_included: 1 }, '14:00');
    expect(result).toMatchObject({ base_price: 1175, extra_hours_fee: 100, after_hours_fee: 75, subtotal: 1350, sales_tax_amount: 81, total_price: 1431, deposit_amount: 572.4, final_balance: 858.6 });
    expect(result.line_items.reduce((sum, row) => sum + row.total, 0)).toBe(result.subtotal);
    const { extra_hours_fee: fee, ...storedColumns } = result;
    const option = normalizeOptionPricing({ ...storedColumns, calculated_breakdown: { extra_hours_fee: fee }, discount_amount: 50 });
    expect(option.subtotal).toBe(1350);
    expect(option.total_price).toBe(1378);
    expect(option).not.toHaveProperty('extra_hours_fee'); // no nonexistent DB column written
  });
  it('honors fee inclusions and records advisory service review', () => {
    const result = calculateQuotePrice(201, 35, false, false, '23:00', '2099-01-01', { ...policy, generator_included: 1, water_included: 1, cleaning_included: 1, damage_waiver_included: 1, service_review_guest_threshold: 200, service_review_hour_threshold: 8 }, '14:00');
    expect(result.utility_fee).toBe(0);
    expect(result.cleaning_fee).toBe(0);
    expect(result.damage_waiver_fee).toBe(0);
    expect(result.travel_fee).toBe(25);
    expect(result.details.service_review_reasons).toHaveLength(2);
  });
  it('treats old snapshots as zero extra hours and ignores malformed amounts', () => {
    expect(getExtraHoursFee(undefined)).toBe(0);
    expect(getExtraHoursFee({})).toBe(0);
    expect(getExtraHoursFee({ extra_hours_fee: -10 })).toBe(0);
    expect(getExtraHoursFee({ extra_hours_fee: 'no' })).toBe(0);
  });
});
describe('pricing configuration validation', () => {
  it('has a UI definition for every supported setting', () => {
    expect(PRICING_FIELDS.map(field => field.key).sort()).toEqual(Object.keys(DEFAULT_PRICING).sort());
    expect(validatePricingSettings(DEFAULT_PRICING)).toEqual({});
  });
  it.each([
    { after_hours_cutoff_hour: 100 }, { after_hours_cutoff_hour: 22.5 },
    { generator_fee: -1 }, { cleaning_fee: '' }, { cleaning_fee: NaN },
    { sales_tax_percentage: 101 }, { deposit_percentage: -1 }, { extra_hours_enabled: 2 },
    { unknown: 5 }, [], null, {},
  ])('rejects invalid data %j', input => expect(Object.keys(validatePricingSettings(input)).length).toBeGreaterThan(0));
  it('preserves saved prices and retains invalid saved values for visible correction', () => {
    const settings = mergePricingSettings([{ setting_key: 'base_price_100_guests', setting_value: 1175 }, { setting_key: 'after_hours_cutoff_hour', setting_value: 100 }]);
    expect(settings.base_price_100_guests).toBe(1175);
    expect(settings.event_time_policy_enabled).toBe(0);
    expect(validatePricingSettings(settings)).toHaveProperty('after_hours_cutoff_hour');
  });
});
