'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { QuoteRequest, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, EVENT_TYPES } from '@/lib/quotes/types';
import { CheckCircle2, Clock, AlertCircle, FileCheck, CreditCard, Calendar, Users, MapPin, Search, SlidersHorizontal, Sparkles, CircleDollarSign, ClipboardList, Send, BadgeCheck, CalendarClock, Plus, Mail, SquarePen, FileSignature, Eye, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuoteRequestsDashboardProps {
  initialQuotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

type SortBy = 'newest' | 'oldest' | 'event_soonest' | 'event_latest' | 'total_highest' | 'total_lowest' | 'status';
type PipelineColumn = 'new_requests' | 'under_review' | 'quote_sent' | 'customer_approved' | 'agreement_sent' | 'deposit_paid' | 'booked';
type PipelineBucket = PipelineColumn | 'all';

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
];

function getStatusColor(status: string) {
  const colors: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    pending_review: { bg: 'bg-[#ded2c4]/35', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <Clock className="w-4 h-4" /> },
    new: { bg: 'bg-[#ded2c4]/35', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <Clock className="w-4 h-4" /> },
    under_review: { bg: 'bg-[#ded2c4]/35', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <Clock className="w-4 h-4" /> },
    draft_quote: { bg: 'bg-white', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <FileCheck className="w-4 h-4" /> },
    quote_sent: { bg: 'bg-[#2d3a47]/10', text: 'text-[#2d3a47]', border: 'border border-[#2d3a47]/40', icon: <FileCheck className="w-4 h-4" /> },
    sent_to_customer: { bg: 'bg-[#2d3a47]/10', text: 'text-[#2d3a47]', border: 'border border-[#2d3a47]/40', icon: <FileCheck className="w-4 h-4" /> },
    customer_approved: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    change_requested: { bg: 'bg-[#ded2c4]/25', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <AlertCircle className="w-4 h-4" /> },
    agreement_pending: { bg: 'bg-[#ded2c4]/25', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <FileCheck className="w-4 h-4" /> },
    agreement_sent: { bg: 'bg-[#2d3a47]/10', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <FileCheck className="w-4 h-4" /> },
    agreement_signed: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    deposit_pending: { bg: 'bg-[#ded2c4]/25', text: 'text-[#2d3a47]', border: 'border border-[#8a7a68]', icon: <CreditCard className="w-4 h-4" /> },
    deposit_paid: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CreditCard className="w-4 h-4" /> },
    booked: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    confirmed: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    completed: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    cancelled: { bg: 'bg-white', text: 'text-[#4b5563]', border: 'border border-[#2d3a47]/40', icon: <AlertCircle className="w-4 h-4" /> },
    declined: { bg: 'bg-white', text: 'text-[#4b5563]', border: 'border border-[#2d3a47]/40', icon: <AlertCircle className="w-4 h-4" /> },
    expired: { bg: 'bg-white', text: 'text-[#4b5563]', border: 'border border-[#2d3a47]/40', icon: <Clock className="w-4 h-4" /> },
  };
  return colors[status] || { bg: 'bg-white', text: 'text-[#2d3a47]', border: 'border border-[#2d3a47]/40', icon: <Clock className="w-4 h-4" /> };
}


function formatStatus(status: string) {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function isQuoteSendable(status: string) {
  return ['pending', 'pending_review', 'new', 'under_review', 'draft_quote', 'change_requested'].includes(status);
}

function isAgreementSendable(status: string) {
  return ['quote_sent', 'sent_to_customer', 'customer_approved', 'agreement_pending'].includes(status);
}

function hasFallbackDistanceCalculation(quote: QuoteRequest) {
  const details = quote.calculated_breakdown?.details;
  return quote.needs_manual_distance_review === true || (typeof details === 'object' && details !== null && (details as Record<string, unknown>).distance_calculation_status === 'fallback');
}

function getDistanceCalculationMessage(quote: QuoteRequest) {
  const details = quote.calculated_breakdown?.details;
  if (typeof details === 'object' && details !== null) {
    const message = (details as Record<string, unknown>).distance_calculation_message;
    if (typeof message === 'string') return message;
  }

  return 'Fallback mileage was used. Verify travel fee manually.';
}

function getPipelineColumn(status: string): PipelineColumn {
  if (['pending', 'pending_review', 'new'].includes(status)) return 'new_requests';
  if (['under_review', 'draft_quote', 'change_requested'].includes(status)) return 'under_review';
  if (['quote_sent', 'sent_to_customer'].includes(status)) return 'quote_sent';
  if (status === 'customer_approved') return 'customer_approved';
  if (['agreement_pending', 'agreement_sent', 'agreement_signed'].includes(status)) return 'agreement_sent';
  if (['deposit_pending', 'deposit_paid'].includes(status)) return 'deposit_paid';
  return 'booked';
}

export default function QuoteRequestsDashboard({
  initialQuotes,
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
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [activePipelineBucket, setActivePipelineBucket] = useState<PipelineBucket>('new_requests');

  const handleRowClick = (quoteId: string) => {
    router.push(`/admin/quotes/${quoteId}`);
  };

  const openQuoteDrawer = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
  };

  // Summary card counts
  const summaryCounts = useMemo(() => {
    const pending = initialQuotes.filter((q) => q.status === 'pending_review').length;
    const underReview = initialQuotes.filter((q) => q.status === 'under_review').length;
    const quoteSent = initialQuotes.filter((q) => q.status === 'quote_sent' || q.status === 'sent_to_customer').length;
    const approved = initialQuotes.filter((q) => q.status === 'customer_approved').length;
    const upcoming = initialQuotes.filter((q) => {
      const eventDate = new Date(q.event_date);
      const now = new Date();
      const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return eventDate >= now && eventDate <= thirtyDaysOut && ['booked', 'confirmed', 'deposit_paid'].includes(q.status);
    }).length;
    const estimatedPipelineRevenue = initialQuotes
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

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = initialQuotes.filter((quote) => {
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;
      if (eventTypeFilter !== 'all' && quote.event_type !== eventTypeFilter) return false;
      if (agreementFilter !== 'all' && quote.agreement_status !== agreementFilter) return false;
      if (depositFilter !== 'all' && quote.deposit_status !== depositFilter) return false;

      if (!normalizedSearch) return true;

      return [
        quote.customer_name,
        quote.email,
        quote.phone,
        quote.event_address,
        quote.city,
        quote.event_type,
        quote.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'event_soonest':
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        case 'event_latest':
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        case 'total_highest':
          return (b.total_price || 0) - (a.total_price || 0);
        case 'total_lowest':
          return (a.total_price || 0) - (b.total_price || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [initialQuotes, search, statusFilter, eventTypeFilter, agreementFilter, depositFilter, sortBy]);

  const pipelineColumns = useMemo(() => {
    const base: Record<PipelineColumn, QuoteRequest[]> = {
      new_requests: [],
      under_review: [],
      quote_sent: [],
      customer_approved: [],
      agreement_sent: [],
      deposit_paid: [],
      booked: [],
    };
    filteredQuotes.forEach((quote) => {
      base[getPipelineColumn(quote.status)].push(quote);
    });
    return base;
  }, [filteredQuotes]);

  const selectedPipelineConfig = pipelineBucketConfig.find((bucket) => bucket.key === activePipelineBucket) ?? pipelineBucketConfig[0];
  const selectedQuotes = activePipelineBucket === 'all' ? filteredQuotes : pipelineColumns[activePipelineBucket];

  return (
    <div className="space-y-8">
      {/* Header / Hero */}
      <div className="rounded-2xl bg-[#2d3a47] text-white shadow-lg border border-[#2d3a47]/80 overflow-hidden">
        <div className="p-6 md:p-8 space-y-2">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ded2c4] font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Signature Luxe Admin
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-white">
            Quote &amp; Booking Command Center
          </h1>
          <p className="text-[#ded2c4] max-w-3xl">
            Manage restroom trailer inquiries from quote request to booked event.
          </p>
        </div>
        {source === 'mock' && (
          <div className="mx-6 md:mx-8 mb-4 p-3 bg-[#ded2c4]/20 border border-[#8a7a68] rounded-lg text-sm text-[#ded2c4]">
            Using demo quote data because Supabase is not configured.
          </div>
        )}
        {error && (
          <div className="mx-6 md:mx-8 mb-5 p-3 bg-red-50/95 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Pending Requests', value: summaryCounts.pending, icon: ClipboardList },
          { label: 'Under Review', value: summaryCounts.underReview, icon: SlidersHorizontal },
          { label: 'Quotes Sent', value: summaryCounts.quoteSent, icon: Send },
          { label: 'Customer Approved', value: summaryCounts.approved, icon: BadgeCheck, featured: true },
          { label: 'Upcoming Events', value: summaryCounts.upcoming, icon: CalendarClock },
          { label: 'Estimated Pipeline Revenue', value: formatCurrency(summaryCounts.estimatedPipelineRevenue), icon: CircleDollarSign },
        ].map((metric) => (
          <div
            key={metric.label}
            className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
              metric.featured
                ? 'border-[#2d3a47]/40 ring-1 ring-[#ded2c4] shadow-md'
                : 'border-[#ded2c4]/45'
            }`}
          >
            <div className="h-1 w-14 rounded-full bg-[#ded2c4] mb-3" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-[#4b5563]">{metric.label}</div>
                <div className={`mt-1 font-semibold ${metric.featured ? 'text-3xl' : 'text-2xl'} text-[#2d3a47]`}>
                  {metric.value}
                </div>
              </div>
              <metric.icon className={`h-5 w-5 ${metric.featured ? 'text-[#2d3a47]' : 'text-[#4b5563]'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Full-width Filters */}
      <section className="bg-white rounded-xl border border-[#8a7a68] p-4 md:p-5 shadow-sm space-y-5" aria-labelledby="quote-filters-heading">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 id="quote-filters-heading" className="text-lg font-serif font-semibold text-[#2d3a47]">Filters</h2>
            <p className="text-sm text-[#4b5563]">Refine the full dashboard before choosing a pipeline bucket.</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-[#2d3a47]">
            <span className="rounded-full bg-[#f8f4ee] px-2.5 py-1 border border-[#8a7a68]" aria-live="polite">{filteredQuotes.length} filtered quote{filteredQuotes.length === 1 ? '' : 's'}</span>
            <Search className="h-5 w-5 text-[#2d3a47]" aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(260px,1.4fr)_repeat(5,minmax(150px,1fr))_auto] 2xl:items-end">
          <label className="block space-y-1.5 sm:col-span-2 lg:col-span-3 2xl:col-span-1">
            <span className="text-sm font-semibold text-[#2d3a47]">Search</span>
            <Input
              placeholder="Name, email, phone, address, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-[#b9aa99] text-[#2d3a47] placeholder:text-[#4b5563]/80 focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Quote Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Filter by quote status">
                <SelectValue placeholder="Quote Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {QUOTE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
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
              <SelectContent>
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
              <SelectContent>
                <SelectItem value="all">All Agreements</SelectItem>
                {AGREEMENT_TRACKING_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
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
              <SelectContent>
                <SelectItem value="all">All Deposits</SelectItem>
                {DEPOSIT_TRACKING_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#2d3a47]">Sort By</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="border-[#b9aa99] text-[#2d3a47] focus:ring-2 focus:ring-[#2d3a47] focus:ring-offset-2" aria-label="Sort quotes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            className="h-10 w-full bg-[#2d3a47] hover:bg-[#23303c] text-white border border-[#2d3a47] focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2 2xl:w-auto 2xl:self-end"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Manual Quote
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-6">
          <section className="bg-[#f8f4ee] rounded-xl border border-[#8a7a68]/80 p-3 shadow-sm" aria-labelledby="pipeline-tabs-heading">
            <div className="px-1 pb-3">
              <h2 id="pipeline-tabs-heading" className="text-lg font-serif font-semibold text-[#2d3a47]">Pipeline Buckets</h2>
              <p className="text-sm text-[#4b5563]">Counts reflect the active filters.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0" role="tablist" aria-label="Quote pipeline buckets">
              {pipelineBucketConfig.map((bucket) => {
                const Icon = bucket.icon;
                const count = bucket.key === 'all' ? filteredQuotes.length : pipelineColumns[bucket.key].length;
                const isActive = activePipelineBucket === bucket.key;

                return (
                  <button
                    key={bucket.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-pressed={isActive}
                    aria-controls="pipeline-records-panel"
                    onClick={() => setActivePipelineBucket(bucket.key)}
                    className={`min-w-[220px] rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2 sm:min-w-[245px] lg:min-w-0 ${
                      isActive
                        ? 'bg-[#2d3a47] text-white border-[#2d3a47] shadow-md ring-2 ring-[#ded2c4]'
                        : 'bg-white text-[#2d3a47] border-[#b9aa99] hover:bg-[#fffaf4] hover:border-[#2d3a47] hover:shadow-sm'
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-[#2d3a47]'}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-semibold leading-tight">{bucket.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white text-[#2d3a47]' : 'bg-[#f8f4ee] text-[#2d3a47] border border-[#8a7a68]'}`} aria-label={`${count} quotes`}>
                            {count}
                          </span>
                        </span>
                        <span className={`mt-1 block text-xs leading-snug ${isActive ? 'text-white/90' : 'text-[#4b5563]'}`}>
                          {bucket.description}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <section id="pipeline-records-panel" role="tabpanel" className="min-w-0 bg-white rounded-xl border border-[#8a7a68] shadow-sm overflow-hidden" aria-labelledby="selected-pipeline-heading">
          <div className="border-b border-[#8a7a68] bg-[#f8f4ee] p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4b5563]">Selected Bucket</p>
                <h2 id="selected-pipeline-heading" className="mt-1 text-2xl font-serif font-semibold text-[#2d3a47]">{selectedPipelineConfig.label}</h2>
                <p className="text-sm text-[#4b5563]">{selectedPipelineConfig.description}</p>
              </div>
              <div className="rounded-xl border border-[#8a7a68] bg-white px-4 py-2 text-[#2d3a47]">
                <span className="block text-2xl font-semibold leading-none">{selectedQuotes.length}</span>
                <span className="text-xs font-semibold uppercase tracking-wide">Quote{selectedQuotes.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>

          {selectedQuotes.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f4ee] border border-[#8a7a68]">
                <ClipboardList className="h-6 w-6 text-[#2d3a47]" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2d3a47]">No quotes in this bucket</h3>
              <p className="mt-2 text-sm text-[#4b5563]">Try another pipeline stage or adjust your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#8a7a68]/70">
              {selectedQuotes.map((quote) => {
                const statusColor = getStatusColor(quote.status);
                const agreementColor = getStatusColor(quote.agreement_status);
                const depositColor = getStatusColor(quote.deposit_status);
                const canSendQuote = isQuoteSendable(quote.status);
                const canSendAgreement = isAgreementSendable(quote.status);
                const fallbackDistance = hasFallbackDistanceCalculation(quote);
                const optionCount = quote.quote_options?.length ?? 0;
                const selectedOption = quote.quote_options?.find((option) => option.id === quote.selected_quote_option_id || option.status === 'selected');

                return (
                  <article
                    key={quote.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(quote.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRowClick(quote.id);
                      }
                    }}
                    className="group cursor-pointer bg-white p-4 transition-colors hover:bg-[#fffaf4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d3a47] focus-visible:ring-inset md:p-5"
                    aria-label={`Open quote ${quote.quote_number || quote.id} for ${quote.customer_name}`}
                  >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                      <div className="min-w-0 space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-[#2d3a47] group-hover:underline group-hover:decoration-[#ded2c4] group-hover:underline-offset-4">{quote.customer_name}</h3>
                            <p className="mt-1 text-sm font-medium text-[#4b5563]">Quote #{quote.quote_number || quote.id.slice(0, 8)}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5563]">Total Price</p>
                            <p className="text-xl font-semibold text-[#2d3a47]">{formatCurrency(quote.total_price || 0)}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-[#2d3a47] md:grid-cols-2 xl:grid-cols-4">
                          <p className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-[#2d3a47]" aria-hidden="true" /><span className="truncate">{quote.email}</span></p>
                          <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-[#2d3a47]" aria-hidden="true" />{quote.phone}</p>
                          <p className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0 text-[#2d3a47]" aria-hidden="true" />{formatDate(quote.event_date)}</p>
                          <p className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-[#2d3a47]" aria-hidden="true" />{quote.guest_count} guests</p>
                          <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0 text-[#2d3a47]" aria-hidden="true" />{quote.event_type}</p>
                          <p className="flex min-w-0 items-center gap-2 md:col-span-2 xl:col-span-3"><MapPin className="h-4 w-4 shrink-0 text-[#2d3a47]" aria-hidden="true" /><span className="truncate">{quote.city}, {quote.state}</span></p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                            {statusColor.icon}<span>Quote: {formatStatus(quote.status)}</span>
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${agreementColor.bg} ${agreementColor.text} ${agreementColor.border}`}>
                            {agreementColor.icon}<span>Agreement: {formatStatus(quote.agreement_status)}</span>
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${depositColor.bg} ${depositColor.text} ${depositColor.border}`}>
                            {depositColor.icon}<span>Deposit: {formatStatus(quote.deposit_status)}</span>
                          </span>
                          {optionCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8f4ee] px-2.5 py-1 text-xs font-semibold text-[#2d3a47] border border-[#8a7a68]">
                              {selectedOption ? `Selected: ${selectedOption.option_label}` : `${optionCount} Option${optionCount === 1 ? '' : 's'}`}
                            </span>
                          )}
                          {fallbackDistance && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-400" title={getDistanceCalculationMessage(quote)}>
                              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Distance review needed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:w-[430px]">
                        <Button size="sm" variant="outline" className="h-9 border-[#b9aa99] text-[#2d3a47] hover:bg-[#f8f4ee] focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2" aria-label={`View ${quote.customer_name} in side drawer`} onClick={(event) => { event.stopPropagation(); openQuoteDrawer(quote); }}><Eye className="w-3.5 h-3.5" aria-hidden="true" />View</Button>
                        <Button size="sm" variant="outline" className="h-9 border-[#b9aa99] text-[#2d3a47] hover:bg-[#f8f4ee] focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2" aria-label={`Edit ${quote.customer_name} quote`} onClick={(event) => { event.stopPropagation(); handleRowClick(quote.id); }}><SquarePen className="w-3.5 h-3.5" aria-hidden="true" />Edit</Button>
                        <Button size="sm" variant="outline" className="h-9 border-[#b9aa99] text-[#2d3a47] hover:bg-[#f8f4ee] focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2 disabled:opacity-55" aria-label={`Send quote to ${quote.customer_name}`} disabled={!canSendQuote} onClick={(event) => event.stopPropagation()}><Mail className="w-3.5 h-3.5" aria-hidden="true" />Send Quote</Button>
                        <Button size="sm" variant="outline" className="h-9 border-[#b9aa99] text-[#2d3a47] hover:bg-[#f8f4ee] focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2 disabled:opacity-55" aria-label={`Send agreement to ${quote.customer_name}`} disabled={!canSendAgreement} onClick={(event) => event.stopPropagation()}><FileSignature className="w-3.5 h-3.5" aria-hidden="true" />Agreement</Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <Sheet open={Boolean(selectedQuote)} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-[#f8f4ee] border-l border-[#8a7a68]">
          {selectedQuote && (
            <div className="space-y-6">
              <SheetHeader className="text-left">
                <SheetTitle className="text-2xl font-serif text-[#2d3a47]">
                  {selectedQuote.customer_name}
                </SheetTitle>
                <SheetDescription className="text-[#4b5563]">
                  Quote details and booking activity timeline.
                </SheetDescription>
              </SheetHeader>

              <div className="bg-white border border-[#8a7a68]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#4b5563]">Customer Details</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Email:</strong> {selectedQuote.email}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Phone:</strong> {selectedQuote.phone}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Status:</strong> {formatStatus(selectedQuote.status)}</p>
                {(selectedQuote.quote_options?.length ?? 0) > 0 && (
                  <p className="text-sm text-[#2d3a47]"><strong>Quote Options:</strong> {selectedQuote.quote_options?.find((option) => option.id === selectedQuote.selected_quote_option_id || option.status === 'selected')?.option_label ?? `${selectedQuote.quote_options?.length} options`}</p>
                )}
              </div>

              <div className="bg-white border border-[#8a7a68]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#4b5563]">Event Details</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Event Type:</strong> {selectedQuote.event_type}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Event Date:</strong> {formatDate(selectedQuote.event_date)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Guest Count:</strong> {selectedQuote.guest_count}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Location:</strong> {selectedQuote.event_address}, {selectedQuote.city}, {selectedQuote.state} {selectedQuote.zip_code}</p>
              </div>

              <div className="bg-white border border-[#8a7a68]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#4b5563]">Quote Breakdown</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Base Price:</strong> {formatCurrency(selectedQuote.base_price || 0)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Travel Fee:</strong> {formatCurrency(selectedQuote.travel_fee || 0)}</p>
                {hasFallbackDistanceCalculation(selectedQuote) && (
                  <p className="text-sm text-amber-800"><strong>Distance Notice:</strong> {getDistanceCalculationMessage(selectedQuote)}</p>
                )}
                <p className="text-sm text-[#2d3a47]"><strong>Utility Fee:</strong> {formatCurrency(selectedQuote.utility_fee || 0)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Total:</strong> {formatCurrency(selectedQuote.total_price || 0)}</p>
              </div>

              <div className="bg-white border border-[#8a7a68]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#4b5563]">Agreement & Deposit</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Agreement:</strong> {formatStatus(selectedQuote.agreement_status)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Deposit:</strong> {formatStatus(selectedQuote.deposit_status)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Deposit Amount:</strong> {formatCurrency(selectedQuote.deposit_amount || 0)}</p>
              </div>

              <div className="bg-white border border-[#8a7a68]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#4b5563]">Internal Notes</h4>
                <p className="text-sm text-[#2d3a47]/85 whitespace-pre-wrap">{selectedQuote.internal_notes || 'No internal notes yet.'}</p>
              </div>

              <div className="bg-white border border-[#8a7a68]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#4b5563]">Timeline / Activity</h4>
                <ul className="space-y-2 text-sm text-[#2d3a47]">
                  <li><strong>Created:</strong> {formatDate(selectedQuote.created_at)}</li>
                  {selectedQuote.updated_at && <li><strong>Last Updated:</strong> {formatDate(selectedQuote.updated_at)}</li>}
                  {selectedQuote.approved_at && <li><strong>Customer Approved:</strong> {formatDate(selectedQuote.approved_at)}</li>}
                  {selectedQuote.agreement_sent_at && <li><strong>Agreement Sent:</strong> {formatDate(selectedQuote.agreement_sent_at)}</li>}
                  {selectedQuote.deposit_paid_at && <li><strong>Deposit Paid:</strong> {formatDate(selectedQuote.deposit_paid_at)}</li>}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 pb-4">
                <Button className="bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white" onClick={() => handleRowClick(selectedQuote.id)}>
                  Edit Quote
                </Button>
                <Button variant="outline" disabled={!isQuoteSendable(selectedQuote.status)}>
                  Send Quote
                </Button>
                <Button variant="outline" disabled={!isAgreementSendable(selectedQuote.status)}>
                  Send Agreement
                </Button>
                <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
