'use client';

import { CalendarDays, Clock3, List, TriangleAlert, LockKeyhole } from 'lucide-react';
import type { QuoteRequest } from '@/lib/quotes/types';
import { getExtraHoursFee, getStoredServiceReviewReasons } from '@/lib/pricing-engine';
import { isBookingBlockingStatus } from '@/lib/availability';

type DeskFees = Required<Pick<QuoteRequest, 'base_price' | 'travel_fee' | 'utility_fee' | 'after_hours_fee' | 'cleaning_fee' | 'damage_waiver_fee' | 'rush_booking_fee'>>;
type DeskTotals = Required<Pick<QuoteRequest, 'subtotal' | 'discount_amount' | 'pretax_total' | 'tax_rate' | 'sales_tax_amount' | 'total_price' | 'deposit_percentage' | 'deposit_amount' | 'final_balance'>>;
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

/** A view of the editor's existing calculation and persisted booking state. */
export function QuoteDeskSummary({ quote, form, pricing, otherBookingOwnsDate, fallbackDistance, distanceMessage, financiallyLocked, onReviewPricing }: {
  quote: QuoteRequest;
  form: DeskFees & { is_manual_override: boolean };
  pricing: DeskTotals;
  otherBookingOwnsDate: boolean;
  fallbackDistance: boolean;
  distanceMessage: string;
  financiallyLocked: boolean;
  onReviewPricing: () => void;
}) {
  const reserved = !quote.is_test_quote && isBookingBlockingStatus(quote.status);
  const inactive = ['cancelled', 'declined', 'expired'].includes(quote.status);
  const reservationTitle = quote.is_test_quote ? 'Test quote · No real reservation' : otherBookingOwnsDate ? 'Date already reserved' : reserved ? 'Reserved date' : inactive ? 'No reservation from this quote' : 'Request only · Date not reserved';
  const reservationText = quote.is_test_quote ? 'Test records do not reserve real booking dates.' : otherBookingOwnsDate ? 'Another booking holds this date. Review same-date requests before proceeding.' : reserved ? 'The saved quote status reserves this day under the existing booking rules.' : 'Pending requests do not reserve dates. Availability follows saved booking statuses.';
  const feeRows: [string, number][] = [['Base rental', form.base_price], ['Additional event hours', getExtraHoursFee(quote.calculated_breakdown)], ['Travel', form.travel_fee], ['Utility setup', form.utility_fee], ['After hours', form.after_hours_fee], ['Cleaning', form.cleaning_fee], ['Damage waiver', form.damage_waiver_fee], ['Rush booking', form.rush_booking_fee]];
  const latest = [
    { label: 'Request received', at: quote.created_at },
    { label: 'Quote email sent', at: quote.quote_sent_at },
    { label: 'Quote link opened', at: quote.quote_viewed_at },
    { label: 'Customer response', at: quote.customer_response_at },
    { label: 'Agreement sent', at: quote.agreement_sent_at },
    { label: 'Agreement signed', at: quote.agreement_signed_at },
    { label: 'Deposit paid', at: quote.deposit_paid_at },
  ].filter((event): event is {label: string; at: string} => typeof event.at === 'string' && Number.isFinite(Date.parse(event.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
  return <aside className="desk-summary" aria-label="Quote summary">
    <h2>Quote summary</h2>
    <dl className="desk-fees">{feeRows.filter(([, amount], index) => index === 0 || amount !== 0).map(([label, amount]) => <div key={label}><dt>{label}</dt><dd>{money(amount)}</dd></div>)}
      {!!pricing.discount_amount && <div><dt>Discount</dt><dd>−{money(pricing.discount_amount)}</dd></div>}
      <div className="desk-subtotal"><dt>Subtotal (pre-tax)</dt><dd>{money(pricing.pretax_total)}</dd></div>
      <div><dt>Sales tax ({Number((pricing.tax_rate * 100).toFixed(4))}%)</dt><dd>{money(pricing.sales_tax_amount)}</dd></div>
      <div className="desk-grand-total"><dt>Total (USD)</dt><dd>{money(pricing.total_price)}</dd></div>
    </dl>
    <dl className="desk-deposit"><div><dt>Deposit ({pricing.deposit_percentage}%)</dt><dd>{money(pricing.deposit_amount)}</dd></div><div><dt>Balance due</dt><dd>{money(pricing.final_balance)}</dd></div></dl>
    <div className="desk-reservation" data-reserved={reserved}><CalendarDays aria-hidden="true"/><div><strong>{reservationTitle}</strong><p>{reservationText}</p></div></div>
    <button className="desk-next" type="button" onClick={onReviewPricing}><List aria-hidden="true"/><span>Pricing &amp; options<strong>{financiallyLocked ? 'Review saved pricing' : 'Next: review pricing'}</strong></span></button>
    {getStoredServiceReviewReasons(quote.calculated_breakdown).map(reason => <p className="desk-lock" key={reason}><TriangleAlert aria-hidden="true"/>{reason}</p>)}
    {fallbackDistance && <div className="desk-distance"><TriangleAlert aria-hidden="true"/><div><strong>Distance review needed</strong><p>{distanceMessage}</p></div></div>}
    {form.is_manual_override && <p className="desk-lock"><TriangleAlert aria-hidden="true"/>Manual pricing override is active.</p>}
    {financiallyLocked && <p className="desk-lock"><LockKeyhole aria-hidden="true"/>Pricing is locked. Use the existing revision flow in Pricing &amp; options.</p>}
    <div className="desk-latest"><strong>Latest activity</strong><p><Clock3 aria-hidden="true"/><span>{latest ? <>{latest.label} · {new Date(latest.at).toLocaleString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'})}</> : 'No recorded activity'}</span></p></div>
  </aside>;
}
