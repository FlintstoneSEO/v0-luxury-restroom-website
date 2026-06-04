import { createAdminClient } from '@/lib/supabase/admin';
import { mockQuoteRequests } from '@/lib/quotes/mockQuotes';
import { mapQuoteRequestRow, QuoteOption, QuoteRequest, QuoteRequestRow } from '@/lib/quotes/types';

export interface GetQuoteRequestsResult {
  quotes: QuoteRequest[];
  source: 'supabase' | 'mock';
  error?: string;
}

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getQuoteRequests(): Promise<GetQuoteRequestsResult> {
  if (!hasSupabaseEnv()) {
    return {
      quotes: mockQuoteRequests,
      source: 'mock',
      error: 'Supabase admin environment variables are not configured. Using mock quote data.',
    };
  }

  try {
    const supabase = createAdminClient();
    const { data: quoteRows, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (quoteError) {
      return {
        quotes: mockQuoteRequests,
        source: 'mock',
        error: `Supabase quote_requests query failed: ${quoteError.message}`,
      };
    }

    const quoteIds = (quoteRows ?? []).map((quote) => quote.id);
    let optionRows: QuoteOption[] = [];
    let optionWarning: string | undefined;

    if (quoteIds.length > 0) {
      const { data: fetchedOptionRows, error: optionError } = await supabase
        .from('quote_options')
        .select(`
          id,
          quote_request_id,
          option_label,
          option_description,
          status,
          total_price,
          is_recommended,
          created_at,
          updated_at
        `)
        .in('quote_request_id', quoteIds);

      if (optionError) {
        optionWarning = `Supabase quote_options query failed: ${optionError.message}`;
      } else {
        optionRows = (fetchedOptionRows ?? []) as QuoteOption[];
      }
    }

    const optionsByQuoteId = new Map<string, QuoteOption[]>();

    for (const option of optionRows) {
      const existing = optionsByQuoteId.get(option.quote_request_id) ?? [];
      existing.push(option);
      optionsByQuoteId.set(option.quote_request_id, existing);
    }

    const rowsWithOptions = ((quoteRows ?? []) as QuoteRequestRow[]).map((quote) => ({
      ...quote,
      quote_options: optionsByQuoteId.get(quote.id) ?? [],
    }));

    const quotes = rowsWithOptions.map(mapQuoteRequestRow);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[getQuoteRequests] counts', {
        quoteRows: quoteRows?.length ?? 0,
        optionRows: optionRows?.length ?? 0,
        mappedQuotes: quotes.length,
      });
    }

    return {
      quotes,
      source: 'supabase',
      error: optionWarning,
    };
  } catch (error) {
    return {
      quotes: mockQuoteRequests,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error fetching quote requests.',
    };
  }
}
