import { Metadata } from 'next'
import Link from 'next/link'
import QuoteRequestForm from '@/components/quote-request-form'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'

const title = 'Request a Luxury Restroom Trailer Quote | Signature Luxe Events'
const description = 'Request a luxury restroom trailer quote for Lansing and Mid-Michigan events. Share your date, guest count, and location to receive tailored options.'
const canonical = 'https://www.signatureluxeevents.com/request-quote'

export const metadata: Metadata = { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }

export default function RequestQuotePage() {
  const business = localBusinessJsonLd('Lansing')
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: 'Request Quote', item: '/request-quote' }])
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'How quickly will I receive a quote?', acceptedAnswer: { '@type': 'Answer', text: 'Most quote requests receive a response within 1 to 2 business days, often sooner when details are complete.' } },
    { '@type': 'Question', name: 'Which areas do you serve?', acceptedAnswer: { '@type': 'Answer', text: 'We serve Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Jackson, Howell, Flint, Ann Arbor, Grand Rapids, and nearby Mid-Michigan communities.' } },
  ] }

  return <><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><Header />
    <main className='container mx-auto px-4 lg:px-8 py-16 space-y-8'>
      <h1 className='text-4xl font-serif font-semibold text-navy'>Request a Luxury Restroom Trailer Quote</h1>
      <p className='text-lg text-muted-foreground'>Planning an event in Lansing or throughout Mid-Michigan? Share your event details below and our team will build a quote around your timeline, guest count, and site setup needs.</p>
      <QuoteRequestForm />
      <section className='space-y-2'>
        <h2 className='text-2xl font-semibold text-navy'>What Happens After You Submit</h2>
        <ul className='list-disc pl-6 space-y-1'>
          <li>We review your event date, location, and attendance details.</li>
          <li>We confirm trailer availability and recommend an appropriate station count.</li>
          <li>We follow up with pricing, delivery planning, and next steps for reservation.</li>
        </ul>
      </section>
      <section className='space-y-2'>
        <h2 className='text-2xl font-semibold text-navy'>Information We Need for an Accurate Quote</h2>
        <p>To provide precise pricing, include event date, address, expected attendance, event timing, and notes about site access, power, and water. Complete details help us avoid changes later.</p>
      </section>
      <section className='space-y-2'>
        <h2 className='text-2xl font-semibold text-navy'>Common Event Types We Support</h2>
        <p>Weddings, private parties, graduations, reunions, corporate gatherings, fundraisers, festivals, construction projects, and emergency temporary restroom needs.</p>
      </section>
      <section className='space-y-2'>
        <h2 className='text-2xl font-semibold text-navy'>Service Area Reminder</h2>
        <p>Our core service footprint includes Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Jackson, Howell, Flint, Ann Arbor, and broader Mid-Michigan regions.</p>
        <p>Need to confirm your city? Visit our <Link href='/service-areas' className='underline'>service areas page</Link>.</p>
      </section>
      <section className='space-y-2'>
        <h2 className='text-2xl font-semibold text-navy'>Prefer to Talk First?</h2>
        <p>If you prefer direct contact, use our <Link href='/contact' className='underline'>contact page</Link> and include your event date and city so we can route your request quickly.</p>
      </section>
    </main><Footer /></>
}
