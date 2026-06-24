import { NextResponse } from 'next/server'

import { verifyDropboxSignWebhook } from '@/lib/integrations/dropbox-sign'
import { createAdminClient } from '@/lib/supabase/admin'

type DropboxSignWebhookPayload = {
  event?: {
    event_type?: string
  }
  signature_request?: {
    signature_request_id?: string
    metadata?: {
      quote_id?: string
    }
    signatures?: Array<{
      signature_id?: string
      signed_at?: number
      status_code?: string
    }>
    files_url?: string
    signing_url?: string
  }
}

function parseDropboxPayload(rawBody: string) {
  try {
    return JSON.parse(rawBody) as DropboxSignWebhookPayload
  } catch {
    const params = new URLSearchParams(rawBody)
    const json = params.get('json')
    return json ? (JSON.parse(json) as DropboxSignWebhookPayload) : null
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const payload = parseDropboxPayload(rawBody)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const signature = request.headers.get('dropbox-signature') ?? request.headers.get('x-dropbox-signature')

  if (!verifyDropboxSignWebhook(rawBody, payload, signature)) {
    console.error('Dropbox Sign webhook verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const eventType = payload.event?.event_type
  const quoteId = payload.signature_request?.metadata?.quote_id
  const signatureRequestId = payload.signature_request?.signature_request_id

  if (!quoteId && !signatureRequestId) {
    return NextResponse.json({ message: 'No quote mapping found' })
  }

  if (eventType !== 'signature_request_signed' && eventType !== 'signature_request_all_signed') {
    return NextResponse.json({ message: 'Event ignored' })
  }

  const signedAtUnix = payload.signature_request?.signatures?.find((signature) => signature.signed_at)?.signed_at
  const signedAt = signedAtUnix ? new Date(signedAtUnix * 1000).toISOString() : new Date().toISOString()

  const supabase = createAdminClient()
  const query = supabase
    .from('quote_requests')
    .update({
      agreement_status: 'signed',
      agreement_signed_at: signedAt,
      signed_agreement_url: payload.signature_request?.files_url ?? null,
    })

  const { error } = quoteId
    ? await query.eq('id', quoteId)
    : await query.eq('dropbox_sign_request_id', signatureRequestId)

  if (error) {
    console.error('Failed to update quote from Dropbox Sign webhook', { quoteId, signatureRequestId, error })
    return NextResponse.json({ error: 'Quote update failed' }, { status: 500 })
  }

  return new Response('Hello API Event Received', { status: 200 })
}
