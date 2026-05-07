import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { adminCustomerApprovalTemplate } from '@/lib/email/templates';

export async function POST(request: Request) {
  const { token, decision, comments } = await request.json();
  const tokenHash = hashApprovalToken(token);
  const supabase = createAdminClient();

  const { data: tokenRecord } = await supabase
    .from('quote_approval_tokens')
    .select('id, quote_request_id, expires_at, used_at, quote_requests(customer_name,quote_number)')
    .eq('token_hash', tokenHash)
    .single();

  if (!tokenRecord || tokenRecord.used_at || isTokenExpired(tokenRecord.expires_at)) {
    return NextResponse.json({ ok: false, message: 'This quote approval link is invalid or expired.' }, { status: 400 });
  }

  if ((decision === 'request_changes' || decision === 'decline') && (!comments || comments.trim().length < 3)) {
    return NextResponse.json({ ok: false, message: 'Please include comments for this response.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const status = decision === 'approve' ? 'customer_approved' : decision === 'request_changes' ? 'changes_requested' : 'customer_declined';

  const { error } = await supabase
    .from('quote_requests')
    .update({
      status,
      customer_response: comments?.trim() || null,
      customer_response_type: decision,
      customer_response_at: now,
      approved_at: decision === 'approve' ? now : null,
      agreement_status: decision === 'approve' ? 'ready_to_send' : undefined,
      updated_at: now,
    })
    .eq('id', tokenRecord.quote_request_id);

  if (error) return NextResponse.json({ ok: false, message: 'Unable to save your response.' }, { status: 400 });

  await supabase.from('quote_approval_tokens').update({ used_at: now }).eq('id', tokenRecord.id);

  if (decision === 'approve' || decision === 'request_changes') {
    const adminTemplate = adminCustomerApprovalTemplate({
      quoteNumber: (tokenRecord as any).quote_requests?.quote_number ?? undefined,
      customerName: (tokenRecord as any).quote_requests?.customer_name ?? 'Customer',
      status,
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
