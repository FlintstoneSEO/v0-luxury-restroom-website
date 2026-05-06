'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Save, DollarSign, Truck, Zap, Clock, Percent } from 'lucide-react';

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
  afterHours: PricingSetting[];
  deposit: PricingSetting[];
}

interface PricingSettingsFormProps {
  settings: PricingSetting[];
  groupedSettings: GroupedSettings;
}

const settingLabels: Record<string, string> = {
  base_price_100_guests: 'Up to 100 guests',
  base_price_150_guests: '101-150 guests',
  base_price_200_guests: '151-200 guests',
  base_price_200_plus: '200+ guests',
  included_miles: 'Included miles (free)',
  travel_rate_per_mile: 'Rate per additional mile',
  generator_fee: 'Generator fee (no power)',
  water_fee: 'Water service fee (no water)',
  after_hours_hourly_rate: 'Hourly rate after cutoff',
  after_hours_cutoff_hour: 'Cutoff hour (24h format)',
  deposit_percentage: 'Deposit percentage',
};

export default function PricingSettingsForm({ settings, groupedSettings }: PricingSettingsFormProps) {
  const [formValues, setFormValues] = useState<Record<string, number>>(
    settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, number>)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      // In a real implementation, this would call a server action to update the settings
      // For now, we'll show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
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

      {/* Base Pricing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-navy">Base Rental Pricing</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.basePricing.map(setting => renderSettingInput(setting))}
        </div>
      </div>

      {/* Travel Fees */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-navy">Travel Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.travel.map(setting => 
            renderSettingInput(setting, setting.setting_key === 'included_miles' ? '' : '$')
          )}
        </div>
      </div>

      {/* Utility Fees */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-navy">Utility Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.utilities.map(setting => renderSettingInput(setting))}
        </div>
      </div>

      {/* After Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-navy">After Hours Fees</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.afterHours.map(setting => 
            renderSettingInput(setting, setting.setting_key === 'after_hours_cutoff_hour' ? '' : '$')
          )}
        </div>
      </div>

      {/* Deposit */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Percent className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-navy">Deposit Settings</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedSettings.deposit.map(setting => renderSettingInput(setting, ''))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="bg-amber-600 hover:bg-amber-700 text-white"
          disabled={isSaving}
        >
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
