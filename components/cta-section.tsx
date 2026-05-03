import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CTASectionProps {
  title: string
  description: string
  ctaText: string
  ctaHref: string
  variant?: "navy" | "cream" | "gold"
  className?: string
}

export function CTASection({
  title,
  description,
  ctaText,
  ctaHref,
  variant = "navy",
  className,
}: CTASectionProps) {
  const variants = {
    navy: {
      bg: "bg-navy",
      title: "text-white",
      description: "text-white/80",
      button: "bg-gold text-charcoal hover:bg-gold/90",
    },
    cream: {
      bg: "bg-cream",
      title: "text-navy",
      description: "text-charcoal/80",
      button: "bg-navy text-white hover:bg-navy/90",
    },
    gold: {
      bg: "bg-gold",
      title: "text-charcoal",
      description: "text-charcoal/80",
      button: "bg-navy text-white hover:bg-navy/90",
    },
  }

  const style = variants[variant]

  return (
    <section className={cn(style.bg, "py-20 md:py-28", className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className={cn(
              "text-3xl font-serif font-semibold tracking-tight md:text-4xl lg:text-5xl text-balance",
              style.title
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed text-pretty",
              style.description
            )}
          >
            {description}
          </p>
          <Button asChild size="lg" className={cn("mt-8 text-base px-8", style.button)}>
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
