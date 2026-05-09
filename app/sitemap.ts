import type { MetadataRoute } from 'next'
import { cityPages, finalRoutes, siteUrl } from '@/lib/seo'
import { resources } from '@/lib/resources'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = finalRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date() }))
  const cities = cityPages.map((city) => ({ url: `${siteUrl}/service-areas/${city.slug}`, lastModified: new Date() }))
  const resourcePages = resources.map((resource) => ({ url: `${siteUrl}/resources/${resource.slug}`, lastModified: new Date(resource.updatedDate) }))
  return [...staticRoutes, ...cities, ...resourcePages]
}
