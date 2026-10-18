import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function AreaHero({ city, intro, index = false }: { city: string; intro: string; index?: boolean }) {
  return <section className="area-hero">
    <div className="area-hero-copy">
      <nav aria-label="Breadcrumb" className="area-breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        {index ? <span aria-current="page">Service areas</span> : <><Link href="/service-areas">Service areas</Link><span aria-hidden="true">/</span><span aria-current="page">{city}</span></>}
      </nav>
      <h1><span className="area-hero-heading-intro">Luxury Restroom Trailer Rentals {index ? 'Across' : 'in'}</span>{' '}<span className="area-hero-locality">{city}{!index && ', MI'}</span></h1>
      <p>{intro}</p>
      <div className="area-hero-actions"><Link href="/request-quote" className="area-button">{index ? 'Check your location' : `Check availability in ${city}`}<ArrowRight aria-hidden="true" size={18} /></Link><Link href="/luxury-restroom-trailer-rentals" className="estate-text-link">Explore the trailers<ArrowRight aria-hidden="true" size={17} /></Link></div>
    </div>
    <figure className="area-hero-photo">
      <Image src="/images/Wedding Trailer.png" alt="Signature Luxe restroom trailer at an outdoor wedding setting" fill priority sizes="(max-width: 900px) 100vw, 48vw" className="object-cover" />
      <figcaption><span>Thoughtful comfort. Beautifully presented.</span><Link href="/gallery">View the gallery<ArrowRight aria-hidden="true" size={17} /></Link></figcaption>
    </figure>
  </section>
}
