import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteRequestUpdateSchema } from '@/lib/quotes/schema';

// Fields that should be converted from empty string to null
const NULLABLE_FIELDS = [
  'deposit_paid_at',
  'deposit_payment_link',
  'agreement_sent_at',
  'agreement_signed_at',
  'agreement_document_url',
  'signed_document_url',
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
  'subtotal',
  'total_price',
  'deposit_amount',
  'deposit_status',
  'deposit_due_date',
  'deposit_paid_at',
  'deposit_paid_amount',
  'deposit_transaction_reference',
  'deposit_payment_link',
  'final_balance',
  'discount_amount',
  'quote_expires_at',
  'status',
  'agreement_status',
  'agreement_sent_at',
  'agreement_signed_at',
  'agreement_document_url',
  'signed_document_url',
  'agreement_provider_reference_id',
  'internal_notes',
  'customer_notes',
  'is_manual_override',
  'customer_response',
  'customer_response_type',
  'customer_response_at',
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
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
    console.error('[v0] Quote update validation errors:', {
      errors: validation.error.errors,
      payloadKeys: Object.keys(payload),
      firstError: validation.error.errors[0],
    });
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
      .select('status')
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

        // Validate non-negative money values (except discount can be 0 or positive)
        if (
          ['base_price', 'travel_fee', 'utility_fee', 'after_hours_fee', 'cleaning_fee', 
           'damage_waiver_fee', 'rush_booking_fee', 'subtotal', 'total_price', 
           'deposit_amount', 'deposit_paid_amount', 'final_balance', 'discount_amount'].includes(field)
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
