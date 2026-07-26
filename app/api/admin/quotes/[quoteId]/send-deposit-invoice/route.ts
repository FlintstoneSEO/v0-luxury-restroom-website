import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSquareDepositInvoice } from '@/lib/integrations/square';
import type { QuoteRequestRow } from '@/lib/quotes/types';

export async function POST(_request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;
  const { quoteId } = await params;
  try {
    const supabase = createAdminClient();
    const { data: quote, error } = await supabase.from('quote_requests').select('*').eq('id', quoteId).single();
    if (error || !quote) return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    if (quote.agreement_status !== 'signed') return NextResponse.json({ message: 'Agreement must be signed before sending a deposit invoice' }, { status: 409 });
    if (quote.deposit_status === 'paid') return NextResponse.json({ message: 'Deposit is already paid' }, { status: 409 });

    const invoice = await createSquareDepositInvoice(quote as QuoteRequestRow);
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase.from('quote_requests').update({
      square_customer_id: invoice.customerId,
      square_deposit_invoice_id: invoice.invoiceId,
      square_deposit_invoice_url: invoice.publicUrl ?? null,
      deposit_payment_link: invoice.publicUrl ?? null,
      deposit_status: 'invoice_sent',
      status: 'deposit_pending',
      updated_at: now,
    }).eq('id', quoteId).select('*').single();
    if (updateError) throw updateError;
    return NextResponse.json({ quote: updated, invoice_id: invoice.invoiceId, invoice_url: invoice.publicUrl });
  } catch (error) {
    console.error('[admin/quotes/send-deposit-invoice] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'Failed to send deposit invoice' }, { status: 500 });
  }
}
