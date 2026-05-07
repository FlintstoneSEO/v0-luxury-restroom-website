import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApprovalToken, hashApprovalToken } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { formatCurrency } from '@/lib/pricing-engine';

// Statuses that allow sending a quote
const SENDABLE_STATUSES = [
  'pending_review',
  'new',
  'under_review',
  'draft_quote',
  'change_requested',
  'quote_sent', // Allow re-sending
];

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;

  try {
    const supabase = createAdminClient();

    // Fetch the quote with correct event-based fields
    const { data: quote, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        quote_number,
        customer_name,
        email,
        event_date,
        event_type,
        event_address,
        city,
        state,
        zip_code,
        guest_count,
        total_price,
        deposit_amount,
        final_balance,
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

    // Check if quote can be sent
    if (!SENDABLE_STATUSES.includes(quote.status)) {
      return NextResponse.json(
        { ok: false, message: `Quote cannot be sent in current status: ${quote.status}` },
        { status: 400 }
      );
    }

    // Generate approval token
    const token = generateApprovalToken();
    const tokenHash = hashApprovalToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(); // 10 days

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const approvalLink = `${appUrl}/quote/${token}`;

    // Format event location
    const eventLocation = [
      quote.event_address,
      quote.city,
      `${quote.state} ${quote.zip_code}`,
    ].filter(Boolean).join(', ');

    // Build email content
    const emailHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3a47;">Your Luxury Restroom Rental Quote</h2>
        
        <p>Hi ${quote.customer_name},</p>
        
        <p>Thank you for requesting a quote from Signature Luxe Events & Amenities. We&apos;re pleased to provide pricing for your upcoming event.</p>
        
        <div style="background: #f8f7f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3a47; margin-top: 0;">Event Details</h3>
          <p><strong>Event Date:</strong> ${new Date(quote.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Event Type:</strong> ${quote.event_type}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p><strong>Guest Count:</strong> ${quote.guest_count}</p>
        </div>
        
        <div style="background: #2d3a47; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ded2c4;">Quote Summary</h3>
          <p style="font-size: 24px; margin: 10px 0;"><strong>Total:</strong> ${formatCurrency(quote.total_price || 0)}</p>
          <p><strong>Deposit Required:</strong> ${formatCurrency(quote.deposit_amount || 0)}</p>
          <p><strong>Balance Due:</strong> ${formatCurrency(quote.final_balance || 0)}</p>
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

    // Send email
    const sendResult = await sendEmail({
      to: quote.email,
      subject: `Your Luxury Restroom Rental Quote - ${quote.quote_number || quote.id.slice(0, 8)}`,
      html: emailHtml,
    });

    if (!sendResult.sent) {
      return NextResponse.json(
        { ok: false, message: `Email send failed: ${sendResult.error || 'unknown error'}` },
        { status: 400 }
      );
    }

    // Store the approval token
    const { error: tokenError } = await supabase.from('quote_approval_tokens').insert({
      quote_request_id: quote.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (tokenError) {
      console.error('[send-quote] Token insert error:', tokenError);
      return NextResponse.json(
        { ok: false, message: 'Failed to create approval token' },
        { status: 400 }
      );
    }

    // Update quote status and token fields
    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        status: 'quote_sent',
        approval_token_hash: tokenHash,
        approval_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quote.id);

    if (updateError) {
      console.error('[send-quote] Quote update error:', updateError);
      return NextResponse.json(
        { ok: false, message: 'Failed to update quote status' },
        { status: 400 }
      );
    }

    // Insert status history
    await supabase.from('quote_status_history').insert({
      quote_request_id: quote.id,
      old_status: quote.status,
      new_status: 'quote_sent',
      changed_at: new Date().toISOString(),
      changed_by: 'admin',
      note: 'Quote email sent to customer',
    });

    return NextResponse.json({ ok: true, message: 'Quote email sent successfully' });
  } catch (error) {
    console.error('[send-quote] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
