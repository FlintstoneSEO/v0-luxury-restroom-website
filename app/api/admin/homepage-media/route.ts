import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const { row } = await request.json();
    if (!row?.id) return NextResponse.json({ ok: false, error: 'Missing row id.' }, { status: 400 });

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user || auth.user.user_metadata?.is_admin !== true) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('homepage_media')
      .update({
        label: row.label,
        image_url: row.image_url,
        storage_bucket: 'homepage-media',
        storage_path: row.storage_path,
        alt_text: row.alt_text,
        caption: row.caption,
        is_active: row.is_active,
        updated_at: new Date().toISOString(),
        updated_by: auth.user.id,
      })
      .eq('id', row.id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
