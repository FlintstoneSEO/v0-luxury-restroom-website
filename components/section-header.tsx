import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
  titleClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-widest text-gold">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl lg:text-5xl text-balance",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </div>
  )
}
