import { formatCurrency } from '@/lib/pricing-engine';

export function quoteSentTemplate(input: { customerName: string; eventDate: string; eventType: string; total: number; deposit: number; approvalLink: string; quoteNumber?: string }) {
  const subject = `Your Signature Luxe Quote${input.quoteNumber ? ` (${input.quoteNumber})` : ''}`;
  const html = `<h2>Your quote is ready</h2>
  <p>Hi ${input.customerName},</p>
  <p>Your quote details:</p>
  <ul>
    <li><strong>Event Date:</strong> ${input.eventDate}</li>
    <li><strong>Event Type:</strong> ${input.eventType}</li>
    <li><strong>Quote Total:</strong> ${formatCurrency(input.total)}</li>
    <li><strong>Deposit Amount:</strong> ${formatCurrency(input.deposit)}</li>
  </ul>
  <p><a href="${input.approvalLink}">Review and respond to your quote</a></p>`;
  return { subject, html };
}

export function adminCustomerApprovalTemplate(input: { quoteNumber?: string; customerName: string; status: string; comments?: string | null }) {
  return {
    subject: `Customer ${input.status.replace('_', ' ')}: ${input.quoteNumber ?? 'Quote'}`,
    html: `<h2>Customer quote response</h2><p><strong>Customer:</strong> ${input.customerName}</p><p><strong>Status:</strong> ${input.status}</p>${input.comments ? `<p><strong>Comments:</strong> ${input.comments}</p>` : ''}`,
  };
}
