import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BOOKING_BLOCKING_STATUSES,
  type AvailabilityQuote,
} from '@/lib/availability';

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

  const { data, error } = await query;
  if (error) throw error;

  const blockingQuotes = (data ?? []) as AvailabilityQuote[];
  return {
    available: blockingQuotes.length === 0,
    blockingQuotes,
    bookingOwner: blockingQuotes.length === 1 ? blockingQuotes[0] : null,
    hasConflict: blockingQuotes.length > 1,
  };
}

export async function getFutureBookedDates(
  supabase: SupabaseClient,
  minimumDate: string,
) {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('event_date')
    .eq('is_test_quote', false)
    .in('status', [...BOOKING_BLOCKING_STATUSES])
    .gte('event_date', minimumDate)
    .order('event_date', { ascending: true });

  if (error) throw error;

  return [...new Set((data ?? []).map((row) => String(row.event_date)))];
}
