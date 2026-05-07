'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/pricing-engine';
import { calculateQuote } from '@/lib/quotes/calculateQuote';
import { canEditQuote, canSendQuote, getQuoteStatusLabel } from '@/lib/quotes/status';
import { QuoteRequest, QUOTE_STATUSES } from '@/lib/quotes/types';

export default function QuoteDetailEditor({ quote }: { quote: QuoteRequest }) {
  const [form, setForm] = useState({
    status: quote.status,
    basePrice: quote.basePrice,
    deliveryFee: quote.deliveryFee,
    addOnsTotal: quote.addOnsTotal,
    discount: quote.discount,
    tax: quote.tax,
    depositAmount: quote.depositAmount,
    internalNotes: quote.internalNotes ?? '',
    customerNotes: quote.customerNotes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  const totals = useMemo(() => calculateQuote({ guestCount: quote.guestCount, ...form }), [form, quote.guestCount]);
  const editable = canEditQuote(form.status);
  const sendable = canSendQuote(form.status);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...totals }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to save quote');
      setMessage('Quote updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save quote changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuote = async () => {
    setSendingQuote(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send quote');
      setMessage('Quote email sent successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send quote email.');
    } finally {
      setSendingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ded2c4]/20 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-xl bg-white border border-[#ded2c4] p-6">
          <h1 className="text-3xl font-serif font-bold text-[#2d3a47]">Quote Detail</h1>
          <p className="text-sm text-[#2d3a47]/80 mt-2">{quote.customerName} · {quote.eventType} · {new Date(quote.eventDate).toLocaleDateString()}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white border border-[#ded2c4] p-6 space-y-4">
            <div><label className="text-sm">Status</label><Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as QuoteRequest['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QUOTE_STATUSES.map((s) => <SelectItem key={s} value={s}>{getQuoteStatusLabel(s)}</SelectItem>)}</SelectContent></Select></div>
            {(['basePrice', 'deliveryFee', 'addOnsTotal', 'discount', 'tax', 'depositAmount'] as const).map((key) => (
              <div key={key}><label className="text-sm">{key}</label><Input disabled={!editable} type="number" step="0.01" value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: Number(e.target.value) }))} /></div>
            ))}
            <div><label className="text-sm">Internal Notes</label><Textarea disabled={!editable} value={form.internalNotes} onChange={(e) => setForm((p) => ({ ...p, internalNotes: e.target.value }))} /></div>
            <div><label className="text-sm">Customer Notes</label><Textarea disabled={!editable} value={form.customerNotes} onChange={(e) => setForm((p) => ({ ...p, customerNotes: e.target.value }))} /></div>
          </div>
          <div className="rounded-xl bg-white border border-[#ded2c4] p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#2d3a47]">Quote Breakdown</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
              <div className="flex justify-between"><span>Deposit</span><span>{formatCurrency(totals.depositAmount)}</span></div>
              <div className="flex justify-between font-semibold"><span>Remaining</span><span>{formatCurrency(totals.remainingBalance)}</span></div>
            </div>
            <Button onClick={handleSave} disabled={saving || !editable} className="w-full bg-[#2d3a47] text-white">{saving ? 'Saving...' : 'Save Quote Changes'}</Button>
            <Button onClick={handleSendQuote} disabled={sendingQuote || !sendable} variant="outline" className="w-full">{sendingQuote ? 'Sending...' : 'Send Quote Email to Customer'}</Button>
            {message && <p className="text-sm text-[#2d3a47]">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
