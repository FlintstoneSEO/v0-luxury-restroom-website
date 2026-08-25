import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApprovalToken, hashApprovalToken } from '@/lib/quote-approval';
import { sendEmail } from '@/lib/email/client';
import { quoteSentTemplate } from '@/lib/email/templates';
import { formatLocalDateOnly, parseLocalDateOnly } from '@/lib/date-only';
import { getCustomerWorkflowOrigin } from '@/lib/app-origins';
import { getPricingSettings } from '@/lib/quotes/build-quote-calculation';
import { isFinancialSnapshotConsistent } from '@/lib/pricing-engine';
import { checkEventDateAvailability } from '@/lib/availability-server';

// Statuses that allow sending a quote
const SENDABLE_STATUSES = [
  'pending',
  'pending_review',
  'new',
  'under_review',
  'draft_quote',
  'change_requested',
  'quote_sent', // Allow re-sending
];

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const STANDARD_APPROVAL_CUTOFF_DAYS = 10;

function getQuoteExpiration(eventDateValue: string, now = new Date()): Date {
  const eventDate = parseLocalDateOnly(eventDateValue);
  const standardExpiration = new Date(eventDate);
  standardExpiration.setDate(standardExpiration.getDate() - STANDARD_APPROVAL_CUTOFF_DAYS);

  // Quotes sent 10 days or fewer before the event remain valid for 24 hours.
  if (standardExpiration.getTime() <= now.getTime()) {
    return new Date(now.getTime() + ONE_DAY_MS);
  }

  return standardExpiration;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;

  try {
    const supabase = createAdminClient();
    const requestBody = await request.json().catch(() => ({})) as {
      confirm_soft_hold?: boolean;
    };

    const customerWorkflowOrigin = getCustomerWorkflowOrigin(request);

    // Fetch the quote with current and legacy fallback fields
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
        deposit_percentage,
        deposit_amount,
        final_balance,
        remaining_balance,
        quote_sent_at,
        additional_notes,
        status
      `)
      .eq('id', quoteId)
      .single();

    if (error || !quote) {
      return NextResponse.json(
        { ok: false, message: 'Quote not found' },
        { status: 404 }
      );
    }

    const quoteEmail = quote.email || quote.customer_email;
    if (!quoteEmail) {
      return NextResponse.json(
        { ok: false, message: 'Quote is missing customer email (email/customer_email).' },
        { status: 400 }
      );
    }

    if (!quote.event_date) {
      return NextResponse.json(
        { ok: false, message: 'Quote is missing an event date.' },
        { status: 400 }
      );
    }

    // Check if quote can be sent
    if (!SENDABLE_STATUSES.includes(quote.status)) {
      return NextResponse.json(
        { ok: false, message: `Unsupported quote status for sending: ${quote.status}` },
        { status: 400 }
      );
    }

    const availability = await checkEventDateAvailability(
      supabase,
      quote.event_date,
      { excludeQuoteId: quote.id },
    );
    if (availability.hardBlocks.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          code: 'EVENT_DATE_BLOCKED',
          message: 'This date has a blocking calendar commitment. Resolve the block before sending a customer quote.',
        },
        { status: 409 },
      );
    }
    if (!availability.available) {
      return NextResponse.json(
        {
          ok: false,
          code: 'EVENT_DATE_ALREADY_BOOKED',
          message: 'This date is already owned by another confirmed booking.',
        },
        { status: 409 },
      );
    }
    if (availability.softHolds.length > 0 && !requestBody.confirm_soft_hold) {
      return NextResponse.json(
        {
          ok: false,
          code: 'SOFT_HOLD_CONFIRMATION_REQUIRED',
          message: 'A soft hold exists on this date. Confirm that you want to send the quote anyway.',
        },
        { status: 409 },
      );
    }

    const totalPrice = Number(quote.total_price ?? quote.total ?? 0);
    const depositAmount = Number(quote.deposit_amount ?? 0);
    const finalBalance = Number(quote.final_balance ?? quote.remaining_balance ?? totalPrice - depositAmount);
    const financialSnapshot = {
      pretax_total: Number(quote.pretax_total ?? totalPrice),
      sales_tax_amount: Number(quote.sales_tax_amount ?? 0),
      total_price: totalPrice,
      deposit_percentage: Number(quote.deposit_percentage ?? 0),
      deposit_amount: depositAmount,
      final_balance: finalBalance,
    };

    // Re-sends preserve the original snapshot. A quote that has never been sent
    // must use the current tax and deposit settings before it can become customer-visible.
    if (!quote.quote_sent_at) {
      if (!isFinancialSnapshotConsistent(financialSnapshot)) {
        return NextResponse.json(
          { ok: false, message: 'This quote has inconsistent stored totals. Recalculate it before sending.' },
          { status: 409 }
        );
      }

      const pricingSettings = await getPricingSettings();
      const expectedTaxRate = Number(pricingSettings.sales_tax_percentage) / 100;
      const actualTaxRate = Number(quote.tax_rate ?? 0);
      const expectedDepositPercentage = Number(pricingSettings.deposit_percentage);
      const actualDepositPercentage = Number(quote.deposit_percentage ?? 0);

      if (
        Math.abs(actualTaxRate - expectedTaxRate) > 0.000001 ||
        Math.abs(actualDepositPercentage - expectedDepositPercentage) > 0.000001
      ) {
        return NextResponse.json(
          {
            ok: false,
            message: `Recalculate this quote before sending so it uses ${pricingSettings.sales_tax_percentage}% Michigan sales tax and a ${pricingSettings.deposit_percentage}% deposit.`,
          },
          { status: 409 }
        );
      }
    }

    // Generate approval token and persist token before sending email.
    // Standard quotes expire 10 days before the event. Quotes sent 10 days
    // or fewer before the event expire 24 hours after they are sent.
    const token = generateApprovalToken();
    const tokenHash = hashApprovalToken(token);
    const expiresAt = getQuoteExpiration(quote.event_date).toISOString();

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('quote_approval_tokens')
      .insert({
        quote_request_id: quote.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (tokenError || !tokenRecord) {
      console.error('[send-quote] Token insert error:', tokenError);
      return NextResponse.json(
        { ok: false, message: 'Failed to create approval token record.' },
        { status: 500 }
      );
    }

    // Update quote status before sending email
    const now = new Date().toISOString();
    const { error: statusUpdateError } = await supabase
      .from('quote_requests')
      .update({
        status: 'quote_sent',
        updated_at: now,
      })
      .eq('id', quote.id);

    if (statusUpdateError) {
      console.error('[send-quote] Quote status update error:', statusUpdateError);
      return NextResponse.json(
        { ok: false, message: 'Failed to update quote status before email send.' },
        { status: 500 }
      );
    }

    const approvalLink = `${customerWorkflowOrigin}/quote/${token}`;

    // Format event location with legacy fallback
    const eventLocation = [
      quote.event_address || quote.event_location,
      quote.city,
      quote.state && quote.zip_code ? `${quote.state} ${quote.zip_code}` : quote.state || quote.zip_code,
    ].filter(Boolean).join(', ');

    const customerName = quote.customer_name || 'Customer';
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
      customerName,
      eventDate: formattedEventDate,
      eventType: quote.event_type || 'TBD',
      guestCount: String(quote.guest_count ?? 'TBD'),
      eventLocation: eventLocation || 'TBD',
      quoteSubtotal: Number(quote.subtotal ?? totalPrice),
      quotePretaxTotal: Number(quote.pretax_total ?? totalPrice),
      quoteTaxRate: Number(quote.tax_rate ?? 0),
      quoteSalesTaxAmount: Number(quote.sales_tax_amount ?? 0),
      quoteTotal: totalPrice,
      approvalLink,
      customerNotes: quote.additional_notes,
      quoteOptions: quoteOptions ?? [],
    });

    // Send email after successful DB writes
    const sendResult = await sendEmail({
      to: quoteEmail,
      subject: `${emailTemplate.subject} - ${quote.quote_number || quote.id.slice(0, 8)}`,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!sendResult.sent) {
      return NextResponse.json(
        { ok: false, message: `Email send failed: ${sendResult.error || 'unknown error'}` },
        { status: 400 }
      );
    }

    // Save quote_sent_at after successful send
    const sentAt = new Date().toISOString();
    const { error: sentAtError } = await supabase
      .from('quote_requests')
      .update({ quote_sent_at: sentAt, updated_at: sentAt })
      .eq('id', quote.id);

    if (sentAtError) {
      console.error('[send-quote] quote_sent_at update error:', sentAtError);
      return NextResponse.json(
        { ok: false, message: 'Quote email sent, but failed to save quote_sent_at.' },
        { status: 500 }
      );
    }

    await supabase.from('quote_link_events').insert({
      quote_request_id: quote.id,
      token_id: tokenRecord.id,
      event_type: 'quote_email_sent',
    });

    // Insert status history
    await supabase.from('quote_status_history').insert({
      quote_request_id: quote.id,
      old_status: quote.status,
      new_status: 'quote_sent',
      changed_at: sentAt,
      changed_by: 'admin',
      note: 'Quote email sent to customer',
    });

    return NextResponse.json({ ok: true, message: 'Quote email sent successfully' });
  } catch (error) {
    console.error('[send-quote] Error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
