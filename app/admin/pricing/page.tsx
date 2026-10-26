import { createClient } from '@/lib/supabase/server';
import PricingSettingsEditor from '@/components/admin/pricing-settings-editor';
import { mergePricingSettings } from '@/lib/pricing/settings';
import './pricing.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Pricing & Settings', description: 'Configure pricing rules and preview example quotes' };

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('pricing_settings').select('setting_key, setting_value');
  return <PricingSettingsEditor initialSettings={mergePricingSettings(data ?? [])} loadError={error ? 'Saved pricing could not be loaded. Reload the page before editing.' : undefined} />;
}
