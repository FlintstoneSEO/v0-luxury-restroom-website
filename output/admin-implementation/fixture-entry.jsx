import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdminShell } from '../../components/admin/admin-shell';
import Dashboard from '../../components/admin/quote-requests-dashboard';
import QuoteDetailEditor from '../../components/admin/quote-detail-editor';
import { BookingCalendar } from '../../components/admin/booking-calendar';
import { AdminLoadingState } from '../../components/admin/admin-feedback';
import { mockQuoteRequests } from '../../lib/quotes/mockQuotes';
import { QUOTE_STATUSES } from '../../lib/quotes/types';

const quotes = QUOTE_STATUSES.map((status, i) => ({
  ...mockQuoteRequests[0], id: `fixture-${i}`, quote_number: `SL-FIXTURE-${100 + i}`,
  customer_name: ['Avery Morgan', 'Drew Parker', 'Taylor Reed', 'Riley Jordan', 'Alex Lane', 'Casey Brooks'][i % 6] + (i > 5 ? ` ${i}` : ''),
  email: `fixture${i}@example.com`, phone: '517-555-0100', status,
  event_date: `2027-06-${String(10 + i).padStart(2, '0')}`, created_at: `2026-10-${String(18 - Math.floor(i/2)).padStart(2,'0')}T12:00:00Z`,
  agreement_status: i === 12 ? 'signed' : i === 11 ? 'sent' : 'not_sent',
  deposit_status: i === 14 ? 'paid' : 'not_requested', agreement_sent_at: undefined,
  quote_sent_at: i >= 5 ? '2026-10-15T12:00:00Z' : undefined,
  quote_viewed_at: i === 6 ? '2026-10-16T12:00:00Z' : undefined, quote_view_count: 3,
  needs_manual_distance_review: i === 3, is_manual_override: i === 4,
  internal_notes: 'Synthetic QA record. Internal notes stay in the admin workspace.',
}));
quotes.push({ ...quotes[0], id: 'hidden-test', customer_name: 'Hidden Test Record', is_test_quote: true, test_label: 'Fixture' });
quotes.push({ ...quotes[10], id: 'conflict', customer_name: 'Conflict Fixture' });
const params = new URLSearchParams(location.search);
const screen = params.get('screen');
const mode = params.get('mode');
const detailQuote = params.has('reference') ? { ...quotes[3], id:'quote-desk-demo', quote_number:'SL-DEMO-0248', customer_name:'Morgan Reed', email:'morgan@example.com', phone:'(517) 555-0187', event_type:'Wedding', event_date:'2027-09-18', event_address:'7423 Oak Ridge Drive', city:'Lansing', state:'MI', zip_code:'48910', guest_count:120, event_start_time:'15:00', event_end_time:'22:00', has_power:true, has_water:true, additional_notes:'Couple is planning an outdoor ceremony with indoor reception.\nPlease include delivery details and what to expect on event day.', base_price:1450, travel_fee:125, utility_fee:150, after_hours_fee:0, cleaning_fee:75, damage_waiver_fee:50, rush_booking_fee:0, subtotal:1850, discount_amount:0, pretax_total:1850, taxable_amount:1850, tax_rate:6, sales_tax_amount:111, total_price:1961, deposit_percentage:40, deposit_amount:784.40, final_balance:1176.60, created_at:'2027-09-09T14:24:00Z' } : quotes[Number(params.get('quote') ?? 3)];
createRoot(document.getElementById('root')).render(<><div className="fixture-banner">Local synthetic fixtures · No operational writes · Real production components</div><AdminShell>{screen === 'detail' ? <QuoteDetailEditor quote={detailQuote} sameDateQuotes={[]} salesTaxPercentage={6} depositPercentage={40} /> : screen === 'calendar' ? <BookingCalendar quotes={quotes} /> : screen === 'loading' ? <AdminLoadingState /> : <Dashboard initialQuotes={mode === 'empty' ? [] : quotes} source={mode === 'error' ? 'mock' : 'supabase'} error={mode === 'error' ? 'Simulated retrieval failure. Retry available.' : undefined} />}</AdminShell></>);
