import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteAgreementUpdateSchema } from '@/lib/quotes/schema';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;
  const payload = await request.json();

  // Validate the update schema
  const validation = quoteAgreementUpdateSchema.safeParse({
    id: quoteId,
    ...payload,
  });

  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid update payload', details: validation.error.errors },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    agreement_status: payload.agreement_status,
  };

  if ('agreement_document_url' in payload) {
    updateData.agreement_document_url = payload.agreement_document_url;
  }
  if ('agreement_provider_reference_id' in payload) {
    updateData.agreement_provider_reference_id = payload.agreement_provider_reference_id;
  }
  if ('agreement_sent_at' in payload) {
    updateData.agreement_sent_at = payload.agreement_sent_at;
  }
  if ('agreement_signed_at' in payload) {
    updateData.agreement_signed_at = payload.agreement_signed_at;
  }

  const { data, error } = await supabase
    .from('quote_requests')
    .update(updateData)
    .eq('id', quoteId)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, quote: data });
}
