import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AreaHero } from '@/components/area-hero'
import { getAllServiceAreas } from '@/lib/content/service-areas'
import { getServiceAreaIndex } from '@/lib/content/index-pages'

const indexContent = getServiceAreaIndex()
const allAreas = getAllServiceAreas()
const bySlug = new Map(allAreas.map((area) => [area.slug, area]))
const toGridArea = (slug: string) => {
  const area = bySlug.get(slug)
  if (!area) throw new Error(`Missing service area for index: ${slug}`)
  return { name: area.city, state: area.state, featured: indexContent.featuredSlugs.includes(slug), href: `/service-areas/${slug}` }
}
const primaryAreas = indexContent.primarySlugs.map(toGridArea)
const extendedAreas = [
  ...indexContent.extendedSlugs.map(toGridArea),
  ...indexContent.additionalMarkets.map((name) => ({ name, state: 'MI' })),
]
export const metadata: Metadata = {
  title: indexContent.seo.title,
  description: indexContent.seo.description,
  alternates: { canonical: indexContent.seo.canonical },
}

type DirectoryArea = { name: string; state?: string; href?: string; featured?: boolean }
function AreaDirectory({ title, description, areas }: { title: string; description: string; areas: DirectoryArea[] }) {
  return <div className="area-directory-group"><h2>{title}</h2><p>{description}</p><ul>{areas.map((area) => <li key={area.name}>{area.href ? <Link href={area.href}><span>{area.name}<small>{area.state}</small></span><ArrowRight aria-hidden="true" size={19} /></Link> : <div><span>{area.name}<small>{area.state}</small></span><small>Available by request</small></div>}</li>)}</ul></div>
}

export default function ServiceAreasPage() {
  return <>
    <Header />
    <main id="public-content" tabIndex={-1} className="estate-public area-public area-index">
      <AreaHero index city="Lansing and Mid-Michigan" intro="Based in Lansing, MI, we proudly serve weddings, events, construction sites, and long-term rental needs throughout Mid-Michigan and surrounding communities." />
      <div className="area-local-strip"><p><MapPin aria-hidden="true" size={19} />Based in Lansing. Serving Mid-Michigan.</p><a href="#coverage-directory">Find your community<ArrowRight aria-hidden="true" size={17} /></a></div>
      <section id="coverage-directory" className="area-directory">
        <AreaDirectory title="Greater Lansing Area" description="Our home base and primary service area. Quick delivery and excellent availability." areas={primaryAreas} />
        <AreaDirectory title="Surrounding Michigan Communities" description="We serve events and projects throughout Mid-Michigan and beyond, typically within a 2-hour radius of Lansing." areas={extendedAreas} />
      </section>
      <section className="area-regional">
        <div className="area-regional-photo"><Image src="/images/3 Station Pro/3Station.jpg" alt="Signature Luxe three-station restroom trailer exterior" fill sizes="(max-width: 900px) 100vw, 50vw" className="object-cover" /></div>
        <div><h2>Local service.<br />Regional reach.</h2><p>Signature Luxe Events &amp; Amenities is proudly based in Lansing, Michigan. From our central location, we serve customers throughout Mid-Michigan and surrounding communities within approximately a 2-hour radius.</p><p>Whether you’re planning a wedding in Ann Arbor, a corporate event in Grand Rapids, a festival in Flint, or a construction project in Jackson, we can deliver and set up our luxury restroom trailers at your location.</p><div className="area-location-help"><h3>Don’t see your area listed?</h3><p>Even if your location isn’t listed above, we may still be able to serve you. Contact us with your event location and we’ll let you know if we can accommodate your needs.</p><Link href="/request-quote" className="area-light-link">Check your location<ArrowRight aria-hidden="true" size={18} /></Link></div></div>
      </section>
      <section className="area-occasions">
        <div className="area-section-heading"><h2>Events and projects throughout Michigan.</h2><p>No matter where your event or project is located in our service area, we provide the same premium service.</p></div>
        <div className="area-occasion-grid">{[
          {title:'Weddings',href:'/wedding-restroom-trailer-rentals',image:'/images/Wedding Trailer.png',description:'Outdoor weddings, barn venues, private estates, and backyard celebrations.'},
          {title:'Special Events',href:'/private-event-restroom-trailers',image:'/images/Special Event Trailer.png',description:'Private parties, corporate events, festivals, and community gatherings.'},
          {title:'Construction',href:'/construction-long-term-restroom-trailer-rentals',image:'/images/Construction Site Trailer.png',description:'Construction sites, commercial projects, and long-term job site rentals.'},
          {title:'Government',href:'/emergency-disaster-relief-restroom-trailers',image:'/images/Disaster Relief Trailer.png',description:'Municipal projects, disaster relief, and emergency response support.'},
        ].map((item)=><Link key={item.href} href={item.href} className="area-occasion"><div className="area-occasion-photo"><Image src={item.image} alt={`Signature Luxe restroom trailer for ${item.title.toLowerCase()}`} fill className="object-cover" sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" /></div><h3>{item.title}<ArrowRight aria-hidden="true" size={19} /></h3><p>{item.description}</p></Link>)}</div>
      </section>
      <section className="area-final"><div><h2>Ready to book in your area?</h2><p>Tell us about your event location and we’ll confirm we can serve you.</p></div><Link href="/request-quote" className="area-button">Request a quote<ArrowRight aria-hidden="true" size={18} /></Link></section>
    </main>
    <Footer />
  </>
}
