import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  eyebrow?: string
  title: string
  description: string
  primaryCta?: { text: string; href: string }
  secondaryCta?: { text: string; href: string }
  trustLine?: string
  imageSrc?: string
  imageAlt?: string
  variant?: "default" | "page"
  className?: string
}

export function HeroSection({ eyebrow, title, description, primaryCta, secondaryCta,
  trustLine, imageSrc, imageAlt = "Luxury restroom trailer", variant = "default", className }: HeroSectionProps) {
  const hasImage = variant !== "page" && Boolean(imageSrc)
  return (
    <section className={cn("estate-page-hero", hasImage && "estate-page-hero-with-image", className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className={cn("estate-page-hero-grid", hasImage && "estate-page-hero-split")}>
          <div>
            {eyebrow && <p className="estate-kicker">{eyebrow}</p>}
            <h1>{title}</h1>
            <p className="estate-hero-description">{description}</p>
            {(primaryCta || secondaryCta) && <div className="estate-hero-actions">
              {primaryCta && <Button asChild size="lg" className="bg-navy text-white hover:bg-navy/90"><Link href={primaryCta.href}>{primaryCta.text}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></Button>}
              {secondaryCta && <Link className="estate-text-link" href={secondaryCta.href}>{secondaryCta.text}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>}
            </div>}
            {trustLine && <p className="estate-location">{trustLine}</p>}
          </div>
          {hasImage && imageSrc && <div className="estate-page-hero-image"><Image src={imageSrc} alt={imageAlt} fill priority sizes="(max-width: 900px) 100vw, 48vw" className="object-cover" /></div>}
        </div>
      </div>
    </section>
  )
}
