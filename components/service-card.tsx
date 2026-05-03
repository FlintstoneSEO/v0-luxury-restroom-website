import Link from "next/link"
import { ArrowRight, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  imagePlaceholder?: string
  className?: string
}

export function ServiceCard({
  title,
  description,
  href,
  icon: Icon,
  imagePlaceholder,
  className,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50",
        className
      )}
    >
      {/* Image Placeholder */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-gold/20 to-navy/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-10 h-10 text-navy" />
          </div>
        </div>
        {imagePlaceholder && (
          <span className="absolute bottom-2 right-2 text-xs text-navy/40 bg-white/60 px-2 py-1 rounded">
            {imagePlaceholder}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-serif font-semibold text-navy group-hover:text-navy/80 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed flex-1">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-navy group-hover:gap-3 transition-all">
          Learn More
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
