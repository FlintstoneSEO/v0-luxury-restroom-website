import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
  description?: string
}

interface ProcessStepsProps {
  steps: Step[]
  variant?: "horizontal" | "vertical"
  className?: string
}

export function ProcessSteps({
  steps,
  variant = "horizontal",
  className,
}: ProcessStepsProps) {
  if (variant === "vertical") {
    return (
      <div className={cn("space-y-6", className)}>
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-semibold shrink-0">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-navy">{step.title}</h3>
              {step.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-8 md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {steps.map((step, index) => (
        <div key={index} className="relative text-center">
          {/* Connector Line - Desktop */}
          {index < steps.length - 1 && (
            <div className="hidden lg:block absolute top-5 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-0.5 bg-border" />
          )}
          
          <div className="relative inline-flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-semibold z-10">
              {step.number}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-navy">
              {step.title}
            </h3>
            {step.description && (
              <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
