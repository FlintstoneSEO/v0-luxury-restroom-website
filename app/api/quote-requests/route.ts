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
      status: 'pending_review',
      agreement_status: 'not_sent',
      deposit_status: 'due',
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
