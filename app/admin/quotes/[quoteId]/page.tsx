import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuoteDetailEditor from '@/components/admin/quote-detail-editor';
import { mapQuoteRequestRow, QuoteRequestRow } from '@/lib/quotes/types';
import type { CalendarQuote } from '@/components/admin/booking-calendar';

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

  const [{ data: quote, error }, { data: pricingSettings }] = await Promise.all([
    supabase.from('quote_requests').select('*').eq('id', quoteId).single(),
    supabase
      .from('pricing_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['deposit_percentage', 'sales_tax_percentage']),
  ]);

  if (error || !quote) notFound();

  const { data: sameDateRows } = await supabase
    .from('quote_requests')
    .select(
      'id, quote_number, event_date, status, is_test_quote, customer_name, event_type, city, state, total_price, created_at',
    )
    .eq('event_date', quote.event_date)
    .order('created_at', { ascending: true });

  const pricingByKey = Object.fromEntries(
    (pricingSettings ?? []).map((setting) => [setting.setting_key, Number(setting.setting_value)])
  );
  const depositPercentage = pricingByKey.deposit_percentage;
  const salesTaxPercentage = pricingByKey.sales_tax_percentage;

  return (
    <QuoteDetailEditor
      quote={mapQuoteRequestRow(quote as QuoteRequestRow)}
      sameDateQuotes={(sameDateRows ?? []) as CalendarQuote[]}
      depositPercentage={Number.isFinite(depositPercentage) ? depositPercentage : undefined}
      salesTaxPercentage={Number.isFinite(salesTaxPercentage) ? salesTaxPercentage : undefined}
    />
  );
}
