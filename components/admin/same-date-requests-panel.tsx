import Link from 'next/link';
import { AlertTriangle, CalendarCheck, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  getSameDateRequestSummary,
  isBookingBlockingStatus,
} from '@/lib/availability';
import { formatLocalDateOnly } from '@/lib/date-only';
import { formatAdminStatus } from '@/lib/quotes/status';
import type { CalendarQuote } from '@/components/admin/booking-calendar';

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value ?? 0);
}

function RelatedQuote({ quote, current }: { quote: CalendarQuote; current: boolean }) {
  return (
    <Link
      href={`/admin/quotes/${quote.id}`}
      aria-current={current ? 'page' : undefined}
      className="grid gap-2 rounded-lg border border-[#d9d1c8] bg-white p-3 transition-colors hover:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <span>
        <span className="flex flex-wrap items-center gap-2">
          <strong className="text-navy">{quote.customer_name}</strong>
          {current && <Badge variant="outline">Current quote</Badge>}
          <Badge variant="outline">{formatAdminStatus(quote.status, 'quote')}</Badge>
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          #{quote.quote_number || quote.id.slice(0, 8)} · {quote.event_type} · {quote.city || 'City not set'}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          Created {new Date(quote.created_at).toLocaleDateString()}
        </span>
      </span>
      <span className="flex items-center justify-between gap-2 sm:block sm:text-right">
        <strong className="text-charcoal">{formatCurrency(quote.total_price)}</strong>
        <ExternalLink className="size-4 text-muted-foreground sm:ml-auto sm:mt-2" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function SameDateRequestsPanel({
  currentQuoteId,
  quotes,
}: {
  currentQuoteId: string;
  quotes: CalendarQuote[];
}) {
  const eventDate = quotes[0]?.event_date ?? '';
  const summary = getSameDateRequestSummary(quotes, eventDate);
  const owner = summary.bookingOwner;
  const currentQuote = quotes.find((quote) => quote.id === currentQuoteId);
  const currentOwnsDate = owner?.id === currentQuoteId;
  const anotherOwnsDate = Boolean(owner && !currentOwnsDate);

  return (
    <section aria-labelledby="same-date-heading" className="rounded-xl border border-[#c8b9a8] bg-[#faf8f5] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-text">Date availability</p>
          <h2 id="same-date-heading" className="mt-1 font-serif text-2xl font-semibold text-navy">
            Same-Date Requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {eventDate ? formatLocalDateOnly(eventDate) : 'Event date not set'}
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            summary.hasBookingConflict
              ? 'border-red-600 bg-red-100 text-red-900'
              : currentOwnsDate
                ? 'border-emerald-600 bg-emerald-100 text-emerald-900'
                : anotherOwnsDate
                  ? 'border-red-500 bg-red-50 text-red-900'
                  : 'border-slate-400 bg-white text-slate-800'
          }
        >
          {summary.hasBookingConflict
            ? 'Booking conflict'
            : currentOwnsDate
              ? 'Booked date'
              : anotherOwnsDate
                ? 'Date already booked'
                : 'No booking owner'}
        </Badge>
      </div>

      {summary.hasBookingConflict && (
        <div role="alert" className="mt-4 rounded-lg border border-red-400 bg-red-50 p-4 text-sm text-red-900">
          <AlertTriangle className="mr-1 inline size-4" aria-hidden="true" />
          More than one blocking quote owns this date. Resolve this data conflict immediately.
        </div>
      )}
      {anotherOwnsDate && owner && (
        <div role="status" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          This date is reserved by quote{' '}
          <Link className="font-bold underline" href={`/admin/quotes/${owner.id}`}>
            {owner.quote_number || owner.id.slice(0, 8)}
          </Link>
          . Other requests for this date cannot be approved.
        </div>
      )}
      {currentOwnsDate && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CalendarCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          This quote owns the reserved event date.
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold text-navy">
            Active requests ({summary.activeRequests.length})
          </h3>
          <div className="space-y-2">
            {summary.activeRequests.length ? (
              summary.activeRequests.map((quote) => (
                <RelatedQuote key={quote.id} quote={quote} current={quote.id === currentQuoteId} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active non-blocking requests.</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-navy">
            Blocking booking{summary.blockingQuotes.length === 1 ? '' : 's'} ({summary.blockingQuotes.length})
          </h3>
          <div className="space-y-2">
            {summary.blockingQuotes.length ? (
              summary.blockingQuotes.map((quote) => (
                <RelatedQuote key={quote.id} quote={quote} current={quote.id === currentQuoteId} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No quote currently blocks this date.</p>
            )}
          </div>
        </div>
      </div>

      {summary.closedRequests.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer font-semibold text-navy">
            Closed requests ({summary.closedRequests.length})
          </summary>
          <div className="mt-2 grid gap-2 lg:grid-cols-2">
            {summary.closedRequests.map((quote) => (
              <RelatedQuote key={quote.id} quote={quote} current={quote.id === currentQuoteId} />
            ))}
          </div>
        </details>
      )}

      {currentQuote && isBookingBlockingStatus(currentQuote.status) && anotherOwnsDate && (
        <p className="mt-4 text-sm font-semibold text-red-900">
          This quote has a blocking status but does not own the date. Database enforcement will reject further conflicting saves.
        </p>
      )}
    </section>
  );
}
