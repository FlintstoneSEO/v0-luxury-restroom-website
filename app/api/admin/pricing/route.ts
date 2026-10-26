import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRICING_FIELDS, validatePricingSettings } from '@/lib/pricing/settings';

export async function PUT(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const { settings } = await request.json();
    const errors = validatePricingSettings(settings);
    if (Object.keys(errors).length) return NextResponse.json({ ok: false, error: 'Review the highlighted pricing settings.', errors }, { status: 400 });
    const supabase = createAdminClient();
    const numericEntries = Object.entries(settings as Record<string, number>).map(([setting_key, setting_value]) => ({
      setting_key, setting_value,
      description: PRICING_FIELDS.find(field => field.key === setting_key)!.label,
    }));

    const payload = [...numericEntries];
    const { error, data } = await supabase.from('pricing_settings').upsert(payload, { onConflict: 'setting_key' }).select('setting_key, setting_value, description');
    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/admin/pricing] database response', { error, updated: data?.length ?? 0 });
    }
    if (error) return NextResponse.json({ ok: false, error: 'Pricing could not be saved. Your changes are still here; try again.' }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/admin/pricing] Unexpected error', error);
    return NextResponse.json({ ok: false, error: 'Unexpected server error while saving pricing settings.' }, { status: 500 });
  }
}
