import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PricingSettingsForm from '@/components/admin/pricing-settings-form';

export const metadata = {
  title: 'Pricing Settings | Admin | Signature Luxe',
  description: 'Manage pricing settings for quote calculations',
};

interface PricingSetting {
  id: string;
  setting_key: string;
  setting_value: number;
  description: string | null;
  updated_at: string;
}

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated (for now, just check if we can access the data)
  const { data: settings, error } = await supabase
    .from('pricing_settings')
    .select('*')
    .order('setting_key');

  if (error) {
    console.error('Error fetching settings:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Settings</h2>
            <p className="text-red-600 mt-2">Unable to load pricing settings. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Group settings by category
  const groupedSettings = {
    basePricing: settings?.filter(s => s.setting_key.startsWith('base_price')) || [],
    travel: settings?.filter(s => ['included_miles', 'travel_rate_per_mile'].includes(s.setting_key)) || [],
    utilities: settings?.filter(s => ['generator_fee', 'water_fee'].includes(s.setting_key)) || [],
    afterHours: settings?.filter(s => s.setting_key.startsWith('after_hours')) || [],
    deposit: settings?.filter(s => s.setting_key === 'deposit_percentage') || [],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-navy">Pricing Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage the pricing rules used for automatic quote calculations.
          </p>
        </div>

        <PricingSettingsForm settings={settings || []} groupedSettings={groupedSettings} />
      </div>
    </div>
  );
}
