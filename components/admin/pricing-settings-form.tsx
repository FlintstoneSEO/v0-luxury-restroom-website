'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Save, DollarSign, Truck, Zap, Clock, Percent, ShieldCheck } from 'lucide-react';

interface PricingSetting {
  id: string;
  setting_key: string;
  setting_value: number;
  description: string | null;
  updated_at: string;
}

interface GroupedSettings {
  basePricing: PricingSetting[];
  travel: PricingSetting[];
  utilities: PricingSetting[];
  serviceFees: PricingSetting[];
  afterHours: PricingSetting[];
  deposit: PricingSetting[];
}

interface PricingSettingsFormProps {
  settings: PricingSetting[];
  groupedSettings: GroupedSettings;
}

const defaultSettingValues: Record<string, number> = {
  base_price_100_guests: 650,
  base_price_150_guests: 750,
  base_price_200_guests: 900,
  base_price_200_plus: 1100,
  included_miles: 30,
  travel_rate_per_mile: 2.5,
  generator_fee: 150,
  water_fee: 100,
  cleaning_fee: 125,
  damage_waiver_fee: 75,
  rush_booking_fee: 250,
  extra_day_fee: 275,
  after_hours_hourly_rate: 75,
  after_hours_cutoff_hour: 22,
  sales_tax_percentage: 6,
  deposit_percentage: 40,
};

const settingLabels: Record<string, string> = {
  base_price_100_guests: 'Up to 100 guests',
  base_price_150_guests: '101-150 guests',
  base_price_200_guests: '151-200 guests',
  base_price_200_plus: '200+ guests',
  included_miles: 'Included miles (free)',
  travel_rate_per_mile: 'Rate per additional mile',
  generator_fee: 'Generator fee (no power)',
  water_fee: 'Water service fee (no water)',
  cleaning_fee: 'Cleaning Fee',
  damage_waiver_fee: 'Damage Waiver Fee',
  rush_booking_fee: 'Rush Booking Fee',
  extra_day_fee: 'Extra Day Fee',
  after_hours_hourly_rate: 'Hourly rate after cutoff',
  after_hours_cutoff_hour: 'Cutoff hour (24h format)',
  sales_tax_percentage: 'Michigan sales tax percentage',
  deposit_percentage: 'Deposit percentage',
};

const GROUPED_SETTING_KEYS = new Set([
  ...Object.keys(defaultSettingValues),
]);

function mergeSettingsWithDefaults(settings: PricingSetting[]): PricingSetting[] {
  const settingsByKey = new Map(settings.map((setting) => [setting.setting_key, setting]));
  const defaults = Object.entries(defaultSettingValues).map(([key, value]) => {
    const existing = settingsByKey.get(key);
    return existing ?? {
      id: key,
      setting_key: key,
      setting_value: value,
      description: `Pricing setting for ${key.replaceAll('_', ' ')}`,
      updated_at: '',
    };
  });

  const extras = settings.filter((setting) => !(setting.setting_key in defaultSettingValues));
  return [...defaults, ...extras];
}

export default function PricingSettingsForm({ settings, groupedSettings: _groupedSettings }: PricingSettingsFormProps) {
  const router = useRouter();
  const mergedSettings = mergeSettingsWithDefaults(settings);
  const groupedSettings: GroupedSettings = {
    basePricing: mergedSettings.filter(s => s.setting_key.startsWith('base_price')),
    travel: mergedSettings.filter(s => ['included_miles', 'travel_rate_per_mile'].includes(s.setting_key)),
    utilities: mergedSettings.filter(s => ['generator_fee', 'water_fee'].includes(s.setting_key)),
    serviceFees: mergedSettings.filter(s => ['cleaning_fee', 'damage_waiver_fee', 'rush_booking_fee', 'extra_day_fee'].includes(s.setting_key)),
    afterHours: mergedSettings.filter(s => s.setting_key.startsWith('after_hours')),
    deposit: mergedSettings.filter(s => ['sales_tax_percentage', 'deposit_percentage'].includes(s.setting_key)),
  };
  const [formValues, setFormValues] = useState<Record<string, number>>(
    mergedSettings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, number>)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const otherSettings = mergedSettings.filter((setting) => !GROUPED_SETTING_KEYS.has(setting.setting_key));

  const handleChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[admin/pricing-settings-form] payload before save', formValues);
      }
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: formValues }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save settings');
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      router.refresh();
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingInput = (setting: PricingSetting, prefix: string = '$') => (
    <Field key={setting.setting_key}>
      <FieldLabel htmlFor={setting.setting_key}>
        {settingLabels[setting.setting_key] || setting.setting_key}
      </FieldLabel>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={setting.setting_key}
          type="number"
          step="0.01"
          min="0"
          value={formValues[setting.setting_key] || 0}
          onChange={(e) => handleChange(setting.setting_key, e.target.value)}
          className={prefix ? 'pl-7' : ''}
        />
      </div>
      {setting.description && (
        <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
      )}
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-[#2d3a47]" />
          <h2 className="text-lg font-semibold text-[#2d3a47]">Base Rental Pricing</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.basePricing.map(setting => renderSettingInput(setting))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="w-5 h-5 text-[#2d3a47]" />
          <h2 className="text-lg font-semibold text-[#2d3a47]">Travel Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.travel.map(setting => renderSettingInput(setting, setting.setting_key === 'included_miles' ? '' : '$'))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-[#2d3a47]" />
          <h2 className="text-lg font-semibold text-[#2d3a47]">Utility Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.utilities.map(setting => renderSettingInput(setting))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-[#2d3a47]" />
          <h2 className="text-lg font-semibold text-[#2d3a47]">Standard Service Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.serviceFees.map(setting => renderSettingInput(setting))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-[#2d3a47]" />
          <h2 className="text-lg font-semibold text-[#2d3a47]">After Hours Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.afterHours.map(setting => renderSettingInput(setting, setting.setting_key === 'after_hours_cutoff_hour' ? '' : '$'))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Percent className="w-5 h-5 text-[#2d3a47]" />
          <h2 className="text-lg font-semibold text-[#2d3a47]">Deposit Settings</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.deposit.map(setting => renderSettingInput(setting, ''))}
        </div>
      </div>

      {otherSettings.length > 0 && (
        <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-[#2d3a47]" />
            <h2 className="text-lg font-semibold text-[#2d3a47]">Other Pricing Settings</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {otherSettings.map(setting => renderSettingInput(setting))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="bg-[#2d3a47] hover:bg-[#1f2933] text-white" disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
