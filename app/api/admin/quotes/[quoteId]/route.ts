import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { pricingValuesSchema, quoteRequestUpdateSchema, quoteStatusUpdateSchema } from '@/lib/quotes/schema';

function toDbPayload(payload: Record<string, unknown>) {
  return {
    status: payload.status,
    base_price: payload.basePrice,
    delivery_fee: payload.deliveryFee,
    add_ons_total: payload.addOnsTotal,
    discount: payload.discount,
    tax: payload.tax,
    total: payload.total,
    deposit_amount: payload.depositAmount,
    remaining_balance: payload.remainingBalance,
    internal_notes: payload.internalNotes,
    customer_notes: payload.customerNotes,
    updated_at: new Date().toISOString(),
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const payload = await request.json();

  const pricingCheck = pricingValuesSchema.safeParse({
    basePrice: payload.basePrice,
    deliveryFee: payload.deliveryFee,
    addOnsTotal: payload.addOnsTotal,
    discount: payload.discount,
    tax: payload.tax,
    total: payload.total,
    depositAmount: payload.depositAmount,
    remainingBalance: payload.remainingBalance,
  });

  const statusCheck = quoteStatusUpdateSchema.safeParse({ id: quoteId, status: payload.status, internalNotes: payload.internalNotes });
  const updateCheck = quoteRequestUpdateSchema.partial().safeParse({ id: quoteId, ...payload });

  if (!pricingCheck.success || !statusCheck.success || !updateCheck.success) {
    return NextResponse.json({ ok: false, error: 'Invalid quote update payload.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('quote_requests').update(toDbPayload(payload)).eq('id', quoteId).select('*').single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, quote: data });
}
