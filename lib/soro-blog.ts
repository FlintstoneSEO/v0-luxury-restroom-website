import { cache } from 'react'

export const SORO_RSS_FEED_URL = 'https://app.trysoro.com/api/rss/1e191ab7-f4d4-4008-9a60-e40f10af4558'
export const BLOG_REVALIDATE_SECONDS = 60 * 60 * 6

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

function getTag(block: string, tagName: string) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'))
  return match ? decodeXml(match[1]).trim() : undefined
}

function getAllTags(block: string, tagName: string) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [...block.matchAll(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'gi'))]
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean)
}

function getAttribute(tag: string, attribute: string) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = tag.match(new RegExp(`${escaped}=["']([^"']+)["']`, 'i'))
  return match ? decodeXml(match[1]).trim() : undefined
}

function firstUrlFromTag(block: string, tagNames: string[], contentType?: RegExp) {
  for (const tagName of tagNames) {
    const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const tags = [...block.matchAll(new RegExp(`<${escaped}\\b[^>]*>`, 'gi'))].map((match) => match[0])
    for (const tag of tags) {
      const type = getAttribute(tag, 'type')
      const url = getAttribute(tag, 'url') || getAttribute(tag, 'href')
      if (url && (!contentType || contentType.test(type || url))) return url
    }
  }
}

function getFeaturedImage(block: string, contentHtml: string) {
  const namespacedImage = firstUrlFromTag(block, ['media:content', 'media:thumbnail', 'image'], /image\//i)
  if (namespacedImage) return namespacedImage

  const enclosure = firstUrlFromTag(block, ['enclosure'], /image\//i)
  if (enclosure) return enclosure

  const itunesImageTag = block.match(/<itunes:image\b[^>]*>/i)?.[0]
  const itunesImage = itunesImageTag ? getAttribute(itunesImageTag, 'href') : undefined
  if (itunesImage) return itunesImage

  const contentImage = contentHtml.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1]
  return contentImage ? decodeXml(contentImage).trim() : undefined
}

function sanitizeHtml(value: string) {
  const decoded = decodeXml(value)
  return decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son[a-z]+=["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

function getSlugSourceFromLink(link?: string) {
  if (!link) return undefined
  try {
    return new URL(link).pathname.split('/').filter(Boolean).pop()
  } catch {
    return link.split('/').filter(Boolean).pop()
  }
}

function postFromXmlItem(itemXml: string, index: number): SoroBlogPost | null {
  const title = getTag(itemXml, 'title') || `Signature Luxe Blog Post ${index + 1}`
  const content = getTag(itemXml, 'content:encoded') || getTag(itemXml, 'content') || getTag(itemXml, 'description') || ''
  const description = getTag(itemXml, 'description') || stripHtml(content) || FALLBACK_DESCRIPTION
  const atomLinkTag = itemXml.match(/<link\b[^>]*href=["'][^"']+["'][^>]*>/i)?.[0]
  const link = getTag(itemXml, 'link') || (atomLinkTag ? getAttribute(atomLinkTag, 'href') : undefined)
  const guid = getTag(itemXml, 'guid')
  const publishedAt = getTag(itemXml, 'pubDate') || getTag(itemXml, 'published') || getTag(itemXml, 'dc:date') || new Date().toISOString()
  const updatedAt = getTag(itemXml, 'updated') || getTag(itemXml, 'lastBuildDate')
  const categories = Array.from(new Set(getAllTags(itemXml, 'category')))
  const preferredSlugSource = getSlugSourceFromLink(link)
  const slug = slugify(preferredSlugSource || guid || title)

  if (!slug) return null

  const contentHtml = sanitizeHtml(content || `<p>${stripHtml(description) || FALLBACK_DESCRIPTION}</p>`)
  const plainDescription = truncate(stripHtml(description || contentHtml) || FALLBACK_DESCRIPTION)

  return {
    title: stripHtml(title) || title,
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

function parseSoroFeed(xml: string) {
  const itemMatches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
  const entryMatches = itemMatches.length ? [] : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)]
  const blocks = itemMatches.length ? itemMatches : entryMatches

  return blocks
    .map((match, index) => postFromXmlItem(match[0], index))
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
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}
