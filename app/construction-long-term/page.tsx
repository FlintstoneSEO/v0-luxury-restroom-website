import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  HardHat,
  Building2,
  Wrench,
  Clock,
  CheckCircle,
  ArrowRight,
  Thermometer,
  Shield,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { SectionHeader } from "@/components/section-header"
import { FeatureGrid } from "@/components/feature-grid"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Construction & Long-Term Restroom Trailer Rentals Michigan | Signature Luxe",
  description:
    "Reliable restroom trailer rentals for construction sites, commercial projects, remodels, temporary facilities, and long-term restroom needs throughout Lansing and surrounding Michigan communities.",
}

const solutions = [
  {
    title: "Construction Sites",
    description:
      "Provide your crew with clean, comfortable restroom facilities that boost morale and productivity.",
    icon: HardHat,
  },
  {
    title: "Commercial Projects",
    description:
      "Professional restroom solutions for commercial developments and office renovations.",
    icon: Building2,
  },
  {
    title: "Property Renovations",
    description:
      "Keep restrooms available during home remodels and renovation projects.",
    icon: Wrench,
  },
  {
    title: "Long-Term Needs",
    description:
      "Extended rental options for ongoing projects and temporary facility requirements.",
    icon: Clock,
  },
]

const features = [
  {
    title: "Climate Controlled",
    description: "Heating and AC for year-round comfort.",
    icon: Thermometer,
  },
  {
    title: "Durable & Reliable",
    description: "Built to handle job site conditions.",
    icon: Shield,
  },
  {
    title: "Flexible Terms",
    description: "Weekly, monthly, or project-based rentals.",
    icon: Clock,
  },
]

const setupRequirements = [
  "20 amp power within 100 feet (or generator)",
  "Water connection within 100 feet (or tank option)",
  "Reasonably flat, accessible ground",
  "Adequate space for delivery vehicle access",
]

const benefits = [
  "Cleaner than standard portable restrooms",
  "Climate-controlled comfort",
  "Running water for hand washing",
  "Private flushing stalls",
  "Professional appearance",
  "Flexible rental terms",
  "Reliable service and support",
]

export default function ConstructionLongTermPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Construction & Long-Term"
          title="Construction and Long-Term Restroom Trailer Rentals in Michigan"
          description="Reliable restroom trailer rentals for construction sites, commercial projects, remodels, temporary facilities, and long-term restroom needs throughout Lansing and surrounding Michigan communities."
          primaryCta={{ text: "Request Availability", href: "/request-availability" }}
        />

        {/* Practical Solutions with Image */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_58_08%20PM-FAtMzJ1Zh8G59v1YcrSx4668yP3wxb.png"
                  alt="Restroom trailer at construction site with workers"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-gold">
                  Job Site Solutions
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Practical Restroom Solutions for Job Sites
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  When your project needs more than standard portable restrooms, our 
                  trailers provide a clean, comfortable, and professional solution that 
                  keeps your crew happy and your site running smoothly.
                </p>
                <div className="mt-8">
                  <FeatureGrid features={features} columns={1} variant="compact" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Construction Image */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_16_57%20PM-VpBHEub4XY4h723FyEp7D51P1xr0DC.png"
                  alt="Restroom trailer at active construction site"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_08_15%20PM-V96pFxXSvB2cRlUNAjQtbfMvGB7ejF.png"
                  alt="Restroom trailer at construction site with flowers"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Applications"
              title="Who This Is For"
              description="Our construction and long-term trailers serve a variety of project types and industries."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {solutions.map((solution, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-3">
                      <solution.icon className="w-6 h-6 text-navy" />
                    </div>
                    <CardTitle className="text-lg text-navy">
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {solution.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Long-Term Options */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-gold">
                  Flexible Terms
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Long-Term Rental Options
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  We understand that construction and renovation projects have varying 
                  timelines. That&apos;s why we offer flexible rental terms to match 
                  your project schedule.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Weekly rental options",
                    "Monthly rental discounts",
                    "Project-based pricing",
                    "Servicing available for extended rentals",
                    "Easy extension or early return",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Cleaner & More Comfortable Than Standard Options
                  </h3>
                  <p className="text-white/80 mb-6">
                    Give your crew the respect they deserve with restroom facilities 
                    that are cleaner, more comfortable, and more professional than 
                    standard portable restrooms.
                  </p>
                  <ul className="space-y-3">
                    {benefits.slice(0, 4).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                        <span className="text-white/80 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Setup Requirements
                  </h3>
                  <ul className="space-y-3">
                    {setupRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                        <span className="text-white/80 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl">
                Need a Long-Term Solution?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tell us about your project and timeline, and we&apos;ll provide a 
                custom proposal with long-term pricing.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-navy hover:bg-navy/90 text-white"
              >
                <Link href="/request-availability">
                  Request Availability
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Upgrade Your Job Site?"
          description="Contact us to discuss your construction or long-term rental needs."
          ctaText="Request Availability"
          ctaHref="/request-availability"
          variant="gold"
        />
      </main>
      <Footer />
    </>
  )
}
