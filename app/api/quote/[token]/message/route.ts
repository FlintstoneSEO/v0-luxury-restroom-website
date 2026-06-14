import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import { quoteCustomerMessageSchema } from '@/lib/quotes/schema';
import { sendEmail } from '@/lib/email/client';
import { escapeHtml } from '@/lib/escape-html';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const validation = quoteCustomerMessageSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, message: 'Invalid message', details: validation.error.errors },
      { status: 400 }
    );
  }

  const { message } = validation.data;

  try {
    const tokenHash = hashApprovalToken(token);
    const supabase = createAdminClient();

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('quote_approval_tokens')
      .select('id, quote_request_id, expires_at')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { ok: false, message: 'Invalid or expired quote link' },
        { status: 404 }
      );
    }

    if (isTokenExpired(tokenRecord.expires_at)) {
      return NextResponse.json(
        { ok: false, message: 'This quote link has expired' },
        { status: 400 }
      );
    }

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

    await supabase.from('quote_link_events').insert({
      quote_request_id: tokenRecord.quote_request_id,
      token_id: tokenRecord.id,
      event_type: 'quote_message_sent',
    });

    await supabase.from('quote_status_history').insert({
      quote_request_id: tokenRecord.quote_request_id,
      old_status: quote.status,
      new_status: quote.status,
      changed_at: now,
      changed_by: 'customer',
      note: `Customer message: ${message}`,
    });

    const adminQuoteUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/quotes/${quote.id}`;
    await sendEmail({
      to: process.env.EMAIL_FROM || 'info@signatureluxeevents.com',
      subject: `Quote ${quote.quote_number || quote.id.slice(0, 8)}: Customer Message`,
      html: `
        <h2>Customer Quote Message</h2>
        <p><strong>Quote:</strong> ${escapeHtml(quote.quote_number || quote.id)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(quote.customer_name)} (${escapeHtml(quote.email)})</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
        <p><a href="${escapeHtml(adminQuoteUrl)}">View in Admin Dashboard</a></p>
      `,
    });

    return NextResponse.json({ ok: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('[quote-message] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
