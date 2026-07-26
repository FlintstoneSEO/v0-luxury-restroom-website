import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuoteDetailEditor from '@/components/admin/quote-detail-editor';
import { mapQuoteRequestRow, QuoteRequestRow } from '@/lib/quotes/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Quote Detail',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const supabase = await createClient();

  const [{ data: quote, error }, { data: depositSetting }] = await Promise.all([
    supabase.from('quote_requests').select('*').eq('id', quoteId).single(),
    supabase.from('pricing_settings').select('setting_value').eq('setting_key', 'deposit_percentage').maybeSingle(),
  ]);

  if (error || !quote) notFound();

  const depositPercentage = Number(depositSetting?.setting_value);

  return (
    <QuoteDetailEditor
      quote={mapQuoteRequestRow(quote as QuoteRequestRow)}
      depositPercentage={Number.isFinite(depositPercentage) ? depositPercentage : undefined}
    />
  );
}
