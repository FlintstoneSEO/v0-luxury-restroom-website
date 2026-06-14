import QuoteRequestsDashboard from '@/components/admin/quote-requests-dashboard';
import { getQuoteRequests } from '@/lib/quotes/getQuoteRequests';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Quote Requests | Admin | Signature Luxe',
  description: 'View and manage quote requests for Signature Luxe Events & Amenities',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminQuoteRequestsPage() {
  const { quotes, source, error } = await getQuoteRequests();

  return <QuoteRequestsDashboard initialQuotes={quotes} source={source} error={error} />;
}
