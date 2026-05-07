'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/pricing-engine';

type QuoteRecord = Record<string, any>;

export default function QuoteDetailEditor({ quote }: { quote: QuoteRecord }) {
  const [form, setForm] = useState({
    status: quote.status ?? 'pending_review',
    base_price: Number(quote.base_price ?? 0),
    delivery_fee: Number(quote.travel_fee ?? 0),
    add_ons: Number((quote.cleaning_fee ?? 0) + (quote.damage_waiver_fee ?? 0) + (quote.rush_booking_fee ?? 0)),
    discount_amount: Number(quote.discount_amount ?? 0),
    deposit_amount: Number(quote.deposit_amount ?? 0),
    deposit_status: quote.deposit_status ?? 'due',
    deposit_payment_link: quote.deposit_payment_link ?? '',
    deposit_due_date: quote.deposit_due_date?.slice(0,10) ?? '',
    deposit_paid_at: quote.deposit_paid_at?.slice(0,10) ?? '',
    deposit_transaction_reference: quote.deposit_transaction_reference ?? '',
    stripe_payment_intent_id: quote.stripe_payment_intent_id ?? '',
    stripe_checkout_session_id: quote.stripe_checkout_session_id ?? '',
    quote_expires_at: quote.quote_expires_at?.slice(0, 10) ?? '',
    internal_notes: quote.internal_notes ?? '',
    customer_notes: quote.customer_notes ?? '',
    agreement_status: quote.agreement_status ?? 'not_sent',
    agreement_document_url: quote.agreement_document_url ?? '',
    signed_document_url: quote.signed_document_url ?? '',
    agreement_provider_reference_id: quote.agreement_provider_reference_id ?? '',
    agreement_sent_at: quote.agreement_sent_at?.slice(0, 10) ?? '',
    agreement_signed_at: quote.agreement_signed_at?.slice(0, 10) ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  const totals = useMemo(() => {
    const subtotal = Math.max(0, form.base_price + form.delivery_fee + form.add_ons - form.discount_amount);
    const total = subtotal;
    const finalBalance = Math.max(0, total - form.deposit_amount);
    return { subtotal, total, finalBalance };
  }, [form]);

  const update = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));


  const handleSendQuote = async () => {
    setSendingQuote(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send quote');
      setMessage('Quote email sent successfully. Status moved to proposal_sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send quote email.');
    } finally {
      setSendingQuote(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const body = {
        status: form.status,
        base_price: form.base_price,
        travel_fee: form.delivery_fee,
        utility_fee: 0,
        after_hours_fee: 0,
        cleaning_fee: form.add_ons,
        damage_waiver_fee: 0,
        rush_booking_fee: 0,
        discount_amount: form.discount_amount,
        subtotal: totals.subtotal,
        total_price: totals.total,
        deposit_amount: form.deposit_amount,
        deposit_status: form.deposit_status,
        deposit_payment_link: form.deposit_payment_link || null,
        deposit_due_date: form.deposit_due_date || null,
        deposit_paid_at: form.deposit_paid_at || null,
        deposit_transaction_reference: form.deposit_transaction_reference || null,
        stripe_payment_intent_id: form.stripe_payment_intent_id || null,
        stripe_checkout_session_id: form.stripe_checkout_session_id || null,
        final_balance: totals.finalBalance,
        quote_expires_at: form.quote_expires_at || null,
        internal_notes: form.internal_notes || null,
        customer_notes: form.customer_notes || null,
        agreement_status: form.agreement_status,
        agreement_document_url: form.agreement_document_url || null,
        signed_document_url: form.signed_document_url || null,
        agreement_provider_reference_id: form.agreement_provider_reference_id || null,
        agreement_sent_at: form.agreement_sent_at || null,
        agreement_signed_at: form.agreement_signed_at || null,
        is_manual_override: true,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save quote');
      setMessage('Quote updated successfully. Manual override saved.');
    } catch {
      setMessage('Failed to save quote changes.');
    } finally {
      setSaving(false);
    }
  };



  const markDepositRequested = () => {
    const today = new Date().toISOString().slice(0,10);
    setForm((prev) => ({ ...prev, deposit_status: 'due', deposit_due_date: prev.deposit_due_date || today }));
  };

  const markDepositPaid = () => {
    const today = new Date().toISOString().slice(0,10);
    setForm((prev) => ({ ...prev, deposit_status: 'paid', deposit_paid_at: prev.deposit_paid_at || today }));
  };

  const markAgreementSent = () => {
    const today = new Date().toISOString().slice(0,10);
    setForm((prev) => ({ ...prev, agreement_status: 'sent', agreement_sent_at: prev.agreement_sent_at || today }));
  };

  const markAgreementSigned = () => {
    const today = new Date().toISOString().slice(0,10);
    setForm((prev) => ({ ...prev, agreement_status: 'signed', agreement_signed_at: prev.agreement_signed_at || today }));
  };

  return (
    <div className="min-h-screen bg-[#ded2c4]/20 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-xl bg-white border border-[#ded2c4] p-6">
          <h1 className="text-3xl font-serif font-bold text-[#2d3a47]">Quote Detail</h1>
          <p className="text-sm text-[#2d3a47]/80 mt-2">{quote.quote_number} · {quote.customer_name}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white border border-[#ded2c4] p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#2d3a47]">Quote Inputs</h2>
            <div>
              <label className="text-sm">Status</label>
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pending_review', 'quoted', 'proposal_sent', 'approved', 'declined', 'expired', 'cancelled'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {[
              ['base_price', 'Base Price'],
              ['delivery_fee', 'Delivery Fee'],
              ['add_ons', 'Add-ons'],
              ['discount_amount', 'Discount'],
              ['deposit_amount', 'Deposit Amount'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm">{label}</label>
                <Input type="number" step="0.01" value={(form as any)[key]} onChange={(e) => update(key, Number(e.target.value))} />
              </div>
            ))}
            <div>
              <label className="text-sm">Quote Expiration Date</label>
              <Input type="date" value={form.quote_expires_at} onChange={(e) => update('quote_expires_at', e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Internal Notes</label>
              <Textarea value={form.internal_notes} onChange={(e) => update('internal_notes', e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm">Customer-facing Notes</label>
              <Textarea value={form.customer_notes} onChange={(e) => update('customer_notes', e.target.value)} rows={4} />
            </div>

            <div className="rounded-lg border border-[#ded2c4] p-4 space-y-3">
              <h3 className="font-semibold text-[#2d3a47]">Deposit Tracking</h3>
              <div><label className="text-sm">Deposit Amount</label><Input type="number" step="0.01" value={form.deposit_amount} onChange={(e) => update('deposit_amount', Number(e.target.value))} /></div>
              <div>
                <label className="text-sm">Deposit Status</label>
                <Select value={form.deposit_status} onValueChange={(v) => update('deposit_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['due','partially_paid','paid','refunded','not_required'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm">Payment Link</label><Input value={form.deposit_payment_link} onChange={(e) => update('deposit_payment_link', e.target.value)} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="text-sm">Payment Due Date</label><Input type="date" value={form.deposit_due_date} onChange={(e) => update('deposit_due_date', e.target.value)} /></div>
                <div><label className="text-sm">Paid Date</label><Input type="date" value={form.deposit_paid_at} onChange={(e) => update('deposit_paid_at', e.target.value)} /></div>
              </div>
              <div><label className="text-sm">Payment Reference</label><Input value={form.deposit_transaction_reference} onChange={(e) => update('deposit_transaction_reference', e.target.value)} /></div>
              <div><label className="text-sm">Stripe Payment Intent (optional)</label><Input value={form.stripe_payment_intent_id} onChange={(e) => update('stripe_payment_intent_id', e.target.value)} /></div>
              <div><label className="text-sm">Stripe Checkout Session (optional)</label><Input value={form.stripe_checkout_session_id} onChange={(e) => update('stripe_checkout_session_id', e.target.value)} /></div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={markDepositRequested}>Mark Deposit Requested</Button>
                <Button type="button" variant="outline" onClick={markDepositPaid}>Mark Deposit Paid</Button>
              </div>
            </div>

            <div className="rounded-lg border border-[#ded2c4] p-4 space-y-3">
              <h3 className="font-semibold text-[#2d3a47]">Rental Agreement</h3>
              <div>
                <label className="text-sm">Agreement Status</label>
                <Select value={form.agreement_status} onValueChange={(v) => update('agreement_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['not_sent','ready_to_send','sent','viewed','signed','voided'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm">Agreement Document URL</label><Input value={form.agreement_document_url} onChange={(e) => update('agreement_document_url', e.target.value)} /></div>
              <div><label className="text-sm">Signed Document URL</label><Input value={form.signed_document_url} onChange={(e) => update('signed_document_url', e.target.value)} /></div>
              <div><label className="text-sm">Provider Reference ID</label><Input value={form.agreement_provider_reference_id} onChange={(e) => update('agreement_provider_reference_id', e.target.value)} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="text-sm">Sent Date</label><Input type="date" value={form.agreement_sent_at} onChange={(e) => update('agreement_sent_at', e.target.value)} /></div>
                <div><label className="text-sm">Signed Date</label><Input type="date" value={form.agreement_signed_at} onChange={(e) => update('agreement_signed_at', e.target.value)} /></div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={markAgreementSent}>Mark Agreement Sent</Button>
                <Button type="button" variant="outline" onClick={markAgreementSigned}>Mark Agreement Signed</Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-[#ded2c4] p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#2d3a47]">Quote Breakdown</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base Price</span><span>{formatCurrency(form.base_price)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(form.delivery_fee)}</span></div>
              <div className="flex justify-between"><span>Add-ons</span><span>{formatCurrency(form.add_ons)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(form.discount_amount)}</span></div>
              <div className="border-t pt-2 flex justify-between font-semibold"><span>Subtotal / Total</span><span>{formatCurrency(totals.total)}</span></div>
              <div className="flex justify-between"><span>Deposit</span><span>{formatCurrency(form.deposit_amount)}</span></div>
              <div className="border-t pt-2 flex justify-between font-semibold text-[#2d3a47]"><span>Final Balance</span><span>{formatCurrency(totals.finalBalance)}</span></div>
            </div>
            <div className="rounded-lg bg-[#ded2c4]/30 p-3 text-sm text-[#2d3a47]">Manual override will mark this quote as admin-edited and persist override values.</div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white">
              {saving ? 'Saving...' : 'Save Quote Changes'}
            </Button>
            <Button onClick={handleSendQuote} disabled={sendingQuote} variant="outline" className="w-full">{sendingQuote ? 'Sending...' : 'Send Quote Email to Customer'}</Button>
            {message && <p className="text-sm text-[#2d3a47]">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
