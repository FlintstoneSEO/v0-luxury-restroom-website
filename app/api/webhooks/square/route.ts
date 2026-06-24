import { NextResponse } from 'next/server'

import { verifySquareWebhook } from '@/lib/integrations/square'
import { createAdminClient } from '@/lib/supabase/admin'

type SquareWebhookPayload = {
  type?: string
  data?: {
    object?: {
      invoice?: {
        id?: string
        status?: string
        public_url?: string
      }
      payment?: {
        status?: string
        invoice_id?: string
      }
    }
  }
}

function getNotificationUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
  if (configuredUrl) {
    return `${configuredUrl.replace(/\/$/, '')}/api/webhooks/square`
  }

  return request.url
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-square-hmacsha256-signature')

  if (!verifySquareWebhook(rawBody, signature, getNotificationUrl(request))) {
    console.error('Square webhook verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: SquareWebhookPayload
  try {
    payload = JSON.parse(rawBody) as SquareWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const invoice = payload.data?.object?.invoice
  const payment = payload.data?.object?.payment
  const invoiceId = invoice?.id ?? payment?.invoice_id
  const invoicePaid = invoice?.status === 'PAID'
  const paymentCompleted = payment?.status === 'COMPLETED'

  if (!invoiceId || (!invoicePaid && !paymentCompleted)) {
    return NextResponse.json({ message: 'Event ignored' })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('quote_requests')
    .update({
      deposit_status: 'paid',
      status: 'confirmed',
      deposit_paid_at: new Date().toISOString(),
    })
    .eq('square_deposit_invoice_id', invoiceId)

  if (error) {
    console.error('Failed to update quote from Square webhook', { invoiceId, error })
    return NextResponse.json({ error: 'Quote update failed' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Deposit marked paid' })
}
