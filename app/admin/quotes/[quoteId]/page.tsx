import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuoteDetailEditor from '@/components/admin/quote-detail-editor';
import { mapQuoteRequestRow, QuoteRequestRow } from '@/lib/quotes/types';

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const supabase = await createClient();

  const { data: quote, error } = await supabase.from('quote_requests').select('*').eq('id', quoteId).single();

  if (error || !quote) notFound();

  return <QuoteDetailEditor quote={mapQuoteRequestRow(quote as QuoteRequestRow)} />;
}
