import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import QuoteApprovalView from '@/components/quote/quote-approval-view';

export default async function QuoteApprovalPage({
  params,
}: {
  params: Promise<{ approvalToken: string }>;
}) {
  const { approvalToken } = await params;
  const tokenHash = hashApprovalToken(approvalToken);

  const supabase = await createClient();
  const { data: tokenRecord } = await supabase
    .from('quote_approval_tokens')
    .select('quote_request_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (!tokenRecord || tokenRecord.used_at || isTokenExpired(tokenRecord.expires_at)) {
    notFound();
  }

  const { data: quote } = await supabase
    .from('quote_requests')
    .select(
      'id, name, email, room_type, total_price, final_price, status, customer_response, customer_response_at'
    )
    .eq('id', tokenRecord.quote_request_id)
    .single();

  if (!quote) notFound();

  return <QuoteApprovalView token={approvalToken} quote={quote} />;
}
