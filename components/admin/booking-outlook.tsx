import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { getAvailabilitySummaries } from '@/lib/availability';
import { formatLocalDateOnly } from '@/lib/date-only';
import type { QuoteRequest } from '@/lib/quotes/types';

export function BookingOutlook({ quotes }: { quotes: QuoteRequest[] }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dates = [...getAvailabilitySummaries(quotes).values()].filter(day => day.eventDate >= today).sort((a,b) => a.eventDate.localeCompare(b.eventDate));
  const reserved = dates.find(day => day.blockingBookingCount > 0);
  const pending = dates.find(day => day.activeRequestCount > 0);
  const label = (value: string) => formatLocalDateOnly(value, { month: 'short', day: 'numeric', year: 'numeric' });
  return <section className="operations-panel operations-outlook" aria-labelledby="outlook-heading"><h2 id="outlook-heading">Booking outlook</h2><div className="operations-outlook-content"><span className="operations-reserved-label"><CalendarDays aria-hidden="true" className="size-4" />Next reserved date</span><ul>
    <li>{reserved ? <><span className="operations-dot stage-booked" aria-hidden="true" /><strong>{label(reserved.eventDate)}</strong><span>{reserved.hasBookingConflict ? 'Booking conflict — review calendar' : `${reserved.bookingOwner?.customer_name} · Reserved date`}</span></> : 'No upcoming reserved dates'}</li>
    <li>{pending ? <><span className="operations-dot stage-under_review" aria-hidden="true" /><strong>{label(pending.eventDate)}</strong><span>{pending.activeRequestCount} pending request{pending.activeRequestCount === 1 ? '' : 's'} · Not reserved by request</span></> : 'No upcoming pending requests'}</li>
  </ul><Link href="/admin/calendar"><CalendarDays className="mr-2 size-4" aria-hidden="true" />Open calendar</Link></div></section>;
}
