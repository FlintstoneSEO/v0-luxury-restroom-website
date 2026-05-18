import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { formatBlogDate, getSoroBlogPosts } from '@/lib/soro-blog'
import { siteUrl } from '@/lib/seo'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Luxury Restroom Trailer Rental Resources',
  description:
    'Helpful planning guides for weddings, private parties, corporate events, festivals, outdoor celebrations, and luxury restroom trailer rentals across Lansing, Mid-Michigan, and surrounding Michigan communities.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Luxury Restroom Trailer Rental Resources',
    description:
      'Helpful planning guides for luxury restroom trailer rentals across Lansing, Mid-Michigan, and surrounding Michigan communities.',
    url: `${siteUrl}/blog`,
    type: 'website',
    images: [{ url: '/images/Wedding Trailer.png', alt: 'Luxury restroom trailer for a Michigan event' }],
  },
}

export default async function BlogPage() {
  const posts = await getSoroBlogPosts()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        <section className="relative overflow-hidden bg-navy py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,194,174,0.28),transparent_35%),linear-gradient(135deg,rgba(45,58,71,0.96),rgba(31,41,51,0.98))]" />
          <div className="container relative mx-auto px-4 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">Signature Luxe Blog</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-serif font-semibold leading-tight md:text-6xl">
              Luxury Restroom Trailer Rental Resources
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
              Helpful planning guides for weddings, private parties, corporate events, festivals, outdoor celebrations, and luxury restroom trailer rentals across Lansing, Mid-Michigan, and surrounding Michigan communities.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-text">Planning Insights</p>
                <h2 className="mt-2 text-3xl font-serif font-semibold text-navy md:text-4xl">Latest Michigan Event Restroom Guides</h2>
              </div>
              <Button asChild className="w-fit bg-navy text-white hover:bg-navy/90">
                <Link href="/request-quote">Request a Quote</Link>
              </Button>
            </div>

            {posts.length > 0 ? (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <article key={post.slug} className="group overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden bg-gold/20">
                        <Image
                          src={post.featuredImage || '/images/Wedding Trailer.png'}
                          alt={post.title}
                          fill
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {post.category && (
                          <span className="rounded-full border border-gold/50 bg-cream px-3 py-1 font-medium text-gold-text">{post.category}</span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-gold-text" />
                          {formatBlogDate(post.publishedAt)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-serif font-semibold leading-snug text-navy">
                        <Link href={`/blog/${post.slug}`} className="hover:text-navy/80">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-3 line-clamp-4 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
                      <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-navy hover:text-gold-text">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-gold/40 bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-serif font-semibold text-navy">Blog posts are being refreshed</h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                  We could not load the latest Soro articles right now. Please check back soon, or request a personalized recommendation for your Michigan event.
                </p>
                <Button asChild className="mt-6 bg-navy text-white hover:bg-navy/90">
                  <Link href="/request-quote">Request a Quote</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Luxury Restroom Trailer Rental Resources',
            description: metadata.description,
            url: `${siteUrl}/blog`,
          }),
        }}
      />
    </>
  )
}
