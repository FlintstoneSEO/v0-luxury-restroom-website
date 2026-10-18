import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ClipboardList, Droplets, Thermometer } from 'lucide-react'

type ServiceHeroProps = {
  title: string
  description: string
  imageSrc?: string
  imageAlt?: string
  primaryCta?: { text: string; href: string }
  secondaryCta?: { text: string; href: string }
  trustLine?: string
  eyebrow?: string
  variant?: 'page' | 'default'
  className?: string
}

export function ServiceHero({ title, description, imageSrc = '/images/Special Event Trailer.png', imageAlt = 'Signature Luxe restroom trailer exterior', primaryCta, secondaryCta, trustLine, className = '' }: ServiceHeroProps) {
  return <>
    <section className={`service-hero ${className}`}>
      <div className="service-hero-copy">
        <nav aria-label="Breadcrumb" className="service-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Restroom trailer services</span></nav>
        <h1>{title}</h1>
        <p className="service-hero-description">{description}</p>
        <div className="service-hero-actions">
          {primaryCta && <Link className="service-button" href={primaryCta.href}>{primaryCta.text}<ArrowRight aria-hidden="true" size={18} /></Link>}
          {secondaryCta && <Link className="estate-text-link" href={secondaryCta.href}>{secondaryCta.text}<ArrowRight aria-hidden="true" size={17} /></Link>}
        </div>
        <p className="service-hero-location">{trustLine || 'Lansing-based. Serving Mid-Michigan and surrounding communities.'}</p>
      </div>
      <figure className="service-hero-photo">
        <Image src={imageSrc} alt={imageAlt} fill priority sizes="(max-width: 900px) 100vw, 48vw" className="object-cover" />
        <figcaption><span>Signature Luxe</span><Link href="/gallery">Explore the gallery <ArrowRight aria-hidden="true" size={16} /></Link></figcaption>
      </figure>
    </section>
    <div className="service-amenities" aria-label="Trailer amenities and planning">
      <span><Thermometer aria-hidden="true" />Climate-controlled comfort</span>
      <span><Droplets aria-hidden="true" />Private, flushing restrooms</span>
      <span><ClipboardList aria-hidden="true" />Delivery & setup planning</span>
    </div>
  </>
}
