'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AdminQuoteRequestRow } from '@/app/admin/page';
import Link from 'next/link';
import { formatCurrency } from '@/lib/pricing-engine';

interface QuoteRequestsDashboardProps {
  initialQuotes: AdminQuoteRequestRow[];
}

type SortBy = 'newest' | 'event_date' | 'total' | 'status';

function toDateValue(value: string | null): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function QuoteRequestsDashboard({ initialQuotes }: QuoteRequestsDashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const statuses = useMemo(
    () => Array.from(new Set(initialQuotes.map((q) => q.status).filter(Boolean) as string[])).sort(),
    [initialQuotes]
  );

  const eventTypes = useMemo(
    () => Array.from(new Set(initialQuotes.map((q) => q.event_type).filter(Boolean) as string[])).sort(),
    [initialQuotes]
  );

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = initialQuotes.filter((quote) => {
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;
      if (eventTypeFilter !== 'all' && quote.event_type !== eventTypeFilter) return false;

      if (dateFrom && quote.event_date && quote.event_date < dateFrom) return false;
      if (dateTo && quote.event_date && quote.event_date > dateTo) return false;

      if (!normalizedSearch) return true;
      const location = [quote.event_address, quote.city, quote.state].filter(Boolean).join(' ').toLowerCase();
      return [quote.customer_name ?? '', quote.event_type ?? '', quote.status ?? '', location]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'event_date') return toDateValue(b.event_date) - toDateValue(a.event_date);
      if (sortBy === 'total') return (b.total_price ?? 0) - (a.total_price ?? 0);
      if (sortBy === 'status') return (a.status ?? '').localeCompare(b.status ?? '');
      return toDateValue(b.created_at) - toDateValue(a.created_at);
    });
  }, [initialQuotes, search, statusFilter, eventTypeFilter, dateFrom, dateTo, sortBy]);

  return (
    <div className="min-h-screen bg-[#ded2c4]/20 py-10 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl border border-[#ded2c4] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-serif font-bold text-[#2d3a47]">Quote Requests</h1>
          <p className="mt-2 text-sm text-[#2d3a47]/80">Internal dashboard for viewing and managing incoming quote requests.</p>
        </div>

        <div className="rounded-xl border border-[#ded2c4] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <Input placeholder="Search customer or location" value={search} onChange={(e) => setSearch(e.target.value)} className="lg:col-span-2" />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Event type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                {eventTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Submitted</SelectItem>
                <SelectItem value="event_date">Event Date</SelectItem>
                <SelectItem value="total">Quote Total</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); setEventTypeFilter('all'); setDateFrom(''); setDateTo(''); setSortBy('newest'); }}>
              Reset
            </Button>
            <p className="text-sm text-[#2d3a47]/70">{filteredQuotes.length} results</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#ded2c4] bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2d3a47] text-[#ded2c4]">
              <tr>
                {['Status','Customer','Event Date','Event Type','Location','Guests','Total','Submitted'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="border-b border-[#ded2c4]/80 last:border-b-0 hover:bg-[#ded2c4]/15">
                  <td className="px-4 py-3 capitalize">{quote.status ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-[#2d3a47]"><Link className="underline" href={`/admin/quotes/${quote.id}`}>{quote.customer_name ?? '—'}</Link></td>
                  <td className="px-4 py-3">{quote.event_date ? new Date(`${quote.event_date}T00:00:00`).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{quote.event_type ?? '—'}</td>
                  <td className="px-4 py-3">{[quote.event_address, quote.city, quote.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3">{quote.guest_count ?? '—'}</td>
                  <td className="px-4 py-3">{typeof quote.total_price === 'number' ? formatCurrency(quote.total_price) : '—'}</td>
                  <td className="px-4 py-3">{new Date(quote.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[#2d3a47]/70">No quote requests match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
