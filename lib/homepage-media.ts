import { createClient } from '@/lib/supabase/server';

export type HomepageSectionKey =
  | 'hero'
  | 'weddings'
  | 'private_parties'
  | 'corporate_events'
  | 'festivals'
  | 'special_events'
  | 'trailer_gallery';

export interface HomepageMediaRecord {
  id: string;
  section_key: HomepageSectionKey;
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
}

export const homepageImageFallbacks: Record<HomepageSectionKey, { src: string; alt: string; label?: string }> = {
  hero: {
    src: '/images/Wedding Trailer.png',
    alt: 'Luxury restroom trailer parked at an elegant outdoor wedding venue in Lansing, Michigan',
  },
  weddings: {
    src: '/images/Wedding Trailer.png',
    alt: 'Luxury restroom trailer at a daytime outdoor wedding ceremony in Mid-Michigan',
    label: 'Weddings',
  },
  private_parties: {
    src: '/images/Special Event Trailer.png',
    alt: 'Luxury restroom trailer staged for a private backyard evening party in Michigan',
    label: 'Parties',
  },
  corporate_events: {
    src: '/images/MSU Tailgate Rental Restroom.png',
    alt: 'Luxury restroom trailer setup for a corporate networking and special event in Lansing',
    label: 'Corporate',
  },
  festivals: {
    src: '/images/Disaster Relief Trailer.png',
    alt: 'Luxury restroom trailer serving a Michigan festival and community event crowd',
    label: 'Festivals',
  },
  special_events: {
    src: '/images/MSU Tailgate Rental Restroom.png',
    alt: 'Luxury restroom trailer rental for corporate galas, fundraisers, and private events in Mid-Michigan',
  },
  trailer_gallery: {
    src: '/images/MSU Tailgate Rental Restroom.png',
    alt: 'Luxury restroom trailer rental for MSU tailgates and game day events in East Lansing',
  },
};

export async function fetchHomepageMedia() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('homepage_media')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[homepage-media] failed to fetch media', error);
    return [] as HomepageMediaRecord[];
  }

  return (data || []) as HomepageMediaRecord[];
}

export function getHomepageMediaMap(records: HomepageMediaRecord[]) {
  const map = new Map<HomepageSectionKey, HomepageMediaRecord>();
  for (const record of records) {
    map.set(record.section_key, record);
  }
  return map;
}

export function resolveHomepageImage(recordsMap: Map<HomepageSectionKey, HomepageMediaRecord>, sectionKey: HomepageSectionKey) {
  const record = recordsMap.get(sectionKey);
  const fallback = homepageImageFallbacks[sectionKey];

  return {
    src: record?.image_url || fallback.src,
    alt: record?.alt_text || fallback.alt,
    label: record?.label || fallback.label,
    caption: record?.caption || '',
  };
}
