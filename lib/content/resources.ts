import { readJsonCollection } from './collection-files'
import { resourceSchema, type ResourceArticle } from './schemas'

let resourceCache: ResourceArticle[] | undefined
export function getAllResources(): ResourceArticle[] {
  return resourceCache ??= readJsonCollection('resources', resourceSchema)
    .filter((resource) => !resource.draft)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
}
export function getResourceBySlug(slug: string): ResourceArticle | undefined {
  return getAllResources().find((resource) => resource.slug === slug)
}
