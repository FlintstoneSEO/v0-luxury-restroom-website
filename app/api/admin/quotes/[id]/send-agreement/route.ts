import { NextResponse } from 'next/server'

import { sendDropboxSignAgreement } from '@/lib/integrations/dropbox-sign'
import { createAdminClient } from '@/lib/supabase/admin'
import type { QuoteRequest } from '@/lib/types/quote'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const supabase = createAdminClient()
    const { data: quote, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !quote) {
      console.error('Quote lookup failed before sending agreement', { quoteId: id, error })
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.agreement_status === 'signed') {
      return NextResponse.json({ error: 'Agreement is already signed' }, { status: 409 })
    }

    const agreement = await sendDropboxSignAgreement(quote as QuoteRequest)
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        dropbox_sign_request_id: agreement.signatureRequestId,
        dropbox_sign_signature_id: agreement.signatureId,
        agreement_status: 'sent',
        agreement_sent_at: now,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update quote after sending agreement', { quoteId: id, error: updateError })
      return NextResponse.json({ error: 'Agreement sent, but quote update failed' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Agreement sent',
      signatureRequestId: agreement.signatureRequestId,
    })
  } catch (error) {
    console.error('Send agreement failed', { quoteId: id, error })
    return NextResponse.json({ error: 'Unable to send agreement' }, { status: 500 })
  }
}
