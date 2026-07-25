import type { SoroBlogPost } from '@/lib/soro-blog'

export const BLOG_FALLBACK_IMAGES = [
  '/images/Wedding Trailer.png',
  '/images/Special Event Trailer.png',
  '/images/MSU Tailgate Rental Restroom.png',
  '/images/Construction Site Trailer.png',
  '/images/Disaster Relief Trailer.png',
  '/images/3 Station Pro/3Station.jpg',
  '/images/3 Station Pro/3Station1.jpg',
  '/images/3 Station Pro/3Station2.jpg',
] as const

function stableHash(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export function getBlogPostImage(post: Pick<SoroBlogPost, 'slug' | 'featuredImage'>) {
  if (post.featuredImage) return post.featuredImage

  const imageIndex = stableHash(post.slug) % BLOG_FALLBACK_IMAGES.length
  return BLOG_FALLBACK_IMAGES[imageIndex]
}
