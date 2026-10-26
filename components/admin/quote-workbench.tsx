'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, AlertTriangle, Check, Circle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';
import { formatLocalDateOnly } from '@/lib/date-only';
import { formatAdminStatus } from '@/lib/quotes/status';
import { getExtraHoursFee } from '@/lib/pricing-engine';
import type { QuoteRequest } from '@/lib/quotes/types';
import { Button } from '@/components/ui/button';

const money = (value?: number) => value == null ? 'Not set' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const date = (value: string) => formatLocalDateOnly(value, { month: 'short', day: 'numeric', year: 'numeric' });
const timestamp = (value: string) => new Date(value).toLocaleString('en-US');

export function needsDistanceReview(quote: QuoteRequest) {
  return quote.needs_manual_distance_review === true || quote.calculated_breakdown?.details != null &&
    (quote.calculated_breakdown.details as Record<string, unknown>).distance_calculation_status === 'fallback';
}

// Guidance opens the existing editor; it never grants eligibility to mutate a quote.
export function quoteReviewLabel(quote: QuoteRequest) {
  if (needsDistanceReview(quote)) return 'Review distance';
  if (['pending', 'pending_review', 'new'].includes(quote.status)) return 'Review request';
  if (['under_review', 'draft_quote'].includes(quote.status)) return 'Review pricing';
  if (quote.status === 'change_requested') return 'Review changes';
  if (['quote_sent', 'sent_to_customer'].includes(quote.status)) return 'Review response';
  if (['customer_approved', 'agreement_pending'].includes(quote.status)) return 'Review agreement';
  if (quote.status === 'agreement_sent') return 'Review signature';
  if (['agreement_signed', 'deposit_pending'].includes(quote.status)) return 'Review deposit';
  if (['deposit_paid', 'booked', 'confirmed'].includes(quote.status)) return 'Review booking';
  if (['completed', 'cancelled', 'declined', 'expired'].includes(quote.status)) return 'Review record';
  return 'Open full quote';
}

const feeFields = [
  ['Base price', 'base_price'], ['Travel', 'travel_fee'], ['Utilities', 'utility_fee'],
  ['After hours', 'after_hours_fee'], ['Cleaning', 'cleaning_fee'], ['Damage waiver', 'damage_waiver_fee'],
  ['Rush booking', 'rush_booking_fee'], ['Subtotal', 'subtotal'], ['Discount', 'discount_amount'],
  ['Pre-tax total', 'pretax_total'], ['Taxable amount', 'taxable_amount'], ['Sales tax', 'sales_tax_amount'],
  ['Total', 'total_price'], ['Deposit', 'deposit_amount'], ['Final balance', 'final_balance'],
] as const;

// Each marker reads its own evidence. A later status never fills prior markers.
export function recordedQuoteMilestones(quote: QuoteRequest) {
  return [
    { label: 'Request', complete: Boolean(quote.created_at) },
    { label: 'Quote sent', complete: Boolean(quote.quote_sent_at || ['quote_sent', 'sent_to_customer'].includes(quote.status)) },
    { label: 'Approved', complete: Boolean(quote.approved_at || quote.customer_response_type === 'approved' || quote.status === 'customer_approved') },
    { label: 'Agreement', complete: Boolean(quote.agreement_signed_at || quote.agreement_status === 'signed') },
    { label: 'Deposit', complete: Boolean(quote.deposit_paid_at || quote.deposit_status === 'paid') },
    { label: 'Booked', complete: ['booked', 'confirmed', 'completed'].includes(quote.status) },
  ];
}

export function QuoteWorkbench({ quote, onBack }: { quote: QuoteRequest; onBack: () => void }) {
  const href = `/admin/quotes/${quote.id}`;
  const milestones = recordedQuoteMilestones(quote);
  const stateCards = [
    { label: 'Quote', status: formatAdminStatus(quote.status, 'quote'), complete: milestones[2].complete },
    { label: 'Agreement', status: formatAdminStatus(quote.agreement_status, 'agreement'), complete: milestones[3].complete },
    { label: 'Deposit', status: formatAdminStatus(quote.deposit_status, 'deposit'), complete: milestones[4].complete },
  ];
  const activity = [
    ['Request received', quote.created_at], ['Last updated', quote.updated_at],
    ['Quote sent', quote.quote_sent_at], ['Quote viewed', quote.quote_viewed_at],
    ['Customer responded', quote.customer_response_at], ['Customer approved', quote.approved_at],
    ['Agreement sent', quote.agreement_sent_at], ['Agreement viewed', quote.agreement_viewed_at],
    ['Agreement signed', quote.agreement_signed_at], ['Deposit paid', quote.deposit_paid_at],
    ['Final balance paid', quote.final_balance_paid_at],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  return (
    <section className="operations-panel operations-detail" aria-labelledby="workbench-heading">
      <Button type="button" variant="outline" className="operations-mobile-back" onClick={onBack}><ArrowLeft aria-hidden="true" className="size-4" />Back to quote queue</Button>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="workbench-heading" tabIndex={-1}>{quote.quote_number || quote.id.slice(0, 8)}</h2>
          <p className="mt-1 font-semibold">{quote.customer_name}</p>
          <p className="mt-1 text-sm text-slate-600">{date(quote.event_date)} · {quote.event_type} · {quote.city}</p>
          {quote.is_test_quote && <p className="text-sm font-bold text-amber-800">TEST QUOTE {quote.test_label}</p>}
        </div>
        <div className="operations-workbench-total shrink-0 text-right"><p className="text-xs text-slate-600">Total</p><p className="text-xl font-semibold">{money(quote.total_price)}</p></div>
      </div>
      <div className="operations-states">
        {stateCards.map(state => <div key={state.label}><span className={`operations-state-icon ${state.complete ? 'is-recorded' : ''}`} aria-hidden="true">{state.complete ? <Check /> : <Circle />}</span><span><strong>{state.label}</strong><span>{state.status}</span></span></div>)}
      </div>
      {needsDistanceReview(quote) && <p className="operations-warning"><AlertTriangle className="mr-1 inline size-4" aria-hidden="true" /><strong>Manual distance review needed.</strong> Verify mileage and travel pricing in the full quote.</p>}
      {quote.is_manual_override && <p className="operations-warning">Manual pricing override is active. Review before recalculating.</p>}
      {isQuoteFinanciallyLocked(quote) && <p className="rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">Customer-facing pricing is locked. Financial changes require the existing revision workflow.</p>}
      <ol className="operations-milestones" aria-label="Recorded milestones; indicators reflect independent stored evidence, not a required sequence">
        {milestones.map(milestone => <li key={milestone.label} data-recorded={milestone.complete}><span className="operations-milestone-icon" aria-hidden="true">{milestone.complete ? <Check /> : <Circle />}</span><span>{milestone.label}</span><span className="sr-only">{milestone.complete ? ': recorded' : ': not recorded'}</span></li>)}
      </ol>
      <Tabs defaultValue="event" className="mt-3">
        <TabsList aria-label="Selected quote information">
          <TabsTrigger value="event">Event</TabsTrigger><TabsTrigger value="pricing">Pricing</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="event">
          <div className="operations-event-summary"><h3>Event summary</h3><dl className="operations-facts">
            <dt>Date</dt><dd>{date(quote.event_date)}</dd><dt>Type</dt><dd>{quote.event_type}</dd>
            <dt>Location</dt><dd>{quote.city}, {quote.state}</dd><dt>Guest count</dt><dd>{quote.guest_count}</dd>
            <dt>Details</dt><dd>{quote.additional_notes || 'No additional event details.'}</dd>
          </dl>
          <details className="operations-contact-details"><summary>Contact &amp; site details</summary><dl className="operations-facts">
            <dt>Address</dt><dd>{quote.event_address}, {quote.city}, {quote.state} {quote.zip_code}</dd>
            <dt>Event time</dt><dd>{quote.event_start_time || 'Not set'} – {quote.event_end_time || 'Not set'}</dd>
            <dt>Power / water</dt><dd>{quote.has_power ? 'Power available' : 'No power'} / {quote.has_water ? 'Water available' : 'No water'}</dd>
            <dt>Email</dt><dd><a className="underline" href={`mailto:${quote.email}`}>{quote.email}</a></dd><dt>Phone</dt><dd><a className="underline" href={`tel:${quote.phone}`}>{quote.phone}</a></dd>
          </dl>
          {quote.customer_notes && <div className="mt-3 text-sm"><h3 className="font-semibold">Customer notes</h3><p className="whitespace-pre-wrap">{quote.customer_notes}</p></div>}
          </details></div>
          <div className="operations-note-preview"><h3>Internal notes <span className="sr-only">· admin only</span></h3><p>{quote.internal_notes || 'No internal notes yet.'}</p><Link href={href}>Edit notes</Link><span>Private · Saved record</span></div>
        </TabsContent>
        <TabsContent value="pricing">
          <dl className="operations-facts">{getExtraHoursFee(quote.calculated_breakdown) > 0 && <><dt>Additional event hours</dt><dd className="text-right">{money(getExtraHoursFee(quote.calculated_breakdown))}</dd></>}{feeFields.map(([label, field]) => <div className="contents" key={field}><dt>{label}</dt><dd className="text-right">{money(quote[field])}</dd></div>)}<dt>Tax rate</dt><dd className="text-right">{quote.tax_rate == null ? 'Not set' : `${(quote.tax_rate * 100).toFixed(2)}%`}</dd><dt>Deposit rate</dt><dd className="text-right">{quote.deposit_percentage == null ? 'Not set' : `${quote.deposit_percentage}%`}</dd><dt>Distance</dt><dd className="text-right">{quote.distance_miles == null ? 'Not set' : `${quote.distance_miles} miles`}</dd></dl>
          {(quote.quote_options?.length ?? 0) > 0 && <div className="mt-4 border-t border-stone-200 pt-3 text-sm"><h3 className="mb-2 font-semibold">Quote options</h3>{quote.quote_options?.map(option => <p className="my-2" key={option.id}>{option.option_label} · {money(option.total_price)}{option.is_recommended ? ' · Recommended' : ''}{option.id === quote.selected_quote_option_id || option.status === 'selected' ? ' · Selected' : ''}{option.needs_manual_distance_review ? ' · Distance review needed' : ''}</p>)}<p className="text-slate-600">Open full quote for option itemization and editing.</p></div>}
        </TabsContent>
        <TabsContent value="activity"><ul className="space-y-3 text-sm">{activity.map(([label, value]) => <li key={label}><strong className="block">{label}</strong><span className="text-slate-600">{timestamp(value)}</span></li>)}</ul>{quote.quote_sent_at && <p className="mt-3 text-sm">Quote link: {quote.quote_viewed_at ? `Viewed (${quote.quote_view_count ?? 1})` : 'Not viewed'}</p>}{quote.customer_response && <p className="mt-3 whitespace-pre-wrap text-sm">Customer response: {quote.customer_response}</p>}{quote.customer_response_type && <p className="mt-2 text-sm">Response: {formatAdminStatus(quote.customer_response_type)}</p>}</TabsContent>
        <TabsContent value="notes"><h3 className="mb-3 text-sm font-semibold">Internal notes · admin only</h3><p className="whitespace-pre-wrap rounded border border-stone-200 bg-stone-50 p-3 text-sm">{quote.internal_notes || 'No internal notes yet.'}</p><p className="mt-3 text-sm text-slate-600">Edit and save notes in the full quote workspace.</p></TabsContent>
      </Tabs>
      <div className="operations-detail-actions"><Link href={href}>{quoteReviewLabel(quote)}<ArrowUpRight className="size-4" aria-hidden="true" /></Link><Link href={href}>Open full quote</Link></div>
      <p className="mt-2 text-xs text-slate-600">Review, preview and confirm customer actions in the full quote.</p>
    </section>
  );
}
