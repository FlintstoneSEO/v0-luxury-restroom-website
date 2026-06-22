# Quote Pricing & Distance Checks

## Default pricing (DEFAULT_PRICING)
- base_price_100_guests: 650
- base_price_150_guests: 750
- base_price_200_guests: 900
- base_price_200_plus: 1100
- included_miles: 30
- travel_rate_per_mile: 2.5
- generator_fee: 150
- water_fee: 100
- after_hours_hourly_rate: 75
- after_hours_cutoff_hour: 22 (10:00 PM)
- damage_waiver_fee: 75
- rush_booking_fee: 250
- cleaning_fee: 125
- extra_day_fee: 275
- deposit_percentage: 25

## Settings merge rule
Pricing settings always start from defaults. Supabase `pricing_settings` values only override known numeric keys with finite numbers. Unknown keys, null, undefined, and NaN are ignored.

## Travel fee formula
`extra_miles = max(0, distance_miles - included_miles)`

`travel_fee = extra_miles * travel_rate_per_mile`

## Utility fee formula
- If `has_power = false`, add `generator_fee`
- If `has_water = false`, add `water_fee`

## After-hours rule
Cutoff is 22:00. After-hours are rounded **up** to the next whole hour and capped at 4 hours.
- 22:01–23:00 => 1 hour
- 23:01–00:00 => 2 hours
- 00:01–01:00 => 3 hours
- 01:01–02:00 => 4 hours (cap)

## After-hours expected outcomes (default $75/hour)
- 18:00 => 0 hours => $0
- 21:00 => 0 hours => $0
- 22:00 => 0 hours => $0
- 22:01 => 1 hour => $75
- 22:30 => 1 hour => $75
- 23:00 => 1 hour => $75
- 23:01 => 2 hours => $150
- 00:30 => 3 hours => $225
- 01:30 => 4 hours => $300
- 02:30 => 4 hours max => $300

## Rush booking rule
If event date is within 14 days from quote calculation date, add rush booking fee.

## Deposit rule
`deposit_amount = total_price * 25%`
`final_balance = total_price - deposit_amount`

## Distance calculation behavior
- Origin: `4463 Helmsway Dr, Lansing, MI 48911`
- Destination built from `event_address, city, state zip_code`
- Same-address matching normalizes punctuation/case and common suffixes (`street/st`, `drive/dr`, etc.)
- Uses Google Distance Matrix when configured

## Fallback distance behavior
If distance lookup fails or API key is missing:
- `distance_miles = 50`
- `calculated_breakdown.details.distance_calculation_status = fallback`
- `calculated_breakdown.details.distance_calculation_message` prompts manual verification
- `calculated_breakdown.details.distance_fallback_miles = 50`

## Manual pricing check examples
1. 100 guests, 0 miles, power yes, water yes, end 21:00 => no travel, no utilities, no after-hours.
2. 150 guests, 50 miles, power no, water yes => travel + generator fee.
3. 200 guests, 80 miles, power no, water no => travel + generator + water.
4. End time 22:30 => 1 billable after-hours hour.
5. End time 00:30 => 3 billable after-hours hours.
6. Event date <= 14 days out => rush fee applies.
7. Event date > 14 days out => no rush fee.
8. Partial Supabase pricing settings => no NaN/undefined totals; defaults fill missing values.
