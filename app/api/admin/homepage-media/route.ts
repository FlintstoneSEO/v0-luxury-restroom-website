import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const { row } = await request.json();
    if (!row?.id) return NextResponse.json({ ok: false, error: 'Missing row id.' }, { status: 400 });


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
        updated_by: adminAuth.user.id,
      })
      .eq('id', row.id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
