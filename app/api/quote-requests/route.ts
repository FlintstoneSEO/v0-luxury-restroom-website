import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteRequestCreateSchema } from '@/lib/quotes/schema';

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = quoteRequestCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Invalid quote payload', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
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
      distance_miles: parsed.data.distance_miles,
      base_price: parsed.data.base_price,
      travel_fee: parsed.data.travel_fee,
      utility_fee: parsed.data.utility_fee,
      after_hours_fee: parsed.data.after_hours_fee,
      cleaning_fee: parsed.data.cleaning_fee,
      damage_waiver_fee: parsed.data.damage_waiver_fee,
      rush_booking_fee: parsed.data.rush_booking_fee,
      subtotal: parsed.data.subtotal,
      total_price: parsed.data.total_price,
      deposit_amount: parsed.data.deposit_amount,
      final_balance: parsed.data.final_balance,
      discount_amount: parsed.data.discount_amount,
      quote_expires_at: parsed.data.quote_expires_at,
      status: parsed.data.status ?? 'pending_review',
      agreement_status: parsed.data.agreement_status ?? 'not_sent',
      deposit_status: parsed.data.deposit_status ?? 'due',
      internal_notes: parsed.data.internal_notes,
      customer_notes: parsed.data.customer_notes,
    };

    const { error } = await supabase.from('quote_requests').insert(payload);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Supabase not configured yet. Using mock mode only.' },
      { status: 503 }
    );
  }
}
