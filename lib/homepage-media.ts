import { fetchSiteMedia, getSiteMediaMap, resolveSiteImage } from '@/lib/site-media';

export type HomepageSectionKey =
  | 'hero'
  | 'weddings'
  | 'private_parties'
  | 'corporate_events'
  | 'festivals'
  | 'special_events'
  | 'trailer_gallery';

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
  return fetchSiteMedia('homepage');
}

export const getHomepageMediaMap = getSiteMediaMap;

export function resolveHomepageImage(recordsMap: Map<string, any>, sectionKey: HomepageSectionKey) {
  return resolveSiteImage(recordsMap, 'homepage', sectionKey, homepageImageFallbacks[sectionKey]);
}
