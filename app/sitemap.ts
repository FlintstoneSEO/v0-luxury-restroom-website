import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/', '/start-here', '/our-restrooms', '/luxury-restroom-trailer-rentals', '/wedding-restroom-trailer-rentals', '/private-event-restroom-trailers', '/corporate-event-restroom-trailers', '/festival-community-event-restroom-trailers', '/construction-long-term-restroom-trailer-rentals', '/emergency-disaster-relief-restroom-trailers', '/luxury-restroom-trailer-features', '/service-areas', '/lansing-mi', '/east-lansing-mi', '/okemos-mi', '/haslett-mi', '/grand-ledge-mi', '/dewitt-mi', '/jackson-mi', '/faq', '/gallery', '/contact', '/request-quote'
  ]
  return routes.map((url) => ({ url: `https://www.signatureluxeevents.com${url}`, lastModified: new Date() }))
}
