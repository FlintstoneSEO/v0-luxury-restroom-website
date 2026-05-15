export interface SiteMediaSection {
  sectionKey: string;
  label: string;
  recommendedWidth: number;
  recommendedHeight: number;
}

export interface SiteMediaPageRegistryItem {
  label: string;
  pageSlug: string;
  route: string;
  sections: SiteMediaSection[];
  intentionallyExcluded?: boolean;
}

const heroFeature = (pageLabel: string): SiteMediaSection[] => [
  { sectionKey: 'hero', label: `${pageLabel} Hero`, recommendedWidth: 1920, recommendedHeight: 1080 },
  { sectionKey: 'feature', label: `${pageLabel} Feature Image`, recommendedWidth: 1200, recommendedHeight: 900 },
];

export const SITE_MEDIA_PAGE_REGISTRY: SiteMediaPageRegistryItem[] = [
  {
    label: 'Homepage',
    pageSlug: 'homepage',
    route: '/',
    sections: [
      { sectionKey: 'hero', label: 'Homepage Hero', recommendedWidth: 1920, recommendedHeight: 1080 },
      { sectionKey: 'weddings', label: 'Homepage Weddings Card', recommendedWidth: 1200, recommendedHeight: 900 },
      { sectionKey: 'private_parties', label: 'Homepage Private Parties Card', recommendedWidth: 1200, recommendedHeight: 900 },
      { sectionKey: 'corporate_events', label: 'Homepage Corporate Events Card', recommendedWidth: 1200, recommendedHeight: 900 },
      { sectionKey: 'festivals', label: 'Homepage Festivals Card', recommendedWidth: 1200, recommendedHeight: 900 },
      { sectionKey: 'special_events', label: 'Homepage Special Events Card', recommendedWidth: 1200, recommendedHeight: 900 },
      { sectionKey: 'trailer_gallery', label: 'Homepage Trailer Gallery', recommendedWidth: 1200, recommendedHeight: 900 },
    ],
  },
  { label: 'Weddings', pageSlug: 'event-types-weddings', route: '/weddings', sections: heroFeature('Wedding Page') },
  { label: 'Private Parties', pageSlug: 'event-types-private-parties', route: '/private-event-restroom-trailers', sections: heroFeature('Private Parties Page') },
  { label: 'Corporate Events', pageSlug: 'event-types-corporate-events', route: '/corporate-event-restroom-trailers', sections: heroFeature('Corporate Events Page') },
  { label: 'Special Events', pageSlug: 'event-types-special-events', route: '/special-events', sections: heroFeature('Special Events Page') },
  { label: 'Festivals / Community Events', pageSlug: 'event-types-festivals-community-events', route: '/festival-community-event-restroom-trailers', sections: heroFeature('Festivals Page') },
  { label: 'Construction / Long-Term', pageSlug: 'event-types-construction-long-term', route: '/construction-long-term-restroom-trailer-rentals', sections: heroFeature('Construction Page') },
  {
    label: 'Gallery',
    pageSlug: 'gallery',
    route: '/gallery',
    sections: [
      { sectionKey: 'hero', label: 'Gallery Hero', recommendedWidth: 1920, recommendedHeight: 1080 },
      { sectionKey: 'gallery_feature', label: 'Gallery Feature Image', recommendedWidth: 1200, recommendedHeight: 900 },
    ],
  },
  { label: 'About', pageSlug: 'about', route: '/about', sections: heroFeature('About Page') },
  { label: 'Contact', pageSlug: 'contact', route: '/contact', sections: heroFeature('Contact Page') },
  { label: 'Start Here', pageSlug: 'start-here', route: '/start-here', sections: heroFeature('Start Here Page') },
  { label: 'Request Quote', pageSlug: 'request-quote', route: '/request-quote', sections: heroFeature('Request Quote Page') },
  { label: 'Trailer Detail Pages', pageSlug: 'trailer-detail-pages', route: '/luxury-restroom-trailer-rentals', sections: heroFeature('Trailer Detail Page') },
  { label: 'Service Area Pages', pageSlug: 'service-areas', route: '/service-areas', sections: heroFeature('Service Area Page') },
];

const bySlug = new Map(SITE_MEDIA_PAGE_REGISTRY.map((item) => [item.pageSlug, item]));
export const getSiteMediaRegistryItem = (pageSlug: string) => bySlug.get(pageSlug);
export const getSiteMediaPageHref = (pageSlug: string) => getSiteMediaRegistryItem(pageSlug)?.route ?? `/${pageSlug.replace(/^\/+/, '')}`;
