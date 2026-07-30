import { formatCurrency } from '@/lib/pricing-engine';
import { escapeHtml } from '@/lib/escape-html';
import { getPublicSiteOrigin } from '@/lib/app-origins';

export type QuoteEmailOptionSummary = {
  id?: string;
  option_label: string;
  option_description?: string | null;
  subtotal: number;
  pretax_total: number;
  tax_rate: number;
  sales_tax_amount: number;
  total_price: number;
  is_recommended?: boolean;
};

type BrandedEmailInput = {
  preheader?: string;
  headline: string;
  subheading?: string;
  bodyHtml: string;
  detailsHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  postCtaHtml?: string;
  footerLines: string[];
};

const LOGO_URL = `${getPublicSiteOrigin()}/images/logo.png`;

function renderBrandedCustomerEmail(input: BrandedEmailInput) {
  const preheader = escapeHtml(input.preheader || '');
  const headline = escapeHtml(input.headline);
  const subheading = input.subheading ? escapeHtml(input.subheading) : '';
  const ctaLabel = input.ctaLabel ? escapeHtml(input.ctaLabel) : '';
  const ctaUrl = input.ctaUrl ? escapeHtml(input.ctaUrl) : '';
  const footerHtml = input.footerLines.map((line) => escapeHtml(line)).join('<br />');

  const html = `
    <div style="margin:0;padding:0;background:#f6f4f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2933;">
      <div style="display:none;font-size:1px;color:#f6f4f1;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4f1;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e9e2d9;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="background:#2d3a47;padding:24px 20px 18px;text-align:center;">
                  <div style="display:inline-block;background:#f6f4f1;border:1px solid #ded2c4;border-radius:10px;padding:10px 16px;">
                    <img src="${escapeHtml(LOGO_URL)}" alt="Signature Luxe Events & Amenities logo" width="220" style="width:220px;max-width:100%;height:auto;display:inline-block;border:0;outline:none;text-decoration:none;" />
                  </div>
                  <div style="height:2px;background:#ded2c4;width:180px;max-width:70%;margin:16px auto 0;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 24px 24px;">
                  <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;color:#2d3a47;font-family:Georgia,'Times New Roman',serif;">${headline}</h1>
                  ${subheading ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#6b7280;">${subheading}</p>` : ''}
                  <div style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#1f2933;">${input.bodyHtml}</div>
                  ${input.detailsHtml ? `<div style="background:#f6f4f1;border:1px solid #ded2c4;border-radius:10px;padding:14px 16px;margin:16px 0 20px;">${input.detailsHtml}</div>` : ''}
                  ${ctaLabel && ctaUrl ? `<p style="margin:0 0 22px;"><a href="${ctaUrl}" style="display:inline-block;background:#2d3a47;color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;border:1px solid #ded2c4;border-radius:999px;font-size:15px;">${ctaLabel}</a></p>` : ''}
                  ${input.postCtaHtml ? `<div style="margin:0;font-size:15px;line-height:1.65;color:#1f2933;">${input.postCtaHtml}</div>` : ''}
                </td>
              </tr>
              <tr>
                <td style="background:#2d3a47;color:#ffffff;padding:16px 24px;text-align:center;font-size:13px;line-height:1.6;">
                  ${footerHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  return { html, logoUrl: LOGO_URL };
}

export function quoteRequestConfirmationTemplate(input: {
  customerName: string;
  quoteNumber: string;
  eventDate: string;
  eventLocation: string;
  businessPhoneDisplay: string;
  businessPhoneHref: string;
  contactUrl: string;
}) {
  const firstName = input.customerName.split(' ')[0] || input.customerName;
  const safeQuoteNumber = escapeHtml(input.quoteNumber);
  const safeEventDate = escapeHtml(input.eventDate);
  const safeEventLocation = escapeHtml(input.eventLocation);
  const safeBusinessPhoneDisplay = escapeHtml(input.businessPhoneDisplay);
  const safeBusinessPhoneHref = escapeHtml(input.businessPhoneHref);

  const { html, logoUrl } = renderBrandedCustomerEmail({
    preheader: `Thanks, ${firstName} — we received your request.`,
    headline: `Thanks, ${firstName} — we received your request.`,
    bodyHtml: `<p style="margin:0 0 10px;">Your quote request is in our queue, and our team will review your event details shortly. We will follow up with a customized quote for your luxury restroom trailer rental.</p><p style="margin:0;">Need to update your details? Reply to this email or call us at <a href="tel:${safeBusinessPhoneHref}" style="color:#2d3a47;">${safeBusinessPhoneDisplay}</a>.</p>`,
    detailsHtml: `
      <p style="margin:0 0 6px;font-size:14px;"><strong>Quote Number:</strong> ${safeQuoteNumber}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Date:</strong> ${safeEventDate}</p>
      <p style="margin:0;font-size:14px;"><strong>Location:</strong> ${safeEventLocation}</p>
    `,
    ctaLabel: 'Contact Our Team',
    ctaUrl: input.contactUrl,
    footerLines: ['Signature Luxe Events & Amenities', 'Luxury Restroom Trailer Rentals', 'Lansing, Michigan • Mid-Michigan Service Area'],
  });

  const text = `Thanks, ${firstName} — we received your request.\n\nYour quote request is in our queue, and our team will review your event details shortly. We will follow up with a customized quote for your luxury restroom trailer rental.\n\nQuote Number: ${input.quoteNumber}\nEvent Date: ${input.eventDate}\nLocation: ${input.eventLocation}\n\nNeed to update your details? Reply to this email or call us at ${input.businessPhoneDisplay}.\n\nSignature Luxe Events & Amenities\nLuxury Restroom Trailer Rentals\nLansing, Michigan • Mid-Michigan Service Area`;

  return { html, text, logoUrl };
}

export function quoteSentTemplate(input: {
  customerName: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
  eventLocation: string;
  quoteSubtotal: number;
  quotePretaxTotal: number;
  quoteTaxRate: number;
  quoteSalesTaxAmount: number;
  quoteTotal: number;
  approvalLink: string;
  customerNotes?: string | null;
  quoteOptions?: QuoteEmailOptionSummary[];
}) {
  const subject = 'Your Luxury Restroom Trailer Quote';
  const safeCustomerName = escapeHtml(input.customerName);
  const safeEventDate = escapeHtml(input.eventDate);
  const safeEventType = escapeHtml(input.eventType);
  const safeGuestCount = escapeHtml(input.guestCount);
  const safeEventLocation = escapeHtml(input.eventLocation);
  const customerNotes = input.customerNotes?.trim();
  const quoteOptions = input.quoteOptions?.filter((option) => option.option_label?.trim()) ?? [];
  const hasMultipleOptions = quoteOptions.length > 1;
  const hasQuoteSalesTax = input.quoteTaxRate > 0 || input.quoteSalesTaxAmount > 0;
  const safeCustomerNotes = customerNotes ? escapeHtml(customerNotes) : '';
  const customerNotesHtml = safeCustomerNotes
    ? `<p style="margin:0 0 6px;font-size:14px;"><strong>Customer Notes:</strong> <span style="white-space:pre-wrap;">${safeCustomerNotes}</span></p>`
    : '';
  const quoteSummaryTextLines = [
    `Event Date: ${input.eventDate}`,
    `Event Type: ${input.eventType}`,
    `Guest Count: ${input.guestCount}`,
    `Event Location: ${input.eventLocation}`,
    ...(customerNotes ? [`Customer Notes: ${customerNotes}`] : []),
    ...(hasMultipleOptions
      ? [
          'Quote Options:',
          ...quoteOptions.map((option) => {
            const hasSalesTax = option.tax_rate > 0 || option.sales_tax_amount > 0;
            return `${option.option_label}${option.option_description ? `: ${option.option_description}` : ''} — ${hasSalesTax ? `Michigan Sales Tax (${(option.tax_rate * 100).toFixed(0)}%): ${formatCurrency(option.sales_tax_amount)} — ` : ''}Total${hasSalesTax ? ' Including Sales Tax' : ''}: ${formatCurrency(option.total_price)}`;
          }),
        ]
      : [
          `Subtotal: ${formatCurrency(input.quoteSubtotal)}`,
          ...(hasQuoteSalesTax
            ? [
                `Pretax Total: ${formatCurrency(input.quotePretaxTotal)}`,
                `Michigan Sales Tax (${(input.quoteTaxRate * 100).toFixed(0)}%): ${formatCurrency(input.quoteSalesTaxAmount)}`,
                `Estimated Total Including Sales Tax: ${formatCurrency(input.quoteTotal)}`,
              ]
            : [`Estimated Total: ${formatCurrency(input.quoteTotal)}`]),
        ]),
  ];

  const { html, logoUrl } = renderBrandedCustomerEmail({
    preheader: 'Prepared exclusively for your upcoming event',
    headline: 'Your Luxury Restroom Trailer Quote',
    subheading: 'Prepared exclusively for your upcoming event',
    bodyHtml: `<p style="margin:0 0 10px;">Hello ${safeCustomerName},</p>
      <p style="margin:0 0 10px;">Thank you for considering Signature Luxe Events & Amenities for your upcoming event.</p>
      <p style="margin:0;">${hasMultipleOptions ? 'We prepared multiple quote options for your event. Open your quote review page to compare options and choose how you would like to proceed.' : 'We are pleased to provide your customized quote for our luxury restroom trailer rental service.'}</p>
      ${hasMultipleOptions ? '' : '<p style="margin:10px 0 0;">Please review the summary below, then open your quote review page to see the full breakdown and choose how you would like to proceed.</p>'}`,
    detailsHtml: `
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Date:</strong> ${safeEventDate}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Type:</strong> ${safeEventType}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Guest Count:</strong> ${safeGuestCount}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Location:</strong> ${safeEventLocation}</p>
      ${customerNotesHtml}
      ${hasMultipleOptions ? `<div style="margin-top:10px;border-top:1px solid #ded2c4;padding-top:10px;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Quote Options:</strong></p>
        ${quoteOptions.map((option) => {
          const hasSalesTax = option.tax_rate > 0 || option.sales_tax_amount > 0;
          return `<div style="margin:0 0 10px;font-size:14px;"><p style="margin:0 0 4px;"><strong>${escapeHtml(option.option_label)}${option.is_recommended ? ' (Recommended)' : ''}</strong>${option.option_description ? ` — ${escapeHtml(option.option_description)}` : ''}</p>${hasSalesTax ? `<p style="margin:0 0 4px;">Michigan Sales Tax (${(option.tax_rate * 100).toFixed(0)}%): ${formatCurrency(option.sales_tax_amount)}</p>` : ''}<p style="margin:0;"><strong>Total${hasSalesTax ? ' Including Sales Tax' : ''}:</strong> ${formatCurrency(option.total_price)}</p></div>`;
        }).join('')}
      </div>` : `<div style="margin-top:10px;border-top:1px solid #ded2c4;padding-top:10px;font-size:14px;">
        <p style="margin:0 0 4px;"><strong>Subtotal:</strong> ${formatCurrency(input.quoteSubtotal)}</p>
        ${hasQuoteSalesTax ? `<p style="margin:0 0 4px;"><strong>Pretax Total:</strong> ${formatCurrency(input.quotePretaxTotal)}</p><p style="margin:0 0 4px;"><strong>Michigan Sales Tax (${(input.quoteTaxRate * 100).toFixed(0)}%):</strong> ${formatCurrency(input.quoteSalesTaxAmount)}</p>` : ''}
        <p style="margin:0;"><strong>Estimated Total${hasQuoteSalesTax ? ' Including Sales Tax' : ''}:</strong> ${formatCurrency(input.quoteTotal)}</p>
      </div>`}
    `,
    ctaLabel: hasMultipleOptions ? 'Review Quote Options' : 'Review Quote & Respond',
    ctaUrl: input.approvalLink,
    postCtaHtml: `<p style="margin:0 0 10px;">Once your quote is approved, we will send the next steps for your rental agreement and deposit payment.</p><p style="margin:0;">We look forward to helping you provide an elevated restroom experience for your guests.</p>`,
    footerLines: ['Signature Luxe Events & Amenities', 'Luxury Restroom Trailer Rentals', 'for Weddings, Private Events, Corporate Events, and Special Occasions', 'Lansing, Michigan and surrounding communities'],
  });

  const text = `Hello ${input.customerName},\n\nThank you for considering Signature Luxe Events & Amenities for your upcoming event.\n\nWe are pleased to provide your customized quote for our luxury restroom trailer rental service.\n\nQuote Summary:\n${quoteSummaryTextLines.join('\n')}\n\n${hasMultipleOptions ? 'Review your quote options and respond here:' : 'Review your quote and respond here:'}\n${input.approvalLink}\n\nOnce your quote is approved, we will send the next steps for your rental agreement and deposit payment.\n\nSignature Luxe Events & Amenities\nLuxury Restroom Trailer Rentals\nLansing, Michigan and surrounding communities`;

  return { subject, html, text, logoUrl };
}

export function adminCustomerApprovalTemplate(input: {
  customerName: string;
  status: string;
  comments?: string | null;
}) {
  const statusDisplay = input.status.replace(/_/g, ' ');
  const safeCustomerName = escapeHtml(input.customerName);
  const safeStatusDisplay = escapeHtml(statusDisplay);
  const safeComments = input.comments ? escapeHtml(input.comments) : '';

  return {
    subject: `Customer Response: ${statusDisplay}`,
    html: `<h2>Customer Quote Response</h2>
    <p><strong>Customer:</strong> ${safeCustomerName}</p>
    <p><strong>Status:</strong> ${safeStatusDisplay}</p>
    ${safeComments ? `<p><strong>Comments:</strong> ${safeComments}</p>` : ''}`,
  };
}
