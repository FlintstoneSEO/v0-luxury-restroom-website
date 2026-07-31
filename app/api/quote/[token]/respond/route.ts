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
      .select('id, quote_number, customer_name, email, status, event_date, is_test_quote')
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
      .select('id, option_label, option_description, base_price, travel_fee, utility_fee, after_hours_fee, cleaning_fee, damage_waiver_fee, rush_booking_fee, subtotal, discount_amount, pretax_total, taxable_amount, tax_rate, sales_tax_amount, total_price, deposit_percentage, deposit_amount, final_balance, calculated_breakdown')
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
    const { data: responseRows, error: responseError } = await supabase.rpc(
      'submit_quote_response',
      {
        p_token_id: tokenRecord.id,
        p_quote_id: tokenRecord.quote_request_id,
        p_response_type: response_type,
        p_comments: comments || '',
        p_selected_quote_option_id: selected_quote_option_id ?? null,
        p_now: now,
      },
    );

    if (responseError) {
      console.error('[quote-respond] Transaction error:', responseError);
      const isDateConflict =
        responseError.code === '23505' ||
        responseError.message.includes('EVENT_DATE_ALREADY_BOOKED');
      if (isDateConflict) {
        return NextResponse.json(
          {
            ok: false,
            code: 'EVENT_DATE_ALREADY_BOOKED',
            message: 'This event date is no longer available. Please contact Signature Luxe to discuss another date.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { ok: false, message: 'Failed to save response' },
        { status: 500 },
      );
    }

    const result = responseRows?.[0] as
      | { result_ok: boolean; result_code: string | null; result_message: string }
      | undefined;

    if (!result?.result_ok) {
      const status =
        result?.result_code === 'EVENT_DATE_ALREADY_BOOKED' ||
        result?.result_code === 'TOKEN_ALREADY_USED'
          ? 409
          : result?.result_code === 'QUOTE_NOT_FOUND' ||
              result?.result_code === 'INVALID_TOKEN'
            ? 404
            : 400;
      return NextResponse.json(
        {
          ok: false,
          ...(result?.result_code ? { code: result.result_code } : {}),
          message: result?.result_message || 'Failed to save response',
        },
        { status },
      );
    }

    // Send notification email to admin
    const statusDisplay = response_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const adminQuoteUrl = `${getAdminAppOrigin(request)}/admin/quotes/${quote.id}`;
    try {
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
    } catch (emailError) {
      // The response is already committed atomically. Do not tell the customer
      // it failed or invite a duplicate submission because an admin alert failed.
      console.error('[quote-respond] Admin notification error:', emailError);
    }

    return NextResponse.json({ ok: true, message: 'Response submitted successfully' });
  } catch (error) {
    console.error('[quote-respond] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
