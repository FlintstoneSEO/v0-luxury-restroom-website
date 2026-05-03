import Link from "next/link"
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
  imagePlaceholder?: string
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
  imagePlaceholder,
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

          {/* Image Placeholder */}
          {!isPageHero && imagePlaceholder && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy/5 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/20 to-navy/10">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-navy"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-navy/60">{imagePlaceholder}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
