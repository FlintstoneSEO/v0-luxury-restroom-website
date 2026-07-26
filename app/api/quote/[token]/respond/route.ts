import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import { quoteCustomerResponseSchema } from '@/lib/quotes/schema';
import { sendEmail } from '@/lib/email/client';
import { escapeHtml } from '@/lib/escape-html';
import { getAdminAppOrigin } from '@/lib/app-origins';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  // Validate the response
  const validation = quoteCustomerResponseSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, message: 'Invalid response', details: validation.error.errors },
      { status: 400 }
    );
  }

  const { response_type, comments, selected_quote_option_id } = validation.data;

  try {
    const tokenHash = hashApprovalToken(token);
    const supabase = createAdminClient();

    // Find and validate the token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('quote_approval_tokens')
      .select('id, quote_request_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { ok: false, message: 'Invalid or expired quote link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(tokenRecord.expires_at)) {
      return NextResponse.json(
        { ok: false, message: 'This quote link has expired' },
        { status: 400 }
      );
    }

    // Check if already used
    if (tokenRecord.used_at) {
      return NextResponse.json(
        { ok: false, message: 'You have already responded to this quote' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Get the quote for notifications
    const { data: quote } = await supabase
      .from('quote_requests')
      .select('id, quote_number, customer_name, email, status')
      .eq('id', tokenRecord.quote_request_id)
      .single();

    if (!quote) {
      return NextResponse.json(
        { ok: false, message: 'Quote not found' },
        { status: 404 }
      );
    }


    const { data: quoteOptions, error: optionsError } = await supabase
      .from('quote_options')
      .select('id, option_label, option_description, base_price, travel_fee, utility_fee, after_hours_fee, cleaning_fee, damage_waiver_fee, rush_booking_fee, subtotal, discount_amount, total_price, deposit_amount, final_balance')
      .eq('quote_request_id', quote.id)
      .neq('status', 'deleted');

    if (optionsError) {
      console.error('[quote-respond] Options fetch error:', optionsError);
      return NextResponse.json({ ok: false, message: 'Failed to validate quote options' }, { status: 500 });
    }

    const hasOptions = (quoteOptions ?? []).length > 0;
    const selectedOption = selected_quote_option_id
      ? (quoteOptions ?? []).find((option) => option.id === selected_quote_option_id)
      : null;

    if (response_type === 'approved' && hasOptions && !selectedOption) {
      return NextResponse.json(
        { ok: false, message: selected_quote_option_id ? 'Selected quote option is invalid' : 'Please choose a quote option before approving' },
        { status: 400 }
      );
    }
    let newStatus: string;
    let agreementStatus: string | undefined;

    switch (response_type) {
      case 'approved':
        newStatus = 'customer_approved';
        agreementStatus = 'ready_to_send';
        break;
      case 'change_requested':
        newStatus = 'change_requested';
        break;
      case 'declined':
        newStatus = 'declined';
        break;
      default:
        newStatus = quote.status;
    }

    const { data: usedTokenRows, error: usedTokenError } = await supabase
      .from('quote_approval_tokens')
      .update({ used_at: now })
      .eq('id', tokenRecord.id)
      .is('used_at', null)
      .select('id');

    if (usedTokenError || usedTokenRows?.length !== 1) {
      return NextResponse.json(
        { ok: false, message: 'You have already responded to this quote' },
        { status: 409 }
      );
    }

    // Update the quote
    const updateData: Record<string, unknown> = {
      status: newStatus,
      customer_response: comments || null,
      customer_response_type: response_type,
      customer_response_at: now,
      updated_at: now,
    };

    if (response_type === 'approved') {
      updateData.approved_at = now;
      updateData.agreement_status = agreementStatus;

      if (selectedOption) {
        updateData.selected_quote_option_id = selectedOption.id;
        updateData.base_price = selectedOption.base_price;
        updateData.travel_fee = selectedOption.travel_fee;
        updateData.utility_fee = selectedOption.utility_fee;
        updateData.after_hours_fee = selectedOption.after_hours_fee;
        updateData.cleaning_fee = selectedOption.cleaning_fee;
        updateData.damage_waiver_fee = selectedOption.damage_waiver_fee;
        updateData.rush_booking_fee = selectedOption.rush_booking_fee;
        updateData.subtotal = selectedOption.subtotal;
        updateData.discount_amount = selectedOption.discount_amount;
        updateData.total_price = selectedOption.total_price;
        updateData.deposit_amount = selectedOption.deposit_amount;
        updateData.final_balance = selectedOption.final_balance;
      }
    }

    const { error: updateError } = await supabase
      .from('quote_requests')
      .update(updateData)
      .eq('id', tokenRecord.quote_request_id);

    if (updateError) {
      console.error('[quote-respond] Update error:', updateError);
      return NextResponse.json(
        { ok: false, message: 'Failed to save response' },
        { status: 500 }
      );
    }

    if (response_type === 'approved' && selectedOption) {
      await supabase.from('quote_options').update({ status: 'selected', updated_at: now }).eq('id', selectedOption.id);
      await supabase
        .from('quote_options')
        .update({ status: 'not_selected', updated_at: now })
        .eq('quote_request_id', tokenRecord.quote_request_id)
        .neq('id', selectedOption.id)
        .neq('status', 'deleted');
    }

    const selectedOptionNote = selectedOption
      ? `Customer approved ${selectedOption.option_label}${selectedOption.option_description ? `: ${selectedOption.option_description}` : ''}`
      : null;

    const responseEventType = {
      approved: 'quote_approved',
      change_requested: 'quote_change_requested',
      declined: 'quote_declined',
    }[response_type];

    await supabase.from('quote_link_events').insert({
      quote_request_id: tokenRecord.quote_request_id,
      token_id: tokenRecord.id,
      event_type: responseEventType,
    });

    // Insert status history
    await supabase.from('quote_status_history').insert({
      quote_request_id: tokenRecord.quote_request_id,
      old_status: quote.status,
      new_status: newStatus,
      changed_at: now,
      changed_by: 'customer',
      note: selectedOptionNote || comments || `Customer ${response_type.replace('_', ' ')}`,
    });

    // Send notification email to admin
    const statusDisplay = response_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const adminQuoteUrl = `${getAdminAppOrigin(request)}/admin/quotes/${quote.id}`;
    await sendEmail({
      to: process.env.EMAIL_FROM || 'info@signatureluxeevents.com',
      subject: `Quote ${quote.quote_number || quote.id.slice(0, 8)}: Customer ${statusDisplay}`,
      html: `
        <h2>Customer Quote Response</h2>
        <p><strong>Quote:</strong> ${escapeHtml(quote.quote_number || quote.id)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(quote.customer_name)} (${escapeHtml(quote.email)})</p>
        <p><strong>Response:</strong> ${escapeHtml(statusDisplay)}</p>
        ${selectedOption ? `<p><strong>Selected Option:</strong> ${escapeHtml(selectedOption.option_label)}${selectedOption.option_description ? `: ${escapeHtml(selectedOption.option_description)}` : ''}</p>` : ''}
        ${comments ? `<p><strong>Comments:</strong> ${escapeHtml(comments)}</p>` : ''}
        <p><a href="${escapeHtml(adminQuoteUrl)}">View in Admin Dashboard</a></p>
      `,
    });

    return NextResponse.json({ ok: true, message: 'Response submitted successfully' });
  } catch (error) {
    console.error('[quote-respond] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
