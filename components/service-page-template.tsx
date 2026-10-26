import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Header } from './layout/header'
import { Footer } from './layout/footer'
import { ServiceHero } from './service-hero'
import { breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd, serviceJsonLd } from '@/lib/seo-schema'

type FAQ = { q: string; a: string }
type Section = { heading: string; paragraphs: string[] }

type PlanningResource = {
  href: string
  title: string
  desc: string
}

const resources: PlanningResource[] = [
  { href: '/request-quote', title: 'Request a Quote', desc: 'Share your event details and receive a custom proposal.' },
  { href: '/service-areas', title: 'Service Areas', desc: 'See delivery and setup coverage details across Mid-Michigan.' },
  { href: '/wedding-restroom-trailer-rentals', title: 'Wedding Restroom Trailers', desc: 'Luxury guest amenities for wedding weekends and private estates.' },
  { href: '/luxury-restroom-trailer-rentals', title: 'Luxury Rental Options', desc: 'Compare station sizes, premium finishes, and climate comfort.' },
  { href: '/construction-long-term-restroom-trailer-rentals', title: 'Construction & Long-Term Rentals', desc: 'Dependable long-term and project-based support for active job sites.' },
  { href: '/faq', title: 'FAQ', desc: 'Get answers to common planning, delivery, and setup questions.' },
  { href: '/gallery', title: 'Gallery', desc: 'View restroom trailer photos from weddings, events, and projects.' },
]

export function ServicePageTemplate({ pageTitle, serviceName, urlPath, intro, sections, faqs, ctaTitle, resourceImageSrc = '/images/Wedding Trailer.png', resourceImageAlt = 'Luxury restroom trailer exterior setup for Michigan event', resourceTitle = 'Helpful Resources While You Plan', resourceDescription = 'Explore service areas, event-specific pages, and planning resources.' }: { pageTitle: string; serviceName: string; urlPath: string; intro: string; sections: Section[]; faqs: FAQ[]; ctaTitle: string; resourceImageSrc?: string; resourceImageAlt?: string; resourceEyebrow?: string; resourceTitle?: string; resourceDescription?: string }) {
  const service = serviceJsonLd(serviceName, `https://www.signatureluxeevents.com${urlPath}`)
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: pageTitle, item: urlPath }])
  const faqSchema = faqJsonLd(faqs.map((f) => ({ question: f.q, answer: f.a })))
  const business = localBusinessJsonLd('Lansing')

  return <>
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
    <Header />
    <main id="public-content" tabIndex={-1} className="estate-public estate-service">
      <ServiceHero title={pageTitle} description={intro}
        imageSrc={resourceImageSrc} imageAlt={resourceImageAlt}
        primaryCta={{ text: 'Request a Quote', href: '/request-quote' }}
        secondaryCta={{ text: 'View Gallery', href: '/gallery' }} />

      {sections[0] && <section className="service-story">
        <div className="service-story-lead">
          <h2>{sections[0].heading}</h2>
          {sections[0].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link href='/request-quote' className="estate-text-link">Plan your rental<ArrowRight aria-hidden="true" size={18} /></Link>
        </div>
        <div className="service-story-photo"><Image src="/images/3 Station Pro/3Station.jpg" alt="Signature Luxe 3 Station Pro restroom trailer exterior" fill sizes="(max-width: 900px) 100vw, 42vw" className="object-cover" /></div>
      </section>}

      <section className="service-editorial" aria-label={`${serviceName} planning details`}>
        {sections.slice(1).map((section) => <article key={section.heading} className="service-editorial-item">
          <h2>{section.heading}</h2>
          <div>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </article>)}
      </section>

      <section className="service-planning">
        <div className="service-planning-heading"><h2>{resourceTitle}</h2><p>{resourceDescription}</p></div>
        <div className="service-resource-list">
          {resources.filter((item) => item.href !== urlPath).map((item) => <Link key={item.href} href={item.href}>
            <div><h3>{item.title}</h3><p>{item.desc}</p></div><ArrowRight aria-hidden="true" size={22} />
          </Link>)}
        </div>
      </section>

      <section className="service-faq">
        <div><h2>Frequently Asked Questions</h2><p>A few details to help you plan.</p><Link href="/faq" className="estate-text-link">More planning answers<ArrowRight aria-hidden="true" size={18} /></Link></div>
        <div>{faqs.map((faq) => <details key={faq.q}><summary>{faq.q}<span aria-hidden="true">+</span></summary><p>{faq.a}</p></details>)}</div>
      </section>

      <section className="service-final">
        <div><h2>{ctaTitle}</h2><p>We serve Lansing, Mid-Michigan, and surrounding communities with delivery, setup, pickup, and dependable scheduling.</p></div>
        <Link href='/request-quote' className="service-button">Request a Quote<ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </main>
    <Footer />
  </>
}
