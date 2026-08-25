import QuoteRequestsDashboard from '@/components/admin/quote-requests-dashboard';
import { getQuoteRequests } from '@/lib/quotes/getQuoteRequests';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAvailabilityBlocksInRange } from '@/lib/availability-blocks/server';
import { addDaysToDateOnly, getLocalTodayDateOnly } from '@/lib/date-only';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Quote Requests',
  description: 'View and manage quote requests for Signature Luxe Events & Amenities',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminQuoteRequestsPage() {
  const today = getLocalTodayDateOnly();
  const loadBlocks = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
    return getAvailabilityBlocksInRange(createAdminClient(), today, addDaysToDateOnly(today, 730));
  };
  const [{ quotes, source, error }, blocksResult] = await Promise.all([
    getQuoteRequests(),
    loadBlocks()
      .then((blocks) => ({ blocks, error: undefined as string | undefined }))
      .catch((blockError: Error) => ({ blocks: [], error: `Availability blocks could not be loaded: ${blockError.message}` })),
  ]);

  return <QuoteRequestsDashboard initialQuotes={quotes} initialBlocks={blocksResult.blocks} source={source} error={[error, blocksResult.error].filter(Boolean).join(' ') || undefined} />;
}
