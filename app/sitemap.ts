import type { MetadataRoute } from 'next'
import { cityPages, finalRoutes, siteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = finalRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date() }))
  const cities = cityPages.map((city) => ({ url: `${siteUrl}/service-areas/${city.slug}`, lastModified: new Date() }))
  return [...staticRoutes, ...cities]
}
