import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BOOKING_BLOCKING_STATUSES,
  type AvailabilityQuote,
} from '@/lib/availability';
import { getAvailabilityBlocksForDate, getAvailabilityBlocksInRange } from '@/lib/availability-blocks/server';
import { enumerateDateOnlyRange } from '@/lib/date-only';

export const EVENT_DATE_ALREADY_BOOKED_CODE = 'EVENT_DATE_ALREADY_BOOKED';
export const EVENT_DATE_ALREADY_BOOKED_MESSAGE =
  'This date is already booked. Please select another date.';

export async function checkEventDateAvailability(
  supabase: SupabaseClient,
  eventDate: string,
  options: { excludeQuoteId?: string } = {},
) {
  let query = supabase
    .from('quote_requests')
    .select('id, quote_number, event_date, status, is_test_quote')
    .eq('event_date', eventDate)
    .eq('is_test_quote', false)
    .in('status', [...BOOKING_BLOCKING_STATUSES])
    .limit(2);

  if (options.excludeQuoteId) {
    query = query.neq('id', options.excludeQuoteId);
  }

  const [{ data, error }, blocks] = await Promise.all([
    query,
    getAvailabilityBlocksForDate(supabase, eventDate),
  ]);
  if (error) throw error;

  const blockingQuotes = (data ?? []) as AvailabilityQuote[];
  const hardBlocks = blocks.filter((block) => block.availability_effect === 'hard_block');
  const softHolds = blocks.filter((block) => block.availability_effect === 'soft_hold');
  return {
    available: blockingQuotes.length === 0 && hardBlocks.length === 0,
    limited: blockingQuotes.length > 0 || blocks.length > 0,
    blockingQuotes,
    hardBlocks,
    softHolds,
    bookingOwner: blockingQuotes.length === 1 ? blockingQuotes[0] : null,
    hasConflict: blockingQuotes.length + hardBlocks.length > 1,
  };
}

export async function getFutureBookedDates(
  supabase: SupabaseClient,
  minimumDate: string,
  maximumDate: string,
) {
  const [{ data, error }, blocks] = await Promise.all([
    supabase
      .from('quote_requests')
      .select('event_date')
      .eq('is_test_quote', false)
      .in('status', [...BOOKING_BLOCKING_STATUSES])
      .gte('event_date', minimumDate)
      .lte('event_date', maximumDate)
      .order('event_date', { ascending: true }),
    getAvailabilityBlocksInRange(supabase, minimumDate, maximumDate),
  ]);

  if (error) throw error;

  const dates = new Set((data ?? []).map((row) => String(row.event_date)));
  for (const block of blocks) {
    for (const date of enumerateDateOnlyRange(
      block.start_date < minimumDate ? minimumDate : block.start_date,
      block.end_date > maximumDate ? maximumDate : block.end_date,
    )) {
      dates.add(date);
    }
  }
  return [...dates].sort();
}
