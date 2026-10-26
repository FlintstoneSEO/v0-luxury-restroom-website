import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AreaHero } from '@/components/area-hero'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'
import { cityPages } from '@/lib/seo'
import { getServiceAreaBySlug, getAllServiceAreas } from '@/lib/content/service-areas'

function occasionFor(title: string) {
  const text = title.toLowerCase()
  if (/wedding|reception/.test(text)) return { href: '/wedding-restroom-trailer-rentals', src: '/images/Wedding Trailer.png', alt: 'Restroom trailer in an outdoor wedding setting' }
  if (/construction|contractor|project|long.term|outage|temporary/.test(text)) return { href: '/construction-long-term-restroom-trailer-rentals', src: '/images/Construction Site Trailer.png', alt: 'Restroom trailer at a construction site' }
  if (/graduation|alumni|tailgate/.test(text)) return { href: '/private-event-restroom-trailers', src: '/images/MSU Tailgate Rental Restroom.png', alt: 'Restroom trailer for a Michigan game-day gathering' }
  if (/corporate|company|donor|nonprofit/.test(text)) return { href: '/corporate-event-restroom-trailers', src: '/images/3 Station Pro/3Station.jpg', alt: 'Signature Luxe three-station trailer exterior' }
  if (/festival|community/.test(text)) return { href: '/festival-community-event-restroom-trailers', src: '/images/Special Event Trailer.png', alt: 'Restroom trailer at an outdoor evening event' }
  return { href: '/private-event-restroom-trailers', src: '/images/Special Event Trailer.png', alt: 'Restroom trailer for a private evening celebration' }
}

const cityMeta: Record<string, { title: string; description: string }> = {
  'lansing-mi': { title: 'Luxury Restroom Trailer Rentals in Lansing, MI', description: 'Rent luxury restroom trailers in Lansing, MI for weddings, private parties, corporate events, construction sites, and outdoor gatherings.' },
  'east-lansing-mi': { title: 'Luxury Restroom Trailer Rentals in East Lansing, MI', description: 'Luxury restroom trailer rentals in East Lansing, MI for MSU tailgates, graduations, weddings, private parties, and outdoor events.' },
  'okemos-mi': { title: 'Luxury Restroom Trailer Rentals in Okemos, MI', description: 'Rent luxury restroom trailers in Okemos, MI for weddings, backyard parties, graduation events, corporate gatherings, and outdoor celebrations.' },
  'haslett-mi': { title: 'Luxury Restroom Trailer Rentals in Haslett, MI', description: 'Luxury restroom trailer rentals in Haslett, MI for Lake Lansing area events, backyard parties, weddings, graduations, and private gatherings.' },
  'grand-ledge-mi': { title: 'Luxury Restroom Trailer Rentals in Grand Ledge, MI', description: 'Luxury restroom trailer rentals in Grand Ledge, MI for outdoor weddings, park gatherings, family events, and private celebrations.' },
  'dewitt-mi': { title: 'Luxury Restroom Trailer Rentals in DeWitt, MI', description: 'Rent luxury restroom trailers in DeWitt, MI for weddings, family events, park gatherings, community events, and private parties.' },
  'holt-mi': { title: 'Luxury Restroom Trailer Rentals in Holt, MI', description: 'Luxury restroom trailer rentals in Holt, MI for backyard parties, graduations, weddings, family gatherings, and outdoor events.' },
  'mason-mi': { title: 'Luxury Restroom Trailer Rentals in Mason, MI', description: 'Rent luxury restroom trailers in Mason, MI for fairground events, outdoor weddings, expos, private parties, and community gatherings.' },
}
const getCityData = (slug: string) => getServiceAreaBySlug(slug) ?? null
export function generateStaticParams() { return cityPages.map((c) => ({ citySlug: c.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> { const { citySlug } = await params; const data = getCityData(citySlug); if (!data) return {}; const isPriorityCity = data.priority; const meta = cityMeta[data.slug]; const title = meta?.title ?? (isPriorityCity ? `Luxury Restroom Trailer Rentals in ${data.city}, MI | Signature Luxe Events` : `Restroom Trailer Rentals ${data.city}, MI`); const description = meta?.description ?? (isPriorityCity ? `Luxury restroom trailer rentals in ${data.city}, MI for weddings, private events, corporate gatherings, festivals, construction projects, and long-term needs with delivery and setup planning.` : `Luxury restroom trailer rentals for weddings, events, and project sites in ${data.city}, Michigan with delivery, setup, and service planning.`); const canonical = `https://www.signatureluxeevents.com/service-areas/${data.slug}`; return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, images: [{ url: '/images/Wedding Trailer.png', alt: `Climate-controlled luxury restroom trailer rental in ${data.city}, Michigan` }] }, twitter: { card: 'summary_large_image', title, description, images: ['/images/Wedding Trailer.png'] } } }

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params
  const data = getCityData(citySlug)
  if (!data) notFound()
  const business = localBusinessJsonLd(data.city)
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: 'Service Areas', item: '/service-areas' }, { name: `${data.city}, MI`, item: `/service-areas/${data.slug}` }])
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
  const guide = [
    { title: `Wedding restroom trailer rentals in ${data.city}`, paragraphs: data.weddingUseCase },
    { title: 'Private parties & backyard celebrations', paragraphs: data.privateEventUseCase },
    { title: 'Corporate, festival & community events', paragraphs: data.corporateFestivalUseCase },
    { title: 'Construction & long-term rentals', paragraphs: data.constructionLongTermUseCase },
    { title: 'Delivery, power, water & placement', paragraphs: data.setupLogistics },
    { title: 'Seasonal planning', paragraphs: data.seasonalPlanning },
  ].filter((item) => item.paragraphs?.length)
  const nearbyAreas = new Map(getAllServiceAreas().map((area) => [area.city.toLowerCase(), area.slug]))
  const nearby = data.nearbyCommunities?.length ? data.nearbyCommunities : data.nearby.split(/, | and /)
  const serviceLinks = [...(data.serviceLinks ?? []),
    { href: '/special-events', label: 'Special events' },
    { href: '/emergency-disaster-relief-restroom-trailers', label: 'Disaster relief & government support' },
    { href: '/service-areas', label: 'All service areas' },
  ].filter((item, index, items) => items.findIndex((other) => other.href === item.href) === index)

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <Header />
    <main id="public-content" tabIndex={-1} className="estate-public area-public">
      <AreaHero city={data.city} intro={data.intro} />
      <div className="area-local-strip"><p><MapPin aria-hidden="true" size={19} />Also serving {data.nearby}.</p><a href="#local-planning">Plan your local rental<ArrowRight aria-hidden="true" size={17} /></a></div>

      <section className="area-occasions" aria-labelledby="local-occasions-heading">
        <div className="area-section-heading"><h2 id="local-occasions-heading">A setting for every occasion.</h2><p>Weddings, events, and projects in {data.city}. Explore the rental that fits your plans.</p></div>
        <div className="area-occasion-grid">{data.useCases.map((title) => {
          const occasion = occasionFor(title)
          return <Link key={title} href={occasion.href} className="area-occasion"><div className="area-occasion-photo"><Image src={occasion.src} alt={occasion.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" className="object-cover" /></div><h3>{title}<ArrowRight aria-hidden="true" size={19} /></h3></Link>
        })}</div>
      </section>

      <section id="local-planning" className="area-local-planning">
        <div className="area-planning-overview">
          <h2>Thoughtfully planned for {data.city}.</h2>
          <p>{data.venueNote}</p>
          {data.localOverview?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="area-interior-photo"><Image src="/images/3 Station Pro/3Station5.jpg" alt="Vanity and sink inside a Signature Luxe restroom trailer" fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" /></div>
        </div>
        <div className="area-guide">
          <h2>Your local rental guide</h2>
          <p>Open the details that matter to your event or project.</p>
          {guide.map((item) => <details key={item.title}><summary><h3>{item.title}</h3><ChevronDown aria-hidden="true" size={19} /></summary><div>{item.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>)}
          <details><summary><h3>Trailer options available in {data.city}</h3><ChevronDown aria-hidden="true" size={19} /></summary><div><p>Our <Link href="/luxury-restroom-trailer-rentals">luxury restroom trailer lineup</Link> includes 2-station units for intimate weddings and backyard parties, 3-station units for mid-sized weddings, corporate events, and graduation parties, plus 4-station trailers for community gatherings and larger guest counts.</p></div></details>
          <p className="area-setup-note">Before delivery, we confirm access paths, surface suitability, and utility planning so setup stays smooth and timeline-friendly.</p>
          <Link href="/request-quote" className="estate-text-link">Talk through your rental<ArrowRight aria-hidden="true" size={18} /></Link>
        </div>
      </section>

      <section className="area-coverage">
        <div><MapPin aria-hidden="true" className="area-coverage-pin" /><h2>{data.city} and a little further.</h2><p>Coverage includes {data.nearby} and surrounding Mid-Michigan communities.</p>{data.trustNote && <p>{data.trustNote}</p>}</div>
        <div className="area-nearby"><h3>Nearby communities served</h3><ul>{nearby.map((name) => {
          const slug = nearbyAreas.get(name.toLowerCase())
          return <li key={name}>{slug ? <Link href={`/service-areas/${slug}`}>{name}<ArrowRight aria-hidden="true" size={16} /></Link> : <span>{name}</span>}</li>
        })}</ul><Link href="/service-areas" className="area-light-link">View all service areas<ArrowRight aria-hidden="true" size={18} /></Link></div>
      </section>

      <section className="area-answers">
        <div className="area-section-heading"><h2>FAQs for {data.city}, MI</h2><p>A few things to know before you book.</p></div>
        <div className="area-guide">{data.faqs.map((faq) => <details key={faq.q}><summary><h3>{faq.q}</h3><ChevronDown aria-hidden="true" size={19} /></summary><div><p>{faq.a}</p></div></details>)}</div>
      </section>

      <section className="area-related" aria-label="Service and planning links">
        <div><h2>Explore the possibilities.</h2><div className="area-link-directory">{serviceLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}<ArrowRight aria-hidden="true" size={17} /></Link>)}</div></div>
        {!!data.resourceLinks?.length && <div><h2>A little planning goes a long way.</h2><div className="area-link-directory">{data.resourceLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}<ArrowRight aria-hidden="true" size={17} /></Link>)}</div></div>}
      </section>
      <section className="area-final"><div><h2>Let’s plan your {data.city} rental.</h2><p>Tell us your date, guest count, and location to receive a tailored restroom trailer recommendation.</p></div><Link href="/request-quote" className="area-button">Request your quote<ArrowRight aria-hidden="true" size={18} /></Link></section>
    </main>
    <Footer />
  </>
}
