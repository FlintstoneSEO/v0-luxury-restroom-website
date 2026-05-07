import { createClient } from '@/lib/supabase/server';
import QuoteRequestsDashboard from '@/components/admin/quote-requests-dashboard';

export const metadata = {
  title: 'Quote Requests | Admin | Signature Luxe',
  description: 'View and manage quote requests for Signature Luxe Events & Amenities',
};

export interface AdminQuoteRequestRow {
  id: string;
  status: string | null;
  customer_name: string | null;
  event_date: string | null;
  event_type: string | null;
  event_address: string | null;
  city: string | null;
  state: string | null;
  guest_count: number | null;
  total_price: number | null;
  created_at: string;
}

export default async function AdminQuoteRequestsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quote_requests')
    .select('id,status,customer_name,event_date,event_type,event_address,city,state,guest_count,total_price,created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <div className="min-h-screen bg-[#ded2c4]/20 py-12 px-4">
        <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-serif font-bold text-[#2d3a47]">Quote Requests</h1>
          <p className="mt-3 text-red-700">Unable to load quote requests right now. Please try again shortly.</p>
        </div>
      </div>
    );
  }

  return <QuoteRequestsDashboard initialQuotes={(data ?? []) as AdminQuoteRequestRow[]} />;
}
