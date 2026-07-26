import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getInvoicePaidAmount, verifySquareWebhook } from '@/lib/integrations/square';
import { getAdminAppOrigin } from '@/lib/app-origins';

function findQuoteId(invoice: any) {
  const customField = invoice?.custom_fields?.find((field: any) => field.label === 'quote_id')?.value;
  if (customField) return customField;
  const match = String(invoice?.description ?? '').match(/quote_id:([0-9a-f-]+)/i);
  return match?.[1];
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const notificationUrl = `${getAdminAppOrigin(request)}/api/webhooks/square`;
  if (!verifySquareWebhook(rawBody, request.headers.get('x-square-hmacsha256-signature'), notificationUrl)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody || '{}');
    const eventType = payload.type;
    const invoice = payload.data?.object?.invoice ?? payload.invoice;
    const isPaid = eventType === 'invoice.payment_made' || eventType === 'invoice.paid' || invoice?.status === 'PAID';
    if (!isPaid) return NextResponse.json({ received: true });

    const quoteId = findQuoteId(invoice);
    const invoiceId = invoice?.id;
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const paidAmount = getInvoicePaidAmount(invoice);
    let query = supabase.from('quote_requests').update({
      deposit_status: 'paid',
      status: 'confirmed',
      deposit_paid_at: now,
      ...(paidAmount !== undefined ? { deposit_paid_amount: paidAmount } : {}),
      deposit_transaction_reference: invoiceId ?? null,
      updated_at: now,
    });
    query = quoteId ? query.eq('id', quoteId) : query.eq('square_deposit_invoice_id', invoiceId);
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhooks/square] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}
