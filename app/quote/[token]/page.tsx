import { createAdminClient } from '@/lib/supabase/admin';
import { hashApprovalToken, isTokenExpired } from '@/lib/quote-approval';
import QuoteApprovalClient from './quote-approval-client';

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

  // Hash the token to look it up
  const tokenHash = hashApprovalToken(token);

  const supabase = createAdminClient();

  // Find the approval token
  const { data: tokenRecord, error: tokenError } = await supabase
    .from('quote_approval_tokens')
    .select('quote_request_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !tokenRecord) {
    return (
      <QuoteLinkError
        title="Invalid Quote Link"
        message="This quote link is invalid or could not be verified. Please check the link or contact us for assistance."
      />
    );
  }

  // Check if token is expired
  if (isTokenExpired(tokenRecord.expires_at)) {
    return (
      <QuoteLinkError
        title="Expired Quote Link"
        message="This quote link has expired. Please contact us to request a new quote."
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
      created_at
    `)
    .eq('id', tokenRecord.quote_request_id)
    .single();

  if (quoteError || !quote) {
    return (
      <QuoteLinkError
        title="Quote Not Found"
        message="We could not find the quote associated with this link. Please contact us for assistance."
      />
    );
  }

  // Check if already responded
  const alreadyResponded = tokenRecord.used_at !== null;

  return (
    <QuoteApprovalClient
      quote={quote}
      token={token}
      alreadyResponded={alreadyResponded}
    />
  );
}

function QuoteLinkError({ title, message }: { title: string; message: string }) {
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
          href="/"
          className="inline-block bg-[#2d3a47] text-white px-6 py-3 rounded-md hover:bg-[#2d3a47]/90 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
