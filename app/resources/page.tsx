import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import './resource-library.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getAllResources } from '@/lib/content/resources'
import { getResourceIndex } from '@/lib/content/index-pages'

const resources = getAllResources()
import { siteUrl } from '@/lib/seo'

const indexContent = getResourceIndex()
export const metadata: Metadata = {
  title: indexContent.seo.title,
  description: indexContent.seo.description,
  alternates: { canonical: indexContent.seo.canonical },
}

const groupedResources = resources.reduce<Record<string, typeof resources>>((acc, resource) => {
  acc[resource.category] = acc[resource.category] ? [...acc[resource.category], resource] : [resource]
  return acc
}, {})


const featuredResources = indexContent.featuredSlugs
  .map((slug) => resources.find((resource) => resource.slug === slug))
  .filter((resource): resource is (typeof resources)[number] => Boolean(resource))
const serviceLinks = indexContent.serviceLinks

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main id="public-content" tabIndex={-1} className="estate-public resource-library bg-cream min-h-screen">
        <header className="resource-width resource-intro">
          <h1>Planning Guides for Better Event Experiences</h1>
          <p>Use these articles to plan restroom capacity, logistics, and guest comfort for weddings, festivals, private events, and long-term projects in Mid-Michigan.</p>
        </header>

        <section className="resource-width resource-featured" aria-labelledby="featured-heading">
          <div className="resource-section-heading">
            <h2 id="featured-heading">Featured Guides</h2>
            <p>Capacity, setup, and budgeting for your next event.</p>
          </div>
          <div className="resource-featured-layout">
            {featuredResources.slice(0, 1).map((resource) => (
              <article className="resource-lead" key={resource.slug}>
                <div className="resource-lead-image"><Image src={resource.heroImage} alt={resource.heroImageAlt} fill priority sizes="(max-width: 800px) 100vw, 60vw" /></div>
                <div className="resource-lead-copy">
                  <span className="resource-category">{resource.category}</span>
                  <h3><Link href={`/resources/${resource.slug}`}>{resource.title}</Link></h3>
                  <p>{resource.excerpt}</p>
                  <div className="resource-meta"><time dateTime={resource.publishDate}>{resource.publishDate}</time><ArrowRight aria-hidden="true" size={20} /></div>
                </div>
              </article>
            ))}
            <div className="resource-reading-list">
              {featuredResources.slice(1).map((resource) => (
                <article key={resource.slug}>
                  <span className="resource-category">{resource.category}</span>
                  <h3><Link href={`/resources/${resource.slug}`}>{resource.title}</Link></h3>
                  <p>{resource.excerpt}</p>
                  <div className="resource-meta"><time dateTime={resource.publishDate}>{resource.publishDate}</time><ArrowRight aria-hidden="true" size={20} /></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="resource-browse">
          <nav className="resource-width resource-topics" aria-label="Browse resource topics">
            <span>Browse by topic</span>
            {Object.keys(groupedResources).map((category, index) => <a href={`#resource-topic-${index}`} key={category}>{category}</a>)}
          </nav>
          <div className="resource-width">
            {Object.entries(groupedResources).map(([category, categoryResources], index) => (
              <section className="resource-topic" id={`resource-topic-${index}`} key={category} aria-labelledby={`resource-heading-${index}`}>
                <div className="resource-section-heading"><h2 id={`resource-heading-${index}`}>{category}</h2><span>{categoryResources.length} {categoryResources.length === 1 ? 'guide' : 'guides'}</span></div>
                <div className="resource-articles">
                  {categoryResources.map((resource) => (
                    <article className="resource-article" key={resource.slug}>
                      <div className="resource-thumbnail"><Image src={resource.heroImage} alt={resource.heroImageAlt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 45vw, 30vw" /></div>
                      <div className="resource-article-copy">
                        <time dateTime={resource.publishDate}>Published {resource.publishDate}</time>
                        <h3><Link href={`/resources/${resource.slug}`}>{resource.title}</Link></h3>
                        <p>{resource.excerpt}</p>
                        <Link className="resource-read" href={`/resources/${resource.slug}`} aria-label={`Read guide: ${resource.title}`}>Read guide <ArrowRight aria-hidden="true" size={18} /></Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="resource-width resource-services">
          <h2>Popular Service Pages</h2>
          <div>{serviceLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowRight aria-hidden="true" size={20} /></Link>)}</div>
        </section>
        <section className="resource-help">
          <div className="resource-width resource-help-inner">
            <div><h2>Need Help Planning Your Event Setup?</h2><p>Tell us about your guest count, venue, and event timing to get a customized recommendation.</p></div>
            <Link href="/request-quote">Request a Quote <ArrowRight aria-hidden="true" size={20} /></Link>
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
