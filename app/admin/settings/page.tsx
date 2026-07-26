import { createClient } from '@/lib/supabase/server';
import { AdminErrorState } from '@/components/admin/admin-feedback';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import PricingSettingsForm from '@/components/admin/pricing-settings-form';

export const metadata = {
  title: 'Pricing Settings',
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
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Configuration"
          title="Pricing Settings"
          description="Manage the pricing rules used for automatic quote calculations."
        />
        <AdminErrorState description="Unable to load pricing settings. Please try again later." />
      </div>
    );
  }

  // Group settings by category
  const groupedSettings = {
    basePricing: settings?.filter(s => s.setting_key.startsWith('base_price')) || [],
    travel: settings?.filter(s => ['included_miles', 'travel_rate_per_mile'].includes(s.setting_key)) || [],
    utilities: settings?.filter(s => ['generator_fee', 'water_fee'].includes(s.setting_key)) || [],
    serviceFees: settings?.filter(s => ['cleaning_fee', 'damage_waiver_fee'].includes(s.setting_key)) || [],
    afterHours: settings?.filter(s => s.setting_key.startsWith('after_hours')) || [],
    deposit: settings?.filter(s => s.setting_key === 'deposit_percentage') || [],
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Pricing Settings"
        description="Manage the pricing rules used for automatic quote calculations."
      />

      <PricingSettingsForm settings={settings || []} groupedSettings={groupedSettings} />
    </div>
  );
}
