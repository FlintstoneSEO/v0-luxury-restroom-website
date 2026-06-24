import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyDropboxSignWebhook } from '@/lib/integrations/dropbox-sign';

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyDropboxSignWebhook(rawBody, request.headers.get('Dropbox-Signature') ?? request.headers.get('X-Dropbox-Signature'))) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') ?? '';
    let payload: any;
    if (contentType.includes('application/x-www-form-urlencoded') || rawBody.startsWith('json=')) {
      const form = new URLSearchParams(rawBody);
      payload = JSON.parse(form.get('json') ?? '{}');
    } else {
      payload = JSON.parse(rawBody || '{}');
    }

    const eventType = payload.event?.event_type;
    const requestData = payload.signature_request ?? payload.data?.object ?? payload;
    const quoteId = requestData.metadata?.quote_id;
    if (!quoteId) return NextResponse.json({ received: true });

    if (eventType === 'signature_request_signed' || eventType === 'signature_request_all_signed' || requestData.is_complete) {
      const now = new Date().toISOString();
      const signedUrl = requestData.files_url ?? requestData.final_copy_uri ?? null;
      const { error } = await createAdminClient().from('quote_requests').update({
        agreement_status: 'signed',
        status: 'agreement_signed',
        agreement_signed_at: now,
        signed_agreement_url: signedUrl,
        signed_document_url: signedUrl,
        updated_at: now,
      }).eq('id', quoteId);
      if (error) throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhooks/dropbox-sign] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}
