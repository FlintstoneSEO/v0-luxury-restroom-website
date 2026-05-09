import { formatCurrency } from '@/lib/pricing-engine';

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

function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, '');

  return 'https://www.signatureluxeevents.com';
}

const LOGO_URL = `${getPublicAppUrl()}/images/logo.png`;

function renderBrandedCustomerEmail(input: BrandedEmailInput) {
  const html = `
    <div style="margin:0;padding:0;background:#f6f4f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2933;">
      <div style="display:none;font-size:1px;color:#f6f4f1;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${input.preheader || ''}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4f1;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e9e2d9;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="background:#2d3a47;padding:24px 20px 18px;text-align:center;">
                  <div style="display:inline-block;background:#f6f4f1;border:1px solid #ded2c4;border-radius:10px;padding:10px 16px;">
                    <img src="${LOGO_URL}" alt="Signature Luxe Events & Amenities logo" width="220" style="width:220px;max-width:100%;height:auto;display:inline-block;border:0;outline:none;text-decoration:none;" />
                  </div>
                  <div style="height:2px;background:#ded2c4;width:180px;max-width:70%;margin:16px auto 0;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 24px 24px;">
                  <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;color:#2d3a47;font-family:Georgia,'Times New Roman',serif;">${input.headline}</h1>
                  ${input.subheading ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#6b7280;">${input.subheading}</p>` : ''}
                  <div style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#1f2933;">${input.bodyHtml}</div>
                  ${input.detailsHtml ? `<div style="background:#f6f4f1;border:1px solid #ded2c4;border-radius:10px;padding:14px 16px;margin:16px 0 20px;">${input.detailsHtml}</div>` : ''}
                  ${input.ctaLabel && input.ctaUrl ? `<p style="margin:0 0 22px;"><a href="${input.ctaUrl}" style="display:inline-block;background:#2d3a47;color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;border:1px solid #ded2c4;border-radius:999px;font-size:15px;">${input.ctaLabel}</a></p>` : ''}
                  ${input.postCtaHtml ? `<div style="margin:0;font-size:15px;line-height:1.65;color:#1f2933;">${input.postCtaHtml}</div>` : ''}
                </td>
              </tr>
              <tr>
                <td style="background:#111111;color:#ded2c4;padding:16px 24px;text-align:center;font-size:13px;line-height:1.6;">
                  ${input.footerLines.join('<br />')}
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
  const { html, logoUrl } = renderBrandedCustomerEmail({
    preheader: `Thanks, ${firstName} — we received your request.`,
    headline: `Thanks, ${firstName} — we received your request.`,
    bodyHtml: `<p style="margin:0 0 10px;">Your quote request is in our queue, and our team will review your event details shortly. We will follow up with a customized quote for your luxury restroom trailer rental.</p><p style="margin:0;">Need to update your details? Reply to this email or call us at <a href="tel:${input.businessPhoneHref}" style="color:#2d3a47;">${input.businessPhoneDisplay}</a>.</p>`,
    detailsHtml: `
      <p style="margin:0 0 6px;font-size:14px;"><strong>Quote Number:</strong> ${input.quoteNumber}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Date:</strong> ${input.eventDate}</p>
      <p style="margin:0;font-size:14px;"><strong>Location:</strong> ${input.eventLocation}</p>
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
  quoteTotal: number;
  approvalLink: string;
}) {
  const subject = 'Your Luxury Restroom Trailer Quote';
  const { html, logoUrl } = renderBrandedCustomerEmail({
    preheader: 'Prepared exclusively for your upcoming event',
    headline: 'Your Luxury Restroom Trailer Quote',
    subheading: 'Prepared exclusively for your upcoming event',
    bodyHtml: `<p style="margin:0 0 10px;">Hello ${input.customerName},</p>
      <p style="margin:0 0 10px;">Thank you for considering Signature Luxe Events & Amenities for your upcoming event.</p>
      <p style="margin:0;">We are pleased to provide your customized quote for our luxury restroom trailer rental service.</p>
      <p style="margin:10px 0 0;">Please review the details below. When you are ready, you may approve your quote using the button provided.</p>`,
    detailsHtml: `
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Date:</strong> ${input.eventDate}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Type:</strong> ${input.eventType}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Guest Count:</strong> ${input.guestCount}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Event Location:</strong> ${input.eventLocation}</p>
      <p style="margin:0;font-size:14px;"><strong>Estimated Total:</strong> ${formatCurrency(input.quoteTotal)}</p>
    `,
    ctaLabel: 'Approve My Quote',
    ctaUrl: input.approvalLink,
    postCtaHtml: `<p style="margin:0 0 10px;">Once your quote is approved, we will send the next steps for your rental agreement and deposit payment.</p><p style="margin:0;">We look forward to helping you provide an elevated restroom experience for your guests.</p>`,
    footerLines: ['Signature Luxe Events & Amenities', 'Luxury Restroom Trailer Rentals', 'for Weddings, Private Events, Corporate Events, and Special Occasions', 'Lansing, Michigan and surrounding communities'],
  });

  const text = `Hello ${input.customerName},\n\nThank you for considering Signature Luxe Events & Amenities for your upcoming event.\n\nWe are pleased to provide your customized quote for our luxury restroom trailer rental service.\n\nQuote Summary:\nEvent Date: ${input.eventDate}\nEvent Type: ${input.eventType}\nGuest Count: ${input.guestCount}\nEvent Location: ${input.eventLocation}\nEstimated Total: ${formatCurrency(input.quoteTotal)}\n\nApprove your quote here:\n${input.approvalLink}\n\nOnce your quote is approved, we will send the next steps for your rental agreement and deposit payment.\n\nSignature Luxe Events & Amenities\nLuxury Restroom Trailer Rentals\nLansing, Michigan and surrounding communities`;

  return { subject, html, text, logoUrl };
}

export function adminCustomerApprovalTemplate(input: {
  customerName: string;
  status: string;
  comments?: string | null;
}) {
  const statusDisplay = input.status.replace(/_/g, ' ');
  return {
    subject: `Customer Response: ${statusDisplay}`,
    html: `<h2>Customer Quote Response</h2>
    <p><strong>Customer:</strong> ${input.customerName}</p>
    <p><strong>Status:</strong> ${statusDisplay}</p>
    ${input.comments ? `<p><strong>Comments:</strong> ${input.comments}</p>` : ''}`,
  };
}
