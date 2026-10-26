import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ACTIVE_NON_BLOCKING_STATUSES,
  BOOKING_BLOCKING_STATUSES,
  type AvailabilityBlock,
  type AvailabilityQuote,
} from '@/lib/availability';

export async function getAvailabilityBlocksInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
  options: { includeCancelled?: boolean } = {},
) {
  let query = supabase
    .from('availability_blocks')
    .select('*')
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .order('start_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (!options.includeCancelled) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AvailabilityBlock[];
}

export async function getAvailabilityBlocksForDate(
  supabase: SupabaseClient,
  eventDate: string,
) {
  return getAvailabilityBlocksInRange(supabase, eventDate, eventDate);
}

export async function getAvailabilityBlockConflicts(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
  options: { excludeBlockId?: string } = {},
) {
  let blockQuery = supabase
    .from('availability_blocks')
    .select('id, title, start_date, end_date, block_type, availability_effect, organization_name, status, created_at, updated_at')
    .eq('status', 'active')
    .eq('availability_effect', 'hard_block')
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (options.excludeBlockId) blockQuery = blockQuery.neq('id', options.excludeBlockId);

  const [blocksResult, bookingsResult, requestsResult] = await Promise.all([
    blockQuery,
    supabase
      .from('quote_requests')
      .select('id, quote_number, event_date, status, is_test_quote, customer_name')
      .eq('is_test_quote', false)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .in('status', [...BOOKING_BLOCKING_STATUSES]),
    supabase
      .from('quote_requests')
      .select('id, quote_number, event_date, status, is_test_quote, customer_name')
      .eq('is_test_quote', false)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .in('status', [...ACTIVE_NON_BLOCKING_STATUSES]),
  ]);

  if (blocksResult.error) throw blocksResult.error;
  if (bookingsResult.error) throw bookingsResult.error;
  if (requestsResult.error) throw requestsResult.error;

  return {
    hardBlocks: (blocksResult.data ?? []) as AvailabilityBlock[],
    blockingQuotes: (bookingsResult.data ?? []) as AvailabilityQuote[],
    activeRequests: (requestsResult.data ?? []) as AvailabilityQuote[],
  };
}
