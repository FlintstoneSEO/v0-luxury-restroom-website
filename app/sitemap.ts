import type { MetadataRoute } from 'next'
import { cityPages, finalRoutes, siteUrl } from '@/lib/seo'
import { getAllResources } from '@/lib/content/resources'
import { getSoroBlogPosts } from '@/lib/soro-blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = finalRoutes.map((route) => {
    const priority =
      route === '/' ? 1.0 :
      ['/luxury-restroom-trailer-rentals', '/wedding-restroom-trailer-rentals', '/private-event-restroom-trailers', '/corporate-event-restroom-trailers', '/festival-community-event-restroom-trailers', '/construction-long-term-restroom-trailer-rentals', '/emergency-disaster-relief-restroom-trailers'].includes(route) ? 0.9 :
      ['/request-quote', '/contact', '/resources', '/blog', '/service-areas'].includes(route) ? 0.7 :
      ['/faq', '/gallery'].includes(route) ? 0.6 : 0.8
    return { url: `${siteUrl}${route}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority }
  })
  const cities = cityPages.map((city) => ({ url: `${siteUrl}/service-areas/${city.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 }))
  const resourcePages = getAllResources().map((resource) => ({ url: `${siteUrl}/resources/${resource.slug}`, lastModified: new Date(resource.updatedDate), changeFrequency: 'monthly' as const, priority: 0.7 }))
  const posts = await getSoroBlogPosts()
  const blogPages = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...cities, ...resourcePages, ...blogPages]
}
