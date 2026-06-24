import { NextResponse } from 'next/server'

import { createSquareDepositInvoice } from '@/lib/integrations/square'
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
      console.error('Quote lookup failed before sending deposit invoice', { quoteId: id, error })
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.agreement_status !== 'signed') {
      return NextResponse.json({ error: 'Agreement must be signed before sending a deposit invoice' }, { status: 409 })
    }

    if (quote.deposit_status === 'paid') {
      return NextResponse.json({ error: 'Deposit is already paid' }, { status: 409 })
    }

    const invoice = await createSquareDepositInvoice(quote as QuoteRequest)
    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        square_customer_id: invoice.customerId,
        square_deposit_invoice_id: invoice.invoiceId,
        square_deposit_invoice_url: invoice.invoiceUrl,
        deposit_status: 'invoice_sent',
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update quote after sending Square invoice', { quoteId: id, error: updateError })
      return NextResponse.json({ error: 'Invoice sent, but quote update failed' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Deposit invoice sent',
      invoiceId: invoice.invoiceId,
      invoiceUrl: invoice.invoiceUrl,
    })
  } catch (error) {
    console.error('Send deposit invoice failed', { quoteId: id, error })
    return NextResponse.json({ error: 'Unable to send deposit invoice' }, { status: 500 })
  }
}
