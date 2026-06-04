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
import { useRouter } from 'next/navigation';

interface QuoteRequestsDashboardProps {
  initialQuotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

type SortBy = 'newest' | 'oldest' | 'event_soonest' | 'event_latest' | 'total_highest' | 'total_lowest' | 'status';
type PipelineColumn = 'new_requests' | 'under_review' | 'quote_sent' | 'customer_approved' | 'agreement_sent' | 'deposit_paid' | 'booked';

function getStatusColor(status: string) {
  const colors: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    pending_review: { bg: 'bg-[#ded2c4]/35', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <Clock className="w-4 h-4" /> },
    new: { bg: 'bg-[#ded2c4]/35', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <Clock className="w-4 h-4" /> },
    under_review: { bg: 'bg-[#ded2c4]/35', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <Clock className="w-4 h-4" /> },
    draft_quote: { bg: 'bg-white', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <FileCheck className="w-4 h-4" /> },
    quote_sent: { bg: 'bg-[#2d3a47]/10', text: 'text-[#2d3a47]', border: 'border border-[#2d3a47]/20', icon: <FileCheck className="w-4 h-4" /> },
    sent_to_customer: { bg: 'bg-[#2d3a47]/10', text: 'text-[#2d3a47]', border: 'border border-[#2d3a47]/20', icon: <FileCheck className="w-4 h-4" /> },
    customer_approved: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    change_requested: { bg: 'bg-[#ded2c4]/25', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <AlertCircle className="w-4 h-4" /> },
    agreement_pending: { bg: 'bg-[#ded2c4]/25', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <FileCheck className="w-4 h-4" /> },
    agreement_sent: { bg: 'bg-[#2d3a47]/10', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <FileCheck className="w-4 h-4" /> },
    agreement_signed: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    deposit_pending: { bg: 'bg-[#ded2c4]/25', text: 'text-[#2d3a47]', border: 'border border-[#ded2c4]/70', icon: <CreditCard className="w-4 h-4" /> },
    deposit_paid: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CreditCard className="w-4 h-4" /> },
    booked: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    confirmed: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    completed: { bg: 'bg-[#2d3a47]', text: 'text-white', border: 'border border-[#2d3a47]', icon: <CheckCircle2 className="w-4 h-4" /> },
    cancelled: { bg: 'bg-white', text: 'text-[#2d3a47]/70', border: 'border border-[#2d3a47]/25', icon: <AlertCircle className="w-4 h-4" /> },
    declined: { bg: 'bg-white', text: 'text-[#2d3a47]/70', border: 'border border-[#2d3a47]/25', icon: <AlertCircle className="w-4 h-4" /> },
    expired: { bg: 'bg-white', text: 'text-[#2d3a47]/70', border: 'border border-[#2d3a47]/25', icon: <Clock className="w-4 h-4" /> },
  };
  return colors[status] || { bg: 'bg-white', text: 'text-[#2d3a47]', border: 'border border-[#2d3a47]/20', icon: <Clock className="w-4 h-4" /> };
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
          <div className="mx-6 md:mx-8 mb-4 p-3 bg-[#ded2c4]/20 border border-[#ded2c4]/70 rounded-lg text-sm text-[#ded2c4]">
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</div>
                <div className={`mt-1 font-semibold ${metric.featured ? 'text-3xl' : 'text-2xl'} text-[#2d3a47]`}>
                  {metric.value}
                </div>
              </div>
              <metric.icon className={`h-5 w-5 ${metric.featured ? 'text-[#2d3a47]' : 'text-[#2d3a47]/65'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#ded2c4]/45 p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 flex-1">
          <Input
            placeholder="Search name, email, phone, address, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="xl:col-span-2 border-[#ded2c4]/70 focus-visible:ring-[#2d3a47]/30"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
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
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger>
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
          <Select value={agreementFilter} onValueChange={setAgreementFilter}>
            <SelectTrigger>
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
          <Select value={depositFilter} onValueChange={setDepositFilter}>
            <SelectTrigger>
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
          </div>
          <Button
            type="button"
            className="bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white border border-[#ded2c4]/40"
          >
            <Plus className="h-4 w-4" />
            New Manual Quote
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[#2d3a47]/60" />
            <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-auto">
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
          </div>
          <span className="text-sm text-muted-foreground">{filteredQuotes.length} quotes</span>
        </div>
      </div>

      {/* Kanban Pipeline */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-12 text-center text-muted-foreground">
          No quotes found matching your filters.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[minmax(320px,340px)] gap-4 min-w-max">
            {[
              { key: 'new_requests' as const, label: 'New Requests' },
              { key: 'under_review' as const, label: 'Under Review' },
              { key: 'quote_sent' as const, label: 'Quote Sent' },
              { key: 'customer_approved' as const, label: 'Customer Approved' },
              { key: 'agreement_sent' as const, label: 'Agreement Sent' },
              { key: 'deposit_paid' as const, label: 'Deposit Paid' },
              { key: 'booked' as const, label: 'Booked' },
            ].map((column) => (
              <div key={column.key} className="bg-[#f8f4ee] border border-[#ded2c4]/50 rounded-xl p-3 space-y-3 flex flex-col min-h-[68vh]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#2d3a47]">{column.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#ded2c4]/60 text-[#2d3a47]">
                    {pipelineColumns[column.key].length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 flex-1">
                  {pipelineColumns[column.key].map((quote) => {
                    const statusColor = getStatusColor(quote.status);
                    const canSendQuote = isQuoteSendable(quote.status);
                    const canSendAgreement = isAgreementSendable(quote.status);
                    const fallbackDistance = hasFallbackDistanceCalculation(quote);
                    return (
                      <div key={quote.id} onClick={() => handleRowClick(quote.id)} className="bg-white rounded-xl border border-[#ded2c4]/40 cursor-pointer hover:shadow-md transition-all overflow-hidden">
                        <div className="h-1 w-full bg-[#ded2c4]" />
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-[#2d3a47] text-sm truncate">{quote.customer_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{quote.email}</p>
                              <p className="text-xs text-[#2d3a47]/70">{quote.phone}</p>
                            </div>
                            <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                              {statusColor.icon}
                              {formatStatus(quote.status)}
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs text-[#2d3a47]/80">
                            <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(quote.event_date)} · {quote.event_type}</p>
                            <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> <span className="truncate">{quote.event_address}, {quote.city}, {quote.state}</span></p>
                            <p className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {quote.guest_count} guests</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2d3a47]/5 border border-[#2d3a47]/20">{formatStatus(quote.agreement_status)}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2d3a47]/5 border border-[#2d3a47]/20">{formatStatus(quote.deposit_status)}</span>
                            {fallbackDistance && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800" title={getDistanceCalculationMessage(quote)}>
                                <AlertTriangle className="h-3 w-3" /> Distance review
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-semibold text-[#2d3a47] text-sm">{formatCurrency(quote.total_price || 0)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={(event) => { event.stopPropagation(); openQuoteDrawer(quote); }}><Eye className="w-3 h-3" />View</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={(event) => { event.stopPropagation(); handleRowClick(quote.id); }}><SquarePen className="w-3 h-3" />Edit</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" disabled={!canSendQuote} onClick={(event) => event.stopPropagation()}><Mail className="w-3 h-3" />Send Quote</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" disabled={!canSendAgreement} onClick={(event) => event.stopPropagation()}><FileSignature className="w-3 h-3" />Agreement</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Sheet open={Boolean(selectedQuote)} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-[#f8f4ee] border-l border-[#ded2c4]/70">
          {selectedQuote && (
            <div className="space-y-6">
              <SheetHeader className="text-left">
                <SheetTitle className="text-2xl font-serif text-[#2d3a47]">
                  {selectedQuote.customer_name}
                </SheetTitle>
                <SheetDescription className="text-[#2d3a47]/70">
                  Quote details and booking activity timeline.
                </SheetDescription>
              </SheetHeader>

              <div className="bg-white border border-[#ded2c4]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d3a47]/70">Customer Details</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Email:</strong> {selectedQuote.email}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Phone:</strong> {selectedQuote.phone}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Status:</strong> {formatStatus(selectedQuote.status)}</p>
              </div>

              <div className="bg-white border border-[#ded2c4]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d3a47]/70">Event Details</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Event Type:</strong> {selectedQuote.event_type}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Event Date:</strong> {formatDate(selectedQuote.event_date)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Guest Count:</strong> {selectedQuote.guest_count}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Location:</strong> {selectedQuote.event_address}, {selectedQuote.city}, {selectedQuote.state} {selectedQuote.zip_code}</p>
              </div>

              <div className="bg-white border border-[#ded2c4]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d3a47]/70">Quote Breakdown</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Base Price:</strong> {formatCurrency(selectedQuote.base_price || 0)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Travel Fee:</strong> {formatCurrency(selectedQuote.travel_fee || 0)}</p>
                {hasFallbackDistanceCalculation(selectedQuote) && (
                  <p className="text-sm text-amber-800"><strong>Distance Notice:</strong> {getDistanceCalculationMessage(selectedQuote)}</p>
                )}
                <p className="text-sm text-[#2d3a47]"><strong>Utility Fee:</strong> {formatCurrency(selectedQuote.utility_fee || 0)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Total:</strong> {formatCurrency(selectedQuote.total_price || 0)}</p>
              </div>

              <div className="bg-white border border-[#ded2c4]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d3a47]/70">Agreement & Deposit</h4>
                <p className="text-sm text-[#2d3a47]"><strong>Agreement:</strong> {formatStatus(selectedQuote.agreement_status)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Deposit:</strong> {formatStatus(selectedQuote.deposit_status)}</p>
                <p className="text-sm text-[#2d3a47]"><strong>Deposit Amount:</strong> {formatCurrency(selectedQuote.deposit_amount || 0)}</p>
              </div>

              <div className="bg-white border border-[#ded2c4]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d3a47]/70">Internal Notes</h4>
                <p className="text-sm text-[#2d3a47]/85 whitespace-pre-wrap">{selectedQuote.internal_notes || 'No internal notes yet.'}</p>
              </div>

              <div className="bg-white border border-[#ded2c4]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d3a47]/70">Timeline / Activity</h4>
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
