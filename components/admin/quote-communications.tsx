import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import type { QuoteCommunications as Communications } from '@/lib/quotes/communications';

export function CustomerContactActions({ email, phone, quoteNumber }: { email: string; phone: string; quoteNumber: string }) {
  const emailHref = email.trim() ? `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(`Re: Quote ${quoteNumber}`)}` : null;
  const phoneNumber = phone.replace(/[^+\d]/g, '');
  return <div className="flex flex-wrap gap-2" aria-label="Contact customer">
    {phoneNumber && <Button asChild variant="outline" className="min-h-11"><a href={`tel:${phoneNumber}`}><Phone aria-hidden="true" />Call customer</a></Button>}
    {emailHref && <Button asChild variant="outline" className="min-h-11"><a href={emailHref}><Mail aria-hidden="true" />Email customer</a></Button>}
    {!emailHref && !phoneNumber && <p className="text-sm text-muted-foreground">No customer contact details saved.</p>}
  </div>;
}

export function QuoteCommunications({ communications, customerName, email, quoteNumber }: {
  communications: Communications; customerName: string; email: string; quoteNumber: string;
}) {
  return <section aria-labelledby="quote-communications-heading" className="mb-6 rounded-lg border border-[#ded2c4]/60 p-4">
    <h2 id="quote-communications-heading">Communications</h2>
    <p className="mb-4 text-sm text-muted-foreground">Questions submitted through the quote page, newest first (up to 100). Email replies are handled in your email app and are not synced here yet.</p>
    {communications.error ? <p role="alert">Customer messages could not be loaded. Refresh the page to try again.</p>
      : communications.messages.length === 0 ? <p className="text-sm">No customer questions yet.</p>
      : <ol className="space-y-3">{communications.messages.map((item) => <li key={item.id} className="rounded-md border border-[#ded2c4]/60 bg-[#f8f7f5] p-4">
        <p className="font-semibold">{customerName}</p>
        <time className="text-sm text-muted-foreground" dateTime={item.changed_at}>{new Date(item.changed_at).toLocaleString('en-US', { timeZone: 'America/Detroit', dateStyle: 'medium', timeStyle: 'short' })} ET</time>
        <p className="my-3 whitespace-pre-wrap break-words text-sm">{item.message}</p>
        <CustomerContactActions email={email} phone="" quoteNumber={quoteNumber} />
      </li>)}</ol>}
  </section>;
}
