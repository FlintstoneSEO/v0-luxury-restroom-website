'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { QuoteRequest, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES } from '@/lib/quotes/types';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function QuoteDetailEditor({ quote }: { quote: QuoteRequest }) {
  const [form, setForm] = useState({
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    address: quote.address,
    city: quote.city,
    state: quote.state,
    zip: quote.zip,
    room_type: quote.room_type,
    room_condition: quote.room_condition,
    features: quote.features.join(', '),
    color_preference: quote.color_preference,
    base_price: quote.base_price ?? 0,
    labor_cost: quote.labor_cost ?? 0,
    materials_cost: quote.materials_cost ?? 0,
    tax_amount: quote.tax_amount ?? 0,
    discount_amount: quote.discount_amount ?? 0,
    final_price: quote.final_price ?? 0,
    status: quote.status,
    internal_notes: quote.internal_notes ?? '',
    customer_notes: quote.customer_notes ?? '',
    agreement_status: quote.agreement_status,
    agreement_document_url: quote.agreement_document_url ?? '',
    agreement_provider_reference_id: quote.agreement_provider_reference_id ?? '',
    deposit_status: quote.deposit_status,
    deposit_payment_link: quote.deposit_payment_link ?? '',
    deposit_due_date: quote.deposit_due_date ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updatePayload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        room_type: form.room_type,
        room_condition: form.room_condition,
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f),
        color_preference: form.color_preference,
        base_price: form.base_price,
        labor_cost: form.labor_cost,
        materials_cost: form.materials_cost,
        tax_amount: form.tax_amount,
        discount_amount: form.discount_amount,
        final_price: form.final_price,
        status: form.status,
        internal_notes: form.internal_notes,
        customer_notes: form.customer_notes,
        agreement_status: form.agreement_status,
        agreement_document_url: form.agreement_document_url,
        agreement_provider_reference_id: form.agreement_provider_reference_id,
        deposit_status: form.deposit_status,
        deposit_payment_link: form.deposit_payment_link,
        deposit_due_date: form.deposit_due_date,
      };

      const res = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to save quote');

      setMessage({ type: 'success', text: 'Quote updated successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save quote changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const totalPrice =
    form.base_price + form.labor_cost + form.materials_cost + form.tax_amount - form.discount_amount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-navy mb-1">{quote.name}</h1>
            <p className="text-muted-foreground">
              {quote.email} · {quote.phone}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Quote #{quote.id.slice(0, 8)} · Created {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-navy">
              ${totalPrice.toFixed(2)}
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
          <p
            className={
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
            <FieldLabel htmlFor="zip">ZIP</FieldLabel>
            <Input
              id="zip"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {/* Restroom Selection */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Restroom Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="room_type">Room Type</FieldLabel>
            <Input
              id="room_type"
              value={form.room_type}
              onChange={(e) => setForm({ ...form, room_type: e.target.value })}
              placeholder="e.g., Luxury 1-Stall"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="room_condition">Condition</FieldLabel>
            <Input
              id="room_condition"
              value={form.room_condition}
              onChange={(e) => setForm({ ...form, room_condition: e.target.value })}
              placeholder="e.g., Excellent"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="color_preference">Color Preference</FieldLabel>
            <Input
              id="color_preference"
              value={form.color_preference}
              onChange={(e) =>
                setForm({ ...form, color_preference: e.target.value })
              }
              placeholder="e.g., White"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="features">Features (comma-separated)</FieldLabel>
            <Input
              id="features"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="e.g., LED lighting, Hands-free soap"
            />
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="base_price">Base Price</FieldLabel>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={form.base_price}
              onChange={(e) =>
                setForm({ ...form, base_price: parseFloat(e.target.value) })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="labor_cost">Labor Cost</FieldLabel>
            <Input
              id="labor_cost"
              type="number"
              step="0.01"
              value={form.labor_cost}
              onChange={(e) =>
                setForm({ ...form, labor_cost: parseFloat(e.target.value) })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="materials_cost">Materials Cost</FieldLabel>
            <Input
              id="materials_cost"
              type="number"
              step="0.01"
              value={form.materials_cost}
              onChange={(e) =>
                setForm({ ...form, materials_cost: parseFloat(e.target.value) })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tax_amount">Tax</FieldLabel>
            <Input
              id="tax_amount"
              type="number"
              step="0.01"
              value={form.tax_amount}
              onChange={(e) =>
                setForm({ ...form, tax_amount: parseFloat(e.target.value) })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="discount_amount">Discount</FieldLabel>
            <Input
              id="discount_amount"
              type="number"
              step="0.01"
              value={form.discount_amount}
              onChange={(e) =>
                setForm({ ...form, discount_amount: parseFloat(e.target.value) })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="final_price">Final Price</FieldLabel>
            <Input
              id="final_price"
              type="number"
              step="0.01"
              value={form.final_price}
              onChange={(e) =>
                setForm({ ...form, final_price: parseFloat(e.target.value) })
              }
            />
          </Field>
        </div>
      </div>

      {/* Status & Workflow */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Workflow Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="status">Quote Status</FieldLabel>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
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
            <Select value={form.agreement_status} onValueChange={(v) => setForm({ ...form, agreement_status: v as any })}>
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
            <Select value={form.deposit_status} onValueChange={(v) => setForm({ ...form, deposit_status: v as any })}>
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
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Agreement Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="agreement_document_url">Document URL</FieldLabel>
            <Input
              id="agreement_document_url"
              type="url"
              value={form.agreement_document_url}
              onChange={(e) =>
                setForm({ ...form, agreement_document_url: e.target.value })
              }
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="agreement_provider_reference_id">Provider Reference ID</FieldLabel>
            <Input
              id="agreement_provider_reference_id"
              value={form.agreement_provider_reference_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  agreement_provider_reference_id: e.target.value,
                })
              }
            />
          </Field>
        </div>
      </div>

      {/* Deposit Tracking */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Deposit Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="deposit_payment_link">Payment Link</FieldLabel>
            <Input
              id="deposit_payment_link"
              type="url"
              value={form.deposit_payment_link}
              onChange={(e) =>
                setForm({ ...form, deposit_payment_link: e.target.value })
              }
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_due_date">Due Date</FieldLabel>
            <Input
              id="deposit_due_date"
              type="date"
              value={form.deposit_due_date}
              onChange={(e) =>
                setForm({ ...form, deposit_due_date: e.target.value })
              }
            />
          </Field>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-gold/20 p-6">
        <h2 className="text-xl font-semibold text-navy mb-4">Notes</h2>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="internal_notes">Internal Notes</FieldLabel>
            <Textarea
              id="internal_notes"
              value={form.internal_notes}
              onChange={(e) =>
                setForm({ ...form, internal_notes: e.target.value })
              }
              placeholder="Private notes for your team..."
              rows={4}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer_notes">Customer Notes</FieldLabel>
            <Textarea
              id="customer_notes"
              value={form.customer_notes}
              onChange={(e) =>
                setForm({ ...form, customer_notes: e.target.value })
              }
              placeholder="Notes visible to customer..."
              rows={4}
            />
          </Field>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-navy hover:bg-navy/90 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save All Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
