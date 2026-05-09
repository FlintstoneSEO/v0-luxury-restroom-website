import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApprovalToken, hashApprovalToken } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { formatCurrency } from '@/lib/pricing-engine';

// Statuses that allow sending a quote
const SENDABLE_STATUSES = [
  'pending',
  'pending_review',
  'new',
  'under_review',
  'draft_quote',
  'change_requested',
  'quote_sent', // Allow re-sending
];

function shouldExposeApprovalLink() {
  return process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview';
}

function getAppUrl(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');

  const host = request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`.replace(/\/$/, '');
  }

  return '';
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;

  try {
    const supabase = createAdminClient();

    const appUrl = getAppUrl(request);
    if (!appUrl) {
      return NextResponse.json(
        { ok: false, message: 'Unable to determine app URL for approval links. Set NEXT_PUBLIC_APP_URL in the deployment environment.' },
        { status: 500 }
      );
    }

    // Fetch the quote with current and legacy fallback fields
    const { data: quote, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        quote_number,
        customer_name,
        email,
        customer_email,
        event_date,
        event_type,
        event_address,
        event_location,
        city,
        state,
        zip_code,
        guest_count,
        total_price,
        total,
        deposit_amount,
        final_balance,
        remaining_balance,
        status
      `)
      .eq('id', quoteId)
      .single();

    if (error || !quote) {
      return NextResponse.json(
        { ok: false, message: 'Quote not found' },
        { status: 404 }
      );
    }

    const quoteEmail = quote.email || quote.customer_email;
    if (!quoteEmail) {
      return NextResponse.json(
        { ok: false, message: 'Quote is missing customer email (email/customer_email).' },
        { status: 400 }
      );
    }

    // Check if quote can be sent
    if (!SENDABLE_STATUSES.includes(quote.status)) {
      return NextResponse.json(
        { ok: false, message: `Unsupported quote status for sending: ${quote.status}` },
        { status: 400 }
      );
    }

    // Generate approval token and persist token before sending email
    const token = generateApprovalToken();
    const tokenHash = hashApprovalToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(); // 10 days

    const { error: tokenError } = await supabase.from('quote_approval_tokens').insert({
      quote_request_id: quote.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (tokenError) {
      console.error('[send-quote] Token insert error:', tokenError);
      return NextResponse.json(
        { ok: false, message: 'Failed to create approval token record.' },
        { status: 500 }
      );
    }

    // Update quote status before sending email
    const now = new Date().toISOString();
    const { error: statusUpdateError } = await supabase
      .from('quote_requests')
      .update({
        status: 'quote_sent',
        updated_at: now,
      })
      .eq('id', quote.id);

    if (statusUpdateError) {
      console.error('[send-quote] Quote status update error:', statusUpdateError);
      return NextResponse.json(
        { ok: false, message: 'Failed to update quote status before email send.' },
        { status: 500 }
      );
    }

    const approvalLink = `${appUrl}/quote/${token}`;

    // Format event location with legacy fallback
    const eventLocation = [
      quote.event_address || quote.event_location,
      quote.city,
      quote.state && quote.zip_code ? `${quote.state} ${quote.zip_code}` : quote.state || quote.zip_code,
    ].filter(Boolean).join(', ');

    const customerName = quote.customer_name || 'Customer';
    const totalPrice = quote.total_price ?? quote.total ?? 0;
    const finalBalance = quote.final_balance ?? quote.remaining_balance ?? 0;

    // Build email content
    const emailHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3a47;">Your Luxury Restroom Rental Quote</h2>

        <p>Hi ${customerName},</p>

        <p>Thank you for requesting a quote from Signature Luxe Events & Amenities. We&apos;re pleased to provide pricing for your upcoming event.</p>

        <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3a47; margin-top: 0;">Event Details</h3>
          <p><strong>Event Date:</strong> ${quote.event_date ? new Date(quote.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</p>
          <p><strong>Event Type:</strong> ${quote.event_type || 'TBD'}</p>
          <p><strong>Location:</strong> ${eventLocation || 'TBD'}</p>
          <p><strong>Guest Count:</strong> ${quote.guest_count ?? 'TBD'}</p>
        </div>

        <div style="background: #2d3a47; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ded2c4;">Quote Summary</h3>
          <p style="font-size: 24px; margin: 10px 0;"><strong>Total:</strong> ${formatCurrency(totalPrice)}</p>
          <p><strong>Deposit Required:</strong> ${formatCurrency(quote.deposit_amount || 0)}</p>
          <p><strong>Balance Due:</strong> ${formatCurrency(finalBalance)}</p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${approvalLink}" style="display: inline-block; background: #2d3a47; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Review &amp; Respond to Quote
          </a>
        </p>

        <p style="color: #666; font-size: 14px;">This quote link will expire in 10 days.</p>

        <p>If you have any questions, please don&apos;t hesitate to reach out.</p>

        <p>Best regards,<br/>
        <strong>Signature Luxe Events & Amenities</strong></p>
      </div>
    `;

    // Send email after successful DB writes
    const sendResult = await sendEmail({
      to: quoteEmail,
      subject: `Your Luxury Restroom Rental Quote - ${quote.quote_number || quote.id.slice(0, 8)}`,
      html: emailHtml,
    });

    if (!sendResult.sent) {
      return NextResponse.json(
        { ok: false, message: `Email send failed: ${sendResult.error || 'unknown error'}` },
        { status: 400 }
      );
    }

    // Save quote_sent_at after successful send
    const sentAt = new Date().toISOString();
    const { error: sentAtError } = await supabase
      .from('quote_requests')
      .update({ quote_sent_at: sentAt, updated_at: sentAt })
      .eq('id', quote.id);

    if (sentAtError) {
      console.error('[send-quote] quote_sent_at update error:', sentAtError);
      return NextResponse.json(
        { ok: false, message: 'Quote email sent, but failed to save quote_sent_at.' },
        { status: 500 }
      );
    }

    // Insert status history
    await supabase.from('quote_status_history').insert({
      quote_request_id: quote.id,
      old_status: quote.status,
      new_status: 'quote_sent',
      changed_at: sentAt,
      changed_by: 'admin',
      note: 'Quote email sent to customer',
    });

    return NextResponse.json({
      ok: true,
      message: 'Quote email sent successfully',
      ...(shouldExposeApprovalLink() ? { approvalLink } : {}),
    });
  } catch (error) {
    console.error('[send-quote] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
