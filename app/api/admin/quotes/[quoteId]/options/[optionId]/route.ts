import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteOptionUpdateSchema } from '@/lib/quotes/schema';
import { normalizeOptionPricing } from '@/lib/quotes/quote-options';

const PRICING_FIELDS = ['base_price', 'travel_fee', 'utility_fee', 'after_hours_fee', 'cleaning_fee', 'damage_waiver_fee', 'rush_booking_fee', 'discount_amount', 'deposit_amount'] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ quoteId: string; optionId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId, optionId } = await params;
  const body = await request.json().catch(() => ({}));
  const validation = quoteOptionUpdateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ ok: false, message: 'Invalid quote option update', details: validation.error.errors }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: current, error: currentError } = await supabase
    .from('quote_options')
    .select('*')
    .eq('id', optionId)
    .eq('quote_request_id', quoteId)
    .single();

  if (currentError || !current) return NextResponse.json({ ok: false, message: 'Quote option not found' }, { status: 404 });

  const input = validation.data;
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) updateData[key] = value;
  }

  if (PRICING_FIELDS.some((field) => field in input)) {
    Object.assign(updateData, normalizeOptionPricing({ ...current, ...input }));
  }

  if (input.is_recommended === true) {
    await supabase.from('quote_options').update({ is_recommended: false }).eq('quote_request_id', quoteId).neq('id', optionId);
  }

  const { data, error } = await supabase
    .from('quote_options')
    .update(updateData)
    .eq('id', optionId)
    .eq('quote_request_id', quoteId)
    .select('*')
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, option: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ quoteId: string; optionId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId, optionId } = await params;
  const supabase = createAdminClient();
  const { data: quote } = await supabase.from('quote_requests').select('selected_quote_option_id').eq('id', quoteId).single();
  if (quote?.selected_quote_option_id === optionId) {
    return NextResponse.json({ ok: false, message: 'Cannot delete the selected approved option.' }, { status: 409 });
  }

  const { error } = await supabase.from('quote_options').delete().eq('id', optionId).eq('quote_request_id', quoteId);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
