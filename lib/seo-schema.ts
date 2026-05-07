export const business = {
  name: 'Signature Luxe Events & Amenities',
  url: 'https://www.signatureluxeevents.com',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
  areaServed: ['Lansing, MI','East Lansing, MI','Okemos, MI','Haslett, MI','Grand Ledge, MI','DeWitt, MI','Holt, MI','Mason, MI','Jackson, MI','Howell, MI','Brighton, MI','Ann Arbor, MI','Flint, MI','Grand Rapids, MI','Battle Creek, MI','Kalamazoo, MI','Detroit Suburbs, MI','Mid-Michigan'],
}

export function localBusinessJsonLd(city = 'Lansing') {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: business.url,
    ...(business.phone ? { telephone: business.phone } : {}),
    areaServed: business.areaServed,
    address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: 'MI', addressCountry: 'US' },
  }
}

export function serviceJsonLd(name: string, url: string, area = 'Mid-Michigan') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    provider: { '@type': 'LocalBusiness', name: business.name },
    areaServed: area,
    url,
  }
}

export function breadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${business.url}${it.item}` })),
  }
}
