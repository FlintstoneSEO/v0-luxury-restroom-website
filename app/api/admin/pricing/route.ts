import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
  const { settings, optional_addons_json } = await request.json();
  const supabase = createAdminClient();

  const numericEntries = Object.entries(settings as Record<string, number>).map(([setting_key, setting_value]) => ({
    setting_key,
    setting_value,
    setting_value_text: null,
  }));

  const payload = [
    ...numericEntries,
    {
      setting_key: 'optional_addons_json',
      setting_value: null,
      setting_value_text: optional_addons_json ?? '[]',
    },
  ];

  const { error } = await supabase.from('pricing_settings').upsert(payload, { onConflict: 'setting_key' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
