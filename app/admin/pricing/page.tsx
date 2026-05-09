import { createClient } from '@/lib/supabase/server';
import PricingSettingsEditor from '@/components/admin/pricing-settings-editor';
import { DEFAULT_PRICING } from '@/lib/pricing-engine';

export const metadata = {
  title: 'Pricing Settings | Admin | Signature Luxe',
  description: 'Manage centralized pricing rules for quote calculations',
};

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('pricing_settings').select('setting_key, setting_value');

  const fromDb = Object.fromEntries((data ?? []).filter((row) => row.setting_key !== 'optional_addons_json').map((row) => [row.setting_key, Number(row.setting_value)]));
  const merged = { ...DEFAULT_PRICING, ...fromDb };

  return <PricingSettingsEditor initialSettings={merged} initialAddons="[]" />;
}
