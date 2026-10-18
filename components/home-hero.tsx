import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

type HomeHeroProps = {
  heroImage: { src: string; alt: string; unoptimized?: boolean }
  content: {
    eyebrow: string
    heading: string
    body: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    location: string
  }
}

export function HomeHero({ heroImage, content }: HomeHeroProps) {
  return (
    <section className="estate-home-hero" aria-labelledby="home-heading">
      <div className="estate-home-copy">
        <p className="estate-kicker">{content.eyebrow}</p>
        <h1 id="home-heading">{content.heading}</h1>
        <p className="estate-hero-description">{content.body}</p>
        <div className="estate-hero-actions">
          <Button asChild size="lg" className="bg-navy text-white hover:bg-navy/90">
            <Link href={content.primaryCta.href}>{content.primaryCta.label}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </Button>
          <Link className="estate-text-link" href={content.secondaryCta.href}>{content.secondaryCta.label}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
        <p className="estate-location"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />{content.location}</p>
      </div>
      <div className="estate-home-image">
        <Image src={heroImage.src} alt={heroImage.alt} unoptimized={heroImage.unoptimized} fill preload quality={85} sizes="(max-width: 900px) 100vw, 56vw" className="object-cover" />
      </div>
    </section>
  )
}
