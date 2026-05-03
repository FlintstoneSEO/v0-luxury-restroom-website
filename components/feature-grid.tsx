import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
  title: string
  description?: string
  icon: LucideIcon
}

interface FeatureGridProps {
  features: Feature[]
  columns?: 2 | 3 | 4 | 6
  variant?: "default" | "compact" | "card"
  className?: string
}

export function FeatureGrid({
  features,
  columns = 3,
  variant = "default",
  className,
}: FeatureGridProps) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  }

  if (variant === "compact") {
    return (
      <div className={cn("grid gap-6", columnClasses[columns], className)}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <feature.icon className="w-5 h-5 text-navy" />
            </div>
            <span className="text-sm font-medium text-charcoal">
              {feature.title}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div className={cn("grid gap-6", columnClasses[columns], className)}>
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-border/50"
          >
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-navy" />
            </div>
            <h3 className="text-lg font-semibold text-navy">{feature.title}</h3>
            {feature.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-8", columnClasses[columns], className)}>
      {features.map((feature, index) => (
        <div key={index} className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-4">
            <feature.icon className="w-7 h-7 text-navy" />
          </div>
          <h3 className="text-lg font-semibold text-navy">{feature.title}</h3>
          {feature.description && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
