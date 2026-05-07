import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { quoteRequestUpdateSchema, quoteStatusUpdateSchema } from '@/lib/quotes/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Quote not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, quote: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;
  const payload = await request.json();

  // Validate the update schema
  const validation = quoteRequestUpdateSchema
    .partial()
    .safeParse({ id: quoteId, ...payload });

  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid update payload', details: validation.error.errors },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  
  // Only include fields that were actually provided
  const updateData: Record<string, unknown> = {};
  if ('name' in payload) updateData.name = payload.name;
  if ('email' in payload) updateData.email = payload.email;
  if ('phone' in payload) updateData.phone = payload.phone;
  if ('address' in payload) updateData.address = payload.address;
  if ('city' in payload) updateData.city = payload.city;
  if ('state' in payload) updateData.state = payload.state;
  if ('zip' in payload) updateData.zip = payload.zip;
  if ('room_type' in payload) updateData.room_type = payload.room_type;
  if ('room_condition' in payload) updateData.room_condition = payload.room_condition;
  if ('features' in payload) updateData.features = payload.features;
  if ('color_preference' in payload) updateData.color_preference = payload.color_preference;
  if ('base_price' in payload) updateData.base_price = payload.base_price;
  if ('labor_cost' in payload) updateData.labor_cost = payload.labor_cost;
  if ('materials_cost' in payload) updateData.materials_cost = payload.materials_cost;
  if ('tax_amount' in payload) updateData.tax_amount = payload.tax_amount;
  if ('total_price' in payload) updateData.total_price = payload.total_price;
  if ('discount_amount' in payload) updateData.discount_amount = payload.discount_amount;
  if ('final_price' in payload) updateData.final_price = payload.final_price;
  if ('price_valid_until' in payload) updateData.price_valid_until = payload.price_valid_until;
  if ('status' in payload) updateData.status = payload.status;
  if ('internal_notes' in payload) updateData.internal_notes = payload.internal_notes;
  if ('customer_notes' in payload) updateData.customer_notes = payload.customer_notes;
  if ('agreement_status' in payload) updateData.agreement_status = payload.agreement_status;
  if ('agreement_document_url' in payload) updateData.agreement_document_url = payload.agreement_document_url;
  if ('agreement_provider_reference_id' in payload) updateData.agreement_provider_reference_id = payload.agreement_provider_reference_id;
  if ('agreement_sent_at' in payload) updateData.agreement_sent_at = payload.agreement_sent_at;
  if ('agreement_signed_at' in payload) updateData.agreement_signed_at = payload.agreement_signed_at;
  if ('deposit_status' in payload) updateData.deposit_status = payload.deposit_status;
  if ('deposit_payment_link' in payload) updateData.deposit_payment_link = payload.deposit_payment_link;
  if ('deposit_due_date' in payload) updateData.deposit_due_date = payload.deposit_due_date;
  if ('deposit_paid_at' in payload) updateData.deposit_paid_at = payload.deposit_paid_at;
  if ('deposit_paid_amount' in payload) updateData.deposit_paid_amount = payload.deposit_paid_amount;

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
