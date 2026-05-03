import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  eyebrow?: string
  title: string
  description: string
  primaryCta?: {
    text: string
    href: string
  }
  secondaryCta?: {
    text: string
    href: string
  }
  trustLine?: string
  imageSrc?: string
  imageAlt?: string
  variant?: "default" | "page"
  className?: string
}

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  trustLine,
  imageSrc,
  imageAlt = "Luxury restroom trailer",
  variant = "default",
  className,
}: HeroSectionProps) {
  const isPageHero = variant === "page"

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isPageHero ? "bg-navy py-20 md:py-28" : "bg-cream py-20 md:py-32",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div
          className={cn(
            "grid items-center gap-12",
            !isPageHero && "lg:grid-cols-2"
          )}
        >
          {/* Content */}
          <div className={cn(isPageHero && "text-center max-w-3xl mx-auto")}>
            {eyebrow && (
              <span
                className={cn(
                  "inline-block text-sm font-medium uppercase tracking-widest mb-4",
                  isPageHero ? "text-gold" : "text-navy"
                )}
              >
                {eyebrow}
              </span>
            )}
            <h1
              className={cn(
                "text-4xl font-serif font-semibold tracking-tight md:text-5xl lg:text-6xl text-balance",
                isPageHero ? "text-white" : "text-navy"
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                "mt-6 text-lg leading-relaxed md:text-xl text-pretty",
                isPageHero ? "text-white/80" : "text-charcoal/80"
              )}
            >
              {description}
            </p>

            {(primaryCta || secondaryCta) && (
              <div
                className={cn(
                  "mt-8 flex flex-wrap gap-4",
                  isPageHero && "justify-center"
                )}
              >
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "text-base px-8",
                      isPageHero
                        ? "bg-gold text-charcoal hover:bg-gold/90"
                        : "bg-navy text-white hover:bg-navy/90"
                    )}
                  >
                    <Link href={primaryCta.href}>{primaryCta.text}</Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={cn(
                      "text-base px-8",
                      isPageHero
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-navy text-navy hover:bg-navy/5"
                    )}
                  >
                    <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
                  </Button>
                )}
              </div>
            )}

            {trustLine && (
              <p
                className={cn(
                  "mt-8 text-sm",
                  isPageHero ? "text-white/60" : "text-muted-foreground"
                )}
              >
                {trustLine}
              </p>
            )}
          </div>

          {/* Image */}
          {!isPageHero && imageSrc && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
