import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDropboxSignAgreement } from '@/lib/integrations/dropbox-sign';
import type { QuoteRequestRow } from '@/lib/quotes/types';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { data: quote, error } = await supabase.from('quote_requests').select('*').eq('id', id).single();
    if (error || !quote) return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    if (quote.agreement_status === 'signed') return NextResponse.json({ message: 'Agreement is already signed' }, { status: 409 });

    const result = await sendDropboxSignAgreement(quote as QuoteRequestRow);
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase.from('quote_requests').update({
      agreement_status: 'sent',
      status: 'agreement_sent',
      agreement_sent_at: now,
      dropbox_sign_request_id: result.signatureRequestId,
      dropbox_sign_signature_id: result.signatureId ?? null,
      agreement_provider_reference_id: result.signatureRequestId,
      agreement_document_url: result.signingUrl ?? null,
      updated_at: now,
    }).eq('id', id).select('*').single();
    if (updateError) throw updateError;
    return NextResponse.json({ quote: updated, signature_request_id: result.signatureRequestId });
  } catch (error) {
    console.error('[admin/quotes/send-agreement] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ message: 'Failed to send agreement' }, { status: 500 });
  }
}
