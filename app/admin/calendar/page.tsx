import { createAdminClient } from '@/lib/supabase/admin';
import {
  BookingCalendar,
  UpcomingBookedEvents,
  type CalendarQuote,
} from '@/components/admin/booking-calendar';
import { addDaysToDateOnly, getLocalTodayDateOnly, isValidDateOnly } from '@/lib/date-only';
import { getAvailabilityBlocksInRange } from '@/lib/availability-blocks/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Booking Calendar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBookingCalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const supabase = createAdminClient();
  const today = getLocalTodayDateOnly();
  const rangeStart = addDaysToDateOnly(today, -366);
  const rangeEnd = addDaysToDateOnly(today, 730);
  const [{ data, error }, blocksResult] = await Promise.all([
    supabase
      .from('quote_requests')
      .select('id, quote_number, event_date, status, is_test_quote, customer_name, event_type, city, state, total_price, created_at')
      .gte('event_date', rangeStart)
      .lte('event_date', rangeEnd)
      .order('event_date', { ascending: true }),
    getAvailabilityBlocksInRange(supabase, rangeStart, rangeEnd)
      .then((blocks) => ({ blocks, error: null as Error | null }))
      .catch((blockError: Error) => ({ blocks: [], error: blockError })),
  ]);

  const quotes = (data ?? []) as CalendarQuote[];
  const { date } = await searchParams;
  const initialDate = date && isValidDateOnly(date) ? date : today;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-navy bg-navy p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ded2c4]">
          Operations schedule
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Booking Calendar
        </h1>
        <p className="mt-2 max-w-3xl text-[#ded2c4]">
          Review customer bookings, partner commitments, operational blocks, and same-date quote activity in one place.
        </p>
      </header>

      {(error || blocksResult.error) && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
          Some calendar data could not be loaded. {error?.message || blocksResult.error?.message}
        </p>
      )}

      <BookingCalendar quotes={quotes} blocks={blocksResult.blocks} initialDate={initialDate} openInitialDate={Boolean(date && isValidDateOnly(date))} />

      <section aria-labelledby="all-upcoming-heading" className="rounded-2xl border border-[#d9d1c8] bg-white p-5 sm:p-6">
        <h2 id="all-upcoming-heading" className="font-serif text-2xl font-semibold text-navy">
          Upcoming commitments
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Confirmed customer bookings and active hard blocks, sorted by date.
        </p>
        <UpcomingBookedEvents quotes={quotes} blocks={blocksResult.blocks} limit={20} />
      </section>
    </div>
  );
}
