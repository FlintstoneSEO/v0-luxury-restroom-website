import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import { quoteCustomerResponseSchema } from '@/lib/quotes/schema';
import { sendEmail } from '@/lib/email/client';

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

  const { response_type, comments } = validation.data;

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

    const now = new Date().toISOString();
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

    // Mark token as used
    await supabase
      .from('quote_approval_tokens')
      .update({ used_at: now })
      .eq('id', tokenRecord.id);

    // Insert status history
    await supabase.from('quote_status_history').insert({
      quote_request_id: tokenRecord.quote_request_id,
      old_status: quote.status,
      new_status: newStatus,
      changed_at: now,
      changed_by: 'customer',
      note: comments || `Customer ${response_type.replace('_', ' ')}`,
    });

    // Send notification email to admin
    const statusDisplay = response_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    await sendEmail({
      to: process.env.EMAIL_FROM || 'info@signatureluxeevents.com',
      subject: `Quote ${quote.quote_number || quote.id.slice(0, 8)}: Customer ${statusDisplay}`,
      html: `
        <h2>Customer Quote Response</h2>
        <p><strong>Quote:</strong> ${quote.quote_number || quote.id}</p>
        <p><strong>Customer:</strong> ${quote.customer_name} (${quote.email})</p>
        <p><strong>Response:</strong> ${statusDisplay}</p>
        ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/quotes/${quote.id}">View in Admin Dashboard</a></p>
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
