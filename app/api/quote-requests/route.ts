import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteRequestCreateSchema } from '@/lib/quotes/schema';
import { buildQuoteCalculation } from '@/lib/quotes/build-quote-calculation';

export async function POST(req: Request) {
  const body = await req.json();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[api/quote-requests] request body received', {
      ...body,
      email: body?.email ? '[redacted]' : body?.email,
      phone: body?.phone ? '[redacted]' : body?.phone,
    });
  }

  if (String(body?.company_website || '').trim()) {
    return NextResponse.json(
      { ok: false, message: 'Could not create quote request right now.' },
      { status: 400 }
    );
  }

  const parsed = quoteRequestCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Invalid quote payload', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const normalizedAddress = parsed.data.event_address.trim();
    const duplicateAddressKey = normalizedAddress.toLowerCase();
    const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: recentDuplicate, error: duplicateError } = await supabase
      .from('quote_requests')
      .select('id, event_address')
      .eq('email', normalizedEmail)
      .eq('event_date', parsed.data.event_date)
      .gte('created_at', duplicateWindowStart)
      .limit(10);

    if (duplicateError) {
      console.error('[api/quote-requests] duplicate detection failed', duplicateError);
    }

    if (recentDuplicate?.some((quote) => String(quote.event_address || '').trim().toLowerCase() === duplicateAddressKey)) {
      return NextResponse.json(
        { ok: false, message: 'We already received a matching quote request. Please wait a few minutes before submitting again.' },
        { status: 409 }
      );
    }

    const { distanceMiles, priceBreakdown, distanceCalculationStatus } = await buildQuoteCalculation(parsed.data);

    const payload = {
      customer_name: parsed.data.customer_name,
      email: normalizedEmail,
      phone: parsed.data.phone,
      event_date: parsed.data.event_date,
      event_type: parsed.data.event_type,
      guest_count: parsed.data.guest_count,
      event_address: normalizedAddress,
      city: parsed.data.city,
      state: parsed.data.state,
      zip_code: parsed.data.zip_code,
      event_start_time: parsed.data.event_start_time,
      event_end_time: parsed.data.event_end_time,
      has_power: parsed.data.has_power,
      has_water: parsed.data.has_water,
      additional_notes: parsed.data.additional_notes,
      distance_miles: distanceMiles,
      base_price: priceBreakdown.base_price,
      travel_fee: priceBreakdown.travel_fee,
      utility_fee: priceBreakdown.utility_fee,
      after_hours_fee: priceBreakdown.after_hours_fee,
      cleaning_fee: priceBreakdown.cleaning_fee,
      damage_waiver_fee: priceBreakdown.damage_waiver_fee,
      rush_booking_fee: priceBreakdown.rush_booking_fee,
      subtotal: priceBreakdown.subtotal,
      discount_amount: priceBreakdown.discount_amount,
      pretax_total: priceBreakdown.pretax_total,
      taxable_amount: priceBreakdown.taxable_amount,
      tax_rate: priceBreakdown.tax_rate,
      sales_tax_amount: priceBreakdown.sales_tax_amount,
      total_price: priceBreakdown.total_price,
      deposit_percentage: priceBreakdown.deposit_percentage,
      deposit_amount: priceBreakdown.deposit_amount,
      final_balance: priceBreakdown.final_balance,
      calculated_breakdown: priceBreakdown,
      needs_manual_distance_review: distanceCalculationStatus === 'fallback',
      status: 'pending_review',
      agreement_status: 'not_sent',
      deposit_status: 'due',
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/quote-requests] final Supabase insert object', {
        ...payload,
        email: payload.email ? '[redacted]' : payload.email,
        phone: payload.phone ? '[redacted]' : payload.phone,
      });
    }

    const { error, data } = await supabase.from('quote_requests').insert(payload).select('id, quote_number');
    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/quote-requests] insert response', { error, inserted: data?.length ?? 0 });
    }
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[quote-requests api] create failed', error);
    return NextResponse.json(
      { ok: false, message: 'Could not create quote request right now.' },
      { status: 503 }
    );
  }
}
