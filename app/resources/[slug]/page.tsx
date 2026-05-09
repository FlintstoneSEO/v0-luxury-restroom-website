import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { resources, resourcesBySlug, sectionHeadingToId } from '@/lib/resources'
import { breadcrumbJsonLd, business } from '@/lib/seo-schema'

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const resource = resourcesBySlug[slug]
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

export default async function ResourceArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = resourcesBySlug[slug]
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

  const faqSchema =
    resource.faqs && resource.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: resource.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null

  return (
    <>
      <Header />
      <main className="bg-cream">
        <article className="container mx-auto px-4 lg:px-8 py-12 md:py-16 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{resource.category}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-serif font-semibold text-navy">{resource.title}</h1>
          <p className="mt-4 text-muted-foreground">Published {resource.publishDate} · Updated {resource.updatedDate}</p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-white">
            <Image src={resource.heroImage} alt={resource.heroImageAlt} width={1200} height={630} className="h-auto w-full" priority />
          </div>

          <section className="mt-8 rounded-2xl border border-border/60 bg-white p-6 md:p-8">
            <h2 className="text-xl font-semibold text-navy">Table of Contents</h2>
            <ol className="mt-4 space-y-2 list-decimal list-inside">
              {resource.sections.map((section) => (
                <li key={section.heading}>
                  <a href={`#${sectionHeadingToId(section.heading)}`} className="text-navy hover:text-navy/80">
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-10 space-y-12 rounded-2xl border border-border/60 bg-white p-6 md:p-10">
            {resource.sections.map((section, index) => (
              <div key={section.heading} className="space-y-5">
                <section id={sectionHeadingToId(section.heading)} className="scroll-mt-28">
                  <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-charcoal text-lg leading-8">
                    {section.content.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {index === 1 && (
                  <section className="rounded-2xl bg-cream border border-gold/40 p-6 md:p-8">
                    <h3 className="text-xl font-semibold text-navy">Need help choosing the right restroom setup?</h3>
                    <p className="mt-3 text-charcoal">Use our quick planning guide, then request a tailored recommendation for your event.</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                        <Link href="/start-here">Start Here</Link>
                      </Button>
                      <Button asChild variant="outline" className="border-navy text-navy hover:bg-white">
                        <Link href="/request-quote">Request a Quote</Link>
                      </Button>
                    </div>
                  </section>
                )}
              </div>
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

          <section className="mt-8 rounded-2xl bg-white p-6 border border-border/60">
            <h2 className="text-xl font-semibold text-navy">Helpful next steps</h2>
            <ul className="mt-4 space-y-2">
              <li><Link href="/start-here" className="text-navy hover:text-navy/80">Start Here</Link></li>
              <li><Link href="/request-quote" className="text-navy hover:text-navy/80">Request a Quote</Link></li>
              {resource.relatedServicePages[0] && (
                <li>
                  <Link href={resource.relatedServicePages[0].href} className="text-navy hover:text-navy/80">
                    {resource.relatedServicePages[0].label}
                  </Link>
                </li>
              )}
              {resource.relatedCityPages[0] && (
                <li>
                  <Link href={resource.relatedCityPages[0].href} className="text-navy hover:text-navy/80">
                    {resource.relatedCityPages[0].label}
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl bg-white p-6 border border-border/60">
            <h2 className="text-xl font-semibold text-navy">Related Resources</h2>
            <ul className="mt-4 space-y-2">
              {resource.relatedResources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy hover:text-navy/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
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
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    </>
  )
}
