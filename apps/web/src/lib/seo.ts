import seoDefaults from '../data/seo-defaults.json';

export interface SeoImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SeoInput {
  title: string;
  description: string;
  canonical?: string | null;
  image?: SeoImage | null;
  noindex?: boolean;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  image: SeoImage;
  robots: string;
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export function toAbsoluteUrl(value: string): string {
  return isAbsoluteUrl(value)
    ? value
    : new URL(value, seoDefaults.canonicalOrigin).toString();
}

export function resolveSeo(input: SeoInput): ResolvedSeo {
  const canonical = input.canonical
    ? toAbsoluteUrl(input.canonical)
    : seoDefaults.canonicalOrigin;
  const image = input.image ?? {
    src: seoDefaults.defaultImage,
    alt: 'Signature Luxe luxury restroom trailer at an evening Michigan event',
    width: 1536,
    height: 1024,
  };

  return {
    title: input.title,
    description: input.description,
    canonical,
    image: {
      ...image,
      src: toAbsoluteUrl(image.src),
    },
    robots: input.noindex ? 'noindex,nofollow' : 'index,follow',
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Signature Luxe Events & Amenities',
    url: seoDefaults.canonicalOrigin,
    image: toAbsoluteUrl(seoDefaults.defaultImage),
    email: 'info@signatureluxeevents.com',
    telephone: '+1-517-295-0107',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Mid-Michigan',
    },
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: seoDefaults.canonicalOrigin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: toAbsoluteUrl(path),
      },
    ],
  };
}

export function serviceSchema(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType: name,
    description: `${name} with delivery, setup, and service planning for events and project sites in Mid-Michigan.`,
    provider: {
      '@type': 'Organization',
      name: 'Signature Luxe Events & Amenities',
      url: seoDefaults.canonicalOrigin,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Mid-Michigan',
    },
    url: toAbsoluteUrl(path),
  };
}
