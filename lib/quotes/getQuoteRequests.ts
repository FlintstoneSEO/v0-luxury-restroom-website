import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { mockQuoteRequests } from '@/lib/quotes/mockQuotes';
import { mapQuoteRequestRow, QuoteRequest, QuoteRequestRow } from '@/lib/quotes/types';

export interface GetQuoteRequestsResult {
  quotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getQuoteRequests(): Promise<GetQuoteRequestsResult> {
  if (!hasSupabaseEnv()) {
    return {
      quotes: mockQuoteRequests,
      source: 'mock',
      error: 'Supabase environment variables are not configured. Using mock quote data.',
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        quotes: mockQuoteRequests,
        source: 'mock',
        error: `Supabase query failed: ${error.message}`,
      };
    }

    const quotes = ((data ?? []) as QuoteRequestRow[]).map(mapQuoteRequestRow);

    return {
      quotes,
      source: 'supabase',
    };
  } catch (error) {
    return {
      quotes: mockQuoteRequests,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error fetching quote requests.',
    };
  }
}
