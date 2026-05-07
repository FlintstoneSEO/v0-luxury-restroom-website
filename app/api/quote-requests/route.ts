import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteRequestCreateSchema } from '@/lib/quotes/schema';
import { calculateQuote } from '@/lib/quotes/calculateQuote';

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = quoteRequestCreateSchema.safeParse({ ...body, basePrice: body.basePrice ?? 0, deliveryFee: body.deliveryFee ?? 0, addOnsTotal: body.addOnsTotal ?? 0, discount: body.discount ?? 0, tax: body.tax ?? 0, total: body.total ?? 0, depositAmount: body.depositAmount ?? 0, remainingBalance: body.remainingBalance ?? 0 });
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid quote payload', issues: parsed.error.flatten() }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const totals = calculateQuote(parsed.data);
    const payload = {
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail,
      customer_phone: parsed.data.customerPhone,
      event_date: parsed.data.eventDate,
      event_type: parsed.data.eventType,
      event_location: parsed.data.eventLocation,
      guest_count: parsed.data.guestCount,
      event_start_time: parsed.data.eventStartTime ?? null,
      event_end_time: parsed.data.eventEndTime ?? null,
      event_notes: parsed.data.eventNotes ?? null,
      has_electrical_access: parsed.data.hasElectricalAccess,
      has_water_access: parsed.data.hasWaterAccess,
      setup_notes: parsed.data.setupNotes ?? null,
      ...{ base_price: totals.basePrice, delivery_fee: totals.deliveryFee, add_ons_total: totals.addOnsTotal, discount: totals.discount, tax: totals.tax, total: totals.total, deposit_amount: totals.depositAmount, remaining_balance: totals.remainingBalance },
      status: parsed.data.status,
      internal_notes: parsed.data.internalNotes ?? null,
      customer_notes: parsed.data.customerNotes ?? null,
      agreement_status: parsed.data.agreementStatus,
      deposit_status: parsed.data.depositStatus,
    };

    const { error } = await supabase.from('quote_requests').insert(payload);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: 'Supabase not configured yet. Using mock mode only.' }, { status: 503 });
  }
}
