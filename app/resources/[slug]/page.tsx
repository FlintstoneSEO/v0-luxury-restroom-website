import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { resources, resourcesBySlug } from '@/lib/resources'
import { breadcrumbJsonLd, business } from '@/lib/seo-schema'

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const resource = resourcesBySlug[params.slug]
  if (!resource) return {}

  return {
    title: resource.metaTitle,
    description: resource.metaDescription,
    alternates: { canonical: `/resources/${resource.slug}` },
    keywords: [resource.primaryKeyword, ...resource.secondaryKeywords],
    openGraph: {
      title: resource.metaTitle,
      description: resource.metaDescription,
      type: 'article',
      url: `/resources/${resource.slug}`,
      images: [{ url: resource.heroImage, alt: resource.heroImageAlt }],
      publishedTime: resource.publishDate,
      modifiedTime: resource.updatedDate,
    },
  }
}

export default function ResourceArticlePage({ params }: { params: { slug: string } }) {
  const resource = resourcesBySlug[params.slug]
  if (!resource) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: resource.title,
    description: resource.metaDescription,
    image: `${business.url}${resource.heroImage}`,
    datePublished: resource.publishDate,
    dateModified: resource.updatedDate,
    author: { '@type': 'Organization', name: business.name },
    publisher: { '@type': 'Organization', name: business.name, logo: { '@type': 'ImageObject', url: business.logo } },
    mainEntityOfPage: `${business.url}/resources/${resource.slug}`,
  }

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Resources', item: '/resources' },
    { name: resource.title, item: `/resources/${resource.slug}` },
  ])

  return (
    <>
      <Header />
      <main className="bg-cream">
        <article className="container mx-auto px-4 lg:px-8 py-12 md:py-16 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{resource.category}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-serif font-semibold text-navy">{resource.title}</h1>
          <p className="mt-4 text-muted-foreground">Published {resource.publishDate} · Updated {resource.updatedDate}</p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-white">
            <Image src={resource.heroImage} alt={resource.heroImageAlt} width={1200} height={630} className="h-auto w-full" priority />
          </div>

          <div className="mt-10 space-y-8">
            {resource.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-serif font-semibold text-navy">{section.heading}</h2>
                <div className="mt-3 space-y-4 text-charcoal leading-relaxed">
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {resource.faqs && resource.faqs.length > 0 && (
            <section className="mt-12 rounded-2xl bg-white p-8 border border-border/60">
              <h2 className="text-2xl font-serif font-semibold text-navy">Frequently Asked Questions</h2>
              <div className="mt-6 space-y-6">
                {resource.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="text-lg font-semibold text-navy">{faq.question}</h3>
                    <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 border border-border/60">
              <h2 className="text-xl font-semibold text-navy">Related Services</h2>
              <ul className="mt-4 space-y-2">
                {resource.relatedServicePages.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-navy hover:text-navy/80">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 border border-border/60">
              <h2 className="text-xl font-semibold text-navy">Related City Pages</h2>
              <ul className="mt-4 space-y-2">
                {resource.relatedCityPages.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-navy hover:text-navy/80">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-12 rounded-2xl bg-navy text-white p-8 text-center">
            <h2 className="text-2xl font-serif font-semibold">Ready to Plan Your Restroom Setup?</h2>
            <p className="mt-3 text-white/85">Request a personalized quote and timeline for your Lansing or Mid-Michigan event.</p>
            <Button asChild className="mt-6 bg-gold text-navy hover:bg-gold/90">
              <Link href="/request-quote">Request a Quote</Link>
            </Button>
          </section>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  )
}
