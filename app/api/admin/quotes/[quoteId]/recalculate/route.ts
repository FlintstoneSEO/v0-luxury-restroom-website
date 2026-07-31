import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildQuoteCalculation } from '@/lib/quotes/build-quote-calculation';
import { QuoteFormData } from '@/lib/types/quote';
import { calculateQuoteFinancials, roundCurrency } from '@/lib/pricing-engine';
import { financialLockMessage, isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';

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
        is_manual_override,
        status,
        quote_sent_at,
        approved_at,
        customer_response_at,
        customer_response_type,
        agreement_status,
        deposit_status,
        total_price,
        deposit_amount,
        final_balance
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

    const financiallyLocked = isQuoteFinanciallyLocked(quote);
    const isExplicitRevision = body?.revise === true;

    if (financiallyLocked && !isExplicitRevision) {
      return NextResponse.json({ ok: false, message: financialLockMessage() }, { status: 409 });
    }

    if (
      isExplicitRevision &&
      (
        ['sent', 'signed'].includes(quote.agreement_status ?? '') ||
        ['invoice_sent', 'pending', 'paid', 'overdue'].includes(quote.deposit_status ?? '')
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: 'An agreement or active deposit invoice prevents in-place financial revision. Void the open document or create a replacement quote instead.',
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
    const discountAmount = Math.max(0, roundCurrency(Number(quote.discount_amount ?? 0)));
    const financials = calculateQuoteFinancials({
      ...priceBreakdown,
      discount_amount: discountAmount,
      sales_tax_percentage: Number(priceBreakdown.details.sales_tax_percentage),
      deposit_percentage: priceBreakdown.deposit_percentage,
    });
    const discountedPriceBreakdown = {
      ...priceBreakdown,
      ...financials,
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
      ...financials,
      distance_miles: distanceMiles,
      calculated_breakdown: discountedPriceBreakdown,
      needs_manual_distance_review: distanceCalculationStatus === 'fallback',
      is_manual_override: false,
      ...(isExplicitRevision
        ? {
            status: 'draft_quote',
            selected_quote_option_id: null,
            quote_sent_at: null,
            approved_at: null,
            customer_response_at: null,
            customer_response_type: null,
            customer_response: null,
            agreement_status: 'not_sent',
            deposit_status: 'due',
            deposit_due_date: null,
            deposit_payment_link: null,
            square_deposit_invoice_id: null,
            square_deposit_invoice_url: null,
            stripe_payment_intent_id: null,
            stripe_checkout_session_id: null,
          }
        : {}),
      updated_at: now,
    };

    if (isExplicitRevision) {
      const { error: tokenExpiryError } = await supabase
        .from('quote_approval_tokens')
        .update({ expires_at: now })
        .eq('quote_request_id', quoteId)
        .is('used_at', null);
      if (tokenExpiryError) {
        return NextResponse.json(
          { ok: false, message: 'Could not expire the existing customer link, so the revision was not started.' },
          { status: 500 }
        );
      }
    }

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

    if (isExplicitRevision) {
      const { error: historyError } = await supabase.from('quote_status_history').insert({
        quote_request_id: quoteId,
        old_status: quote.status,
        new_status: 'draft_quote',
        changed_at: now,
        changed_by: 'admin',
        note: `Financial revision started. Previous total ${quote.total_price ?? 0}; deposit ${quote.deposit_amount ?? 0}; balance ${quote.final_balance ?? 0}.`,
      });
      if (historyError) {
        console.error('[admin/quotes/recalculate] Status history error:', historyError);
      }
    }

    return NextResponse.json({ ok: true, quote: updatedQuote });
  } catch (error) {
    console.error('[admin/quotes/recalculate] Error:', error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}
