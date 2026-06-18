import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildQuoteCalculation } from '@/lib/quotes/build-quote-calculation';
import { QuoteFormData } from '@/lib/types/quote';

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const supabase = createAdminClient();
    const { data: quote, error: fetchError } = await supabase
      .from('quote_requests')
      .select(`
        id,
        customer_name,
        phone,
        email,
        event_date,
        event_type,
        guest_count,
        event_address,
        city,
        state,
        zip_code,
        event_start_time,
        event_end_time,
        has_power,
        has_water,
        additional_notes,
        discount_amount,
        is_manual_override
      `)
      .eq('id', quoteId)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ ok: false, message: 'Quote not found' }, { status: 404 });
    }

    if (quote.is_manual_override && body?.force !== true) {
      return NextResponse.json(
        {
          ok: false,
          message: 'This quote has manual override enabled. Submit again with force=true to replace manual pricing with recalculated pricing.',
        },
        { status: 409 }
      );
    }

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

    const { distanceMiles, priceBreakdown, distanceCalculationStatus } = await buildQuoteCalculation(quoteInput);
    const discountAmount = Math.max(0, roundMoney(Number(quote.discount_amount ?? 0)));
    const discountedTotal = roundMoney(Math.max(0, priceBreakdown.subtotal - discountAmount));
    const finalBalance = roundMoney(Math.max(0, discountedTotal - priceBreakdown.deposit_amount));
    const discountedPriceBreakdown = {
      ...priceBreakdown,
      discount_amount: discountAmount,
      total_price: discountedTotal,
      final_balance: finalBalance,
    };
    const now = new Date().toISOString();

    const updateData = {
      base_price: priceBreakdown.base_price,
      travel_fee: priceBreakdown.travel_fee,
      utility_fee: priceBreakdown.utility_fee,
      after_hours_fee: priceBreakdown.after_hours_fee,
      cleaning_fee: priceBreakdown.cleaning_fee,
      damage_waiver_fee: priceBreakdown.damage_waiver_fee,
      rush_booking_fee: priceBreakdown.rush_booking_fee,
      subtotal: priceBreakdown.subtotal,
      discount_amount: discountAmount,
      total_price: discountedTotal,
      deposit_amount: priceBreakdown.deposit_amount,
      final_balance: finalBalance,
      distance_miles: distanceMiles,
      calculated_breakdown: discountedPriceBreakdown,
      needs_manual_distance_review: distanceCalculationStatus === 'fallback',
      is_manual_override: false,
      updated_at: now,
    };

    const { data: updatedQuote, error: updateError } = await supabase
      .from('quote_requests')
      .update(updateData)
      .eq('id', quoteId)
      .select('*')
      .single();

    if (updateError) {
      console.error('[admin/quotes/recalculate] Update error:', updateError);
      return NextResponse.json({ ok: false, message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, quote: updatedQuote });
  } catch (error) {
    console.error('[admin/quotes/recalculate] Error:', error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}
