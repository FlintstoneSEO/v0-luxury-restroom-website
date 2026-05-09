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

  const parsed = quoteRequestCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Invalid quote payload', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { distanceMiles, priceBreakdown } = await buildQuoteCalculation(parsed.data);

    const payload = {
      customer_name: parsed.data.customer_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      event_date: parsed.data.event_date,
      event_type: parsed.data.event_type,
      guest_count: parsed.data.guest_count,
      event_address: parsed.data.event_address,
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
      total_price: priceBreakdown.total_price,
      deposit_amount: priceBreakdown.deposit_amount,
      final_balance: priceBreakdown.final_balance,
      calculated_breakdown: priceBreakdown,
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
