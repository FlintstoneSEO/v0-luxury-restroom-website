import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, ArrowLeft, ExternalLink } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { business, breadcrumbJsonLd } from '@/lib/seo-schema'
import { formatBlogDate, getSoroBlogPost, getSoroBlogPosts } from '@/lib/soro-blog'
import { siteUrl } from '@/lib/seo'

export const revalidate = 21600

export async function generateStaticParams() {
  const posts = await getSoroBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getSoroBlogPost(slug)
  if (!post) return {}

  const canonical = `/blog/${post.slug}`
  const image = post.featuredImage || '/images/Wedding Trailer.png'

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${siteUrl}${canonical}`,
      images: [{ url: image, alt: post.title }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
    },
  }
}

const relatedServiceLinks = [
  { href: '/luxury-restroom-trailer-rentals', label: 'Luxury Restroom Trailer Rentals' },
  { href: '/wedding-restroom-trailer-rentals', label: 'Wedding Restroom Trailer Rentals' },
  { href: '/private-event-restroom-trailers', label: 'Private Event Restroom Trailers' },
  { href: '/festival-community-event-restroom-trailers', label: 'Festival & Community Event Restrooms' },
  { href: '/service-areas/lansing-mi', label: 'Lansing, MI Service Area' },
  { href: '/service-areas/east-lansing-mi', label: 'East Lansing, MI Service Area' },
]

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getSoroBlogPost(slug)
  if (!post) notFound()

  const canonicalUrl = `${siteUrl}/blog/${post.slug}`
  const image = post.featuredImage || '/images/Wedding Trailer.png'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: image.startsWith('http') ? image : `${siteUrl}${image}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { '@type': 'Organization', name: business.name, url: business.url },
    publisher: { '@type': 'Organization', name: business.name, logo: { '@type': 'ImageObject', url: business.logo } },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    articleSection: post.category || 'Luxury Restroom Trailer Rentals',
    about: ['Luxury restroom trailer rentals', 'Lansing Michigan event planning', 'Mid-Michigan outdoor events'],
  }

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/${post.slug}` },
  ])

  return (
    <>
      <Header />
      <main className="bg-cream">
        <article className="container mx-auto max-w-5xl px-4 py-12 lg:px-8 md:py-16">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold-text hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Blog Resources
          </Link>

          <header className="mt-6 rounded-3xl border border-gold/40 bg-white p-6 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {post.category && <span className="rounded-full bg-cream px-3 py-1 font-medium text-gold-text">{post.category}</span>}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-gold-text" />
                {formatBlogDate(post.publishedAt)}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-serif font-semibold leading-tight text-navy md:text-6xl">{post.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{post.description}</p>
          </header>

          <div className="mt-8 overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm">
            <Image src={image} alt={post.title} width={1400} height={788} className="h-auto w-full object-cover" priority />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm md:p-10">
              <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-3xl border border-gold/40 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-serif font-semibold text-navy">Plan Your Michigan Event</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Explore local restroom trailer options for weddings, private parties, corporate events, festivals, and outdoor celebrations in Lansing and Mid-Michigan.
                </p>
                <Button asChild className="mt-5 w-full bg-navy text-white hover:bg-navy/90">
                  <Link href="/request-quote">Request a Quote</Link>
                </Button>
              </section>

              <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-serif font-semibold text-navy">Helpful Links</h2>
                <ul className="mt-4 space-y-3 text-sm font-medium">
                  {relatedServiceLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-navy hover:text-gold-text">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          <section className="mt-10 rounded-3xl bg-navy p-8 text-center text-white md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Signature Luxe Events & Amenities</p>
            <h2 className="mt-3 text-3xl font-serif font-semibold">Need a luxury restroom trailer for your Michigan event?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">
              Tell us about your venue, guest count, timeline, and service area. We will recommend a polished restroom trailer setup for your Lansing or Mid-Michigan event.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-gold text-navy hover:bg-gold/90">
                <Link href="/request-quote">Request a Quote</Link>
              </Button>
              {post.originalUrl && (
                <Button asChild variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white hover:text-navy">
                  <a href={post.originalUrl} target="_blank" rel="noopener noreferrer">
                    Original Article <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </section>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  )
}
