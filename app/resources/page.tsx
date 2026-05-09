import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { resources } from '@/lib/resources'
import { siteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Resource Center | Planning Guides for Restroom Trailer Rentals',
  description:
    'Explore planning guides, checklists, and educational resources for restroom trailer rentals in Lansing and Mid-Michigan.',
  alternates: {
    canonical: '/resources',
  },
}

const groupedResources = resources.reduce<Record<string, typeof resources>>((acc, resource) => {
  acc[resource.category] = acc[resource.category] ? [...acc[resource.category], resource] : [resource]
  return acc
}, {})

const serviceLinks = [
  { href: '/wedding-restroom-trailer-rentals', label: 'Wedding Restroom Trailer Rentals' },
  { href: '/festival-community-event-restroom-trailers', label: 'Festival & Community Event Restrooms' },
  { href: '/construction-long-term-restroom-trailer-rentals', label: 'Construction & Long-Term Rentals' },
]

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main className="bg-cream min-h-screen">
        <section className="bg-white py-16 md:py-20 border-b border-border/60">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Resource Center</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-serif font-semibold text-navy">Planning Guides for Better Event Experiences</h1>
            <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
              Use these articles to plan restroom capacity, logistics, and guest comfort for weddings, festivals, private events,
              and long-term projects in Mid-Michigan.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 lg:px-8 space-y-12">
            {Object.entries(groupedResources).map(([category, categoryResources]) => (
              <div key={category}>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy">{category}</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {categoryResources.map((resource) => (
                    <article key={resource.slug} className="rounded-2xl bg-white p-6 shadow-sm border border-border/60">
                      <p className="text-sm text-muted-foreground">Published {resource.publishDate}</p>
                      <h3 className="mt-2 text-xl font-semibold text-navy">{resource.title}</h3>
                      <p className="mt-3 text-muted-foreground">{resource.excerpt}</p>
                      <Link className="mt-4 inline-block text-navy font-semibold hover:text-navy/80" href={`/resources/${resource.slug}`}>
                        Read guide →
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 bg-white border-y border-border/60">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-serif font-semibold text-navy">Popular Service Pages</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {serviceLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-navy border border-navy/30 rounded-full px-4 py-2 hover:bg-cream transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-semibold text-navy">Need Help Planning Your Event Setup?</h2>
            <p className="mt-3 text-muted-foreground">Tell us about your guest count, venue, and event timing to get a customized recommendation.</p>
            <Button asChild className="mt-6 bg-navy hover:bg-navy/90 text-white">
              <Link href="/request-quote">Request a Quote</Link>
            </Button>
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
            name: 'Resource Center',
            url: `${siteUrl}/resources`,
          }),
        }}
      />
    </>
  )
}
