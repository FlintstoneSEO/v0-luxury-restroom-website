import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const payload = await request.json();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('quote_requests')
    .update(payload)
    .eq('id', quoteId)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, quote: data });
}
