export type QuoteNotificationPayload = { quoteNumber?: string; firstName: string; lastName: string; email: string }

export async function sendQuoteNotification(_payload: QuoteNotificationPayload) {
  // TODO: Integrate provider SDK (Resend, SendGrid, SES) using env vars only.
  // Keep side effects optional so quote requests can still be stored.
  return { sent: false, reason: 'Email provider not configured' }
}
