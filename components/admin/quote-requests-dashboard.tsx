'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency } from '@/lib/pricing-engine';
import { QuoteRequest, QuoteStatus } from '@/lib/quotes/types';
import { getQuoteStatusLabel, quoteStatusBadgeStyles } from '@/lib/quotes/status';

interface QuoteRequestsDashboardProps {
  initialQuotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

type SortBy = 'newest' | 'event_date' | 'total' | 'status';

function toDateValue(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function QuoteRequestsDashboard({ initialQuotes, source, error }: QuoteRequestsDashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const statuses = useMemo(() => Array.from(new Set(initialQuotes.map((q) => q.status))).sort(), [initialQuotes]);
  const eventTypes = useMemo(() => Array.from(new Set(initialQuotes.map((q) => q.eventType))).sort(), [initialQuotes]);

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = initialQuotes.filter((quote) => {
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;
      if (eventTypeFilter !== 'all' && quote.eventType !== eventTypeFilter) return false;
      if (dateFrom && quote.eventDate < dateFrom) return false;
      if (dateTo && quote.eventDate > dateTo) return false;

      if (!normalizedSearch) return true;

      return [quote.customerName, quote.eventType, quote.status, quote.eventLocation]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'event_date') return toDateValue(b.eventDate) - toDateValue(a.eventDate);
      if (sortBy === 'total') return b.total - a.total;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return toDateValue(b.createdAt) - toDateValue(a.createdAt);
    });
  }, [initialQuotes, search, statusFilter, eventTypeFilter, dateFrom, dateTo, sortBy]);

  return (
    <div className="min-h-screen bg-[#ded2c4]/20 py-10 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl border border-[#ded2c4] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-serif font-bold text-[#2d3a47]">Quote Requests</h1>
          <p className="mt-2 text-sm text-[#2d3a47]/80">Internal dashboard for viewing and managing incoming quote requests.</p>
          <p className="mt-1 text-xs text-[#2d3a47]/70">Data source: {source === 'supabase' ? 'Supabase' : 'Mock fallback'}</p>
          {error ? <p className="mt-2 text-xs text-amber-700">{error}</p> : null}
        </div>

        <div className="rounded-xl border border-[#ded2c4] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <Input placeholder="Search customer or location" value={search} onChange={(e) => setSearch(e.target.value)} className="lg:col-span-2" />
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{getQuoteStatusLabel(status as QuoteStatus)}</SelectItem>)}</SelectContent></Select>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}><SelectTrigger><SelectValue placeholder="Event type" /></SelectTrigger><SelectContent><SelectItem value="all">All Event Types</SelectItem>{eventTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#ded2c4] bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2d3a47] text-[#ded2c4]"><tr>{['Status','Customer','Event Date','Event Type','Location','Guests','Total','Submitted'].map((head) => <th key={head} className="px-4 py-3 text-left font-medium">{head}</th>)}</tr></thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="border-b border-[#ded2c4]/80 last:border-b-0 hover:bg-[#ded2c4]/15">
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${quoteStatusBadgeStyles[quote.status]}`}>{getQuoteStatusLabel(quote.status)}</span></td>
                  <td className="px-4 py-3 font-medium text-[#2d3a47]"><Link className="underline" href={`/admin/quotes/${quote.id}`}>{quote.customerName}</Link></td>
                  <td className="px-4 py-3">{new Date(`${quote.eventDate}T00:00:00`).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{quote.eventType}</td>
                  <td className="px-4 py-3">{quote.eventLocation}</td>
                  <td className="px-4 py-3">{quote.guestCount}</td>
                  <td className="px-4 py-3">{formatCurrency(quote.total)}</td>
                  <td className="px-4 py-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
