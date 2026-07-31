import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateQuoteFinancials, DEFAULT_PRICING } from '@/lib/pricing-engine';

const CORE_QUOTE_FIELDS = 'customer_name, phone, email, event_date, event_type, guest_count, event_address, city, state, zip_code, event_start_time, event_end_time, has_power, has_water, additional_notes, distance_miles, base_price, travel_fee, utility_fee, after_hours_fee, cleaning_fee, damage_waiver_fee, rush_booking_fee, subtotal, discount_amount, pretax_total, taxable_amount, tax_rate, sales_tax_amount, total_price, deposit_percentage, deposit_amount, final_balance, quote_expires_at, calculated_breakdown, needs_manual_distance_review, is_manual_override, customer_notes';

function defaultEventDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const body = await request.json().catch(() => ({}));
  const testRecipientEmail = typeof body.test_recipient_email === 'string' ? body.test_recipient_email.trim() : '';
  const sourceQuoteId = typeof body.source_quote_id === 'string' ? body.source_quote_id : null;

  if (!testRecipientEmail || !/^\S+@\S+\.\S+$/.test(testRecipientEmail)) {
    return NextResponse.json({ ok: false, message: 'A valid test_recipient_email is required.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const sampleFinancials = calculateQuoteFinancials({
    base_price: 1200,
    travel_fee: 75,
    cleaning_fee: 100,
    damage_waiver_fee: 50,
    sales_tax_percentage: DEFAULT_PRICING.sales_tax_percentage,
    deposit_percentage: DEFAULT_PRICING.deposit_percentage,
  });

  let quotePayload: Record<string, unknown> = {
    customer_name: 'Test Customer',
    phone: '555-0100',
    email: testRecipientEmail,
    event_date: defaultEventDate(),
    event_type: 'Private Party',
    guest_count: 75,
    event_address: '123 Test Event Lane',
    city: 'Lansing',
    state: 'MI',
    zip_code: '48933',
    event_start_time: '17:00',
    event_end_time: '22:00',
    has_power: true,
    has_water: true,
    additional_notes: 'Default internal test quote used for end-to-end workflow testing.',
    distance_miles: 15,
    base_price: 1200,
    travel_fee: 75,
    utility_fee: 0,
    after_hours_fee: 0,
    cleaning_fee: 100,
    damage_waiver_fee: 50,
    rush_booking_fee: 0,
    ...sampleFinancials,
    calculated_breakdown: {
      base_price: 1200,
      travel_fee: 75,
      utility_fee: 0,
      after_hours_fee: 0,
      cleaning_fee: 100,
      damage_waiver_fee: 50,
      rush_booking_fee: 0,
      ...sampleFinancials,
      line_items: [],
      details: {
        sales_tax_percentage: DEFAULT_PRICING.sales_tax_percentage,
        deposit_percentage: DEFAULT_PRICING.deposit_percentage,
      },
    },
    customer_notes: 'This is a test quote for internal testing only.',
  };

  if (sourceQuoteId) {
    const { data: sourceQuote, error: sourceError } = await supabase
      .from('quote_requests')
      .select(CORE_QUOTE_FIELDS)
      .eq('id', sourceQuoteId)
      .single();

    if (sourceError || !sourceQuote) {
      return NextResponse.json({ ok: false, message: 'Source quote not found.' }, { status: 404 });
    }

    quotePayload = { ...sourceQuote, email: testRecipientEmail, customer_name: `Test Customer (clone of ${sourceQuote.customer_name || sourceQuoteId.slice(0, 8)})` };
  }

  const { data: createdQuote, error: insertError } = await supabase
    .from('quote_requests')
    .insert({
      ...quotePayload,
      status: 'draft_quote',
      agreement_status: 'not_sent',
      deposit_status: 'due',
      is_test_quote: true,
      test_label: sourceQuoteId ? 'Admin cloned test quote' : 'Admin sample test quote',
      test_source_quote_id: sourceQuoteId,
      internal_notes: `TEST QUOTE - internal testing only. Send only to ${testRecipientEmail}. Created ${now}${sourceQuoteId ? ` from source quote ${sourceQuoteId}` : ''}.`,
      quote_sent_at: null,
      quote_viewed_at: null,
      quote_view_count: 0,
      customer_response: null,
      customer_response_type: null,
      customer_response_at: null,
      approved_at: null,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (insertError || !createdQuote) {
    console.error('[test-quote] insert error:', insertError);
    return NextResponse.json({ ok: false, message: insertError?.message || 'Failed to create test quote.' }, { status: 500 });
  }

  if (sourceQuoteId) {
    const { data: sourceOptions } = await supabase.from('quote_options').select('*').eq('quote_request_id', sourceQuoteId).neq('status', 'deleted');
    if (sourceOptions?.length) {
      await supabase.from('quote_options').insert(sourceOptions.map(({ id, quote_request_id, created_at, updated_at, ...option }) => ({
        ...option,
        quote_request_id: createdQuote.id,
        status: option.status === 'selected' ? 'draft' : option.status,
        created_at: now,
        updated_at: now,
      })));
    }
  }

  return NextResponse.json({ ok: true, quote_id: createdQuote.id });
}
