'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { QuoteRequest, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, EVENT_TYPES } from '@/lib/quotes/types';
import { CheckCircle2, Clock, AlertCircle, FileCheck, CreditCard, Calendar, Users, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuoteRequestsDashboardProps {
  initialQuotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

type SortBy = 'newest' | 'oldest' | 'event_soonest' | 'event_latest' | 'total_highest' | 'total_lowest' | 'status';

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

  const handleRowClick = (quoteId: string) => {
    router.push(`/admin/quotes/${quoteId}`);
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
    return { pending, underReview, quoteSent, approved, upcoming };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-[#2d3a47] mb-2">Quote Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Manage luxury restroom rental quote requests and track customer responses.
        </p>
        {source === 'mock' && (
          <div className="p-3 bg-[#ded2c4]/20 border border-[#ded2c4]/70 rounded-lg text-sm text-[#2d3a47] mb-4">
            Using demo quote data because Supabase is not configured.
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-4">
          <div className="text-sm text-muted-foreground">Pending Review</div>
          <div className="text-2xl font-bold text-[#2d3a47]">{summaryCounts.pending}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-4">
          <div className="text-sm text-muted-foreground">Under Review</div>
          <div className="text-2xl font-bold text-[#2d3a47]">{summaryCounts.underReview}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-4">
          <div className="text-sm text-muted-foreground">Quote Sent</div>
          <div className="text-2xl font-bold text-[#2d3a47]">{summaryCounts.quoteSent}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-4">
          <div className="text-sm text-muted-foreground">Customer Approved</div>
          <div className="text-2xl font-bold text-[#2d3a47]">{summaryCounts.approved}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-4">
          <div className="text-sm text-muted-foreground">Upcoming Events</div>
          <div className="text-2xl font-bold text-[#2d3a47]">{summaryCounts.upcoming}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Search name, email, phone, address, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lg:col-span-2"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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

      {/* Desktop Table */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2d3a47]/5 border-b border-[#ded2c4]/30">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Event Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Event Type</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Location</th>
                <th className="px-4 py-3 text-center font-semibold text-[#2d3a47]">Guests</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Agreement</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Deposit</th>
                <th className="px-4 py-3 text-right font-semibold text-[#2d3a47]">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2d3a47]">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-muted-foreground">
                    No quotes found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const statusColor = getStatusColor(quote.status);
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => handleRowClick(quote.id)}
                      className="border-b border-[#ded2c4]/20 hover:bg-[#2d3a47]/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                        >
                          {statusColor.icon}
                          {formatStatus(quote.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#2d3a47]">{quote.customer_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{quote.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{quote.phone}</td>
                      <td className="px-4 py-3">{formatDate(quote.event_date)}</td>
                      <td className="px-4 py-3">{quote.event_type}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">
                        {quote.event_address}, {quote.city}, {quote.state} {quote.zip_code}
                      </td>
                      <td className="px-4 py-3 text-center">{quote.guest_count}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#ded2c4]/20 text-[#2d3a47] border border-[#ded2c4]/60">
                          {formatStatus(quote.agreement_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#ded2c4]/20 text-[#2d3a47] border border-[#ded2c4]/60">
                          {formatStatus(quote.deposit_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#2d3a47]">
                        {formatCurrency(quote.total_price || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground group-hover:text-[#2d3a47] transition-colors">
                        {formatDate(quote.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-8 text-center text-muted-foreground">
            No quotes found matching your filters.
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const statusColor = getStatusColor(quote.status);
            return (
              <div
                key={quote.id}
                onClick={() => handleRowClick(quote.id)}
                className="bg-white rounded-lg border border-[#ded2c4]/30 p-4 space-y-3 cursor-pointer hover:border-[#2d3a47]/30 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#2d3a47]">{quote.customer_name}</h3>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                    >
                      {statusColor.icon}
                      {formatStatus(quote.status)}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{quote.event_type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(quote.event_date)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {quote.guest_count} guests
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <MapPin className="w-4 h-4" />
                    {quote.city}, {quote.state}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#ded2c4]/20">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Event: </span>
                    <span className="font-medium">{quote.event_type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#2d3a47]">{formatCurrency(quote.total_price || 0)}</div>
                    <div className="text-xs text-muted-foreground">
                      Deposit: {formatCurrency(quote.deposit_amount || 0)} ({formatStatus(quote.deposit_status)})
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
