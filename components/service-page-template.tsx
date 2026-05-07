import Link from 'next/link'
import Image from 'next/image'
import { ClipboardList, Droplets, Sparkles, Thermometer } from 'lucide-react'
import { Header } from './layout/header'
import { Footer } from './layout/footer'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

type FAQ = { q: string; a: string }
type Section = { heading: string; paragraphs: string[] }

const resources = [
  { href: '/request-quote', title: 'Request a Quote', desc: 'Share your event details and receive a custom proposal.' },
  { href: '/service-areas/lansing-mi', title: 'Lansing Service Area', desc: 'See Lansing delivery and setup coverage details.' },
  { href: '/service-areas/east-lansing-mi', title: 'East Lansing Service Area', desc: 'Explore East Lansing rental guidance and logistics.' },
  { href: '/service-areas/okemos-mi', title: 'Okemos Restroom Trailer Rentals', desc: 'Review options for Okemos events and properties.' },
  { href: '/wedding-restroom-trailer-rentals', title: 'Wedding Restroom Trailers', desc: 'Luxury guest amenities for wedding weekends.' },
  { href: '/luxury-restroom-trailer-rentals', title: 'Luxury Restroom Rental Options', desc: 'Compare station sizes and premium features.' },
  { href: '/construction-long-term-restroom-trailer-rentals', title: 'Construction and Long-Term Rentals', desc: 'Dependable long-term and project-based support.' },
  { href: '/faq', title: 'FAQ', desc: 'Get answers to common planning and delivery questions.' },
  { href: '/gallery', title: 'Gallery', desc: 'View restroom trailer photos and event setups.' },
]

export function ServicePageTemplate({ pageTitle, serviceName, urlPath, intro, sections, faqs, ctaTitle, resourceImageSrc = '/images/Wedding Trailer.png', resourceImageAlt = 'Luxury restroom trailer exterior setup for Michigan event', resourceEyebrow = 'Planning Support', resourceTitle = 'Helpful Resources While You Plan', resourceDescription = 'Explore service areas, event-specific pages, and planning resources.' }: { pageTitle: string; serviceName: string; urlPath: string; intro: string; sections: Section[]; faqs: FAQ[]; ctaTitle: string; resourceImageSrc?: string; resourceImageAlt?: string; resourceEyebrow?: string; resourceTitle?: string; resourceDescription?: string }) {
  const service = serviceJsonLd(serviceName, `https://www.signatureluxeevents.com${urlPath}`)
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: pageTitle, item: urlPath }])
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }

  return <>
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <Header />
    <main>
      <section className='bg-navy py-20 md:py-28 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.2),_transparent_50%)]' />
        <div className='container relative mx-auto px-4 lg:px-8 text-center max-w-4xl'>
          <p className='text-gold uppercase tracking-[0.2em] text-xs mb-4'>{serviceName}</p>
          <h1 className='text-4xl md:text-5xl font-serif font-semibold text-white'>{pageTitle}</h1>
          <p className='mt-6 text-lg text-white/80'>{intro}</p>
          <div className='mt-8 flex flex-wrap justify-center gap-4'>
            <Link href='/request-quote' className='bg-gold text-charcoal px-7 py-3 rounded-md font-medium'>Request a Quote</Link>
            <Link href='/gallery' className='border border-white/40 text-white px-7 py-3 rounded-md font-medium hover:bg-white/10'>View Gallery</Link>
          </div>
          <p className='mt-8 text-sm text-white/60'>Lansing-based luxury restroom trailer rentals serving Mid-Michigan.</p>
        </div>
      </section>

      <section className='bg-white py-10'>
        <div className='container mx-auto px-4 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[{ icon: Thermometer, title: 'Climate Controlled' }, { icon: Droplets, title: 'Private Flushing Stalls' }, { icon: Sparkles, title: 'Modern Vanities' }, { icon: ClipboardList, title: 'Delivery & Setup Planning' }].map((item) => (
            <div key={item.title} className='rounded-2xl border border-gold/30 bg-cream p-5'>
              <div className='mb-3 inline-flex rounded-xl bg-gold/25 p-3'><item.icon className='h-8 w-8 text-navy' /></div>
              <p className='font-medium text-navy'>{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='bg-white py-8'>
        <div className='container mx-auto px-4 lg:px-8'>
          <div className='rounded-2xl border border-gold/30 bg-navy text-white p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5'>
            <div>
              <h2 className='text-2xl font-semibold'>Get a Fast Quote for Your Michigan Event</h2>
              <p className='mt-2 text-white/85'>Tell us your location, date, and guest count, and we&apos;ll match you with the right trailer size and plan.</p>
            </div>
            <Link href='/request-quote' className='bg-gold text-charcoal px-6 py-3 rounded-md font-medium w-fit'>Request a Luxury Restroom Quote</Link>
          </div>
        </div>
      </section>

      {sections.map((section, index) => (
        <section key={section.heading} className={index % 2 === 0 ? 'bg-white py-10' : 'bg-cream py-10'}>
          <div className='container mx-auto px-4 lg:px-8'>
            <div className='rounded-2xl border border-gold/20 bg-white p-8 shadow-sm'>
              <p className='text-gold-text text-xs uppercase tracking-[0.2em] mb-3'>Signature Luxe</p>
              <h2 className='text-2xl font-semibold text-navy mb-4'>{section.heading}</h2>
              <div className='space-y-4 text-base leading-relaxed text-charcoal/90'>
                {section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 30)}>{paragraph}</p>)}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className='bg-white py-10'>
        <div className='container mx-auto px-4 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-6 items-stretch'>
            <div className='rounded-2xl border border-gold/20 bg-cream p-8'>
              <div className='h-1.5 w-14 rounded-full bg-gold mb-4' /><p className='text-gold-text text-xs uppercase tracking-[0.2em] mb-3'>{resourceEyebrow}</p><h2 className='text-2xl font-semibold text-navy'>{resourceTitle}</h2>
              <p className='mt-3 text-base leading-relaxed text-charcoal/90'>{resourceDescription}</p>
            </div>
            <div className='relative overflow-hidden rounded-2xl min-h-[220px] border border-gold/20'>
              <Image src={resourceImageSrc} alt={resourceImageAlt} fill className='object-cover' sizes='(max-width: 1024px) 100vw, 50vw' />
            </div>
          </div>
          <div className='mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {resources.map((item) => <Link key={item.href} href={item.href} className='rounded-xl border border-gold/20 bg-white p-5 shadow-sm transition hover:border-gold/50'><h3 className='font-semibold text-navy'>{item.title}</h3><p className='text-sm leading-relaxed text-charcoal/85 mt-1'>{item.desc}</p></Link>)}
          </div>
        </div>
      </section>

      <section className='bg-cream py-12'>
        <div className='container mx-auto px-4 lg:px-8'>
          <h2 className='text-2xl font-semibold text-navy mb-6'>Frequently Asked Questions</h2>
          <div className='space-y-4'>
            {faqs.map((faq) => <div key={faq.q} className='rounded-xl border border-gold/20 bg-white p-6'><h3 className='font-semibold text-navy'>{faq.q}</h3><p className='mt-2 text-charcoal'>{faq.a}</p></div>)}
          </div>
        </div>
      </section>

      <section className='bg-white py-12'>
        <div className='container mx-auto px-4 lg:px-8'>
          <div className='rounded-2xl bg-navy text-white border border-gold/30 p-8 lg:p-10 text-center'>
            <h2 className='text-2xl font-semibold'>{ctaTitle}</h2>
            <p className='mt-2 text-white/90'>We serve Lansing, Mid-Michigan, and surrounding communities with delivery, setup, pickup, and dependable scheduling.</p>
            <Link href='/request-quote' className='inline-block mt-5 bg-gold text-charcoal px-6 py-3 rounded-md font-medium'>Request a Quote</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
