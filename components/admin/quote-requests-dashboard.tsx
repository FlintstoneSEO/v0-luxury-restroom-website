'use client';

import type { CalendarBlock } from '@/lib/calendar-blocks';
import { useMemo, useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { QuoteWorkbench, quoteReviewLabel, needsDistanceReview } from './quote-workbench';
import { BookingOutlook } from './booking-outlook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { formatLocalDateOnly, parseLocalDateOnly } from '@/lib/date-only';
import { QuoteRequest, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, EVENT_TYPES } from '@/lib/quotes/types';
import { CheckCircle2, AlertCircle, CreditCard, Users, SlidersHorizontal, ClipboardList, Send, BadgeCheck, FileSignature, CalendarCheck, Plus, AlertTriangle, RefreshCw, ArrowRight, Search, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { formatAdminStatus } from '@/lib/quotes/status';
import {
  getAvailabilitySummaries,
  type SameDateRequestSummary,
} from '@/lib/availability';

interface QuoteRequestsDashboardProps {
  initialQuotes: QuoteRequest[];
  blocks?: CalendarBlock[];
  source: 'supabase' | 'mock';
  error?: string;
}

type SortBy = 'newest' | 'oldest' | 'event_soonest' | 'event_latest' | 'total_highest' | 'total_lowest' | 'status';
type PipelineColumn =
  | 'new_requests'
  | 'under_review'
  | 'quote_sent'
  | 'customer_approved'
  | 'agreement_sent'
  | 'deposit_paid'
  | 'booked'
  | 'closed_lost';
type PipelineBucket = PipelineColumn | 'all';
type TestQuoteFilter = 'hide' | 'show' | 'only';
type AvailabilityFilter =
  | 'all'
  | 'multiple_requests'
  | 'date_already_booked'
  | 'booked_dates'
  | 'booking_conflicts';

const pipelineBucketConfig: Array<{
  key: PipelineBucket;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { key: 'all', label: 'All Quotes', description: 'Every quote matching filters', icon: ClipboardList },
  { key: 'new_requests', label: 'New Requests', description: 'Needs initial review', icon: ClipboardList },
  { key: 'under_review', label: 'Under Review', description: 'Being prepared or revised', icon: SlidersHorizontal },
  { key: 'quote_sent', label: 'Quote Sent', description: 'Waiting on customer response', icon: Send },
  { key: 'customer_approved', label: 'Customer Approved', description: 'Ready for agreement', icon: BadgeCheck },
  { key: 'agreement_sent', label: 'Agreement Sent', description: 'Agreement workflow active', icon: FileSignature },
  { key: 'deposit_paid', label: 'Deposit Paid', description: 'Payment progress', icon: CreditCard },
  { key: 'booked', label: 'Booked', description: 'Confirmed or completed', icon: CheckCircle2 },
  { key: 'closed_lost', label: 'Closed / Lost', description: 'Declined, cancelled, or expired quotes', icon: AlertCircle },
];

function formatDate(dateString: string) {
  return formatLocalDateOnly(dateString, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getPipelineColumn(status: string): PipelineColumn {
  if (['pending', 'pending_review', 'new'].includes(status)) return 'new_requests';
  if (['under_review', 'draft_quote', 'change_requested'].includes(status)) return 'under_review';
  if (['quote_sent', 'sent_to_customer'].includes(status)) return 'quote_sent';
  if (status === 'customer_approved') return 'customer_approved';
  if (['agreement_pending', 'agreement_sent', 'agreement_signed'].includes(status)) return 'agreement_sent';
  if (['deposit_pending', 'deposit_paid'].includes(status)) return 'deposit_paid';
  if (['booked', 'confirmed', 'completed'].includes(status)) return 'booked';
  if (['declined', 'cancelled', 'expired'].includes(status)) return 'closed_lost';
  return 'under_review';
}

function DateAvailabilityBadges({
  quoteId,
  summary,
  onFilter,
}: {
  quoteId: string;
  summary?: SameDateRequestSummary<QuoteRequest>;
  onFilter: (filter: AvailabilityFilter) => void;
}) {
  if (!summary) return null;

  const badges: Array<{
    key: string;
    label: string;
    filter: AvailabilityFilter;
    className: string;
    icon: LucideIcon;
  }> = [];

  if (summary.hasBookingConflict) {
    badges.push({
      key: 'conflict',
      label: 'Booking conflict',
      filter: 'booking_conflicts',
      className: 'border-red-600 bg-red-100 text-red-900',
      icon: AlertTriangle,
    });
  } else if (summary.bookingOwner?.id === quoteId) {
    badges.push({
      key: 'owner',
      label: 'Booked date',
      filter: 'booked_dates',
      className: 'border-emerald-600 bg-emerald-100 text-emerald-900',
      icon: CalendarCheck,
    });
  } else if (summary.bookingOwner) {
    badges.push({
      key: 'unavailable',
      label: 'Date already booked',
      filter: 'date_already_booked',
      className: 'border-red-500 bg-red-50 text-red-900',
      icon: AlertCircle,
    });
  }

  if (summary.hasMultipleRequests) {
    badges.push({
      key: 'multiple',
      label: `${summary.activeRequestCount} requests for this date`,
      filter: 'multiple_requests',
      className: 'border-amber-500 bg-amber-100 text-amber-950',
      icon: Users,
    });
  }

  return badges.map((badge) => (
    <button
      key={badge.key}
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${badge.className}`}
      onClick={(event) => {
        event.stopPropagation();
        onFilter(badge.filter);
      }}
      aria-label={`${badge.label}. Filter dashboard by this availability state.`}
    >
      <badge.icon className="size-3.5" aria-hidden="true" />
      {badge.label}
    </button>
  ));
}

export default function QuoteRequestsDashboard({
  initialQuotes,
  blocks = [],
  source,
  error,
}: QuoteRequestsDashboardProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [agreementFilter, setAgreementFilter] = useState('all');
  const [depositFilter, setDepositFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedDetail, setFocusedDetail] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const queueRef = useRef<HTMLDivElement>(null);
  const [activePipelineBucket, setActivePipelineBucket] = useState<PipelineBucket>('all');
  const [testQuoteFilter, setTestQuoteFilter] = useState<TestQuoteFilter>('hide');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [creatingTestQuote, setCreatingTestQuote] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'needs_action' | 'waiting'>('all');

  const handleRefreshDashboard = () => startRefresh(() => router.refresh());
  const selectQuote = (id: string) => {
    setSelectedId(id);
    setFocusedDetail(true);
    if (window.innerWidth < 1440) requestAnimationFrame(() => {
      document.getElementById('workbench-heading')?.focus({ preventScroll: true });
      document.querySelector('.operations-workbench')?.scrollIntoView({ block: 'start' });
    });
  };
  const backToQueue = () => {
    setFocusedDetail(false);
    requestAnimationFrame(() => {
      const buttons = queueRef.current?.querySelectorAll<HTMLButtonElement>('[data-quote-id]');
      Array.from(buttons ?? []).find(button => button.dataset.quoteId === selectedId && button.offsetParent !== null)?.focus();
    });
  };
  const resetFilters = () => {
    setSearch(''); setStatusFilter('all'); setEventTypeFilter('all'); setAgreementFilter('all');
    setDepositFilter('all'); setAvailabilityFilter('all'); setTestQuoteFilter('hide'); setSortBy('newest');
    setActivePipelineBucket('all'); setReviewFilter('all'); setFocusedDetail(false);
  };

  const handleCreateTestQuote = async () => {
    const testRecipientEmail = window.prompt('Send test quote to which email address?');
    if (!testRecipientEmail) return;

    if (creatingTestQuote) return;
    setCreatingTestQuote(true);
    try {
      const res = await fetch('/api/admin/quotes/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_recipient_email: testRecipientEmail }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || body.error || 'Failed to create test quote');
      router.push(`/admin/quotes/${body.quote_id}`);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to create test quote');
    } finally {
      setCreatingTestQuote(false);
    }
  };

  // Summary card counts
  const summaryCounts = useMemo(() => {
    const metricQuotes = initialQuotes.filter((q) => !q.is_test_quote);
    const pending = metricQuotes.filter((q) => q.status === 'pending_review').length;
    const underReview = metricQuotes.filter((q) => ['under_review', 'draft_quote', 'change_requested'].includes(q.status)).length;
    const quoteSent = metricQuotes.filter((q) => q.status === 'quote_sent' || q.status === 'sent_to_customer').length;
    const approved = metricQuotes.filter((q) => q.status === 'customer_approved').length;
    const upcoming = metricQuotes.filter((q) => {
      const eventDate = parseLocalDateOnly(q.event_date);
      const now = new Date();
      const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return eventDate >= now && eventDate <= thirtyDaysOut && ['booked', 'confirmed', 'deposit_paid'].includes(q.status);
    }).length;
    const estimatedPipelineRevenue = metricQuotes
      .filter((q) =>
        [
          'pending_review',
          'under_review',
          'draft_quote',
          'quote_sent',
          'sent_to_customer',
          'customer_approved',
          'agreement_pending',
          'agreement_sent',
          'deposit_pending',
        ].includes(q.status)
      )
      .reduce((sum, quote) => sum + (quote.total_price || 0), 0);
    return { pending, underReview, quoteSent, approved, upcoming, estimatedPipelineRevenue };
  }, [initialQuotes]);

  const availabilitySummaries = useMemo(
    () => getAvailabilitySummaries(initialQuotes),
    [initialQuotes],
  );

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = initialQuotes.filter((quote) => {
      const quoteStatus = quote.status || 'pending_review';
      const quoteAgreementStatus = quote.agreement_status || 'not_sent';
      const quoteDepositStatus = quote.deposit_status || 'due';
      const quoteEventType = quote.event_type || '';

      if (testQuoteFilter === 'hide' && quote.is_test_quote) return false;
      if (testQuoteFilter === 'only' && !quote.is_test_quote) return false;
      if (statusFilter !== 'all' && quoteStatus !== statusFilter) return false;
      if (eventTypeFilter !== 'all' && quoteEventType !== eventTypeFilter) return false;
      if (agreementFilter !== 'all' && quoteAgreementStatus !== agreementFilter) return false;
      if (depositFilter !== 'all' && quoteDepositStatus !== depositFilter) return false;

      const availability = availabilitySummaries.get(quote.event_date);
      if (
        availabilityFilter === 'multiple_requests' &&
        !availability?.hasMultipleRequests
      ) return false;
      if (
        availabilityFilter === 'date_already_booked' &&
        (!availability?.bookingOwner || availability.bookingOwner.id === quote.id)
      ) return false;
      if (
        availabilityFilter === 'booked_dates' &&
        availability?.bookingOwner?.id !== quote.id
      ) return false;
      if (
        availabilityFilter === 'booking_conflicts' &&
        !availability?.hasBookingConflict
      ) return false;

      if (!normalizedSearch) return true;

      const searchableText = [
        quote.customer_name ?? '',
        quote.email ?? '',
        quote.phone ?? '',
        quote.event_address ?? '',
        quote.city ?? '',
        quote.state ?? '',
        quote.zip_code ?? '',
        quote.event_type ?? '',
        quote.status ?? '',
        quote.quote_number ?? '',
      ].join(' ').toLowerCase();

      return searchableText.includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'event_soonest':
          return parseLocalDateOnly(a.event_date).getTime() - parseLocalDateOnly(b.event_date).getTime();
        case 'event_latest':
          return parseLocalDateOnly(b.event_date).getTime() - parseLocalDateOnly(a.event_date).getTime();
        case 'total_highest':
          return (b.total_price || 0) - (a.total_price || 0);
        case 'total_lowest':
          return (a.total_price || 0) - (b.total_price || 0);
        case 'status':
          return (a.status || 'pending_review').localeCompare(b.status || 'pending_review');
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [initialQuotes, search, statusFilter, eventTypeFilter, agreementFilter, depositFilter, sortBy, testQuoteFilter, availabilityFilter, availabilitySummaries]);

  const pipelineColumns = useMemo(() => {
    const base: Record<PipelineColumn, QuoteRequest[]> = {
      new_requests: [],
      under_review: [],
      quote_sent: [],
      customer_approved: [],
      agreement_sent: [],
      deposit_paid: [],
      booked: [],
      closed_lost: [],
    };
    filteredQuotes.forEach((quote) => {
      base[getPipelineColumn(quote.status || 'pending_review')].push(quote);
    });
    return base;
  }, [filteredQuotes]);

  const selectedPipelineConfig = pipelineBucketConfig.find((bucket) => bucket.key === activePipelineBucket) ?? pipelineBucketConfig[0];
  const needsAction = (quote: QuoteRequest) => ['pending', 'pending_review', 'new', 'under_review', 'draft_quote', 'change_requested', 'customer_approved'].includes(quote.status) || (needsDistanceReview(quote) && !['completed', 'cancelled', 'declined', 'expired'].includes(quote.status));
  const waiting = (quote: QuoteRequest) => ['quote_sent', 'sent_to_customer', 'agreement_pending', 'agreement_sent', 'deposit_pending'].includes(quote.status);
  const selectedQuotes = (activePipelineBucket === 'all' ? filteredQuotes : pipelineColumns[activePipelineBucket]).filter(quote => reviewFilter === 'all' || (reviewFilter === 'needs_action' ? needsAction(quote) : waiting(quote)));
  const primaryPipeline = pipelineBucketConfig.filter(bucket => !['all', 'deposit_paid', 'closed_lost'].includes(bucket.key));

  // Resolve against current props/results; never retain a stale record snapshot after refresh.
  const selectedQuote = selectedQuotes.find(quote => quote.id === selectedId) ?? selectedQuotes[0] ?? null;

  return (
    <div className={`space-y-4 ${focusedDetail && selectedQuote ? 'operations-focus-detail' : ''}`}>
      <header className="operations-header">
        <h1>Quotes &amp; bookings</h1>
        <div className="operations-header-tools">
          <label className="operations-search"><Search aria-hidden="true" className="size-4" /><span className="sr-only">Search all quotes</span><Input placeholder="Search quotes, customers or events…" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <Button type="button" variant="outline" disabled={refreshing} onClick={handleRefreshDashboard}><RefreshCw className="size-4" aria-hidden="true" />{refreshing ? 'Refreshing…' : 'Refresh'}</Button>
        </div>
      </header>
      <span className="sr-only" role="status">{refreshing ? 'Refreshing quotes' : `${selectedQuotes.length} quotes in ${selectedPipelineConfig.label}`}</span>
      {source === 'mock' && <p role="status" className="operations-warning">Demo / fallback data. This is not the live quote queue.</p>}
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" className="underline" onClick={handleRefreshDashboard} disabled={refreshing}>Retry</button></div>}
      <nav className="operations-pipeline" aria-label="Quote pipeline buckets">
        {primaryPipeline.map(bucket => <button type="button" key={bucket.key} aria-label={bucket.label} aria-pressed={activePipelineBucket === bucket.key} onClick={() => { setActivePipelineBucket(bucket.key); setReviewFilter('all'); setFocusedDetail(false); }}>
          <span className={`operations-dot stage-${bucket.key}`} aria-hidden="true" /><span>{bucket.key === 'new_requests' ? 'New' : bucket.label}<strong>{bucket.key === 'all' ? filteredQuotes.length : pipelineColumns[bucket.key].length}</strong></span><ChevronRight aria-hidden="true" className="operations-pipeline-chevron size-4" />
        </button>)}
      </nav>
      <label className="operations-pipeline-mobile text-sm font-semibold">
        Pipeline stage
        <select className="mt-1 block min-h-11 w-full rounded border border-stone-300 bg-white px-3" value={activePipelineBucket} onChange={event => { setActivePipelineBucket(event.target.value as PipelineBucket); setReviewFilter('all'); setFocusedDetail(false); }}>
          {pipelineBucketConfig.map(bucket => <option key={bucket.key} value={bucket.key}>{bucket.label} ({bucket.key === 'all' ? filteredQuotes.length : pipelineColumns[bucket.key].length})</option>)}
        </select>
      </label>
      <div className="operations-workspace">
        <section className="operations-panel operations-queue" aria-labelledby="queue-heading" ref={queueRef}>
          <div className="operations-toolbar">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="queue-heading">Quote queue <span className="font-normal text-slate-500">({selectedQuotes.length})</span></h2><span className="operations-active-stage">{activePipelineBucket !== 'all' ? selectedPipelineConfig.label : ''}</span></div>
            <div className="operations-queue-controls">
              <div className="operations-segments" aria-label="Quote review views">
                <button type="button" title="Requests, reviews, approved quotes and active distance flags" aria-pressed={reviewFilter === 'needs_action'} onClick={() => { setActivePipelineBucket('all'); setReviewFilter('needs_action'); }}>Needs action ({filteredQuotes.filter(needsAction).length})</button>
                <button type="button" title="Waiting on customer response, signature or deposit" aria-pressed={reviewFilter === 'waiting'} onClick={() => { setActivePipelineBucket('all'); setReviewFilter('waiting'); }}>Waiting ({filteredQuotes.filter(waiting).length})</button>
                <button type="button" aria-label="All Quotes" aria-pressed={activePipelineBucket === 'all' && reviewFilter === 'all'} onClick={() => { setActivePipelineBucket('all'); setReviewFilter('all'); }}>All ({filteredQuotes.length})</button>
              </div>
              <label className="operations-search operations-queue-search"><Search aria-hidden="true" className="size-4" /><span className="sr-only">Search quotes</span><Input placeholder="Search quotes…" value={search} onChange={event => setSearch(event.target.value)} /></label>
            <details className="operations-filters" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}><summary><SlidersHorizontal aria-hidden="true" className="size-4" />More filters</summary>
              <div className="operations-filter-popover">
              <label className="block text-sm font-semibold">Pipeline stage<select className="mt-1 block min-h-11 w-full rounded border border-stone-300 bg-white px-3" aria-label="Filter pipeline stage" value={activePipelineBucket} onChange={event => { setActivePipelineBucket(event.target.value as PipelineBucket); setReviewFilter('all'); }}>{pipelineBucketConfig.map(bucket => <option key={bucket.key} value={bucket.key}>{bucket.label} ({bucket.key === 'all' ? filteredQuotes.length : pipelineColumns[bucket.key].length})</option>)}</select></label>
        <div className="operations-filter-grid">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Quote Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter by quote status">
                <SelectValue placeholder="Quote Status" />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="all">All Statuses</SelectItem>
                {QUOTE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatAdminStatus(status, 'quote')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Event Type</span>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter by event type">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="all">All Event Types</SelectItem>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Agreement Status</span>
            <Select value={agreementFilter} onValueChange={setAgreementFilter}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter by agreement status">
                <SelectValue placeholder="Agreement" />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="all">All Agreements</SelectItem>
                {AGREEMENT_TRACKING_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatAdminStatus(status, 'agreement')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Deposit Status</span>
            <Select value={depositFilter} onValueChange={setDepositFilter}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter by deposit status">
                <SelectValue placeholder="Deposit" />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="all">All Deposits</SelectItem>
                {DEPOSIT_TRACKING_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatAdminStatus(status, 'deposit')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Test Quotes</span>
            <Select value={testQuoteFilter} onValueChange={(v) => setTestQuoteFilter(v as TestQuoteFilter)}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter test quotes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="hide">Hide Test Quotes</SelectItem>
                <SelectItem value="show">Show Test Quotes</SelectItem>
                <SelectItem value="only">Test Quotes Only</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Date Availability</span>
            <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as AvailabilityFilter)}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter by date availability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="multiple_requests">Multiple Requests</SelectItem>
                <SelectItem value="date_already_booked">Date Already Booked</SelectItem>
                <SelectItem value="booked_dates">Booked Dates</SelectItem>
                <SelectItem value="booking_conflicts">Booking Conflicts</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Sort By</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Sort quotes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="admin-typography">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="event_soonest">Event Date (Soonest)</SelectItem>
                <SelectItem value="event_latest">Event Date (Latest)</SelectItem>
                <SelectItem value="total_highest">Highest Total</SelectItem>
                <SelectItem value="total_lowest">Lowest Total</SelectItem>
                <SelectItem value="status">Status A-Z</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <Button
            type="button"
            onClick={handleCreateTestQuote}
            disabled={creatingTestQuote}
            className="h-10 w-full bg-[#2d3a47] hover:bg-[#23303c] text-white border border-[#2d3a47] focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2 2xl:w-auto 2xl:self-end"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {creatingTestQuote ? 'Creating...' : 'Create Test Quote'}
          </Button>
        </div>
              <Button type="button" variant="outline" className="mt-3" onClick={resetFilters}>Reset filters</Button>
              <div className="operations-summary"><span>Estimated pipeline: <strong>{formatCurrency(summaryCounts.estimatedPipelineRevenue)}</strong></span><span>Upcoming events (30 days): <strong>{summaryCounts.upcoming}</strong></span><span>Metrics exclude test quotes · Bucket counts reflect filters</span></div>
              </div>
            </details>
            </div>
            <p className="operations-test-label">{testQuoteFilter === 'hide' ? 'Test quotes hidden' : testQuoteFilter === 'only' ? 'Test quotes only' : 'Including test quotes'}</p>
          </div>
          {selectedQuotes.length === 0 ? <div className="p-8 text-center"><ClipboardList className="mx-auto mb-3 size-6" aria-hidden="true" /><h3 className="font-semibold">No quotes match this view</h3><p className="my-3 text-sm text-slate-600">Choose another stage or reset your filters to see all non-test quotes.</p><Button variant="outline" onClick={resetFilters}>Reset filters</Button></div> : <div className="operations-queue-scroll" tabIndex={0} role="region" aria-label="Quote results">
            <table className="operations-table operations-desktop-table"><caption className="sr-only">{selectedPipelineConfig.label}. Select a customer to inspect their quote.</caption><thead><tr><th scope="col">Customer</th><th scope="col">Event</th><th scope="col">Status</th><th scope="col">Total</th><th scope="col">Next step</th></tr></thead>
              <tbody>{selectedQuotes.map(quote => <tr key={quote.id} data-selected={selectedQuote?.id === quote.id}>
                <td><button type="button" data-quote-id={quote.id} title={quote.quote_number || quote.id} aria-pressed={selectedQuote?.id === quote.id} onClick={() => selectQuote(quote.id)}>{quote.customer_name}</button>{quote.is_test_quote && <small className="font-bold text-amber-800">TEST QUOTE</small>}</td>
                <td><strong>{formatDate(quote.event_date)}</strong><small>{quote.city} · {quote.event_type}</small><span className="sr-only">{quote.guest_count} guests</span></td>
                <td><span className="operations-row-status"><span className={`operations-dot stage-${getPipelineColumn(quote.status)}`} aria-hidden="true" />{formatAdminStatus(quote.status, 'quote')}</span><span className="sr-only">Agreement: {formatAdminStatus(quote.agreement_status, 'agreement')}. Deposit: {formatAdminStatus(quote.deposit_status, 'deposit')}.</span>{quote.quote_sent_at && <small className="operations-viewed">{quote.quote_viewed_at ? `Viewed ${quote.quote_view_count ?? 1}x` : 'Not viewed'}</small>}</td>
                <td className="operations-total">{quote.total_price == null ? 'Not set' : formatCurrency(quote.total_price)}</td>
                <td><button type="button" className="operations-next-step" onClick={() => selectQuote(quote.id)} aria-label={`${quoteReviewLabel(quote)} for ${quote.customer_name}`}>{quoteReviewLabel(quote)}{needsDistanceReview(quote) && <AlertTriangle aria-label="Distance review needed" className="size-4 shrink-0 text-amber-700" />}<ChevronRight className="size-4 shrink-0" aria-hidden="true" /></button><DateAvailabilityBadges quoteId={quote.id} summary={availabilitySummaries.get(quote.event_date)} onFilter={setAvailabilityFilter} /></td>
              </tr>)}</tbody>
            </table>
            <div className="operations-mobile-list">{selectedQuotes.map(quote => <article key={quote.id} className="operations-mobile-record"><button type="button" data-quote-id={quote.id} onClick={() => selectQuote(quote.id)} aria-label={`Inspect ${quote.customer_name} quote`}><strong>{quote.customer_name}</strong><strong>{quote.total_price == null ? 'Not set' : formatCurrency(quote.total_price)}</strong></button><p>{formatDate(quote.event_date)} · {quote.city} · {quote.event_type}</p><AdminStatusBadge status={quote.status} family="quote" /><p>Agreement: {formatAdminStatus(quote.agreement_status, 'agreement')} · Deposit: {formatAdminStatus(quote.deposit_status, 'deposit')}</p>{quote.is_test_quote && <p className="font-bold">TEST QUOTE</p>}{needsDistanceReview(quote) && <p className="font-semibold text-amber-800">Distance review needed</p>}<DateAvailabilityBadges quoteId={quote.id} summary={availabilitySummaries.get(quote.event_date)} onFilter={setAvailabilityFilter} /><Link className="inline-flex min-h-11 items-center gap-2 text-sm underline" href={`/admin/quotes/${quote.id}`}>{quoteReviewLabel(quote)}<ArrowRight className="size-4" aria-hidden="true" /></Link></article>)}</div>
          </div>}
        </section>
        <div className="operations-workbench">{selectedQuote ? <QuoteWorkbench key={selectedQuote.id} quote={selectedQuote} onBack={backToQueue} /> : <div className="operations-panel p-8 text-sm text-slate-600">Select a quote from the queue to see its event, pricing, activity and notes.</div>}</div>
      </div>
      <BookingOutlook quotes={initialQuotes} blocks={blocks} />
    </div>
  );
}
