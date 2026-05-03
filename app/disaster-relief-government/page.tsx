import type { Metadata } from "next"
import Link from "next/link"
import {
  ShieldCheck,
  Building,
  AlertTriangle,
  Tent,
  CheckCircle,
  ArrowRight,
  Clock,
  Zap,
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
  title: "Disaster Relief & Government Restroom Trailer Rentals Michigan | Signature Luxe",
  description:
    "Dependable restroom trailer solutions for emergency response, municipal projects, government use, disaster relief, and temporary infrastructure needs across Michigan.",
}

const applications = [
  {
    title: "Government & Municipal",
    description:
      "Restroom facilities for municipal projects, public works, and government operations.",
    icon: Building,
  },
  {
    title: "Disaster Relief",
    description:
      "Rapid deployment restroom solutions for emergency response and disaster recovery efforts.",
    icon: AlertTriangle,
  },
  {
    title: "Emergency Response",
    description:
      "Support for first responders, emergency crews, and community assistance operations.",
    icon: ShieldCheck,
  },
  {
    title: "Temporary Infrastructure",
    description:
      "Restroom support for temporary facilities, staging areas, and community shelters.",
    icon: Tent,
  },
]

const features = [
  {
    title: "Rapid Response",
    description: "Quick deployment when time matters most.",
    icon: Clock,
  },
  {
    title: "Reliable Operation",
    description: "Dependable performance in demanding conditions.",
    icon: ShieldCheck,
  },
  {
    title: "Self-Contained",
    description: "Generator and water tank options available.",
    icon: Zap,
  },
]

const capabilities = [
  "Quick response and rapid deployment",
  "Self-contained operation options",
  "Generator power when needed",
  "Fresh water tank availability",
  "Climate-controlled interiors",
  "Professional, clean facilities",
  "Flexible rental terms",
  "Coordination with emergency operations",
]

const governmentApplications = [
  "Municipal construction projects",
  "Public works operations",
  "Park and recreation events",
  "Public health response",
  "Voting site support",
  "Community programs",
]

const emergencyApplications = [
  "Natural disaster response",
  "Community evacuation support",
  "First responder operations",
  "Emergency shelter facilities",
  "Recovery operations",
  "Community assistance centers",
]

export default function DisasterReliefGovernmentPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Disaster Relief & Government"
          title="Disaster Relief and Government Restroom Trailer Rentals in Michigan"
          description="Dependable restroom trailer solutions for emergency response, municipal projects, government use, disaster relief, and temporary infrastructure needs across Michigan."
          primaryCta={{ text: "Request Availability", href: "/request-availability" }}
        />

        {/* Reliable Support */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-medium uppercase tracking-widest text-gold">
                Dependable Solutions
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                Reliable Restroom Support When It Matters Most
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                When communities face emergencies or governments need temporary 
                infrastructure, our restroom trailers provide clean, comfortable, 
                and professional facilities that serve the public with dignity.
              </p>
            </div>
            <div className="mt-12">
              <FeatureGrid features={features} columns={3} variant="card" />
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Applications"
              title="How We Serve Government and Emergency Needs"
              description="Our trailers support a variety of government operations and emergency response scenarios."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {applications.map((app, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-3">
                      <app.icon className="w-6 h-6 text-navy" />
                    </div>
                    <CardTitle className="text-lg text-navy">
                      {app.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {app.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Government and Emergency Details */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-gold">
                  Government Use
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Government and Municipal Use
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  We support government agencies, municipalities, and public 
                  organizations with professional restroom facilities for 
                  construction projects, public events, and operational needs.
                </p>
                <ul className="mt-8 space-y-3">
                  {governmentApplications.map((app, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                      <span className="text-white/90">{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-gold">
                  Emergency Response
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Disaster Relief and Emergency Response
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  When emergencies strike, communities need reliable support. Our 
                  trailers can be deployed rapidly to provide clean, dignified 
                  restroom facilities for affected residents and first responders.
                </p>
                <ul className="mt-8 space-y-3">
                  {emergencyApplications.map((app, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                      <span className="text-white/90">{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-gold">
                  Capabilities
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Clean, Professional, and Ready for Deployment
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Our trailers are maintained to high standards and can be 
                  configured to operate in challenging environments with 
                  generator power and self-contained water systems.
                </p>
                <Button
                  asChild
                  className="mt-8 bg-navy hover:bg-navy/90 text-white"
                >
                  <Link href="/request-availability">
                    Contact Us for Government Inquiries
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="bg-cream rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-navy mb-6">
                  Our Capabilities Include
                </h3>
                <ul className="space-y-3">
                  {capabilities.map((capability, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      <span className="text-charcoal">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Need Government or Emergency Support?"
          description="Contact us to discuss your government or disaster relief restroom needs."
          ctaText="Request Availability"
          ctaHref="/request-availability"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
