import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { adminCustomerApprovalTemplate } from '@/lib/email/templates';

export async function POST(request: Request) {
  const { token, decision, comments } = await request.json();
  const tokenHash = hashApprovalToken(token);
  const supabase = await createClient();

  const { data: tokenRecord, error: tokenError } = await supabase
    .from('quote_approval_tokens')
    .select('id, quote_request_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !tokenRecord || tokenRecord.used_at || isTokenExpired(tokenRecord.expires_at)) {
    return NextResponse.json(
      { ok: false, message: 'This quote approval link is invalid or expired.' },
      { status: 400 }
    );
  }

  // Validate comments for certain decisions
  if ((decision === 'request_changes' || decision === 'rejection') && (!comments || comments.trim().length < 3)) {
    return NextResponse.json(
      { ok: false, message: 'Please include comments for this response.' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  let newStatus = 'new';
  if (decision === 'approval') {
    newStatus = 'customer_approved';
  } else if (decision === 'request_changes') {
    newStatus = 'under_review';
  } else if (decision === 'rejection') {
    newStatus = 'declined';
  }

  // Get quote details before updating
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('id, name, email')
    .eq('id', tokenRecord.quote_request_id)
    .single();

  // Update quote with customer response
  const { error: updateError } = await supabase
    .from('quote_requests')
    .update({
      status: newStatus,
      customer_response: comments?.trim() || null,
      customer_response_type: decision === 'approval' ? 'approval' : decision === 'request_changes' ? 'inquiry' : 'rejection',
      customer_response_at: now,
      approved_at: decision === 'approval' ? now : null,
    })
    .eq('id', tokenRecord.quote_request_id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: 'Unable to save your response.' },
      { status: 400 }
    );
  }

  // Mark token as used
  await supabase
    .from('quote_approval_tokens')
    .update({ used_at: now })
    .eq('id', tokenRecord.id);

  // Notify admin of customer response
  if (decision === 'approval' || decision === 'request_changes') {
    const adminTemplate = adminCustomerApprovalTemplate({
      customerName: quote?.name ?? 'Customer',
      status: newStatus,
      comments: comments?.trim() || null,
    });
    await sendEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAIL || 'info@signatureluxeevents.com',
      subject: adminTemplate.subject,
      html: adminTemplate.html,
    });
  }

  return NextResponse.json({ ok: true });
}
