import Link from "next/link"
import Image from "next/image"
import { ArrowRight, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  title: string
  description: string
  href: string
  icon?: LucideIcon
  imageSrc?: string
  imageAlt?: string
  imagePlaceholder?: string
  imageUnoptimized?: boolean
  className?: string
}

export function ServiceCard({
  title,
  description,
  href,
  icon: Icon,
  imageSrc,
  imageAlt,
  imagePlaceholder,
  imageUnoptimized,
  className,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "estate-service-card group",
        className
      )}
    >
      {/* Image Placeholder */}
      <div className="estate-service-card-image">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            unoptimized={imageUnoptimized}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              {Icon ? <Icon className="w-10 h-10 text-navy" /> : null}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent" />
        {imagePlaceholder && (
          <span className="absolute bottom-2 right-2 text-xs text-navy/40 bg-white/60 px-2 py-1 rounded">
            {imagePlaceholder}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="estate-service-card-copy">
        <h3 className="text-xl font-serif font-semibold text-navy group-hover:text-navy/80 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-muted-foreground text-base md:text-[17px] leading-relaxed flex-1">
          {description}
        </p>
        <div className="estate-text-link">
          Learn More
          <ArrowRight aria-hidden="true" className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
