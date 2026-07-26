import home from '@/content/pages/home.json'
import { homepageSchema, type HomepageContent } from './schemas'

const pages = new Map<string, HomepageContent>([['home', homepageSchema.parse(home)]])

export function getPageBySlug(slug: string): HomepageContent | undefined {
  return pages.get(slug)
}

export function getAllPages(): HomepageContent[] {
  return [...pages.values()].filter((page) => !page.draft)
}

export function getHomepage(): HomepageContent {
  const page = getPageBySlug('home')
  if (!page) throw new Error('Shared homepage content is missing.')
  return page
}
