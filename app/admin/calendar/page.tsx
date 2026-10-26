import { getCalendarBlocks } from '@/lib/quotes/getCalendarBlocks';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  BookingCalendar,
  UpcomingBookedEvents,
  type CalendarQuote,
} from '@/components/admin/booking-calendar';
import { addDaysToDateOnly, getLocalTodayDateOnly } from '@/lib/date-only';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Booking Calendar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBookingCalendarPage() {
  const supabase = createAdminClient();
  const today = getLocalTodayDateOnly();
  const rangeStart = addDaysToDateOnly(today, -366);
  const rangeEnd = addDaysToDateOnly(today, 730);
  const { data, error } = await supabase
    .from('quote_requests')
    .select(
      'id, quote_number, event_date, status, is_test_quote, customer_name, event_type, city, state, total_price, created_at',
    )
    .gte('event_date', rangeStart)
    .lte('event_date', rangeEnd)
    .order('event_date', { ascending: true });

  const quotes = (data ?? []) as CalendarQuote[];
  const { blocks, error: blockError } = await getCalendarBlocks();

  return (
    <div className="space-y-8">
      <header className="admin-calendar-heading">
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Booking Calendar
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Review booked events, same-date requests, and booking conflicts without introducing hourly or multi-trailer scheduling.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
          Calendar data could not be loaded. {error.message}
        </p>
      )}

      {blockError && <p role="alert" className="text-red-900">{blockError}</p>}
      <BookingCalendar quotes={quotes} blocks={blocks} />

      <section aria-labelledby="all-upcoming-heading" className="rounded-2xl border border-[#d9d1c8] bg-white p-5 sm:p-6">
        <h2 id="all-upcoming-heading" className="font-serif text-2xl font-semibold text-navy">
          Upcoming booked events
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Customer bookings and reserved partner dates, excluding test quotes and past events.
        </p>
        <UpcomingBookedEvents quotes={quotes} blocks={blocks} limit={20} />
      </section>
    </div>
  );
}
