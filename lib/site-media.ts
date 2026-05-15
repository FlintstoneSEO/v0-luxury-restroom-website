import { createClient } from '@/lib/supabase/server';

export interface SiteMediaRecord {
  id: string;
  page_slug: string;
  section_key: string;
  label: string | null;
  image_url: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  recommended_width: number | null;
  recommended_height: number | null;
  updated_at: string | null;
}

const SUPABASE_HOST = 'lmytjyqjgjsqqffsulwz.supabase.co';

function isSupabaseImage(url?: string | null) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === SUPABASE_HOST;
  } catch {
    return false;
  }
}

export async function fetchSiteMedia(pageSlug?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('site_media')
    .select('*')
    .eq('is_active', true)
    .order('page_slug', { ascending: true })
    .order('sort_order', { ascending: true });

  if (pageSlug) {
    query = query.eq('page_slug', pageSlug);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[site-media] failed to fetch media', error);
    return [] as SiteMediaRecord[];
  }

  return (data || []) as SiteMediaRecord[];
}

export async function fetchAllSiteMedia() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_media')
    .select('*')
    .order('page_slug', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[site-media] failed to fetch all media', error);
    return [] as SiteMediaRecord[];
  }

  return (data || []) as SiteMediaRecord[];
}

export function getSiteMediaMap(records: SiteMediaRecord[]) {
  const map = new Map<string, SiteMediaRecord>();
  for (const record of records) {
    map.set(`${record.page_slug}:${record.section_key}`, record);
  }
  return map;
}

export function resolveSiteImage(
  recordsMap: Map<string, SiteMediaRecord>,
  pageSlug: string,
  sectionKey: string,
  fallback: { src: string; alt: string; label?: string }
) {
  const record = recordsMap.get(`${pageSlug}:${sectionKey}`);
  const isSupabase = isSupabaseImage(record?.image_url);
  const src = isSupabase && record?.image_url
    ? `${record.image_url}${record.image_url.includes('?') ? '&' : '?'}v=${record.updated_at || record.id}`
    : record?.image_url || fallback.src;

  return {
    src,
    alt: record?.alt_text || fallback.alt,
    label: record?.label || fallback.label,
    caption: record?.caption || '',
    unoptimized: isSupabase,
  };
}
