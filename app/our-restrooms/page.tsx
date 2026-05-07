import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  Thermometer,
  DoorOpen,
  Sparkles,
  Droplets,
  Zap,
  CheckCircle,
  Users,
  ArrowRight,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { SectionHeader } from "@/components/section-header"
import { FeatureGrid } from "@/components/feature-grid"
import { GalleryGrid } from "@/components/gallery-grid"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Luxury Restroom Trailers in Lansing MI | Features & Options",
  description:
    "View luxury restroom trailer features, setup requirements, and 2-station, 3-station, and 4-station restroom trailer options for events in Michigan.",
}

const features = [
  {
    title: "Temperature Controlled",
    description:
      "Heating and air conditioning keep guests comfortable in any weather.",
    icon: Thermometer,
  },
  {
    title: "Private Flushing Stalls",
    description:
      "Full-size private stalls with real flushing toilets, not porta-potty style.",
    icon: DoorOpen,
  },
  {
    title: "Stylish Finishes",
    description:
      "Modern vanity stations with mirrors, countertops, and quality fixtures.",
    icon: Sparkles,
  },
  {
    title: "Fresh Water System",
    description:
      "Running water for hand washing with soap dispensers and paper products.",
    icon: Droplets,
  },
  {
    title: "Power Ready",
    description:
      "Interior lighting and climate control powered by standard 20 amp connection.",
    icon: Zap,
  },
  {
    title: "Practical Layouts",
    description:
      "Thoughtfully designed interiors for efficient guest flow and comfort.",
    icon: Users,
  },
]

const trailerOptions = [
  {
    name: "2-Station Trailer",
    capacity: "Up to 150 guests",
    description:
      "Compact option for events and job sites where space is limited. Recommended for gatherings with an expected guest count of up to 150 people.",
    features: [
      "2 private restroom stalls",
      "Climate controlled interior",
      "Hand washing stations",
      "Compact footprint",
      "Ideal for smaller venues",
    ],
  },
  {
    name: "3-Station Trailer",
    capacity: "Up to 225 guests",
    description:
      "Compact and flexible option for events and job sites where space is important. Recommended for events expecting up to 225 guests.",
    features: [
      "3 private restroom stalls",
      "Climate controlled interior",
      "Expanded vanity area",
      "Flexible configuration",
      "Great for medium events",
    ],
    popular: true,
  },
  {
    name: "4-Station Trailer",
    capacity: "250+ guests",
    description:
      "A popular option for larger events. Compact enough for many event spaces while offering increased capacity. Recommended for events with 250+ guests.",
    features: [
      "4 private restroom stalls",
      "Climate controlled interior",
      "Dual vanity stations",
      "Maximum capacity",
      "Perfect for large gatherings",
    ],
  },
]

const setupRequirements = [
  "20 amp power source within 100 feet",
  "Water connection within 100 feet",
  "Generator options available when power is not nearby",
  "Fresh water tank options available when water is not nearby",
  "Reasonably flat, level ground for placement",
  "Adequate access for delivery vehicle",
]

const amenities = [
  "Fully stocked with hand soap and paper essentials",
  "Heating and air conditioning",
  "Power access support within 100 feet",
  "Fresh water hookup within 100 feet",
  "Generator options available when needed",
  "Fresh water tank options available when needed",
]

const interiorGallery = [
  {
    id: "int1",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03504-zEWBCoaFRmOx3fWQJRxsUNKyS1RLSU.jpg",
    alt: "Modern vanity station with mirror and succulent decor",
    category: "Vanity"
  },
  {
    id: "int2",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03430-tFWoDUOQcCiO6n1GbK4NfiTkB8gEbx.jpg",
    alt: "Bright vanity area with tree ring artwork",
    category: "Vanity"
  },
  {
    id: "int3",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03520-SllxtiCxRUBTroLepm40y033UcPvDf.jpg",
    alt: "Private restroom stall with flushing toilet",
    category: "Stall"
  },
  {
    id: "int4",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03401-zJLPWwUHkUivbGQTOGaiePJW9U8rli.jpg",
    alt: "Men's room with urinal and toilet",
    category: "Interior"
  },
]

export default function OurRestroomsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Our Restrooms"
          title="Luxury Restroom Trailers"
          description="Modern, climate-controlled restroom trailers designed to provide a clean, comfortable experience for your guests, crew, or community."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
          secondaryCta={{ text: "View Gallery", href: "/gallery" }}
        />

        {/* Features */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Features"
              title="Premium Features & Finishes"
              description="Every detail is designed for comfort, cleanliness, and a premium guest experience."
            />
            <div className="mt-12">
              <FeatureGrid features={features} columns={3} variant="card" />
            </div>
          </div>
        </section>

        {/* Trailer Options */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Trailer Options"
              title="Choose the Right Size for Your Event"
              description="We offer multiple trailer configurations to match your guest count and space requirements."
            />
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {trailerOptions.map((trailer) => (
                <Card
                  key={trailer.name}
                  className={`relative overflow-hidden ${
                    trailer.popular ? "border-navy border-2" : ""
                  }`}
                >
                  {trailer.popular && (
                    <div className="absolute top-0 right-0 bg-navy text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-navy" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-navy">
                          {trailer.name}
                        </CardTitle>
                        <p className="text-sm text-gold font-semibold">
                          {trailer.capacity}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {trailer.description}
                    </p>
                    <ul className="space-y-3">
                      {trailer.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-navy mt-0.5 shrink-0" />
                          <span className="text-sm text-charcoal">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`w-full mt-6 ${
                        trailer.popular
                          ? "bg-navy hover:bg-navy/90 text-white"
                          : "bg-gold/20 text-navy hover:bg-gold/30"
                      }`}
                    >
                      <Link href="/request-quote">
                        Check Availability
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interior Gallery */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Interior Details"
              title="Step Inside Our Trailers"
              description="Modern finishes, private stalls, and thoughtful details create a comfortable guest experience."
            />
            <div className="mt-12">
              <GalleryGrid images={interiorGallery} columns={4} />
            </div>
          </div>
        </section>

        {/* Floor Plan Section */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Floor Plan
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  3-Station Trailer Layout
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Our most popular configuration features two women&apos;s rooms and one men&apos;s room, 
                  each with a private stall, vanity area, and flushing toilet. The mechanical room 
                  houses the fresh water tank and electrical systems.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                    <span className="text-charcoal">2 Women&apos;s private restrooms</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                    <span className="text-charcoal">1 Men&apos;s private restroom with urinal</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                    <span className="text-charcoal">Built-in fresh water tank</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                    <span className="text-charcoal">Climate control system</span>
                  </li>
                </ul>
              </div>
              <div className="relative bg-white rounded-2xl p-6 shadow-sm">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Floor-Plan-12--3-ECO-E8LdGCh5vDiR48gqS3HfZ3hU9CWEff.png"
                  alt="3-Station restroom trailer floor plan showing layout"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Exterior Gallery */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Exterior"
              title="Professional Appearance for Any Event"
              description="Our trailers feature a clean, modern exterior that complements any event setting."
            />
            <div className="mt-12">
              <GalleryGrid 
                images={[
                  {
                    id: "ext1",
                    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03647-wvGP4IObLWSxCr7Hvk08PhOzDZzM9p.jpg",
                    alt: "Professional exterior view of restroom trailer",
                    category: "Exterior"
                  },
                  {
                    id: "ext2",
                    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_19_19%20PM-flItPBW2CyM2JXe8YJpcXdcdJRxIOb.png",
                    alt: "Restroom trailer at evening event with string lights",
                    category: "Events"
                  },
                  {
                    id: "ext3",
                    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Apr%2024%2C%202026%2C%2010_08_32%20PM-R6Ta7a6rys9yAckLBuJnKBPnAZ4mRl.png",
                    alt: "Restroom trailer at backyard party",
                    category: "Events"
                  },
                ]} 
                columns={3} 
              />
            </div>
          </div>
        </section>

        {/* Setup Requirements */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Setup Requirements
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  What Your Site Needs
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Our restroom trailers are designed for easy setup with minimal 
                  site requirements. Here&apos;s what we need for a successful installation.
                </p>
                <ul className="mt-8 space-y-4">
                  {setupRequirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Included Amenities
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Everything You Need for a Comfortable Experience
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Our trailers come fully stocked and ready for your event. 
                  All essential supplies are included.
                </p>
                <ul className="mt-8 space-y-4">
                  {amenities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Reserve Your Trailer?"
          description="Request availability for your event date and receive a custom proposal."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="cream"
        />
      </main>
      <Footer />
    </>
  )
}
