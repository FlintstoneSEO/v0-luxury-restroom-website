import Link from 'next/link'
import { Header } from './layout/header'
import { Footer } from './layout/footer'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

type FAQ = { q: string; a: string }
type Section = { heading: string; paragraphs: string[] }

export function ServicePageTemplate({
  pageTitle,
  serviceName,
  urlPath,
  intro,
  sections,
  faqs,
  ctaTitle,
}: {
  pageTitle: string
  serviceName: string
  urlPath: string
  intro: string
  sections: Section[]
  faqs: FAQ[]
  ctaTitle: string
}) {
  const service = serviceJsonLd(serviceName, `https://www.signatureluxeevents.com${urlPath}`)
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: pageTitle, item: urlPath },
  ])
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <main className='container mx-auto px-4 lg:px-8 py-16 space-y-8'>
        <h1 className='text-4xl font-serif font-semibold text-navy'>{pageTitle}</h1>
        <p className='text-lg text-muted-foreground'>{intro}</p>

        <div className='rounded-xl bg-navy text-white p-8'>
          <h2 className='text-2xl font-semibold'>Get a Fast Quote for Your Michigan Event</h2>
          <p className='mt-2 text-white/90'>Tell us your location, date, and guest count, and we will match you with the right trailer size and service plan.</p>
          <Link href='/request-quote' className='inline-block mt-4 bg-gold text-charcoal px-6 py-3 rounded-md'>Request a Luxury Restroom Quote</Link>
        </div>

        {sections.map((section) => (
          <section key={section.heading} className='space-y-3'>
            <h2 className='text-2xl font-semibold text-navy'>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 30)}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section className='space-y-3'>
          <h2 className='text-2xl font-semibold text-navy'>Helpful Resources While You Plan</h2>
          <p>Many clients compare options across event types and locations before booking. You can explore wedding-focused guidance, service-area pages, and planning resources below.</p>
          <div className='flex flex-wrap gap-4 underline'>
            <Link href='/request-quote'>Start your quote request</Link>
            <Link href='/service-areas/lansing-mi'>Lansing service area details</Link>
            <Link href='/service-areas/east-lansing-mi'>East Lansing event support</Link>
            <Link href='/service-areas/okemos-mi'>Okemos restroom trailer rentals</Link>
            <Link href='/wedding-restroom-trailer-rentals'>Wedding restroom trailers</Link>
            <Link href='/luxury-restroom-trailer-rentals'>Luxury restroom rental options</Link>
            <Link href='/construction-long-term-restroom-trailer-rentals'>Long-term and construction rentals</Link>
            <Link href='/faq'>Read common planning questions</Link>
            <Link href='/gallery'>View trailer photos in our gallery</Link>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold text-navy'>Frequently Asked Questions</h2>
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className='font-semibold'>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </section>

        <div className='rounded-xl bg-navy text-white p-8'>
          <h2 className='text-2xl font-semibold'>{ctaTitle}</h2>
          <p className='mt-2 text-white/90'>We serve Lansing, Mid-Michigan, and surrounding communities with delivery, setup, pickup, and dependable scheduling.</p>
          <Link href='/request-quote' className='inline-block mt-4 bg-gold text-charcoal px-6 py-3 rounded-md'>Request a Quote</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
