import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteRequestUpdateSchema } from '@/lib/quotes/schema';
import { buildQuoteCalculation, getPricingSettings } from '@/lib/quotes/build-quote-calculation';
import { calculateQuoteFinancials } from '@/lib/pricing-engine';
import { financialLockMessage, isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';
import type { QuoteFormData } from '@/lib/types/quote';

// Fields that should be converted from empty string to null
const NULLABLE_FIELDS = [
  'deposit_paid_at',
  'deposit_payment_link',
  'square_deposit_invoice_url',
  'square_final_invoice_url',
  'agreement_sent_at',
  'agreement_signed_at',
  'agreement_document_url',
  'signed_document_url',
  'signed_agreement_url',
  'final_balance_paid_at',
  'customer_response_at',
  'quote_expires_at',
  'deposit_due_date',
] as const;

// Valid fields that exist in the quote_requests table
const ALLOWED_UPDATE_FIELDS = [
  'customer_name',
  'phone',
  'email',
  'event_date',
  'event_type',
  'guest_count',
  'event_address',
  'city',
  'state',
  'zip_code',
  'event_start_time',
  'event_end_time',
  'has_power',
  'has_water',
  'additional_notes',
  'distance_miles',
  'base_price',
  'travel_fee',
  'utility_fee',
  'after_hours_fee',
  'cleaning_fee',
  'damage_waiver_fee',
  'rush_booking_fee',
  'deposit_status',
  'deposit_due_date',
  'deposit_paid_at',
  'deposit_paid_amount',
  'deposit_transaction_reference',
  'deposit_payment_link',
  'square_customer_id',
  'square_deposit_invoice_id',
  'square_deposit_invoice_url',
  'square_final_invoice_id',
  'square_final_invoice_url',
  'final_balance_paid_at',
  'discount_amount',
  'quote_expires_at',
  'status',
  'agreement_status',
  'agreement_sent_at',
  'agreement_signed_at',
  'agreement_document_url',
  'signed_document_url',
  'signed_agreement_url',
  'dropbox_sign_request_id',
  'dropbox_sign_signature_id',
  'agreement_provider_reference_id',
  'internal_notes',
  'customer_notes',
  'is_manual_override',
  'customer_response',
  'customer_response_type',
  'customer_response_at',
] as const;

const PRICING_INPUT_FIELDS = [
  'base_price',
  'travel_fee',
  'utility_fee',
  'after_hours_fee',
  'cleaning_fee',
  'damage_waiver_fee',
  'rush_booking_fee',
  'discount_amount',
] as const;

const EVENT_PRICING_INPUT_FIELDS = [
  'event_date',
  'guest_count',
  'event_address',
  'city',
  'state',
  'zip_code',
  'event_start_time',
  'event_end_time',
  'has_power',
  'has_water',
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;

  try {
    const supabase = createAdminClient();

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
  } catch (error) {
    console.error('[admin/quotes] GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;
  const payload = await request.json();

  // Convert empty strings to null for nullable fields
  for (const field of NULLABLE_FIELDS) {
    if (field in payload && payload[field] === '') {
      payload[field] = null;
    }
  }

  // Validate the update schema
  const validation = quoteRequestUpdateSchema.safeParse({ id: quoteId, ...payload });

  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid update payload', details: validation.error.errors },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Get the current quote to check for status changes
    const { data: currentQuote, error: fetchError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (fetchError || !currentQuote) {
      return NextResponse.json(
        { ok: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {};

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (field in payload) {
        const value = payload[field];

        // Validate non-negative editable money values.
        if (
          ['base_price', 'travel_fee', 'utility_fee', 'after_hours_fee', 'cleaning_fee',
           'damage_waiver_fee', 'rush_booking_fee', 'deposit_paid_amount', 'discount_amount'].includes(field)
        ) {
          const numValue = typeof value === 'number' ? value : parseFloat(value);
          if (numValue < 0) {
            return NextResponse.json(
              { ok: false, error: `${field} cannot be negative` },
              { status: 400 }
            );
          }
        }

        updateData[field] = value;
      }
    }

    const pricingChanged = PRICING_INPUT_FIELDS.some((field) => {
      if (!(field in payload)) return false;
      return Number(payload[field] ?? 0) !== Number(currentQuote[field] ?? 0);
    });
    const eventPricingChanged = EVENT_PRICING_INPUT_FIELDS.some((field) => {
      if (!(field in payload)) return false;
      return payload[field] !== currentQuote[field];
    });

    if ((pricingChanged || eventPricingChanged) && isQuoteFinanciallyLocked(currentQuote)) {
      return NextResponse.json(
        { ok: false, error: financialLockMessage() },
        { status: 409 }
      );
    }

    if (eventPricingChanged) {
      const quoteInput: QuoteFormData = {
        customer_name: String(payload.customer_name ?? currentQuote.customer_name ?? ''),
        phone: String(payload.phone ?? currentQuote.phone ?? ''),
        email: String(payload.email ?? currentQuote.email ?? ''),
        event_date: String(payload.event_date ?? currentQuote.event_date ?? ''),
        event_type: String(payload.event_type ?? currentQuote.event_type ?? ''),
        guest_count: Number(payload.guest_count ?? currentQuote.guest_count ?? 0),
        event_address: String(payload.event_address ?? currentQuote.event_address ?? ''),
        city: String(payload.city ?? currentQuote.city ?? ''),
        state: String(payload.state ?? currentQuote.state ?? ''),
        zip_code: String(payload.zip_code ?? currentQuote.zip_code ?? ''),
        event_start_time: String(payload.event_start_time ?? currentQuote.event_start_time ?? ''),
        event_end_time: String(payload.event_end_time ?? currentQuote.event_end_time ?? ''),
        has_power: Boolean(payload.has_power ?? currentQuote.has_power),
        has_water: Boolean(payload.has_water ?? currentQuote.has_water),
        additional_notes: String(payload.additional_notes ?? currentQuote.additional_notes ?? ''),
      };
      const calculation = await buildQuoteCalculation(quoteInput);
      const financials = calculateQuoteFinancials({
        ...calculation.priceBreakdown,
        discount_amount: Number(payload.discount_amount ?? currentQuote.discount_amount ?? 0),
        sales_tax_percentage: Number(calculation.priceBreakdown.details.sales_tax_percentage),
        deposit_percentage: calculation.priceBreakdown.deposit_percentage,
      });

      Object.assign(updateData, {
        base_price: calculation.priceBreakdown.base_price,
        travel_fee: calculation.priceBreakdown.travel_fee,
        utility_fee: calculation.priceBreakdown.utility_fee,
        after_hours_fee: calculation.priceBreakdown.after_hours_fee,
        cleaning_fee: calculation.priceBreakdown.cleaning_fee,
        damage_waiver_fee: calculation.priceBreakdown.damage_waiver_fee,
        rush_booking_fee: calculation.priceBreakdown.rush_booking_fee,
        ...financials,
        distance_miles: calculation.distanceMiles,
        calculated_breakdown: {
          ...calculation.priceBreakdown,
          ...financials,
        },
        needs_manual_distance_review: calculation.distanceCalculationStatus === 'fallback',
        is_manual_override: false,
      });
    } else if (pricingChanged) {
      const pricingSettings = await getPricingSettings();
      const financials = calculateQuoteFinancials({
        base_price: Number(payload.base_price ?? currentQuote.base_price ?? 0),
        travel_fee: Number(payload.travel_fee ?? currentQuote.travel_fee ?? 0),
        utility_fee: Number(payload.utility_fee ?? currentQuote.utility_fee ?? 0),
        after_hours_fee: Number(payload.after_hours_fee ?? currentQuote.after_hours_fee ?? 0),
        cleaning_fee: Number(payload.cleaning_fee ?? currentQuote.cleaning_fee ?? 0),
        damage_waiver_fee: Number(payload.damage_waiver_fee ?? currentQuote.damage_waiver_fee ?? 0),
        rush_booking_fee: Number(payload.rush_booking_fee ?? currentQuote.rush_booking_fee ?? 0),
        discount_amount: Number(payload.discount_amount ?? currentQuote.discount_amount ?? 0),
        sales_tax_percentage: pricingSettings.sales_tax_percentage,
        deposit_percentage: pricingSettings.deposit_percentage,
      });

      Object.assign(updateData, financials, {
        calculated_breakdown: {
          ...(currentQuote.calculated_breakdown ?? {}),
          ...financials,
          details: {
            ...((currentQuote.calculated_breakdown?.details as Record<string, unknown> | undefined) ?? {}),
            sales_tax_percentage: pricingSettings.sales_tax_percentage,
            deposit_percentage: pricingSettings.deposit_percentage,
          },
        },
      });
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Check if status changed for history tracking
    const statusChanged = 'status' in payload && payload.status !== currentQuote.status;

    // Perform the update
    const { data, error } = await supabase
      .from('quote_requests')
      .update(updateData)
      .eq('id', quoteId)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/quotes] PATCH error:', error);
      if (
        error.code === '23505' ||
        (error.code === 'P0001' && error.message.includes('EVENT_DATE_ALREADY_BOOKED'))
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: 'EVENT_DATE_ALREADY_BOOKED',
            error: 'This event date is already reserved by another quote.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    // Insert status history if status changed
    if (statusChanged) {
      const { error: historyError } = await supabase
        .from('quote_status_history')
        .insert({
          quote_request_id: quoteId,
          old_status: currentQuote.status,
          new_status: payload.status,
          changed_at: new Date().toISOString(),
          changed_by: 'admin',
          note: payload.internal_notes || null,
        });

      if (historyError) {
        console.error('[admin/quotes] Status history insert error:', historyError);
        // Don't fail the whole request if history insert fails
      }
    }

    return NextResponse.json({ ok: true, quote: data });
  } catch (error) {
    console.error('[admin/quotes] PATCH error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
