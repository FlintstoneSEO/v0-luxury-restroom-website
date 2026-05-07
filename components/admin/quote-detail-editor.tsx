'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { QuoteRequest, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, EVENT_TYPES } from '@/lib/quotes/types';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, Send, FileSignature, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface QuoteDetailEditorProps {
  quote: QuoteRequest;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function QuoteDetailEditor({ quote }: QuoteDetailEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    // Customer
    customer_name: quote.customer_name ?? '',
    email: quote.email ?? '',
    phone: quote.phone ?? '',
    
    // Event
    event_date: quote.event_date ?? '',
    event_type: quote.event_type ?? '',
    guest_count: quote.guest_count ?? 0,
    event_address: quote.event_address ?? '',
    city: quote.city ?? '',
    state: quote.state ?? '',
    zip_code: quote.zip_code ?? '',
    event_start_time: quote.event_start_time ?? '',
    event_end_time: quote.event_end_time ?? '',
    has_power: quote.has_power ?? false,
    has_water: quote.has_water ?? false,
    additional_notes: quote.additional_notes ?? '',
    distance_miles: quote.distance_miles ?? 0,
    
    // Pricing
    base_price: quote.base_price ?? 0,
    travel_fee: quote.travel_fee ?? 0,
    utility_fee: quote.utility_fee ?? 0,
    after_hours_fee: quote.after_hours_fee ?? 0,
    cleaning_fee: quote.cleaning_fee ?? 0,
    damage_waiver_fee: quote.damage_waiver_fee ?? 0,
    rush_booking_fee: quote.rush_booking_fee ?? 0,
    subtotal: quote.subtotal ?? 0,
    discount_amount: quote.discount_amount ?? 0,
    total_price: quote.total_price ?? 0,
    deposit_amount: quote.deposit_amount ?? 0,
    final_balance: quote.final_balance ?? 0,
    quote_expires_at: quote.quote_expires_at ?? '',
    is_manual_override: quote.is_manual_override ?? false,
    
    // Workflow
    status: quote.status,
    agreement_status: quote.agreement_status,
    deposit_status: quote.deposit_status,
    internal_notes: quote.internal_notes ?? '',
    customer_notes: quote.customer_notes ?? '',
    
    // Agreement
    agreement_document_url: quote.agreement_document_url ?? '',
    signed_document_url: quote.signed_document_url ?? '',
    agreement_provider_reference_id: quote.agreement_provider_reference_id ?? '',
    agreement_sent_at: quote.agreement_sent_at ?? '',
    agreement_signed_at: quote.agreement_signed_at ?? '',
    
    // Deposit
    deposit_payment_link: quote.deposit_payment_link ?? '',
    deposit_due_date: quote.deposit_due_date ?? '',
    deposit_paid_at: quote.deposit_paid_at ?? '',
    deposit_paid_amount: quote.deposit_paid_amount ?? 0,
    deposit_transaction_reference: quote.deposit_transaction_reference ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  // Calculate subtotal, total, and final balance
  const recalculatePricing = useCallback(() => {
    const subtotal = 
      (form.base_price || 0) +
      (form.travel_fee || 0) +
      (form.utility_fee || 0) +
      (form.after_hours_fee || 0) +
      (form.cleaning_fee || 0) +
      (form.damage_waiver_fee || 0) +
      (form.rush_booking_fee || 0);
    
    const total = subtotal - (form.discount_amount || 0);
    const finalBalance = total - (form.deposit_amount || 0);
    
    return { subtotal, total, finalBalance };
  }, [form.base_price, form.travel_fee, form.utility_fee, form.after_hours_fee, form.cleaning_fee, form.damage_waiver_fee, form.rush_booking_fee, form.discount_amount, form.deposit_amount]);

  // Auto-calculate when pricing fields change
  useEffect(() => {
    if (!form.is_manual_override) {
      const { subtotal, total, finalBalance } = recalculatePricing();
      setForm(prev => ({
        ...prev,
        subtotal,
        total_price: total,
        final_balance: finalBalance,
      }));
    }
  }, [form.base_price, form.travel_fee, form.utility_fee, form.after_hours_fee, form.cleaning_fee, form.damage_waiver_fee, form.rush_booking_fee, form.discount_amount, form.deposit_amount, form.is_manual_override, recalculatePricing]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to save quote');

      setMessage({ type: 'success', text: 'Quote updated successfully.' });
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save quote changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuoteEmail = async () => {
    setSendingQuote(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send`, {
        method: 'POST',
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send quote email');

      setMessage({ type: 'success', text: 'Quote email sent successfully.' });
      setForm(prev => ({ ...prev, status: 'quote_sent' }));
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send quote email.',
      });
    } finally {
      setSendingQuote(false);
    }
  };

  const markAgreementSent = async () => {
    setForm(prev => ({
      ...prev,
      agreement_status: 'sent',
      agreement_sent_at: new Date().toISOString(),
    }));
    setMessage({ type: 'success', text: 'Agreement marked as sent. Remember to save changes.' });
  };

  const markAgreementSigned = async () => {
    setForm(prev => ({
      ...prev,
      agreement_status: 'signed',
      agreement_signed_at: new Date().toISOString(),
      status: 'agreement_signed',
    }));
    setMessage({ type: 'success', text: 'Agreement marked as signed. Remember to save changes.' });
  };

  const markDepositRequested = async () => {
    setForm(prev => ({
      ...prev,
      deposit_status: 'requested',
      status: 'deposit_pending',
    }));
    setMessage({ type: 'success', text: 'Deposit marked as requested. Remember to save changes.' });
  };

  const markDepositPaid = async () => {
    setForm(prev => ({
      ...prev,
      deposit_status: 'paid',
      deposit_paid_at: new Date().toISOString(),
      deposit_paid_amount: prev.deposit_amount,
      status: 'deposit_paid',
    }));
    setMessage({ type: 'success', text: 'Deposit marked as paid. Remember to save changes.' });
  };

  const calculatedPricing = recalculatePricing();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-[#2d3a47] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2d3a47] mb-1">{quote.customer_name}</h1>
            <p className="text-muted-foreground">
              {quote.email} | {quote.phone}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Quote #{quote.quote_number || quote.id.slice(0, 8)} | Created {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2d3a47]">
              {formatCurrency(form.total_price)}
            </p>
            <p className="text-sm text-muted-foreground">Total Quote</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg flex gap-3 items-start ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="customer_name">Customer Name</FieldLabel>
            <Input
              id="customer_name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field>
            <FieldLabel htmlFor="event_date">Event Date</FieldLabel>
            <Input
              id="event_date"
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_type">Event Type</FieldLabel>
            <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="guest_count">Guest Count</FieldLabel>
            <Input
              id="guest_count"
              type="number"
              value={form.guest_count}
              onChange={(e) => setForm({ ...form, guest_count: parseInt(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="distance_miles">Distance (miles)</FieldLabel>
            <Input
              id="distance_miles"
              type="number"
              step="0.1"
              value={form.distance_miles}
              onChange={(e) => setForm({ ...form, distance_miles: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="event_address">Event Address</FieldLabel>
            <Input
              id="event_address"
              value={form.event_address}
              onChange={(e) => setForm({ ...form, event_address: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip_code">ZIP Code</FieldLabel>
            <Input
              id="zip_code"
              value={form.zip_code}
              onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_start_time">Start Time</FieldLabel>
            <Input
              id="event_start_time"
              type="time"
              value={form.event_start_time}
              onChange={(e) => setForm({ ...form, event_start_time: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_end_time">End Time</FieldLabel>
            <Input
              id="event_end_time"
              type="time"
              value={form.event_end_time}
              onChange={(e) => setForm({ ...form, event_end_time: e.target.value })}
            />
          </Field>
          <Field className="flex items-center gap-2 md:col-span-2">
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_power"
                  checked={form.has_power}
                  onCheckedChange={(checked) => setForm({ ...form, has_power: !!checked })}
                />
                <label htmlFor="has_power" className="text-sm">Power Available</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_water"
                  checked={form.has_water}
                  onCheckedChange={(checked) => setForm({ ...form, has_water: !!checked })}
                />
                <label htmlFor="has_water" className="text-sm">Water Available</label>
              </div>
            </div>
          </Field>
          <Field className="md:col-span-2 lg:col-span-4">
            <FieldLabel htmlFor="additional_notes">Additional Notes (from customer)</FieldLabel>
            <Textarea
              id="additional_notes"
              value={form.additional_notes}
              onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
              rows={3}
            />
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2d3a47]">Pricing</h2>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_manual_override"
              checked={form.is_manual_override}
              onCheckedChange={(checked) => setForm({ ...form, is_manual_override: !!checked })}
            />
            <label htmlFor="is_manual_override" className="text-sm">Manual Override</label>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field>
            <FieldLabel htmlFor="base_price">Base Price</FieldLabel>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="travel_fee">Travel Fee</FieldLabel>
            <Input
              id="travel_fee"
              type="number"
              step="0.01"
              value={form.travel_fee}
              onChange={(e) => setForm({ ...form, travel_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="utility_fee">Utility Fee</FieldLabel>
            <Input
              id="utility_fee"
              type="number"
              step="0.01"
              value={form.utility_fee}
              onChange={(e) => setForm({ ...form, utility_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="after_hours_fee">After Hours Fee</FieldLabel>
            <Input
              id="after_hours_fee"
              type="number"
              step="0.01"
              value={form.after_hours_fee}
              onChange={(e) => setForm({ ...form, after_hours_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cleaning_fee">Cleaning Fee</FieldLabel>
            <Input
              id="cleaning_fee"
              type="number"
              step="0.01"
              value={form.cleaning_fee}
              onChange={(e) => setForm({ ...form, cleaning_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="damage_waiver_fee">Damage Waiver</FieldLabel>
            <Input
              id="damage_waiver_fee"
              type="number"
              step="0.01"
              value={form.damage_waiver_fee}
              onChange={(e) => setForm({ ...form, damage_waiver_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rush_booking_fee">Rush Booking Fee</FieldLabel>
            <Input
              id="rush_booking_fee"
              type="number"
              step="0.01"
              value={form.rush_booking_fee}
              onChange={(e) => setForm({ ...form, rush_booking_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="discount_amount">Discount</FieldLabel>
            <Input
              id="discount_amount"
              type="number"
              step="0.01"
              value={form.discount_amount}
              onChange={(e) => setForm({ ...form, discount_amount: parseFloat(e.target.value) || 0 })}
            />
          </Field>
        </div>

        <div className="mt-6 p-4 bg-[#2d3a47]/5 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="ml-2 font-semibold">{formatCurrency(calculatedPricing.subtotal)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-2 font-bold text-[#2d3a47]">{formatCurrency(calculatedPricing.total)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deposit:</span>
              <span className="ml-2 font-semibold">{formatCurrency(form.deposit_amount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Final Balance:</span>
              <span className="ml-2 font-semibold">{formatCurrency(calculatedPricing.finalBalance)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Field>
            <FieldLabel htmlFor="deposit_amount">Deposit Amount</FieldLabel>
            <Input
              id="deposit_amount"
              type="number"
              step="0.01"
              value={form.deposit_amount}
              onChange={(e) => setForm({ ...form, deposit_amount: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="quote_expires_at">Quote Expires</FieldLabel>
            <Input
              id="quote_expires_at"
              type="date"
              value={form.quote_expires_at}
              onChange={(e) => setForm({ ...form, quote_expires_at: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {/* Workflow Status */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Workflow Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="status">Quote Status</FieldLabel>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="agreement_status">Agreement Status</FieldLabel>
            <Select value={form.agreement_status} onValueChange={(v) => setForm({ ...form, agreement_status: v as typeof form.agreement_status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGREEMENT_TRACKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_status">Deposit Status</FieldLabel>
            <Select value={form.deposit_status} onValueChange={(v) => setForm({ ...form, deposit_status: v as typeof form.deposit_status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPOSIT_TRACKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Agreement Tracking */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Agreement Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="agreement_document_url">Agreement Document URL</FieldLabel>
            <Input
              id="agreement_document_url"
              type="url"
              value={form.agreement_document_url}
              onChange={(e) => setForm({ ...form, agreement_document_url: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="signed_document_url">Signed Document URL</FieldLabel>
            <Input
              id="signed_document_url"
              type="url"
              value={form.signed_document_url}
              onChange={(e) => setForm({ ...form, signed_document_url: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="agreement_provider_reference_id">Provider Reference ID</FieldLabel>
            <Input
              id="agreement_provider_reference_id"
              value={form.agreement_provider_reference_id}
              onChange={(e) => setForm({ ...form, agreement_provider_reference_id: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Agreement Dates</FieldLabel>
            <div className="text-sm text-muted-foreground space-y-1 pt-2">
              {form.agreement_sent_at && <div>Sent: {new Date(form.agreement_sent_at).toLocaleString()}</div>}
              {form.agreement_signed_at && <div>Signed: {new Date(form.agreement_signed_at).toLocaleString()}</div>}
              {!form.agreement_sent_at && !form.agreement_signed_at && <div>Not yet sent</div>}
            </div>
          </Field>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Agreement as Sent',
              description: 'This will update the agreement status to "Sent" and record the current timestamp.',
              action: markAgreementSent,
            })}
            disabled={form.agreement_status === 'signed'}
          >
            <FileSignature className="w-4 h-4 mr-2" />
            Mark Agreement Sent
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Agreement as Signed',
              description: 'This will update the agreement status to "Signed" and record the current timestamp.',
              action: markAgreementSigned,
            })}
            disabled={form.agreement_status === 'signed'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Agreement Signed
          </Button>
        </div>
      </div>

      {/* Deposit Tracking */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Deposit Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="deposit_payment_link">Payment Link</FieldLabel>
            <Input
              id="deposit_payment_link"
              type="url"
              value={form.deposit_payment_link}
              onChange={(e) => setForm({ ...form, deposit_payment_link: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_due_date">Due Date</FieldLabel>
            <Input
              id="deposit_due_date"
              type="date"
              value={form.deposit_due_date}
              onChange={(e) => setForm({ ...form, deposit_due_date: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_paid_amount">Paid Amount</FieldLabel>
            <Input
              id="deposit_paid_amount"
              type="number"
              step="0.01"
              value={form.deposit_paid_amount}
              onChange={(e) => setForm({ ...form, deposit_paid_amount: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_transaction_reference">Transaction Reference</FieldLabel>
            <Input
              id="deposit_transaction_reference"
              value={form.deposit_transaction_reference}
              onChange={(e) => setForm({ ...form, deposit_transaction_reference: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Payment Date</FieldLabel>
            <div className="text-sm text-muted-foreground pt-2">
              {form.deposit_paid_at ? new Date(form.deposit_paid_at).toLocaleString() : 'Not yet paid'}
            </div>
          </Field>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Deposit as Requested',
              description: 'This will update the deposit status to "Requested".',
              action: markDepositRequested,
            })}
            disabled={form.deposit_status === 'paid'}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Mark Deposit Requested
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Deposit as Paid',
              description: 'This will update the deposit status to "Paid" and record the current timestamp.',
              action: markDepositPaid,
            })}
            disabled={form.deposit_status === 'paid'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Deposit Paid
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="internal_notes">Internal Notes (Staff Only)</FieldLabel>
            <Textarea
              id="internal_notes"
              value={form.internal_notes}
              onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
              placeholder="Private notes for your team..."
              rows={4}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer_notes">Customer Notes</FieldLabel>
            <Textarea
              id="customer_notes"
              value={form.customer_notes}
              onChange={(e) => setForm({ ...form, customer_notes: e.target.value })}
              placeholder="Notes visible to customer..."
              rows={4}
            />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirmDialog({
            open: true,
            title: 'Send Quote Email',
            description: 'This will send an email to the customer with a link to review and approve the quote. The quote status will be updated to "Quote Sent".',
            action: handleSendQuoteEmail,
          })}
          disabled={sendingQuote || !['pending_review', 'new', 'under_review', 'draft_quote', 'change_requested', 'quote_sent'].includes(form.status)}
          className="flex-1"
        >
          {sendingQuote ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Quote Email
            </>
          )}
        </Button>
        <Link href="/admin" className="flex-1">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDialog?.action) {
                  await confirmDialog.action();
                }
                setConfirmDialog(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
