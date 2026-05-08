import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ClipboardList, Droplets, Sparkles, Truck } from 'lucide-react'
import QuoteRequestForm from '@/components/quote-request-form'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/hero-section'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'

const title = 'Request a Luxury Restroom Trailer Quote | Signature Luxe Events'
const description = 'Request a luxury restroom trailer quote for Lansing and Mid-Michigan events. Share your date, guest count, and location to receive tailored options.'
const canonical = 'https://www.signatureluxeevents.com/request-quote'

export const metadata: Metadata = { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }

const nextSteps = [
  'Submit your event details',
  'We review your date, location, and setup needs',
  'You receive a custom quote',
  'Approve your proposal and reserve your date',
]

export default function RequestQuotePage() {
  const business = localBusinessJsonLd('Lansing')
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: 'Request Quote', item: '/request-quote' }])
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'How quickly will I receive a quote?', acceptedAnswer: { '@type': 'Answer', text: 'Most quote requests receive a response within 1 to 2 business days, often sooner when details are complete.' } },
    { '@type': 'Question', name: 'Which areas do you serve?', acceptedAnswer: { '@type': 'Answer', text: 'We serve Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Jackson, Howell, Flint, Ann Arbor, Grand Rapids, and nearby Mid-Michigan communities.' } },
  ] }

  return <><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><Header />
    <main>
      <HeroSection
        variant='page'
        eyebrow='Request a Quote'
        title='Request a Luxury Restroom Trailer Quote'
        description='Tell us about your event, location, guest count, and setup needs. We’ll review availability and provide a custom quote for your Lansing or Mid-Michigan event.'
        primaryCta={{ text: 'Start Your Quote', href: '#quote-form' }}
        secondaryCta={{ text: 'View Trailer Options', href: '/luxury-restroom-trailer-rentals' }}
        trustLine='Based in Lansing, MI. Serving Mid-Michigan and surrounding communities.'
      />

      <section id='quote-form' className='py-20 md:py-28 bg-white'>
        <div className='container mx-auto px-4 lg:px-8'>
          <div className='grid gap-10 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <div className='bg-cream rounded-2xl p-8 lg:p-10 shadow-sm border border-gold/30'>
                <h2 className='text-2xl font-serif font-semibold text-navy mb-2'>Event Details</h2>
                <p className='text-charcoal/80 mb-8'>Provide as much detail as possible so we can recommend the right trailer size, delivery plan, and quote.</p>
                <QuoteRequestForm />
              </div>
            </div>
            <aside className='lg:col-span-1'>
              <div className='sticky top-24 space-y-6'>
                <div className='bg-navy text-white rounded-2xl p-6 lg:p-8'>
                  <h3 className='text-xl font-serif font-semibold mb-6'>What Happens Next</h3>
                  <div className='space-y-5'>
                    {nextSteps.map((step, index) => (
                      <div key={step} className='flex gap-4'>
                        <div className='w-8 h-8 rounded-full bg-gold text-charcoal text-sm font-semibold flex items-center justify-center shrink-0'>{index + 1}</div>
                        <p className='text-white/90'>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bg-cream border border-gold/30 rounded-2xl p-6'>
                  <h3 className='text-lg font-semibold text-navy mb-4'>Quick Info</h3>
                  <ul className='space-y-3'>
                    {[
                      'Custom quotes based on event size and location',
                      'Serving Lansing and Mid-Michigan',
                      'Weddings, events, construction, and temporary needs',
                      '2-station, 3-station, and 4-station options',
                    ].map((item) => <li key={item} className='flex items-start gap-2'><CheckCircle className='h-5 w-5 text-navy mt-0.5 shrink-0' /><span className='text-base text-charcoal'>{item}</span></li>)}
                  </ul>
                </div>

                <div className='bg-white border border-gold/30 rounded-2xl p-6'>
                  <h3 className='text-lg font-semibold text-navy mb-2'>Prefer to Talk First?</h3>
                  <p className='text-base text-charcoal/80 mb-3'>If you prefer direct contact, visit our contact page and share your event date and location details so we can route your request quickly.</p>
                  <Link href='/contact' className='text-navy font-medium hover:underline'>Visit the Contact Page</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className='py-16 bg-navy text-white'>
        <div className='container mx-auto px-4 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[{ icon: Sparkles, text: 'Climate-controlled trailers' }, { icon: Droplets, text: 'Private flushing stalls' }, { icon: ClipboardList, text: 'Modern vanities and mirrors' }, { icon: Truck, text: 'Delivery, setup, and pickup planning' }].map((item) => (
            <div key={item.text} className='rounded-2xl border border-gold/30 bg-white/5 p-5'>
              <div className='mb-3 inline-flex rounded-xl bg-gold/20 p-3'><item.icon className='h-8 w-8 text-gold' /></div>
              <p className='text-white/90 font-medium'>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='py-14 bg-cream'>
        <div className='container mx-auto px-4 lg:px-8'>
          <p className='text-center text-charcoal max-w-4xl mx-auto'>Serving Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Jackson, Howell, Flint, Ann Arbor, Grand Rapids, and Mid-Michigan communities with premium restroom trailer rental service.</p>
        </div>
      </section>
    </main><Footer /></>
}
