import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApprovalToken, hashApprovalToken } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { quoteSentTemplate } from '@/lib/email/templates';

export async function POST(_request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const supabase = createAdminClient();

  const { data: quote, error } = await supabase
    .from('quote_requests')
    .select('id,quote_number,customer_name,email,event_date,event_type,total_price,deposit_amount,status')
    .eq('id', quoteId)
    .single();

  if (error || !quote) return NextResponse.json({ ok: false, message: 'Quote not found' }, { status: 404 });

  const token = generateApprovalToken();
  const tokenHash = hashApprovalToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString();
  const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL || ''}/quote/${token}`;

  const tmpl = quoteSentTemplate({
    customerName: quote.customer_name || 'Customer',
    eventDate: quote.event_date || 'TBD',
    eventType: quote.event_type || 'Event',
    total: Number(quote.total_price || 0),
    deposit: Number(quote.deposit_amount || 0),
    approvalLink,
    quoteNumber: quote.quote_number || undefined,
  });

  const sendResult = await sendEmail({ to: quote.email, subject: tmpl.subject, html: tmpl.html });
  if (!sendResult.sent) {
    return NextResponse.json({ ok: false, message: `Email send failed: ${sendResult.error || 'unknown error'}` }, { status: 400 });
  }

  await supabase.from('quote_approval_tokens').insert({ quote_request_id: quote.id, token_hash: tokenHash, expires_at: expiresAt });
  await supabase.from('quote_requests').update({ status: 'proposal_sent', updated_at: new Date().toISOString() }).eq('id', quote.id);

  return NextResponse.json({ ok: true });
}
