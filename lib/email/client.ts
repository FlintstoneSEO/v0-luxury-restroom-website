export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type SendEmailResult = { sent: boolean; provider: string; id?: string; error?: string };

const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
const fromAddress = process.env.EMAIL_FROM || 'Signature Luxe <info@signatureluxeevents.com>';

async function sendWithResend(message: EmailMessage): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, provider: 'resend', error: 'Missing RESEND_API_KEY' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAddress, to: message.to, subject: message.subject, html: message.html, text: message.text, reply_to: message.replyTo }),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok ? { sent: true, provider: 'resend', id: body.id } : { sent: false, provider: 'resend', error: body.message || `HTTP ${res.status}` };
}

async function sendWithSendGrid(message: EmailMessage): Promise<SendEmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return { sent: false, provider: 'sendgrid', error: 'Missing SENDGRID_API_KEY' };
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: { email: process.env.EMAIL_FROM_ADDRESS || 'info@signatureluxeevents.com', name: 'Signature Luxe Events & Amenities' },
      personalizations: [{ to: (Array.isArray(message.to) ? message.to : [message.to]).map((email) => ({ email })) }],
      subject: message.subject,
      content: [{ type: 'text/html', value: message.html }],
      reply_to: message.replyTo ? { email: message.replyTo } : undefined,
    }),
  });
  return res.ok ? { sent: true, provider: 'sendgrid' } : { sent: false, provider: 'sendgrid', error: `HTTP ${res.status}` };
}

async function sendWithMailgun(message: EmailMessage): Promise<SendEmailResult> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!apiKey || !domain) return { sent: false, provider: 'mailgun', error: 'Missing Mailgun config' };
  const params = new URLSearchParams();
  params.append('from', fromAddress);
  (Array.isArray(message.to) ? message.to : [message.to]).forEach((r) => params.append('to', r));
  params.append('subject', message.subject);
  params.append('html', message.html);
  if (message.text) params.append('text', message.text);
  const token = Buffer.from(`api:${apiKey}`).toString('base64');
  const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, { method: 'POST', headers: { Authorization: `Basic ${token}` }, body: params });
  return res.ok ? { sent: true, provider: 'mailgun' } : { sent: false, provider: 'mailgun', error: `HTTP ${res.status}` };
}

export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  if (provider === 'resend') return sendWithResend(message);
  if (provider === 'sendgrid') return sendWithSendGrid(message);
  if (provider === 'mailgun') return sendWithMailgun(message);
  if (provider === 'smtp') return { sent: false, provider: 'smtp', error: 'SMTP transport not configured in this build' };
  return { sent: false, provider: provider || 'none', error: 'EMAIL_PROVIDER not configured' };
}
