import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
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
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import rawContent from "@/content/service-pages/emergency-response.json"
import { defineServicePageData } from "@/lib/content/service-pages"

const content = defineServicePageData(rawContent)

const { title, description, canonical } = content.seo

export const metadata: Metadata = {
  title, description, alternates: { canonical },
  openGraph: { title, description, url: canonical ?? undefined },
  twitter: { card: "summary_large_image", title, description },
}

const contentIcons = { Clock, ShieldCheck, Zap, Building, AlertTriangle, Tent }

const responseFeatures = content.data.responseFeatures.map((item) => ({ ...item, icon: contentIcons[item.icon as keyof typeof contentIcons] }))

const applications = content.data.applications.map((item) => ({ ...item, icon: contentIcons[item.icon as keyof typeof contentIcons] }))

const governmentApplications = content.data.governmentApplications

const emergencyApplications = content.data.emergencyApplications

const capabilities = content.data.capabilities

const emergencyFaqs = content.data.emergencyFaqs

export default function EmergencyDisasterReliefRestroomTrailersPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Emergency & Disaster Relief"
          title="Emergency and Disaster Relief Restroom Trailers"
          description="When a facility outage or emergency disrupts normal operations, temporary restrooms help maintain continuity for staff, responders, and the public. We provide availability-based scheduling for Lansing, Mid-Michigan, and regional Michigan needs."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
        />

        {/* Reliable Support with Image */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/Disaster Relief Trailer.png"
                  alt="Restroom trailer at emergency response staging site"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
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
                <div className="mt-8">
                  <FeatureGrid features={responseFeatures} columns={1} variant="compact" />
                </div>
              </div>
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
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <app.icon className="w-6 h-6 text-navy" />
                      </div>
                      <CardTitle className="text-lg text-navy">
                        {app.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base md:text-[17px] text-muted-foreground leading-relaxed">
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
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
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
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
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
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Capabilities
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Clean, Professional, and Ready for Deployment
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Our trailers are maintained to high standards and can be configured 
                  to operate in challenging environments with generator power and 
                  self-contained water systems. Upfront planning for access paths, 
                  surface conditions, and operational timing helps reduce delays during 
                  already complex situations.
                </p>
                <Button
                  asChild
                  className="mt-8 bg-navy hover:bg-navy/90 text-white"
                >
                  <Link href="/request-quote">
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

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Emergency & Disaster Relief Questions"
            />
            <div className="mt-12 max-w-3xl mx-auto">
              <FAQSection faqs={emergencyFaqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Need Government or Emergency Support?"
          description="Contact us to discuss your government or disaster relief restroom needs."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
