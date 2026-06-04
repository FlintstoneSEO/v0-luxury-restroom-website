import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { SITE_MEDIA_PAGE_REGISTRY } from '@/lib/site-media-registry';

export async function PUT(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const { row } = await request.json();
    if (!row?.id) return NextResponse.json({ ok: false, error: 'Missing row id.' }, { status: 400 });
    if (!row?.page_slug?.trim()) return NextResponse.json({ ok: false, error: 'page_slug is required.' }, { status: 400 });
    if (!row?.section_key?.trim()) return NextResponse.json({ ok: false, error: 'section_key is required.' }, { status: 400 });
    if (row?.image_url && !row?.alt_text?.trim()) return NextResponse.json({ ok: false, error: 'alt_text is required when image_url exists.' }, { status: 400 });


    const admin = createAdminClient();
    const { error } = await admin
      .from('site_media')
      .update({
        page_slug: row.page_slug,
        section_key: row.section_key,
        label: row.label,
        image_url: row.image_url,
        storage_bucket: row.storage_path ? 'site-media' : null,
        storage_path: row.storage_path,
        alt_text: row.alt_text,
        caption: row.caption,
        is_active: row.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}


export async function POST() {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  try {

    const admin = createAdminClient();
    const now = new Date().toISOString();
    const rows = SITE_MEDIA_PAGE_REGISTRY.flatMap((page) =>
      page.sections.map((section) => ({
        page_slug: page.pageSlug,
        section_key: section.sectionKey,
        label: section.label,
        recommended_width: section.recommendedWidth,
        recommended_height: section.recommendedHeight,
        is_active: true,
        updated_at: now,
      })),
    );

    const { error } = await admin.from('site_media').upsert(rows, { onConflict: 'page_slug,section_key' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, createdOrUpdated: rows.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
