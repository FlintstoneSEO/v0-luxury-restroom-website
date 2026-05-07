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
import Link from 'next/link';
import { QuoteRequest, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES } from '@/lib/quotes/types';
import { CheckCircle2, Clock, AlertCircle, FileCheck, CreditCard, ChevronRight } from 'lucide-react';

interface QuoteRequestsDashboardProps {
  initialQuotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

type SortBy = 'newest' | 'created' | 'final_price' | 'status';

function getStatusColor(status: string) {
  const colors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    new: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="w-4 h-4" /> },
    under_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <Clock className="w-4 h-4" /> },
    quote_sent: { bg: 'bg-purple-50', text: 'text-purple-700', icon: <FileCheck className="w-4 h-4" /> },
    customer_approved: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
    agreement_pending: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: <FileCheck className="w-4 h-4" /> },
    deposit_pending: { bg: 'bg-orange-50', text: 'text-orange-700', icon: <CreditCard className="w-4 h-4" /> },
    booked: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> },
    completed: { bg: 'bg-slate-50', text: 'text-slate-700', icon: <CheckCircle2 className="w-4 h-4" /> },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
    declined: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
  };
  return colors[status] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: <Clock className="w-4 h-4" /> };
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function QuoteRequestsDashboard({
  initialQuotes,
  source,
  error,
}: QuoteRequestsDashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agreementFilter, setAgreementFilter] = useState('all');
  const [depositFilter, setDepositFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const statuses = useMemo(
    () => Array.from(new Set(initialQuotes.map((q) => q.status))).sort(),
    [initialQuotes]
  );

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = initialQuotes.filter((quote) => {
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;
      if (agreementFilter !== 'all' && quote.agreement_status !== agreementFilter) return false;
      if (depositFilter !== 'all' && quote.deposit_status !== depositFilter) return false;

      if (!normalizedSearch) return true;

      return [quote.name, quote.email, quote.room_type, quote.city, quote.status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'final_price')
        return (b.final_price || 0) - (a.final_price || 0);
      if (sortBy === 'created')
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [initialQuotes, search, statusFilter, agreementFilter, depositFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-navy mb-2">Quote Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Manage restroom rental quote requests and track customer responses.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Data source: {source === 'supabase' ? 'Supabase' : 'Mock data'}</span>
          <span>•</span>
          <span>{filteredQuotes.length} quotes</span>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            {error}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gold/20 p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search by name, email, or city..."
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
          <Select value={agreementFilter} onValueChange={setAgreementFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Agreement Status" />
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
              <SelectValue placeholder="Deposit Status" />
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

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="final_price">Highest Price</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy/5 border-b border-gold/20">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-navy">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-navy">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-navy">Restroom</th>
                <th className="px-6 py-4 text-left font-semibold text-navy">Location</th>
                <th className="px-6 py-4 text-left font-semibold text-navy">Agreement</th>
                <th className="px-6 py-4 text-left font-semibold text-navy">Deposit</th>
                <th className="px-6 py-4 text-right font-semibold text-navy">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-navy">Created</th>
                <th className="px-6 py-4 text-center font-semibold text-navy"></th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    No quotes found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const statusColor = getStatusColor(quote.status);
                  return (
                    <tr
                      key={quote.id}
                      className="border-b border-gold/10 hover:bg-navy/2 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                        >
                          {statusColor.icon}
                          {formatStatus(quote.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy">{quote.name}</div>
                        <div className="text-xs text-muted-foreground">{quote.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{quote.room_type}</td>
                      <td className="px-6 py-4 text-sm">{quote.city}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {formatStatus(quote.agreement_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {formatStatus(quote.deposit_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-navy">
                        ${(quote.final_price || quote.total_price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-navy/10 text-navy transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
