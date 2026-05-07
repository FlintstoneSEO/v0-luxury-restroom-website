import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { SectionHeader } from "@/components/section-header"
import { ServiceAreaGrid } from "@/components/service-area-grid"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Service Areas | Luxury Restroom Trailer Rentals Michigan",
  description:
    "Signature Luxe Events serves Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Holt, Mason, and surrounding Mid-Michigan communities with luxury restroom trailer rentals.",
}

const primaryAreas = [
  { name: "Lansing", state: "MI", featured: true, href: "/service-areas/lansing-mi" },
  { name: "East Lansing", state: "MI", featured: true, href: "/service-areas/east-lansing-mi" },
  { name: "Okemos", state: "MI", href: "/service-areas/okemos-mi" },
  { name: "Haslett", state: "MI", href: "/service-areas/haslett-mi" },
  { name: "Grand Ledge", state: "MI", href: "/service-areas/grand-ledge-mi" },
  { name: "DeWitt", state: "MI", href: "/service-areas/dewitt-mi" },
  { name: "Jackson", state: "MI", href: "/service-areas/jackson-mi" },
  { name: "Howell", state: "MI", href: "/service-areas/howell-mi" },
]

const extendedAreas = [
  { name: "Flint", state: "MI", href: "/service-areas/flint-mi" },
  { name: "Ann Arbor", state: "MI", href: "/service-areas/ann-arbor-mi" },
  { name: "Grand Rapids", state: "MI", href: "/service-areas/grand-rapids-mi" },
  { name: "Charlotte", state: "MI" },
  { name: "Battle Creek", state: "MI" },
  { name: "Kalamazoo", state: "MI" },
  { name: "Brighton", state: "MI" },
  { name: "Novi", state: "MI" },
  { name: "Livonia", state: "MI" },
  { name: "Saginaw", state: "MI" },
]

export default function ServiceAreasPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Service Areas"
          title="Luxury Restroom Trailer Rentals Across Lansing and Mid-Michigan"
          description="Based in Lansing, MI, we proudly serve weddings, events, construction sites, and long-term rental needs throughout Mid-Michigan and surrounding communities."
          primaryCta={{ text: "Request a Quote", href: "/request-quote" }}
        />

        {/* Primary Service Areas */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Primary Areas"
              title="Greater Lansing Area"
              description="Our home base and primary service area. Quick delivery and excellent availability."
            />
            <div className="mt-12">
              <ServiceAreaGrid areas={primaryAreas} showLinks />
            </div>
          </div>
        </section>

        {/* Extended Service Areas */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Extended Areas"
              title="Surrounding Michigan Communities"
              description="We serve events and projects throughout Mid-Michigan and beyond, typically within a 2-hour radius of Lansing."
            />
            <div className="mt-12">
              <ServiceAreaGrid areas={extendedAreas} showLinks />
            </div>
          </div>
        </section>

        {/* About Our Service Area */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Based in Lansing
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Local Service, Regional Reach
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Signature Luxe Events & Amenities is proudly based in Lansing, Michigan. 
                  From our central location, we serve customers throughout Mid-Michigan 
                  and surrounding communities within approximately a 2-hour radius.
                </p>
                <p className="mt-4 text-lg text-white/80 leading-relaxed">
                  Whether you&apos;re planning a wedding in Ann Arbor, a corporate event 
                  in Grand Rapids, a festival in Flint, or a construction project in 
                  Jackson, we can deliver and set up our luxury restroom trailers at 
                  your location.
                </p>
                <div className="mt-8 flex items-center gap-3 text-gold">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Based in Lansing, MI</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Don&apos;t See Your Area Listed?
                </h3>
                <p className="text-white/80 mb-6">
                  Even if your location isn&apos;t listed above, we may still be able 
                  to serve you. Contact us with your event location and we&apos;ll 
                  let you know if we can accommodate your needs.
                </p>
                <Button asChild className="bg-gold text-charcoal hover:bg-gold/90">
                  <Link href="/request-quote">
                    Check Your Location
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Events We Serve */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="What We Serve"
              title="Events and Projects Throughout Michigan"
              description="No matter where your event or project is located in our service area, we provide the same premium service."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Weddings",
                  description:
                    "Outdoor weddings, barn venues, private estates, and backyard celebrations.",
                },
                {
                  title: "Special Events",
                  description:
                    "Private parties, corporate events, festivals, and community gatherings.",
                },
                {
                  title: "Construction",
                  description:
                    "Construction sites, commercial projects, and long-term job site rentals.",
                },
                {
                  title: "Government",
                  description:
                    "Municipal projects, disaster relief, and emergency response support.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-cream rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Book in Your Area?"
          description="Tell us about your event location and we&apos;ll confirm we can serve you."
          ctaText="Request a Quote"
          ctaHref="/request-quote"
          variant="gold"
        />
      </main>
      <Footer />
    </>
  )
}
