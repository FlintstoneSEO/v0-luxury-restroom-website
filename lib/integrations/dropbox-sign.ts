import crypto from 'crypto'

import type { QuoteRequest } from '@/lib/types/quote'
import {
  buildAgreementMergeFields,
  toDropboxSignCustomFields,
} from '@/lib/agreements/merge-fields'

type DropboxSignResponse = {
  signature_request?: {
    signature_request_id?: string
    signatures?: Array<{
      signature_id?: string
      signer_email_address?: string
    }>
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

export async function sendDropboxSignAgreement(quote: QuoteRequest) {
  const apiKey = requireEnv('DROPBOX_SIGN_API_KEY')
  const templateId = requireEnv('DROPBOX_SIGN_TEMPLATE_ID')
  const clientId = process.env.DROPBOX_SIGN_CLIENT_ID
  const testMode = process.env.DROPBOX_SIGN_TEST_MODE !== 'false'

  const body = {
    template_ids: [templateId],
    subject: `Rental Agreement for ${quote.quote_number}`,
    message: `Please review and sign your Signature Luxe rental agreement for ${quote.event_date}.`,
    signers: [
      {
        role: 'Customer',
        name: quote.customer_name,
        email_address: quote.email,
      },
    ],
    custom_fields: toDropboxSignCustomFields(buildAgreementMergeFields(quote)),
    metadata: {
      quote_id: quote.id,
      quote_number: quote.quote_number,
    },
    test_mode: testMode ? 1 : 0,
    ...(clientId ? { client_id: clientId } : {}),
  }

  const response = await fetch('https://api.hellosign.com/v3/signature_request/send_with_template', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Dropbox Sign agreement send failed', {
      quoteId: quote.id,
      status: response.status,
      body: errorBody.slice(0, 500),
    })
    throw new Error('Unable to send agreement')
  }

  const data = (await response.json()) as DropboxSignResponse
  const signatureRequest = data.signature_request
  const signature = signatureRequest?.signatures?.[0]

  if (!signatureRequest?.signature_request_id) {
    console.error('Dropbox Sign response missing signature_request_id', { quoteId: quote.id })
    throw new Error('Dropbox Sign response was incomplete')
  }

  return {
    signatureRequestId: signatureRequest.signature_request_id,
    signatureId: signature?.signature_id ?? null,
  }
}

export function verifyDropboxSignWebhook(rawBody: string, payload: unknown, signatureHeader?: string | null) {
  const secret = process.env.DROPBOX_SIGN_WEBHOOK_SECRET
  if (!secret) {
    console.error('DROPBOX_SIGN_WEBHOOK_SECRET is not configured')
    return false
  }

  if (signatureHeader) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (safeEqual(expected, signatureHeader)) {
      return true
    }
  }

  const parsed = payload as {
    event?: {
      event_hash?: string
      event_time?: string
      event_type?: string
    }
  }

  const legacyHash = parsed.event?.event_hash
  const eventTime = parsed.event?.event_time
  const eventType = parsed.event?.event_type

  if (legacyHash && eventTime && eventType) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${eventTime}${eventType}`)
      .digest('hex')

    if (safeEqual(expected, legacyHash)) {
      return true
    }
  }

  const rawBodyHash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  const rawBodySignature = (payload as { signature?: string }).signature

  return rawBodySignature ? safeEqual(rawBodyHash, rawBodySignature) : false
}
