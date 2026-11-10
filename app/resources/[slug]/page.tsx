import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import './resource-article.css'
import { sectionHeadingToId } from '@/lib/resources'
import { getAllResources, getResourceBySlug } from '@/lib/content/resources'

const resources = getAllResources()
import { breadcrumbJsonLd, business } from '@/lib/seo-schema'

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const resource = getResourceBySlug(slug)
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
  const resource = getResourceBySlug(slug)
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
      <main id="public-content" tabIndex={-1} className="estate-public resource-story">
        <article>
          <header className="story-width story-header">
            <Link href="/resources" className="story-back"><ArrowLeft size={16} aria-hidden="true" /> All planning guides</Link>
            <h1>{resource.title}</h1>
            <p className="story-deck">{resource.excerpt}</p>
            <div className="story-byline"><span>{resource.category}</span><span>Published <time dateTime={resource.publishDate}>{resource.publishDate}</time></span><span>Updated <time dateTime={resource.updatedDate}>{resource.updatedDate}</time></span></div>
            <div className="story-hero"><Image src={resource.heroImage} alt={resource.heroImageAlt} fill priority sizes="(max-width: 1440px) 100vw, 1320px" /></div>
          </header>
          <div className="story-width story-layout">
            <aside className="story-sidebar">
              <nav aria-label="Table of contents">
                <h2>In this guide</h2>
                <ol>{resource.sections.map(section => <li key={section.heading}><a href={`#${sectionHeadingToId(section.heading)}`}>{section.heading}</a></li>)}</ol>
                {resource.faqs && resource.faqs.length > 0 && <a className="story-faq-jump" href="#article-questions">Frequently Asked Questions</a>}
              </nav>
              <Link className="story-sidebar-link" href="/start-here">Start planning your event <ArrowRight size={18} aria-hidden="true" /></Link>
            </aside>
            <div className="story-reading">
              {resource.sections.map(section => (
                <section className="story-section" id={sectionHeadingToId(section.heading)} key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.content.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
              <section className="story-planning-note">
                <h3>Need help choosing the right restroom setup?</h3>
                <p>Use our quick planning guide, then request a tailored recommendation for your event.</p>
                <div><Link href="/start-here">Start Here <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/request-quote">Request a Quote <ArrowRight size={17} aria-hidden="true" /></Link></div>
              </section>
              {resource.faqs && resource.faqs.length > 0 && (
                <section className="story-questions" id="article-questions">
                  <h2>Frequently Asked Questions</h2>
                  {resource.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<Plus size={20} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}
                </section>
              )}
              <div className="story-local-links">
                <section><h2>Related Services</h2><ul>{resource.relatedServicePages.map((link, index) => <li key={`${link.href}-${index}`}><Link href={link.href}>{link.label}<ArrowRight size={17} aria-hidden="true" /></Link></li>)}</ul></section>
                <section><h2>Related City Pages</h2><ul>{resource.relatedCityPages.map((link, index) => <li key={`${link.href}-${index}`}><Link href={link.href}>{link.label}<ArrowRight size={17} aria-hidden="true" /></Link></li>)}</ul></section>
              </div>
            </div>
          </div>
          <section className="story-related">
            <div className="story-width">
              <div className="story-related-heading"><h2>Related Resources</h2><Link href="/resources">Explore all guides <ArrowRight size={18} aria-hidden="true" /></Link></div>
              <div className="story-related-grid">{resource.relatedResources.map((link, index) => {
                const related = resources.find(item => `/resources/${item.slug}` === link.href)
                return <article key={`${link.href}-${index}`}>{related && <div className="story-related-image"><Image src={related.heroImage} alt={related.heroImageAlt} fill sizes="(max-width: 700px) 100vw, 45vw" /></div>}<h3><Link href={link.href}>{link.label}</Link></h3>{related && <p>{related.excerpt}</p>}</article>
              })}</div>
            </div>
          </section>
          <section className="story-cta"><div className="story-width story-cta-inner"><div><h2>Ready to Plan Your Restroom Setup?</h2><p>Request a personalized quote and timeline for your Lansing or Mid-Michigan event.</p></div><Link href="/request-quote">Request a Quote <ArrowRight size={20} aria-hidden="true" /></Link></div></section>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    </>
  )
}
