import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { quoteDepositUpdateSchema } from '@/lib/quotes/schema';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;
  const payload = await request.json();

  // Validate the update schema
  const validation = quoteDepositUpdateSchema.safeParse({
    id: quoteId,
    ...payload,
  });

  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid update payload', details: validation.error.errors },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    deposit_status: payload.deposit_status,
  };

  if ('deposit_payment_link' in payload) {
    updateData.deposit_payment_link = payload.deposit_payment_link;
  }
  if ('deposit_due_date' in payload) {
    updateData.deposit_due_date = payload.deposit_due_date;
  }
  if ('deposit_paid_at' in payload) {
    updateData.deposit_paid_at = payload.deposit_paid_at;
  }
  if ('deposit_paid_amount' in payload) {
    updateData.deposit_paid_amount = payload.deposit_paid_amount;
  }
  if ('deposit_transaction_reference' in payload) {
    updateData.deposit_transaction_reference = payload.deposit_transaction_reference;
  }
  if ('stripe_payment_intent_id' in payload) {
    updateData.stripe_payment_intent_id = payload.stripe_payment_intent_id;
  }
  if ('stripe_checkout_session_id' in payload) {
    updateData.stripe_checkout_session_id = payload.stripe_checkout_session_id;
  }

  const { data, error } = await supabase
    .from('quote_requests')
    .update(updateData)
    .eq('id', quoteId)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, quote: data });
}
