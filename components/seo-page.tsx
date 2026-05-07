import Link from 'next/link'
import { Header } from './layout/header'
import { Footer } from './layout/footer'

export function SeoPage({ title, intro, cta = 'Check Availability', city }: { title: string; intro: string; cta?: string; city?: string }) {
  return (<><Header /><main className='container mx-auto px-4 lg:px-8 py-16 space-y-8'>
    <h1 className='text-4xl font-serif font-semibold text-navy'>{title}</h1>
    <p className='text-lg text-muted-foreground'>{intro}</p>
    <section className='space-y-4'>
      <h2 className='text-2xl font-semibold text-navy'>What to expect</h2>
      <p>Our luxury restroom trailers are clean, climate-controlled, and professionally delivered across Lansing, Mid-Michigan, and nearby communities. We help with weddings, private events, corporate functions, festivals, construction sites, long-term rentals, and emergency needs.</p>
      <p>We provide planning guidance for guest counts, trailer sizing (2-station, 3-station, and 4-station options), power and water access, placement logistics, and service schedules so your event or project stays comfortable and on brand.</p>
    </section>
    <section className='space-y-2'>
      <h2 className='text-2xl font-semibold text-navy'>Helpful links</h2>
      <div className='flex flex-wrap gap-4 underline text-navy'>
        <Link href='/request-quote'>Request Quote</Link><Link href='/service-areas'>Service Areas</Link><Link href='/faq'>FAQ</Link><Link href='/wedding-restroom-trailer-rentals'>Weddings</Link><Link href='/construction-long-term-restroom-trailer-rentals'>Construction</Link>
      </div>
    </section>
    <div className='rounded-xl bg-navy text-white p-8'><h2 className='text-2xl font-semibold'>{city ? `Check Availability in ${city}` : cta}</h2><Link href='/request-quote' className='inline-block mt-4 bg-gold text-charcoal px-6 py-3 rounded-md'>Request a Fast Quote</Link></div>
  </main><Footer /></>)
}
