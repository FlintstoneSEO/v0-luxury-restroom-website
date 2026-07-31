'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  Circle,
  Clock3,
  MapPin,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BOOKING_BLOCKING_STATUSES,
  getAvailabilitySummaries,
  getSameDateRequestSummary,
  isActiveAvailabilityRequest,
  isBookingBlockingStatus,
  isClosedAvailabilityRequest,
  isRealQuote,
} from '@/lib/availability';
import {
  formatDateOnlyValue,
  formatLocalDateOnly,
  getLocalTodayDateOnly,
  parseLocalDateOnly,
} from '@/lib/date-only';
import { formatAdminStatus } from '@/lib/quotes/status';

export interface CalendarQuote {
  id: string;
  quote_number?: string | null;
  event_date: string;
  status: string;
  is_test_quote?: boolean | null;
  customer_name: string;
  event_type: string;
  city?: string | null;
  state?: string | null;
  total_price?: number | null;
  created_at: string;
}

type ActivityFilter =
  | 'all'
  | 'booked'
  | 'pending'
  | 'multiple'
  | 'customer_approved'
  | 'agreement'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'completed';

const activityFilters: Array<{ value: ActivityFilter; label: string }> = [
  { value: 'all', label: 'All activity' },
  { value: 'booked', label: 'Booked events' },
  { value: 'pending', label: 'Pending requests' },
  { value: 'multiple', label: 'Multiple requests' },
  { value: 'customer_approved', label: 'Customer approved' },
  { value: 'agreement', label: 'Agreement workflow' },
  { value: 'deposit_pending', label: 'Deposit pending' },
  { value: 'deposit_paid', label: 'Deposit paid' },
  { value: 'completed', label: 'Completed' },
];

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function appliesFilter(quote: CalendarQuote, filter: ActivityFilter) {
  if (filter === 'all') return true;
  if (filter === 'booked') return isBookingBlockingStatus(quote.status);
  if (filter === 'pending') return isActiveAvailabilityRequest(quote.status);
  if (filter === 'customer_approved') return quote.status === 'customer_approved';
  if (filter === 'agreement') {
    return ['agreement_pending', 'agreement_sent', 'agreement_signed'].includes(quote.status);
  }
  if (filter === 'deposit_pending') return quote.status === 'deposit_pending';
  if (filter === 'deposit_paid') return quote.status === 'deposit_paid';
  if (filter === 'completed') return quote.status === 'completed';
  return true;
}

function QuoteRow({ quote }: { quote: CalendarQuote }) {
  return (
    <Link
      href={`/admin/quotes/${quote.id}`}
      className="block rounded-lg border border-[#d9d1c8] bg-white p-3 transition-colors hover:border-navy hover:bg-[#fffaf4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-navy">{quote.customer_name}</span>
        <Badge variant="outline">{formatAdminStatus(quote.status, 'quote')}</Badge>
      </span>
      <span className="mt-1 block text-sm text-muted-foreground">
        #{quote.quote_number || quote.id.slice(0, 8)} · {quote.event_type}
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-sm text-charcoal">
        <MapPin className="size-3.5" aria-hidden="true" />
        {[quote.city, quote.state].filter(Boolean).join(', ') || 'Location not set'}
      </span>
      <span className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Created {new Date(quote.created_at).toLocaleDateString()}</span>
        <strong className="text-charcoal">{formatCurrency(quote.total_price)}</strong>
      </span>
    </Link>
  );
}

export function UpcomingBookedEvents({
  quotes,
  limit = 5,
}: {
  quotes: CalendarQuote[];
  limit?: number;
}) {
  const today = getLocalTodayDateOnly();
  const upcoming = quotes
    .filter(
      (quote) =>
        isRealQuote(quote) &&
        isBookingBlockingStatus(quote.status) &&
        quote.event_date >= today,
    )
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const nextThirtyDays = new Date();
  nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
  const nextThirtyDate = formatDateOnlyValue(nextThirtyDays);
  const inThirtyDays = upcoming.filter((quote) => quote.event_date <= nextThirtyDate).length;

  if (upcoming.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#c8b9a8] bg-[#faf8f5] p-6 text-center">
        <CalendarCheck className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
        <p className="mt-2 font-semibold text-navy">No upcoming booked events</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer-approved and later workflow dates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#f5f1eb] p-3">
          <span className="block text-2xl font-semibold text-navy">{inThirtyDays}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Next 30 days
          </span>
        </div>
        <div className="rounded-lg bg-[#f5f1eb] p-3">
          <span className="block text-2xl font-semibold text-navy">{upcoming.length}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Future bookings
          </span>
        </div>
      </div>
      {upcoming.slice(0, limit).map((quote, index) => (
        <Link
          key={quote.id}
          href={`/admin/quotes/${quote.id}`}
          className={`block rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
            index === 0
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-[#d9d1c8] bg-white hover:border-navy'
          }`}
        >
          {index === 0 && (
            <span className="mb-2 inline-flex rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Next event
            </span>
          )}
          <span className="block font-serif text-lg font-semibold text-navy">
            {formatLocalDateOnly(quote.event_date, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="mt-1 block font-semibold text-charcoal">{quote.customer_name}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            #{quote.quote_number || quote.id.slice(0, 8)} · {quote.event_type} ·{' '}
            {[quote.city, quote.state].filter(Boolean).join(', ')}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-navy">
            {formatAdminStatus(quote.status, 'quote')}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function BookingCalendar({
  quotes,
  compact = false,
}: {
  quotes: CalendarQuote[];
  compact?: boolean;
}) {
  const today = getLocalTodayDateOnly();
  const [month, setMonth] = useState(() => parseLocalDateOnly(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [showTests, setShowTests] = useState(false);

  const visibleQuotes = useMemo(() => {
    const realOrRequested = quotes.filter((quote) => showTests || isRealQuote(quote));
    if (filter === 'multiple') {
      const summaries = getAvailabilitySummaries(realOrRequested);
      return realOrRequested.filter(
        (quote) => summaries.get(quote.event_date)?.hasMultipleRequests,
      );
    }
    return realOrRequested.filter((quote) => appliesFilter(quote, filter));
  }, [filter, quotes, showTests]);

  const summaries = useMemo(
    () => getAvailabilitySummaries(visibleQuotes),
    [visibleQuotes],
  );
  const allVisibleDates = [...summaries.keys()];
  const conflictDates = allVisibleDates
    .filter((date) => summaries.get(date)?.hasBookingConflict)
    .map(parseLocalDateOnly);
  const multipleDates = allVisibleDates
    .filter(
      (date) =>
        summaries.get(date)?.hasMultipleRequests &&
        !summaries.get(date)?.bookingOwner,
    )
    .map(parseLocalDateOnly);
  const bookedDates = allVisibleDates
    .filter((date) =>
      summaries
        .get(date)
        ?.blockingQuotes.some((quote) =>
          ['deposit_paid', 'booked', 'confirmed'].includes(quote.status),
        ),
    )
    .map(parseLocalDateOnly);
  const workflowDates = allVisibleDates
    .filter(
      (date) =>
        Boolean(summaries.get(date)?.bookingOwner) &&
        !summaries
          .get(date)
          ?.blockingQuotes.some((quote) =>
            ['deposit_paid', 'booked', 'confirmed', 'completed'].includes(quote.status),
          ),
    )
    .map(parseLocalDateOnly);
  const pendingDates = allVisibleDates
    .filter(
      (date) =>
        summaries.get(date)?.activeRequestCount === 1 &&
        !summaries.get(date)?.bookingOwner,
    )
    .map(parseLocalDateOnly);
  const completedDates = allVisibleDates
    .filter((date) =>
      summaries.get(date)?.blockingQuotes.some((quote) => quote.status === 'completed'),
    )
    .map(parseLocalDateOnly);
  const selectedQuotes = quotes.filter(
    (quote) =>
      quote.event_date === selectedDate && (showTests || isRealQuote(quote)),
  );
  const selectedSummary = getSameDateRequestSummary(selectedQuotes, selectedDate);

  function dateLabel(date: Date) {
    const dateValue = formatDateOnlyValue(date);
    const summary = summaries.get(dateValue);
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!summary) return formatted;
    if (summary.hasBookingConflict) {
      return `${formatted}, booking conflict, ${summary.blockingBookingCount} blocking bookings`;
    }
    if (summary.bookingOwner) {
      return `${formatted}, booked event, ${summary.activeRequestCount} additional requests`;
    }
    if (summary.hasMultipleRequests) {
      return `${formatted}, ${summary.activeRequestCount} active requests`;
    }
    return `${formatted}, one active request`;
  }

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#d9d1c8] bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="space-y-1.5">
            <span className="block text-sm font-semibold text-navy">Calendar activity</span>
            <Select value={filter} onValueChange={(value) => setFilter(value as ActivityFilter)}>
              <SelectTrigger className="min-h-11 w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityFilters.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d9d1c8] px-3 text-sm font-semibold text-charcoal">
            <Checkbox
              checked={showTests}
              onCheckedChange={(checked) => setShowTests(checked === true)}
            />
            Show test quotes
          </label>
        </div>
      )}

      <div className={compact ? '' : 'grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]'}>
        <div className="rounded-xl border border-[#d9d1c8] bg-white p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = parseLocalDateOnly(today);
                setMonth(current);
                setSelectedDate(today);
              }}
            >
              Today
            </Button>
            <span className="text-sm text-muted-foreground">
              Select a date for details
            </span>
          </div>
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={parseLocalDateOnly(selectedDate)}
            onSelect={(date) => date && setSelectedDate(formatDateOnlyValue(date))}
            modifiers={{
              conflict: conflictDates,
              multiple: multipleDates,
              booked: bookedDates,
              workflow: workflowDates,
              pending: pendingDates,
              completed: completedDates,
            }}
            modifiersClassNames={{
              conflict: 'bg-red-100 text-red-900 font-bold ring-2 ring-red-600',
              multiple: 'bg-amber-100 text-amber-950 font-bold',
              booked: 'bg-emerald-100 text-emerald-950 font-bold',
              workflow: 'bg-blue-100 text-blue-950 font-bold',
              pending: 'bg-slate-100 text-slate-900',
              completed: 'bg-stone-200 text-stone-700',
            }}
            labels={{ labelDayButton: dateLabel }}
            className="mx-auto w-full [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(11)]"
          />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {[
              ['bg-emerald-600', 'Booked / deposit paid'],
              ['bg-blue-700', 'Approved / agreement'],
              ['bg-amber-500', 'Multiple requests'],
              ['bg-slate-500', 'One pending request'],
              ['bg-red-600', 'Booking conflict'],
              ['bg-stone-400', 'Completed / past'],
            ].map(([tone, label]) => (
              <span key={label} className="flex items-center gap-2 text-charcoal">
                <Circle className={`size-2.5 fill-current ${tone.replace('bg-', 'text-')}`} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {!compact && (
          <section
            aria-labelledby="selected-date-heading"
            className="rounded-xl border border-[#d9d1c8] bg-[#faf8f5] p-4 sm:p-5"
          >
            <h2 id="selected-date-heading" className="font-serif text-2xl font-semibold text-navy">
              {formatLocalDateOnly(selectedDate)}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">
                {selectedSummary.hasBookingConflict
                  ? 'Booking conflict'
                  : selectedSummary.bookingOwner
                    ? 'Date booked'
                    : 'Available'}
              </Badge>
              <Badge variant="outline">
                {selectedSummary.activeRequestCount} active request
                {selectedSummary.activeRequestCount === 1 ? '' : 's'}
              </Badge>
              <Badge variant="outline">
                {selectedSummary.blockingBookingCount} blocking booking
                {selectedSummary.blockingBookingCount === 1 ? '' : 's'}
              </Badge>
            </div>
            {selectedSummary.hasBookingConflict && (
              <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <AlertTriangle className="mr-1 inline size-4" aria-hidden="true" />
                More than one real quote blocks this date. Resolve this data conflict immediately.
              </div>
            )}
            <div className="mt-5 space-y-5">
              <div>
                <h3 className="mb-2 font-semibold text-navy">Booked quote owner</h3>
                {selectedSummary.bookingOwner ? (
                  <QuoteRow quote={selectedSummary.bookingOwner} />
                ) : (
                  <p className="text-sm text-muted-foreground">No quote currently owns this date.</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-navy">Pending requests</h3>
                <div className="space-y-2">
                  {selectedSummary.activeRequests.length ? (
                    selectedSummary.activeRequests.map((quote) => (
                      <QuoteRow key={quote.id} quote={quote} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending requests.</p>
                  )}
                </div>
              </div>
              {selectedSummary.closedRequests.length > 0 && (
                <details>
                  <summary className="cursor-pointer font-semibold text-navy">
                    Closed requests ({selectedSummary.closedRequests.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {selectedSummary.closedRequests.map((quote) => (
                      <QuoteRow key={quote.id} quote={quote} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export function DashboardBookingSection({ quotes }: { quotes: CalendarQuote[] }) {
  return (
    <section
      aria-labelledby="upcoming-booked-events-heading"
      className="rounded-2xl border border-[#c8b9a8] bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-text">
            Booking operations
          </p>
          <h2 id="upcoming-booked-events-heading" className="mt-1 font-serif text-2xl font-semibold text-navy">
            Upcoming Booked Events
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One trailer, one reserved event date. Pending requests remain visible alongside bookings.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/calendar">
            View Full Calendar
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <BookingCalendar quotes={quotes} compact />
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="size-4 text-navy" aria-hidden="true" />
            <h3 className="font-semibold text-navy">Next five events</h3>
          </div>
          <UpcomingBookedEvents quotes={quotes} />
        </div>
      </div>
    </section>
  );
}
