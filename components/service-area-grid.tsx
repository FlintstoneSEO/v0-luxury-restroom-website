import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceArea {
  name: string
  state?: string
  href?: string
  featured?: boolean
}

interface ServiceAreaGridProps {
  areas: ServiceArea[]
  showLinks?: boolean
  className?: string
}

export function ServiceAreaGrid({
  areas,
  showLinks = false,
  className,
}: ServiceAreaGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {areas.map((area, index) => {
        const content = (
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
              area.featured
                ? "bg-navy text-white border-navy"
                : "bg-white border-border/50 hover:border-navy/30 hover:shadow-sm",
              showLinks && "cursor-pointer"
            )}
          >
            <MapPin
              className={cn(
                "w-5 h-5 shrink-0",
                area.featured ? "text-gold" : "text-navy"
              )}
            />
            <span className={cn("font-medium", area.featured ? "text-white" : "text-charcoal")}>
              {area.name}
              {area.state && `, ${area.state}`}
            </span>
            {showLinks && (
              <ArrowRight
                className={cn(
                  "w-4 h-4 ml-auto shrink-0",
                  area.featured ? "text-gold" : "text-navy"
                )}
              />
            )}
          </div>
        )

        if (showLinks && area.href) {
          return (
            <Link key={index} href={area.href}>
              {content}
            </Link>
          )
        }

        return <div key={index}>{content}</div>
      })}
    </div>
  )
}
