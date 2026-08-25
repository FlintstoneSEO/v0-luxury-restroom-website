'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  Circle,
  Clock3,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getCombinedAvailabilitySummaries,
  getAvailabilityDaySummary,
  isActiveAvailabilityRequest,
  isBookingBlockingStatus,
  isClosedAvailabilityRequest,
  isRealQuote,
  type AvailabilityBlock,
} from '@/lib/availability';
import {
  formatDateOnlyValue,
  formatLocalDateOnly,
  getLocalTodayDateOnly,
  parseLocalDateOnly,
} from '@/lib/date-only';
import { formatAdminStatus } from '@/lib/quotes/status';
import { CalendarDateDetails } from '@/components/admin/calendar-date-details';

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
  | 'completed'
  | 'partner_blocks'
  | 'hard_blocks'
  | 'soft_holds';

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
  { value: 'partner_blocks', label: 'Partner bookings' },
  { value: 'hard_blocks', label: 'Manual hard blocks' },
  { value: 'soft_holds', label: 'Soft holds' },
];

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

export function UpcomingBookedEvents({
  quotes,
  blocks = [],
  limit = 5,
}: {
  quotes: CalendarQuote[];
  blocks?: AvailabilityBlock[];
  limit?: number;
}) {
  const today = getLocalTodayDateOnly();
  const upcomingQuotes = quotes
    .filter(
      (quote) =>
        isRealQuote(quote) &&
        isBookingBlockingStatus(quote.status) &&
        quote.event_date >= today,
    )
    .map((quote) => ({
      id: `quote-${quote.id}`,
      date: quote.event_date,
      endDate: quote.event_date,
      title: quote.customer_name,
      detail: `#${quote.quote_number || quote.id.slice(0, 8)} · ${quote.event_type} · ${[quote.city, quote.state].filter(Boolean).join(', ')}`,
      label: formatAdminStatus(quote.status, 'quote'),
      href: `/admin/quotes/${quote.id}`,
    }));
  const upcomingBlocks = blocks
    .filter((block) => block.status === 'active' && block.availability_effect === 'hard_block' && block.end_date >= today)
    .map((block) => ({
      id: `block-${block.id}`,
      date: block.start_date,
      endDate: block.end_date,
      title: block.organization_name || block.title,
      detail: block.title,
      label: block.block_type === 'partner_booking' ? 'Partner Booking' : block.block_type.replaceAll('_', ' '),
      href: `/admin/calendar?date=${block.start_date}`,
    }));
  const upcoming = [...upcomingQuotes, ...upcomingBlocks]
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextThirtyDays = new Date();
  nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
  const nextThirtyDate = formatDateOnlyValue(nextThirtyDays);
  const inThirtyDays = upcoming.filter((commitment) => commitment.date <= nextThirtyDate).length;

  if (upcoming.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#c8b9a8] bg-[#faf8f5] p-6 text-center">
        <CalendarCheck className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
        <p className="mt-2 font-semibold text-navy">No upcoming commitments</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer bookings and active hard blocks will appear here.
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
            Future commitments
          </span>
        </div>
      </div>
      {upcoming.slice(0, limit).map((commitment, index) => (
        <Link
          key={commitment.id}
          href={commitment.href}
          className={`block rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
            index === 0
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-[#d9d1c8] bg-white hover:border-navy'
          }`}
        >
          {index === 0 && (
            <span className="mb-2 inline-flex rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Next commitment
            </span>
          )}
          <span className="block font-serif text-lg font-semibold text-navy">
            {formatLocalDateOnly(commitment.date, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {commitment.endDate !== commitment.date
              ? ` – ${formatLocalDateOnly(commitment.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}`
              : ''}
          </span>
          <span className="mt-1 block font-semibold text-charcoal">{commitment.title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {commitment.detail}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-navy">
            {commitment.label}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function BookingCalendar({
  quotes,
  blocks = [],
  compact = false,
  initialDate,
  openInitialDate = false,
}: {
  quotes: CalendarQuote[];
  blocks?: AvailabilityBlock[];
  compact?: boolean;
  initialDate?: string;
  openInitialDate?: boolean;
}) {
  const router = useRouter();
  const today = getLocalTodayDateOnly();
  const startingDate = initialDate || today;
  const [month, setMonth] = useState(() => parseLocalDateOnly(startingDate));
  const [selectedDate, setSelectedDate] = useState(startingDate);
  const [detailsOpen, setDetailsOpen] = useState(openInitialDate);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [showTests, setShowTests] = useState(false);

  const visibleQuotes = useMemo(() => {
    if (['partner_blocks', 'hard_blocks', 'soft_holds'].includes(filter)) return [];
    const realOrRequested = quotes.filter((quote) => showTests || isRealQuote(quote));
    if (filter === 'multiple') {
      const summaries = getCombinedAvailabilitySummaries(realOrRequested, []);
      return realOrRequested.filter(
        (quote) => summaries.get(quote.event_date)?.hasMultipleRequests,
      );
    }
    return realOrRequested.filter((quote) => appliesFilter(quote, filter));
  }, [filter, quotes, showTests]);

  const visibleBlocks = useMemo(() => {
    if (filter === 'all') return blocks.filter((block) => block.status === 'active');
    if (filter === 'partner_blocks') return blocks.filter((block) => block.status === 'active' && block.block_type === 'partner_booking');
    if (filter === 'hard_blocks') return blocks.filter((block) => block.status === 'active' && block.availability_effect === 'hard_block' && block.block_type !== 'partner_booking');
    if (filter === 'soft_holds') return blocks.filter((block) => block.status === 'active' && block.availability_effect === 'soft_hold');
    return [];
  }, [blocks, filter]);

  const summaries = useMemo(
    () => getCombinedAvailabilitySummaries(visibleQuotes, visibleBlocks),
    [visibleBlocks, visibleQuotes],
  );
  const allVisibleDates = [...summaries.keys()];
  const conflictDates = allVisibleDates
    .filter((date) => summaries.get(date)?.hasBlockingConflict)
    .map(parseLocalDateOnly);
  const multipleDates = allVisibleDates
    .filter(
      (date) =>
        summaries.get(date)?.state === 'multiple_requests',
    )
    .map(parseLocalDateOnly);
  const bookedDates = allVisibleDates
    .filter((date) =>
      summaries.get(date)?.state === 'booked' && summaries
        .get(date)
        ?.blockingQuotes.some((quote) =>
          ['deposit_paid', 'booked', 'confirmed'].includes(quote.status),
        ),
    )
    .map(parseLocalDateOnly);
  const workflowDates = allVisibleDates
    .filter(
      (date) =>
        summaries.get(date)?.state === 'booked' &&
        !summaries
          .get(date)
          ?.blockingQuotes.some((quote) =>
            ['deposit_paid', 'booked', 'confirmed', 'completed'].includes(quote.status),
          ),
    )
    .map(parseLocalDateOnly);
  const pendingDates = allVisibleDates
    .filter(
      (date) => summaries.get(date)?.state === 'active_request',
    )
    .map(parseLocalDateOnly);
  const completedDates = allVisibleDates
    .filter((date) =>
      summaries.get(date)?.state === 'booked' &&
      summaries.get(date)?.blockingQuotes.some((quote) => quote.status === 'completed'),
    )
    .map(parseLocalDateOnly);
  const partnerBlockDates = allVisibleDates.filter((date) => summaries.get(date)?.state === 'partner_block').map(parseLocalDateOnly);
  const hardBlockDates = allVisibleDates.filter((date) => summaries.get(date)?.state === 'hard_block').map(parseLocalDateOnly);
  const softHoldDates = allVisibleDates.filter((date) => summaries.get(date)?.state === 'soft_hold').map(parseLocalDateOnly);
  const selectedSummary = getAvailabilityDaySummary(
    quotes.filter((quote) => quote.event_date === selectedDate && (showTests || isRealQuote(quote))),
    blocks,
    selectedDate,
  );

  function dateLabel(date: Date) {
    const dateValue = formatDateOnlyValue(date);
    const summary = summaries.get(dateValue);
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!summary) return formatted;
    if (summary.hasBlockingConflict) return `${formatted}, blocking commitment conflict`;
    if (summary.state === 'booked') return `${formatted}, booked event, ${summary.activeRequestCount} additional requests`;
    if (summary.state === 'partner_block') return `${formatted}, partner booking block`;
    if (summary.state === 'hard_block') return `${formatted}, date blocked`;
    if (summary.state === 'soft_hold') return `${formatted}, soft hold`;
    if (summary.state === 'multiple_requests') return `${formatted}, ${summary.activeRequestCount} active requests`;
    if (summary.state === 'active_request') return `${formatted}, one active request`;
    return `${formatted}, available`;
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d9d1c8] px-3 text-sm font-semibold text-charcoal">
              <Checkbox checked={showTests} onCheckedChange={(checked) => setShowTests(checked === true)} />
              Show test quotes
            </label>
            <Button type="button" onClick={() => { setSelectedDate(today); setDetailsOpen(true); }} className="bg-navy text-white hover:bg-navy/90">
              <CalendarPlus className="size-4" aria-hidden="true" /> Block dates
            </Button>
          </div>
        </div>
      )}

      <div>
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
            onSelect={(date) => {
              if (!date) return;
              const dateValue = formatDateOnlyValue(date);
              if (compact) {
                router.push(`/admin/calendar?date=${dateValue}`);
                return;
              }
              setSelectedDate(dateValue);
              setDetailsOpen(true);
            }}
            modifiers={{
              conflict: conflictDates,
              multiple: multipleDates,
              booked: bookedDates,
              workflow: workflowDates,
              pending: pendingDates,
              completed: completedDates,
              partnerBlock: partnerBlockDates,
              hardBlock: hardBlockDates,
              softHold: softHoldDates,
            }}
            modifiersClassNames={{
              conflict: 'bg-red-100 text-red-900 font-bold ring-2 ring-red-600',
              multiple: 'bg-amber-100 text-amber-950 font-bold',
              booked: 'bg-emerald-100 text-emerald-950 font-bold',
              workflow: 'bg-blue-100 text-blue-950 font-bold',
              pending: 'bg-slate-100 text-slate-900',
              completed: 'bg-stone-200 text-stone-700',
              partnerBlock: 'bg-violet-200 text-violet-950 font-bold ring-1 ring-violet-500',
              hardBlock: 'bg-purple-100 text-purple-950 font-bold ring-1 ring-purple-500',
              softHold: 'bg-violet-50 text-violet-900 font-semibold ring-1 ring-violet-300',
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
              ['bg-red-600', 'Commitment conflict'],
              ['bg-stone-400', 'Completed / past'],
              ['bg-violet-600', 'Partner / manual block'],
              ['bg-violet-300', 'Soft hold'],
            ].map(([tone, label]) => (
              <span key={label} className="flex items-center gap-2 text-charcoal">
                <Circle className={`size-2.5 fill-current ${tone.replace('bg-', 'text-')}`} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

      </div>
      {!compact && (
        <CalendarDateDetails
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          selectedDate={selectedDate}
          summary={selectedSummary}
        />
      )}
    </div>
  );
}

export function DashboardBookingSection({ quotes, blocks = [] }: { quotes: CalendarQuote[]; blocks?: AvailabilityBlock[] }) {
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
            Upcoming Commitments
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer bookings, partner dates, and operational hard blocks in one schedule.
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
        <BookingCalendar quotes={quotes} blocks={blocks} compact />
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="size-4 text-navy" aria-hidden="true" />
            <h3 className="font-semibold text-navy">Next five commitments</h3>
          </div>
          <UpcomingBookedEvents quotes={quotes} blocks={blocks} />
        </div>
      </div>
    </section>
  );
}
