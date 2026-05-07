import { formatCurrency } from '@/lib/pricing-engine';

export function quoteSentTemplate(input: {
  customerName: string;
  address?: string;
  quoteAmount: number;
  approvalLink: string;
}) {
  const subject = `Your Luxury Restroom Rental Quote`;
  const html = `<h2>Your quote is ready</h2>
  <p>Hi ${input.customerName},</p>
  <p>Thank you for requesting a quote for luxury restroom trailer rental.</p>
  ${input.address ? `<p><strong>Service Location:</strong> ${input.address}</p>` : ''}
  <p><strong>Quote Total:</strong> ${formatCurrency(input.quoteAmount)}</p>
  <p><a href="${input.approvalLink}">Click here to review and respond to your quote</a></p>
  <p>This link will expire in 10 days.</p>
  <p>Best regards,<br/>Signature Luxe Events</p>`;
  return { subject, html };
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
