import { createAdminClient } from '@/lib/supabase/admin';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import QuoteApprovalClient from './quote-approval-client';
import { getPublicSiteOrigin } from '@/lib/app-origins';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Quote Review | Signature Luxe Events & Amenities',
  robots: {
    index: false,
    follow: false,
  },
};

interface QuoteApprovalPageProps {
  params: Promise<{ token: string }>;
}

export default async function QuoteApprovalPage({ params }: QuoteApprovalPageProps) {
  const { token } = await params;
  const publicSiteOrigin = getPublicSiteOrigin();

  // Hash the token to look it up
  const tokenHash = hashApprovalToken(token);

  const supabase = createAdminClient();

  // Find the approval token
  const { data: tokenRecord, error: tokenError } = await supabase
    .from('quote_approval_tokens')
    .select('id, quote_request_id, expires_at, used_at, first_viewed_at, last_viewed_at, view_count')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !tokenRecord) {
    return (
      <QuoteLinkError
        title="Invalid Quote Link"
        message="This quote link is invalid or could not be verified. Please check the link or contact us for assistance."
        homeHref={publicSiteOrigin}
      />
    );
  }

  // Check if token is expired
  if (isTokenExpired(tokenRecord.expires_at)) {
    return (
      <QuoteLinkError
        title="Expired Quote Link"
        message="This quote link has expired. Please contact us to request a new quote."
        homeHref={publicSiteOrigin}
      />
    );
  }

  // Fetch the quote
  const { data: quote, error: quoteError } = await supabase
    .from('quote_requests')
    .select(`
      id,
      quote_number,
      customer_name,
      email,
      event_date,
      event_type,
      event_address,
      city,
      state,
      zip_code,
      guest_count,
      event_start_time,
      event_end_time,
      has_power,
      has_water,
      base_price,
      travel_fee,
      utility_fee,
      after_hours_fee,
      cleaning_fee,
      damage_waiver_fee,
      rush_booking_fee,
      subtotal,
      total_price,
      discount_amount,
      deposit_amount,
      final_balance,
      customer_notes,
      status,
      selected_quote_option_id,
      quote_viewed_at,
      quote_view_count,
      created_at,
      is_test_quote
    `)
    .eq('id', tokenRecord.quote_request_id)
    .single();

  if (quoteError || !quote) {
    return (
      <QuoteLinkError
        title="Quote Not Found"
        message="We could not find the quote associated with this link. Please contact us for assistance."
        homeHref={publicSiteOrigin}
      />
    );
  }

  const now = new Date().toISOString();

  await supabase
    .from('quote_approval_tokens')
    .update({
      first_viewed_at: tokenRecord.first_viewed_at ?? now,
      last_viewed_at: now,
      view_count: (tokenRecord.view_count ?? 0) + 1,
    })
    .eq('id', tokenRecord.id);

  await supabase
    .from('quote_requests')
    .update({
      quote_viewed_at: quote.quote_viewed_at ?? now,
      quote_view_count: (quote.quote_view_count ?? 0) + 1,
    })
    .eq('id', tokenRecord.quote_request_id);

  await supabase
    .from('quote_link_events')
    .insert({
      quote_request_id: tokenRecord.quote_request_id,
      token_id: tokenRecord.id,
      event_type: 'quote_link_opened',
    });

  const { data: options } = await supabase
    .from('quote_options')
    .select('*')
    .eq('quote_request_id', quote.id)
    .neq('status', 'deleted')
    .order('is_recommended', { ascending: false })
    .order('created_at', { ascending: true });

  const publicQuote = { ...quote };
  delete publicQuote.quote_viewed_at;
  delete publicQuote.quote_view_count;

  // Check if already responded
  const alreadyResponded = tokenRecord.used_at !== null;

  return (
    <QuoteApprovalClient
      quote={publicQuote}
      token={token}
      alreadyResponded={alreadyResponded}
      options={options ?? []}
      publicSiteOrigin={publicSiteOrigin}
    />
  );
}

function QuoteLinkError({
  title,
  message,
  homeHref,
}: {
  title: string;
  message: string;
  homeHref: string;
}) {
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center border border-[#d8c7a3]/40">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#d8c7a3]/20 text-[#2d3a47]">
          <span className="font-serif text-2xl" aria-hidden="true">
            SL
          </span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#2d3a47] mb-4">{title}</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <a
          href={homeHref}
          className="inline-block bg-[#2d3a47] text-white px-6 py-3 rounded-md hover:bg-[#2d3a47]/90 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
