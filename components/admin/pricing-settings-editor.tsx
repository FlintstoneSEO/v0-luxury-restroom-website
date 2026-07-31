'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminSaveState } from '@/components/admin/admin-feedback';

const FIELDS: Array<{ key: string; label: string; help?: string }> = [
  { key: 'base_price_100_guests', label: 'Base Price (Up to 100 guests)' },
  { key: 'base_price_150_guests', label: 'Base Price (101-150 guests)' },
  { key: 'base_price_200_guests', label: 'Base Price (151-200 guests)' },
  { key: 'base_price_200_plus', label: 'Base Price (200+ guests)' },
  { key: 'included_miles', label: 'Included Delivery Miles' },
  { key: 'travel_rate_per_mile', label: 'Mileage Rate (per mile)' },
  { key: 'generator_fee', label: 'Generator Fee' },
  { key: 'water_fee', label: 'Water Supply Fee' },
  { key: 'extra_day_fee', label: 'Extra Day Fee' },
  { key: 'cleaning_fee', label: 'Cleaning Fee' },
  { key: 'rush_booking_fee', label: 'Rush Booking Fee' },
  { key: 'damage_waiver_fee', label: 'Damage Waiver Fee' },
  { key: 'after_hours_hourly_rate', label: 'After Hours Hourly Rate' },
  { key: 'after_hours_cutoff_hour', label: 'After Hours Cutoff Hour' },
  { key: 'sales_tax_percentage', label: 'Michigan Sales Tax Percentage', help: 'Applied after discounts to new or explicitly revised quotes.' },
  { key: 'deposit_percentage', label: 'Deposit Percentage' },
];

export default function PricingSettingsEditor({ initialSettings, initialAddons }: { initialSettings: Record<string, number>; initialAddons: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(initialSettings);
  const [addons, setAddons] = useState<string>(initialAddons || '[]');
  const [message, setMessage] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);

  const update = (key: string, raw: string) => setValues((p) => ({ ...p, [key]: Number(raw) || 0 }));

  const save = async () => {
    setSaving(true);
    setMessage('');
    setSaveState('saving');
    try {
      JSON.parse(addons);
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      });
      if (!res.ok) throw new Error('Unable to save settings');
      setMessage('Pricing settings saved.');
      setSaveState('success');
      router.refresh();
    } catch {
      setMessage('Failed to save settings. Ensure optional add-ons JSON is valid.');
      setSaveState('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Pricing"
        description="Centralized pricing rules used by the quote calculation helper."
      />
      <div className="rounded-xl border border-[#ded2c4] bg-white p-5 sm:p-6 space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="note">
          Pricing settings apply to new quotes and explicit financial revisions only. Sent, approved, signed, and paid quotes retain their stored totals.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-[#2d3a47]">{field.label}</label>
              <Input type="number" step="0.01" value={values[field.key] ?? 0} onChange={(e) => update(field.key, e.target.value)} />
              {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-[#2d3a47]">Optional Add-ons (JSON Array)</label>
          <Textarea rows={6} value={addons} onChange={(e) => setAddons(e.target.value)} placeholder='[{"code":"luxury_lighting","label":"Luxury Lighting","price":125}]' />
        </div>

        <Button onClick={save} disabled={saving} className="bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white">
          {saving ? 'Saving...' : 'Save Pricing Settings'}
        </Button>
        <AdminSaveState state={saveState} message={message || undefined} />
      </div>
    </div>
  );
}
