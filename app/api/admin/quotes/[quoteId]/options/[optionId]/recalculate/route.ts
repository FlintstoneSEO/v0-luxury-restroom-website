import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateQuoteOption } from '@/lib/quotes/quote-options';
import { QuoteFormData } from '@/lib/types/quote';
import { financialLockMessage, isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';

export async function POST(_request: Request, { params }: { params: Promise<{ quoteId: string; optionId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId, optionId } = await params;
  const supabase = createAdminClient();

  const { data: quote, error: quoteError } = await supabase
    .from('quote_requests')
    .select('customer_name, phone, email, event_date, event_type, guest_count, event_address, city, state, zip_code, event_start_time, event_end_time, has_power, has_water, additional_notes, status, quote_sent_at, approved_at, customer_response_at, customer_response_type, agreement_status, deposit_status')
    .eq('id', quoteId)
    .single();

  if (quoteError || !quote) return NextResponse.json({ ok: false, message: 'Quote not found' }, { status: 404 });
  if (isQuoteFinanciallyLocked(quote)) {
    return NextResponse.json({ ok: false, message: financialLockMessage() }, { status: 409 });
  }

  const { data: option, error: optionError } = await supabase
    .from('quote_options')
    .select('id, has_power, has_water, discount_amount')
    .eq('id', optionId)
    .eq('quote_request_id', quoteId)
    .single();

  if (optionError || !option) return NextResponse.json({ ok: false, message: 'Quote option not found' }, { status: 404 });

  const quoteInput: QuoteFormData = {
    customer_name: quote.customer_name,
    phone: quote.phone,
    email: quote.email,
    event_date: quote.event_date,
    event_type: quote.event_type,
    guest_count: Number(quote.guest_count),
    event_address: quote.event_address,
    city: quote.city,
    state: quote.state,
    zip_code: quote.zip_code,
    event_start_time: quote.event_start_time,
    event_end_time: quote.event_end_time,
    has_power: Boolean(quote.has_power),
    has_water: Boolean(quote.has_water),
    additional_notes: quote.additional_notes ?? undefined,
  };

  const recalculated = await recalculateQuoteOption(quoteInput, option);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('quote_options')
    .update({ ...recalculated, updated_at: now })
    .eq('id', optionId)
    .eq('quote_request_id', quoteId)
    .select('*')
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, option: data });
}
