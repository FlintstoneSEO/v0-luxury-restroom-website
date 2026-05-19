import { cache } from 'react'

export const SORO_RSS_FEED_URL = 'https://app.trysoro.com/api/rss/1e191ab7-f4d4-4008-9a60-e40f10af4558'
export const BLOG_REVALIDATE_SECONDS = 60 * 60
export const BLOG_FALLBACK_IMAGE = '/images/Wedding Trailer.png'

export const SORO_FEATURED_IMAGE_HOSTNAMES = [
  'app.trysoro.com',
  'cdn.trysoro.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
] as const

export type SoroBlogPost = {
  title: string
  slug: string
  description: string
  excerpt: string
  publishedAt: string
  updatedAt?: string
  featuredImage?: string
  contentHtml: string
  originalUrl?: string
  category?: string
  categories: string[]
}

const FALLBACK_DESCRIPTION =
  'Helpful planning guidance for luxury restroom trailer rentals across Lansing, Mid-Michigan, and surrounding Michigan communities.'
const FALLBACK_TITLE = 'Signature Luxe Blog Post'

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function stripHtml(value = '') {
  return decodeXml(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value: string, length = 165) {
  if (value.length <= length) return value
  const truncated = value.slice(0, length).replace(/\s+\S*$/, '')
  return `${truncated}…`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getTag(block: string, tagName: string) {
  const escaped = escapeRegExp(tagName)
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'))
  return match ? decodeXml(match[1]).trim() : undefined
}

function getAllTags(block: string, tagName: string) {
  const escaped = escapeRegExp(tagName)
  return [...block.matchAll(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'gi'))]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean)
}

function getAttribute(tag: string, attribute: string) {
  const escaped = escapeRegExp(attribute)
  const match = tag.match(new RegExp(`${escaped}=["']([^"']+)["']`, 'i'))
  return match ? decodeXml(match[1]).trim() : undefined
}

function firstUrlFromTag(block: string, tagNames: string[], contentType?: RegExp) {
  for (const tagName of tagNames) {
    const escaped = escapeRegExp(tagName)
    const tags = [...block.matchAll(new RegExp(`<${escaped}\\b[^>]*>`, 'gi'))].map((match) => match[0])
    for (const tag of tags) {
      const type = getAttribute(tag, 'type')
      const url = getAttribute(tag, 'url') || getAttribute(tag, 'href') || getAttribute(tag, 'src')
      if (url && (!contentType || contentType.test(type || url))) return url
    }
  }
}

function normalizeHttpUrl(value?: string) {
  if (!value) return undefined
  const trimmed = decodeXml(value).trim()
  const withProtocol = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed

  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

function isAllowedSoroImageUrl(value?: string) {
  const normalized = normalizeHttpUrl(value)
  if (!normalized) return undefined

  try {
    const { hostname } = new URL(normalized)
    return SORO_FEATURED_IMAGE_HOSTNAMES.includes(hostname as (typeof SORO_FEATURED_IMAGE_HOSTNAMES)[number]) ? normalized : undefined
  } catch {
    return undefined
  }
}

function getFeaturedImage(block: string, contentHtml: string) {
  const candidates = [
    firstUrlFromTag(block, ['media:content', 'media:thumbnail'], /image\//i),
    firstUrlFromTag(block, ['image'], /image\//i),
    firstUrlFromTag(block, ['enclosure'], /image\//i),
    block.match(/<itunes:image\b[^>]*>/i)?.[0] ? getAttribute(block.match(/<itunes:image\b[^>]*>/i)?.[0] || '', 'href') : undefined,
    getTag(block, 'media:thumbnail'),
    getTag(block, 'media:content'),
    contentHtml.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1],
  ]

  for (const candidate of candidates) {
    const image = isAllowedSoroImageUrl(candidate)
    if (image) return image
  }
}

function sanitizeHtml(value: string) {
  const decoded = decodeXml(value)
  const cleaned = decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\son[a-z]+=["'][^"']*["']/gi, '')
    .replace(/\s(href|src)=["']\s*javascript:[^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim()

  return cleaned || `<p>${FALLBACK_DESCRIPTION}</p>`
}

function getSlugSourceFromLink(link?: string) {
  if (!link) return undefined
  try {
    return new URL(link).pathname.split('/').filter(Boolean).pop()
  } catch {
    return link.split('/').filter(Boolean).pop()
  }
}

function normalizeDate(value?: string, fallback?: string) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback || value : date.toISOString()
}

function uniqueSlug(baseSlug: string, index: number, existingSlugs: Set<string>) {
  const fallbackSlug = baseSlug || `signature-luxe-blog-post-${index + 1}`
  let slug = fallbackSlug
  let duplicateIndex = 2

  while (existingSlugs.has(slug)) {
    slug = `${fallbackSlug}-${duplicateIndex}`.slice(0, 100)
    duplicateIndex += 1
  }

  existingSlugs.add(slug)
  return slug
}

function getOriginalLink(itemXml: string) {
  const atomAlternateLink = [...itemXml.matchAll(/<link\b[^>]*href=["'][^"']+["'][^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => !getAttribute(tag, 'rel') || getAttribute(tag, 'rel') === 'alternate')
  const link = getTag(itemXml, 'link') || (atomAlternateLink ? getAttribute(atomAlternateLink, 'href') : undefined)
  return normalizeHttpUrl(link)
}

function postFromXmlItem(itemXml: string, index: number, existingSlugs: Set<string>): SoroBlogPost | null {
  const rawTitle = getTag(itemXml, 'title') || `${FALLBACK_TITLE} ${index + 1}`
  const title = stripHtml(rawTitle) || `${FALLBACK_TITLE} ${index + 1}`
  const content = getTag(itemXml, 'content:encoded') || getTag(itemXml, 'content') || getTag(itemXml, 'summary') || getTag(itemXml, 'description') || ''
  const description = getTag(itemXml, 'description') || getTag(itemXml, 'summary') || stripHtml(content) || FALLBACK_DESCRIPTION
  const link = getOriginalLink(itemXml)
  const guid = getTag(itemXml, 'guid') || getTag(itemXml, 'id')
  const publishedAt = normalizeDate(
    getTag(itemXml, 'pubDate') || getTag(itemXml, 'published') || getTag(itemXml, 'dc:date') || getTag(itemXml, 'updated'),
    new Date().toISOString(),
  ) || new Date().toISOString()
  const updatedAt = normalizeDate(getTag(itemXml, 'updated') || getTag(itemXml, 'lastBuildDate'), publishedAt)
  const categories = Array.from(new Set([...getAllTags(itemXml, 'category'), ...getAllTags(itemXml, 'dc:subject'), ...getAllTags(itemXml, 'media:category')]))
  const preferredSlugSource = getSlugSourceFromLink(link)
  const slug = uniqueSlug(slugify(preferredSlugSource || guid || title), index, existingSlugs)
  const contentHtml = sanitizeHtml(content || `<p>${stripHtml(description) || FALLBACK_DESCRIPTION}</p>`)
  const plainDescription = truncate(stripHtml(description || contentHtml) || FALLBACK_DESCRIPTION)

  return {
    title,
    slug,
    description: plainDescription,
    excerpt: plainDescription,
    publishedAt,
    updatedAt,
    featuredImage: getFeaturedImage(itemXml, contentHtml),
    contentHtml,
    originalUrl: link,
    category: categories[0],
    categories,
  }
}

export function parseSoroFeed(xml: string) {
  if (!xml.trim()) return []

  const itemMatches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
  const entryMatches = itemMatches.length ? [] : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)]
  const blocks = itemMatches.length ? itemMatches : entryMatches
  const existingSlugs = new Set<string>()

  return blocks
    .map((match, index) => postFromXmlItem(match[0], index, existingSlugs))
    .filter((post): post is SoroBlogPost => Boolean(post))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export const getSoroBlogPosts = cache(async (): Promise<SoroBlogPost[]> => {
  try {
    const response = await fetch(SORO_RSS_FEED_URL, {
      next: { revalidate: BLOG_REVALIDATE_SECONDS },
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    })

    if (!response.ok) {
      console.error(`Soro RSS feed request failed: ${response.status} ${response.statusText}`)
      return []
    }

    const xml = await response.text()
    return parseSoroFeed(xml)
  } catch (error) {
    console.error('Unable to load Soro RSS feed', error)
    return []
  }
})

export async function getSoroBlogPost(slug: string) {
  const posts = await getSoroBlogPosts()
  return posts.find((post) => post.slug === slug)
}

export function formatBlogDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}
