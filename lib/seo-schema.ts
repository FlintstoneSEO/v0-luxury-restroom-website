export const business = {
  name: 'Signature Luxe Events & Amenities',
  url: 'https://www.signatureluxeevents.com',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
  image: 'https://www.signatureluxeevents.com/images/Wedding Trailer.png',
  logo: 'https://www.signatureluxeevents.com/images/logo.png',
  priceRange: '$$',
  areaServed: ['Lansing, MI','East Lansing, MI','Okemos, MI','Haslett, MI','Grand Ledge, MI','DeWitt, MI','Holt, MI','Mason, MI','Jackson, MI','Howell, MI','Brighton, MI','Charlotte, MI','Ann Arbor, MI','Flint, MI','Grand Rapids, MI','Battle Creek, MI','Kalamazoo, MI','Mid-Michigan'],
  sameAs: [process.env.NEXT_PUBLIC_FACEBOOK_URL, process.env.NEXT_PUBLIC_INSTAGRAM_URL].filter(Boolean),
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${business.url}/#website`,
    url: business.url,
    name: business.name,
    publisher: { '@id': `${business.url}/#organization` },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${business.url}/#organization`,
    name: business.name,
    url: business.url,
    logo: business.logo,
    image: business.image,
    ...(business.sameAs.length ? { sameAs: business.sameAs } : {}),
  }
}

export function localBusinessJsonLd(city = 'Lansing') {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'EventRentalStore'],
    '@id': `${business.url}#localbusiness`,
    name: business.name,
    description:
      'Lansing-based luxury restroom trailer rental company serving weddings, private events, corporate gatherings, festivals, construction sites, long-term projects, and emergency response operations across Mid-Michigan.',
    url: business.url,
    image: business.image,
    logo: business.logo,
    priceRange: business.priceRange,
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.sameAs.length ? { sameAs: business.sameAs } : {}),
    parentOrganization: { '@id': `${business.url}/#organization` },
    areaServed: business.areaServed,
    serviceType: [
      'Luxury restroom trailer rentals',
      'Wedding restroom trailer rentals',
      'Event restroom trailer rentals',
      'Construction and long-term restroom trailer rentals',
      'Emergency and disaster relief restroom trailer rentals',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Luxury Restroom Trailer Rental Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wedding restroom trailer rentals' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private and corporate event restroom trailer rentals' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Construction and long-term restroom trailer rentals' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Emergency and disaster relief restroom trailer rentals' } },
      ],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'MI',
      addressCountry: 'US',
    },
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
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
  }
}

export function serviceJsonLd(name: string, url: string, area = 'Mid-Michigan') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description: `${name} with delivery, setup, and service planning for events and project sites in ${area}.`,
    provider: { '@type': 'LocalBusiness', name: business.name, url: business.url },
    areaServed: area,
    url,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Restroom Trailer Rental Services',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Wedding restroom trailer rentals' },
        { '@type': 'OfferCatalog', name: 'Private and corporate event restroom trailer rentals' },
        { '@type': 'OfferCatalog', name: 'Construction and long-term restroom trailer rentals' },
        { '@type': 'OfferCatalog', name: 'Emergency and disaster relief restroom trailer rentals' },
      ],
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${business.url}${it.item}` })),
  }
}
