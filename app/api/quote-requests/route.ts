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
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      zip: parsed.data.zip,
      room_type: parsed.data.room_type,
      room_condition: parsed.data.room_condition,
      features: parsed.data.features,
      color_preference: parsed.data.color_preference,
      base_price: parsed.data.base_price,
      labor_cost: parsed.data.labor_cost,
      materials_cost: parsed.data.materials_cost,
      tax_amount: parsed.data.tax_amount,
      total_price: parsed.data.total_price,
      discount_amount: parsed.data.discount_amount,
      final_price: parsed.data.final_price,
      price_valid_until: parsed.data.price_valid_until,
      status: parsed.data.status,
      internal_notes: parsed.data.internal_notes,
      customer_notes: parsed.data.customer_notes,
      agreement_status: parsed.data.agreement_status,
      deposit_status: parsed.data.deposit_status,
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
