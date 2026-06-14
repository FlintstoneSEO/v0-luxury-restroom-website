import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApprovalToken, hashApprovalToken } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { quoteSentTemplate } from '@/lib/email/templates';

function getAppUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');
  const origin = request.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  const host = request.headers.get('host');
  return host ? `${request.headers.get('x-forwarded-proto') || 'https'}://${host}`.replace(/\/$/, '') : '';
}

export async function POST(request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;
  const body = await request.json().catch(() => ({}));
  const testRecipientEmail = typeof body.test_recipient_email === 'string' ? body.test_recipient_email.trim() : '';

  if (!testRecipientEmail || !/^\S+@\S+\.\S+$/.test(testRecipientEmail)) {
    return NextResponse.json({ ok: false, message: 'A valid test_recipient_email is required.' }, { status: 400 });
  }

  const appUrl = getAppUrl(request);
  if (!appUrl) return NextResponse.json({ ok: false, message: 'Unable to determine app URL.' }, { status: 500 });

  const supabase = createAdminClient();
  let testQuoteId = quoteId;

  const { data: quote, error: quoteError } = await supabase.from('quote_requests').select('*').eq('id', quoteId).single();
  if (quoteError || !quote) return NextResponse.json({ ok: false, message: 'Quote not found.' }, { status: 404 });

  if (!quote.is_test_quote) {
    const cloneRes = await fetch(new URL('/api/admin/quotes/test', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
      body: JSON.stringify({ source_quote_id: quoteId, test_recipient_email: testRecipientEmail }),
    });
    const cloneBody = await cloneRes.json();
    if (!cloneRes.ok) return NextResponse.json(cloneBody, { status: cloneRes.status });
    testQuoteId = cloneBody.quote_id;
  } else if (quote.email !== testRecipientEmail) {
    await supabase.from('quote_requests').update({ email: testRecipientEmail, updated_at: new Date().toISOString() }).eq('id', testQuoteId);
  }

  const { data: testQuote, error: testQuoteError } = await supabase.from('quote_requests').select('*').eq('id', testQuoteId).single();
  if (testQuoteError || !testQuote?.is_test_quote) return NextResponse.json({ ok: false, message: 'Test quote not found.' }, { status: 404 });

  const token = generateApprovalToken();
  const tokenHash = hashApprovalToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString();
  const now = new Date().toISOString();

  const { data: tokenRecord, error: tokenError } = await supabase
    .from('quote_approval_tokens')
    .insert({ quote_request_id: testQuote.id, token_hash: tokenHash, expires_at: expiresAt })
    .select('id')
    .single();
  if (tokenError || !tokenRecord) return NextResponse.json({ ok: false, message: 'Failed to create approval token.' }, { status: 500 });

  const approvalLink = `${appUrl}/quote/${token}`;
  const eventLocation = [testQuote.event_address, testQuote.city, testQuote.state && testQuote.zip_code ? `${testQuote.state} ${testQuote.zip_code}` : testQuote.state || testQuote.zip_code].filter(Boolean).join(', ');
  const formattedEventDate = testQuote.event_date ? new Date(testQuote.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  const { data: quoteOptions } = await supabase.from('quote_options').select('id, option_label, option_description, total_price, is_recommended, status').eq('quote_request_id', testQuote.id).neq('status', 'deleted').order('is_recommended', { ascending: false }).order('created_at', { ascending: true });

  const emailTemplate = quoteSentTemplate({
    customerName: testQuote.customer_name || 'Test Customer',
    eventDate: formattedEventDate,
    eventType: testQuote.event_type || 'TBD',
    guestCount: String(testQuote.guest_count ?? 'TBD'),
    eventLocation: eventLocation || 'TBD',
    quoteTotal: testQuote.total_price ?? 0,
    approvalLink,
    customerNotes: `This is a test quote for internal testing only. ${testQuote.customer_notes || ''}`.trim(),
    quoteOptions: quoteOptions ?? [],
  });

  const sendResult = await sendEmail({
    to: testRecipientEmail,
    subject: `[TEST] ${emailTemplate.subject} - ${testQuote.quote_number || testQuote.id.slice(0, 8)}`,
    html: `<div style="border:2px solid #d97706;padding:12px;margin-bottom:16px;background:#fffbeb;"><strong>This is a test quote for internal testing only.</strong></div>${emailTemplate.html}`,
    text: `This is a test quote for internal testing only.\n\n${emailTemplate.text}`,
  });

  if (!sendResult.sent) return NextResponse.json({ ok: false, message: `Email send failed: ${sendResult.error || 'unknown error'}` }, { status: 400 });

  await supabase.from('quote_requests').update({ status: 'quote_sent', quote_sent_at: now, updated_at: now }).eq('id', testQuote.id);
  await supabase.from('quote_link_events').insert({ quote_request_id: testQuote.id, token_id: tokenRecord.id, event_type: 'quote_test_email_sent' });
  await supabase.from('quote_status_history').insert({ quote_request_id: testQuote.id, old_status: testQuote.status, new_status: 'quote_sent', changed_at: now, changed_by: 'admin', note: 'Test quote email sent to test recipient' });

  return NextResponse.json({ ok: true, quote_id: testQuote.id, approval_link: approvalLink });
}
