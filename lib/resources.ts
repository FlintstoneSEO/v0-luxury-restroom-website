import { getAllResources } from '@/lib/content/resources'
import type { ResourceArticle } from '@/lib/content/schemas'
export type { ResourceArticle }
export type ResourceSection = ResourceArticle['sections'][number]
export type ResourceFaq = NonNullable<ResourceArticle['faqs']>[number]
export type ResourceLink = ResourceArticle['relatedResources'][number]

export const resources = getAllResources()
export const resourcesBySlug = Object.fromEntries(resources.map((resource) => [resource.slug, resource]))
export function sectionHeadingToId(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
