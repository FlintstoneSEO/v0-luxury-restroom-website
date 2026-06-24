import type { QuoteRequestRow } from '@/lib/quotes/types';
import { buildAgreementMergeFields, toDropboxSignCustomFields } from '@/lib/agreements/merge-fields';

function getConfig() {
  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  const clientId = process.env.DROPBOX_SIGN_CLIENT_ID;
  const templateId = process.env.DROPBOX_SIGN_TEMPLATE_ID;
  if (!apiKey || !clientId || !templateId) throw new Error('Missing Dropbox Sign configuration');
  return { apiKey, clientId, templateId, testMode: process.env.DROPBOX_SIGN_TEST_MODE !== 'false' };
}

export async function sendDropboxSignAgreement(quote: QuoteRequestRow) {
  const { apiKey, clientId, templateId, testMode } = getConfig();
  const payload = {
    template_ids: [templateId],
    client_id: clientId,
    subject: `Signature Luxe rental agreement for ${quote.event_date}`,
    message: 'Please review and sign your Signature Luxe Events & Amenities rental agreement.',
    signers: [{ role: 'Customer', name: quote.customer_name, email_address: quote.email }],
    custom_fields: toDropboxSignCustomFields(buildAgreementMergeFields(quote)),
    metadata: { quote_id: quote.id },
    test_mode: testMode ? 1 : 0,
  };

  const response = await fetch('https://api.hellosign.com/v3/signature_request/send_with_template', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[dropbox-sign] create signature request failed', { status: response.status, error: body?.error?.error_name ?? body?.error_msg });
    throw new Error('Failed to create Dropbox Sign agreement');
  }
  const request = body.signature_request ?? body;
  const signature = request.signatures?.[0];
  return {
    signatureRequestId: request.signature_request_id as string,
    signatureId: signature?.signature_id as string | undefined,
    signingUrl: signature?.signing_url as string | undefined,
  };
}

export function verifyDropboxSignWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.DROPBOX_SIGN_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const crypto = require('node:crypto') as typeof import('node:crypto');
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
