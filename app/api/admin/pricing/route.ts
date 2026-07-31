import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PRICING } from '@/lib/pricing-engine';

const ALLOWED_PRICING_KEYS = new Set(Object.keys(DEFAULT_PRICING));

export async function PUT(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const { settings } = await request.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/admin/pricing] pricing settings payload before upsert', { settings });
    }
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid settings payload.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const numericEntries: Array<{ setting_key: string; setting_value: number; description: string }> = Object.entries(settings as Record<string, number>)
      .filter(([setting_key]) => ALLOWED_PRICING_KEYS.has(setting_key))
      .map(([setting_key, rawValue]) => {
        const setting_value = Number(rawValue);
        return {
          setting_key,
          setting_value,
          description: `Pricing setting for ${setting_key.replaceAll('_', ' ')}`,
        };
      })
      .filter((entry) => Number.isFinite(entry.setting_value));

    const invalidPercentage = numericEntries.find(
      (entry) =>
        ['sales_tax_percentage', 'deposit_percentage'].includes(entry.setting_key) &&
        (entry.setting_value < 0 || entry.setting_value > 100)
    );
    if (invalidPercentage) {
      return NextResponse.json(
        { ok: false, error: `${invalidPercentage.setting_key} must be between 0 and 100.` },
        { status: 400 }
      );
    }

    if (!numericEntries.length) {
      return NextResponse.json({ ok: false, error: 'No valid numeric pricing settings were provided.' }, { status: 400 });
    }

    const payload = [...numericEntries];
    const { error, data } = await supabase.from('pricing_settings').upsert(payload, { onConflict: 'setting_key' }).select('setting_key, setting_value, description');
    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/admin/pricing] database response', { error, updated: data?.length ?? 0 });
    }
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/admin/pricing] Unexpected error', error);
    return NextResponse.json({ ok: false, error: 'Unexpected server error while saving pricing settings.' }, { status: 500 });
  }
}
