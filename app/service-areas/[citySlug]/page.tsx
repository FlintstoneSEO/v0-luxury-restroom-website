import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'
import { cityPages } from '@/lib/seo'

const cityContent: Record<string, { intro: string; nearby: string; venueNote: string; useCases: string[]; faqs: { q: string; a: string }[] }> = {
'lansing-mi': { intro: 'Lansing events range from downtown galas to backyard graduation parties, and our team plans delivery windows that fit venue access rules and neighborhood logistics.', nearby: 'East Lansing, Holt, Mason, and Grand Ledge', venueNote:'From REO Town and Old Town to suburban private properties, we coordinate placement and utility checks before arrival.', useCases:['wedding weekends at private estates','corporate fundraisers and alumni gatherings','city festivals and community celebrations','long-term construction trailer support'], faqs:[{q:'How early should I reserve in Lansing?',a:'For peak wedding weekends, reserve 2-4 months ahead. For weekdays and smaller parties, we can often help faster.'},{q:'Do you handle setup at city parks?',a:'Yes. We coordinate placement, power, and water planning with your site contact.'},{q:'Can I rent for a multi-day event?',a:'Absolutely. We offer weekend and extended rental options with service scheduling.'}] },
  'east-lansing-mi': { intro: 'East Lansing events often include university-related gatherings, alumni weekends, and private celebrations where polished guest experience matters.', nearby: 'Lansing, Okemos, Haslett, and Dewitt', venueNote:'We handle tighter venue access timelines common around campus-adjacent event spaces.', useCases:['MSU-related events and tailgates','weddings at venues outside city core','private graduation and backyard parties','corporate and nonprofit events'], faqs:[{q:'Do you serve MSU-area venues?',a:'Yes, we regularly deliver to East Lansing venues and nearby private properties.'},{q:'What utilities are required?',a:'We review power and water access and provide guidance before delivery.'},{q:'Are attendants included?',a:'Service options can be customized based on event size and duration.'}] },
}

function getCityData(slug: string) {
  const base = cityPages.find((c) => c.slug === slug)
  if (!base) return null
  const fallback = { venueNote:`Our crews review access, setup surfaces, and utility options for sites in and around ${base.city}.`, useCases:['weddings and private parties','corporate events and festivals','construction and long-term projects','emergency and temporary restroom needs'], intro: `${base.city} hosts weddings, corporate gatherings, festivals, and long-term project needs where clean, upscale restroom access helps guests and teams stay comfortable.`, nearby: 'surrounding Mid-Michigan communities', faqs:[{q:`Do you deliver to ${base.city}?`,a:`Yes. We serve ${base.city} and nearby communities with scheduled delivery and pickup.`},{q:'Can you help with guest-count planning?',a:'Yes, we recommend trailer sizing based on guest volume and event duration.'},{q:'Do you provide long-term rentals?',a:'Yes, including construction and temporary facility support.'}] }
  return { ...base, ...(cityContent[slug] ?? fallback) }
}

export function generateStaticParams() { return cityPages.map((c) => ({ citySlug: c.slug })) }

export function generateMetadata({ params }: { params: { citySlug: string } }): Metadata {
  const data = getCityData(params.citySlug)
  if (!data) return {}
  const title = `Luxury Restroom Trailer Rentals in ${data.city}, MI`
  const description = `Book luxury restroom trailer rentals in ${data.city}, MI for weddings, private events, corporate functions, festivals, and long-term project needs.`
  const canonical = `https://www.signatureluxeevents.com/service-areas/${data.slug}`
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }
}

export default function CityPage({ params }: { params: { citySlug: string } }) {
  const data = getCityData(params.citySlug)
  if (!data) notFound()
  const business = localBusinessJsonLd(data.city)
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' },{ name: 'Service Areas', item: '/service-areas' },{ name: `${data.city}, MI`, item: `/service-areas/${data.slug}` }])
  const faqSchema = { '@context':'https://schema.org','@type':'FAQPage',mainEntity:data.faqs.map((f)=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html:JSON.stringify(business)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/><Header/><main className='container mx-auto px-4 lg:px-8 py-16 space-y-8'><h1 className='text-4xl font-serif font-semibold text-navy'>Luxury Restroom Trailer Rentals in {data.city}, MI</h1><p className='text-lg text-muted-foreground'>{data.intro} We serve {data.nearby} with white-glove delivery, setup, and pickup.</p><div><Button asChild><Link href='/request-quote'>Check Availability in {data.city}</Link></Button></div><h2 className='text-2xl font-semibold text-navy'>Popular rental use cases in {data.city}</h2><p>{data.venueNote}</p><ul className='list-disc pl-6 space-y-2'>{data.useCases.map((useCase)=><li key={useCase}>{useCase}</li>)}</ul><p>Our mobile restroom trailer rentals are ideal for wedding restroom trailer rental Michigan searches, VIP event restroom trailer rentals, and portable restroom trailer rental near me requests that need elevated comfort. We also support construction and long-term restroom trailer rental Michigan projects with dependable service schedules.</p><h2 className='text-2xl font-semibold text-navy'>Planning delivery, power, water, and guest counts</h2><p>Before delivery, we confirm trailer placement, turnaround access, power plan, and fresh-water/waste logistics so your crew or guests have a smooth experience. We also help estimate station count based on guest volume, event timeline, and venue flow.</p><p>Whether you are searching for a bathroom trailer rental Michigan option for a formal wedding, a portable restroom trailer rental near me for a private gathering, or a luxury porta potty alternative for VIP guests, we tailor recommendations to your timeline and site requirements.</p><div className='flex flex-wrap gap-4 underline'><Link href='/wedding-restroom-trailer-rentals'>Weddings</Link><Link href='/luxury-restroom-trailer-rentals'>Luxury Trailer Rentals</Link><Link href='/construction-long-term-restroom-trailer-rentals'>Construction & Long-Term</Link><Link href='/faq'>FAQ</Link><Link href='/request-quote'>Request Quote</Link></div><h2 className='text-2xl font-semibold text-navy'>FAQs for {data.city}, MI</h2><div className='space-y-4'>{data.faqs.map((f)=><div key={f.q}><h3 className='font-semibold'>{f.q}</h3><p>{f.a}</p></div>)}</div><div className='rounded-xl bg-navy text-white p-8'><h2 className='text-2xl font-semibold'>Plan Event Restrooms in {data.city}</h2><Link href='/request-quote' className='inline-block mt-4 bg-gold text-charcoal px-6 py-3 rounded-md'>Request a Quote</Link></div></main><Footer/></>
}
