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
  CalendarDays,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { SectionHeader } from "@/components/section-header"
import { FeatureGrid } from "@/components/feature-grid"
import { GalleryGrid } from "@/components/gallery-grid"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import rawContent from "@/content/service-pages/construction-long-term.json"
import { defineServicePageData } from "@/lib/content/service-pages"

const content = defineServicePageData(rawContent)

const { title, description, canonical } = content.seo

export const metadata: Metadata = {
  title, description, alternates: { canonical },
  openGraph: { title, description, url: canonical ?? undefined },
  twitter: { card: "summary_large_image", title, description },
}

const contentIcons = { Thermometer, Shield, Clock, HardHat, Building2, Wrench, CalendarDays }

const solutionFeatures = content.data.solutionFeatures.map((item) => ({ ...item, icon: contentIcons[item.icon as keyof typeof contentIcons] }))

const solutions = content.data.solutions.map((item) => ({ ...item, icon: contentIcons[item.icon as keyof typeof contentIcons] }))

const setupRequirements = content.data.setupRequirements

const benefits = content.data.benefits

const siteGallery = content.data.siteGallery

const constructionFaqs = content.data.constructionFaqs

export default function ConstructionLongTermRestroomTrailerRentalsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Construction & Long-Term"
          title="Construction and Long-Term Restroom Trailer Rentals in Michigan"
          description="Construction projects and temporary facility disruptions need dependable restroom access for crews and site teams. We support Lansing and Mid-Michigan projects with long-term rental planning and recurring service."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
        />

        {/* Practical Solutions with Image */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/Construction Site Trailer.png"
                  alt="Restroom trailer at construction site with workers"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
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
                  <FeatureGrid features={solutionFeatures} columns={1} variant="compact" />
                </div>
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
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <solution.icon className="w-6 h-6 text-navy" />
                      </div>
                      <CardTitle className="text-lg text-navy">
                        {solution.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base md:text-[17px] text-muted-foreground leading-relaxed">
                      {solution.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Gallery"
              title="Restroom Trailers at Work"
              description="See how our trailers support construction sites and long-term projects across Mid-Michigan."
            />
            <div className="mt-12">
              <GalleryGrid images={siteGallery} columns={4} />
            </div>
          </div>
        </section>

        {/* Long-Term Options */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Flexible Terms
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Long-Term Rental Options
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Long-term rentals are structured around how your site actually operates. 
                  We discuss anticipated crew counts, subcontractor traffic, and schedule 
                  changes so restroom capacity stays aligned as the job progresses.
                </p>
                <ul className="mt-8 space-y-4">
                  {benefits.map((item, index) => (
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
                    Setup Requirements
                  </h3>
                  <ul className="space-y-3">
                    {setupRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                        <span className="text-white/80 text-base">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Temporary Restroom During Outages
                  </h3>
                  <p className="text-white/80 text-base leading-relaxed mb-4">
                    Restroom trailers can also support occupied facilities during remodels, 
                    plumbing work, or temporary outages — ideal for offices, schools, 
                    churches, and other sites that need continuity.
                  </p>
                  <Button asChild className="w-full bg-gold text-charcoal hover:bg-gold/90">
                    <Link href="/request-quote">
                      Request Availability
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Construction & Long-Term Rental Questions"
            />
            <div className="mt-12 max-w-3xl mx-auto">
              <FAQSection faqs={constructionFaqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Need a Long-Term Solution?"
          description="Tell us about your project and timeline, and we will provide a custom proposal with long-term pricing."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
