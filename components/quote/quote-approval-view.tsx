'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/pricing-engine';

export default function QuoteApprovalView({ token, quote }: { token: string; quote: any }) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (decision: 'approve' | 'request_changes' | 'decline') => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/quote/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, decision, comments }),
    });
    const body = await res.json();
    setLoading(false);
    setMessage(body.ok ? 'Your response was saved. Thank you.' : body.message || 'Unable to submit response.');
  };

  return (
    <div className="min-h-screen bg-[#ded2c4]/20 py-10 px-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#ded2c4] bg-white p-6 space-y-5">
        <h1 className="text-3xl font-serif font-bold text-[#2d3a47]">Review Your Quote</h1>
        <p className="text-[#2d3a47]/80">Quote {quote.quote_number} for {quote.customer_name}</p>

        <div className="rounded-lg border border-[#ded2c4] p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Event Date</span><span>{quote.event_date ?? '—'}</span></div>
          <div className="flex justify-between"><span>Event Type</span><span>{quote.event_type ?? '—'}</span></div>
          <div className="flex justify-between"><span>Total</span><span>{formatCurrency(Number(quote.total_price ?? 0))}</span></div>
          <div className="flex justify-between"><span>Deposit</span><span>{formatCurrency(Number(quote.deposit_amount ?? 0))}</span></div>
          <div className="flex justify-between font-semibold"><span>Final Balance</span><span>{formatCurrency(Number(quote.final_balance ?? 0))}</span></div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#2d3a47]">Comments (required for request changes or decline)</label>
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={5} placeholder="Share any changes or concerns" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button disabled={loading} className="bg-green-700 hover:bg-green-800 text-white" onClick={() => submit('approve')}>Approve Quote</Button>
          <Button disabled={loading} variant="outline" onClick={() => submit('request_changes')}>Request Changes</Button>
          <Button disabled={loading} className="bg-red-700 hover:bg-red-800 text-white" onClick={() => submit('decline')}>Decline Quote</Button>
        </div>
        {message && <p className="text-sm text-[#2d3a47]">{message}</p>}
      </div>
    </div>
  );
}
