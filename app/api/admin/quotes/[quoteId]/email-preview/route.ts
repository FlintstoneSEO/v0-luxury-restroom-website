import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteSentTemplate } from '@/lib/email/templates';
import { formatLocalDateOnly } from '@/lib/date-only';
import { getCustomerWorkflowOrigin } from '@/lib/app-origins';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;

  try {
    const supabase = createAdminClient();
    const customerWorkflowOrigin = getCustomerWorkflowOrigin(request);

    const { data: quote, error } = await supabase
      .from('quote_requests')
      .select(`
        id,
        quote_number,
        customer_name,
        email,
        customer_email,
        event_date,
        event_type,
        event_address,
        event_location,
        city,
        state,
        zip_code,
        guest_count,
        subtotal,
        pretax_total,
        tax_rate,
        sales_tax_amount,
        total_price,
        total,
        additional_notes
      `)
      .eq('id', quoteId)
      .single();

    if (error || !quote) {
      return NextResponse.json(
        { ok: false, message: 'Quote not found' },
        { status: 404 }
      );
    }

    const to = quote.email || quote.customer_email;
    if (!to) {
      return NextResponse.json(
        { ok: false, message: 'Quote is missing customer email (email/customer_email).' },
        { status: 400 }
      );
    }

    const eventLocation = [
      quote.event_address || quote.event_location,
      quote.city,
      quote.state && quote.zip_code ? `${quote.state} ${quote.zip_code}` : quote.state || quote.zip_code,
    ].filter(Boolean).join(', ');

    const formattedEventDate = quote.event_date
      ? formatLocalDateOnly(quote.event_date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'TBD';

    const { data: quoteOptions } = await supabase
      .from('quote_options')
      .select('id, option_label, option_description, subtotal, pretax_total, tax_rate, sales_tax_amount, total_price, is_recommended, status')
      .eq('quote_request_id', quote.id)
      .neq('status', 'deleted')
      .order('is_recommended', { ascending: false })
      .order('created_at', { ascending: true });

    const emailTemplate = quoteSentTemplate({
      customerName: quote.customer_name || 'Customer',
      eventDate: formattedEventDate,
      eventType: quote.event_type || 'TBD',
      guestCount: String(quote.guest_count ?? 'TBD'),
      eventLocation: eventLocation || 'TBD',
      quoteSubtotal: Number(quote.subtotal ?? quote.total_price ?? quote.total ?? 0),
      quotePretaxTotal: Number(quote.pretax_total ?? quote.total_price ?? quote.total ?? 0),
      quoteTaxRate: Number(quote.tax_rate ?? 0),
      quoteSalesTaxAmount: Number(quote.sales_tax_amount ?? 0),
      quoteTotal: quote.total_price ?? quote.total ?? 0,
      approvalLink: `${customerWorkflowOrigin}/quote/preview-token-not-active`,
      customerNotes: quote.additional_notes,
      quoteOptions: quoteOptions ?? [],
    });

    return NextResponse.json({
      ok: true,
      to,
      subject: `${emailTemplate.subject} - ${quote.quote_number || quote.id.slice(0, 8)}`,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
  } catch (error) {
    console.error('[email-preview] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
