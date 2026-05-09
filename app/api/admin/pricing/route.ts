import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
  const { settings, optional_addons_json } = await request.json();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[api/admin/pricing] request body', { settings, optional_addons_json });
  }
  const supabase = createAdminClient();

  const numericEntries = Object.entries(settings as Record<string, number>).map(([setting_key, setting_value]) => ({
    setting_key,
    setting_value,
    setting_value_text: null,
  }));

  const payload = [...numericEntries];
  if (typeof optional_addons_json === 'string') {
    payload.push({
      setting_key: 'optional_addons_json',
      setting_value: null,
      setting_value_text: optional_addons_json,
    });
  }

  const { error, data } = await supabase.from('pricing_settings').upsert(payload, { onConflict: 'setting_key' }).select('setting_key, setting_value, setting_value_text');
  if (process.env.NODE_ENV !== 'production') {
    console.log('[api/admin/pricing] database response', { error, updated: data?.length ?? 0 });
  }
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
