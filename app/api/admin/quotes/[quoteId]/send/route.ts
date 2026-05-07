import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateApprovalToken, hashApprovalToken } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { quoteSentTemplate } from '@/lib/email/templates';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;
  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from('quote_requests')
    .select('id, name, email, address, city, state, zip, room_type, total_price, final_price, status')
    .eq('id', quoteId)
    .single();

  if (error || !quote) {
    return NextResponse.json(
      { ok: false, message: 'Quote not found' },
      { status: 404 }
    );
  }

  if (quote.status !== 'new' && quote.status !== 'under_review' && quote.status !== 'quote_sent') {
    return NextResponse.json(
      { ok: false, message: 'Quote cannot be sent in current status.' },
      { status: 400 }
    );
  }

  const token = generateApprovalToken();
  const tokenHash = hashApprovalToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString();
  const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL || ''}/quote/${token}`;

  const tmpl = quoteSentTemplate({
    customerName: quote.name || 'Customer',
    address: quote.address || '',
    quoteAmount: quote.final_price || quote.total_price || 0,
    approvalLink,
  });

  const sendResult = await sendEmail({
    to: quote.email,
    subject: tmpl.subject,
    html: tmpl.html,
  });

  if (!sendResult.sent) {
    return NextResponse.json(
      { ok: false, message: `Email send failed: ${sendResult.error || 'unknown error'}` },
      { status: 400 }
    );
  }

  // Store the approval token and update quote status
  const { error: tokenError } = await supabase.from('quote_approval_tokens').insert({
    quote_request_id: quote.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (tokenError) {
    return NextResponse.json(
      { ok: false, message: 'Failed to create approval token' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from('quote_requests')
    .update({
      status: 'quote_sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', quote.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: 'Failed to update quote status' },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
