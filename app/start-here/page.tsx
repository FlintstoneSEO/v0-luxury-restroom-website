import type { Metadata } from "next"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  Droplets,
  Users,
  ClipboardList,
  Send,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { SectionHeader } from "@/components/section-header"
import { FeatureGrid } from "@/components/feature-grid"
import { ProcessSteps } from "@/components/process-steps"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Start Here | Signature Luxe Events & Amenities",
  description:
    "Learn what information we need to provide you with a custom restroom trailer rental quote for your event in Lansing and Mid-Michigan.",
}

const considerations = [
  {
    title: "Event Date",
    description:
      "Let us know your event date so we can confirm availability and reserve your trailer.",
    icon: Calendar,
  },
  {
    title: "Timing & Delivery",
    description:
      "Share when you need the trailer delivered and picked up. We can accommodate early morning deliveries and next-day pickups.",
    icon: Clock,
  },
  {
    title: "Location Details",
    description:
      "Provide the event address or venue name. We service Lansing, Mid-Michigan, and communities within a 2-hour radius.",
    icon: MapPin,
  },
  {
    title: "Power Requirements",
    description:
      "Our trailers need a 20 amp power source within 100 feet. If power isn&apos;t available, we can discuss generator options.",
    icon: Zap,
  },
  {
    title: "Water Connection",
    description:
      "A water hookup within 100 feet is ideal. If not available, we can discuss fresh water tank options.",
    icon: Droplets,
  },
  {
    title: "Guest Count",
    description:
      "Tell us your expected guest count so we can recommend the right trailer size for your event.",
    icon: Users,
  },
]

const nextSteps = [
  {
    number: 1,
    title: "Submit Your Request",
    description: "Fill out our availability form with your event details.",
  },
  {
    number: 2,
    title: "We Review Your Needs",
    description: "Our team reviews your date, location, and setup requirements.",
  },
  {
    number: 3,
    title: "Receive Your Proposal",
    description: "Get a custom proposal with pricing and trailer recommendations.",
  },
  {
    number: 4,
    title: "Reserve Your Date",
    description: "Approve your proposal and secure your trailer for your event.",
  },
]

export default function StartHerePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Start Here"
          title="Planning Your Restroom Trailer Rental"
          description="Every event is unique. Here&apos;s what we need to know to provide you with the perfect restroom trailer solution for your occasion."
          primaryCta={{ text: "Request Availability", href: "/request-availability" }}
        />

        {/* Introduction */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                Every Event Setup Is Different
              </h2>
              <p className="mt-6 text-lg text-charcoal/80 leading-relaxed">
                Whether you&apos;re planning an elegant wedding, a corporate event, or need 
                long-term restroom solutions for a job site, we tailor our service to 
                fit your specific needs. To provide you with an accurate quote, we&apos;ll 
                need some details about your event.
              </p>
            </div>
          </div>
        </section>

        {/* What We Need to Know */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Planning Details"
              title="What We Need to Know"
              description="Help us understand your event so we can recommend the best solution."
            />
            <div className="mt-12">
              <FeatureGrid features={considerations} columns={3} variant="card" />
            </div>
          </div>
        </section>

        {/* Setup Requirements Highlight */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Setup Requirements
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  What Your Site Needs
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Our luxury restroom trailers require a few basic utilities for 
                  operation. Don&apos;t worry if you&apos;re not sure about your site&apos;s setup - 
                  we can help you figure it out.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "20 amp power source within 100 feet",
                    "Water connection within 100 feet",
                    "Generator available if power isn't nearby",
                    "Reasonably flat ground for trailer placement",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Not sure about your setup?
                </h3>
                <p className="text-white/80 mb-6">
                  That&apos;s okay! When you request availability, just let us know 
                  what you&apos;re unsure about and we&apos;ll help you figure out the 
                  best solution for your location.
                </p>
                <Button asChild className="bg-gold text-charcoal hover:bg-gold/90">
                  <Link href="/request-availability">
                    Get Help With Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens Next */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="The Process"
              title="What Happens After You Request Availability"
              description="From your initial request to event day, here&apos;s what to expect."
            />
            <div className="mt-12">
              <ProcessSteps steps={nextSteps} variant="horizontal" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Get Started?"
          description="Tell us about your event and we&apos;ll provide a custom proposal within 1-2 business days."
          ctaText="Request Availability"
          ctaHref="/request-availability"
          variant="gold"
        />
      </main>
      <Footer />
    </>
  )
}
