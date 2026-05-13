import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  PartyPopper,
  GraduationCap,
  Users,
  Home,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Thermometer,
  DoorOpen,
  Droplets,
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

const title =
  "Private Event Restroom Trailer Rentals in Lansing & Mid-Michigan | Signature Luxe Events"
const description =
  "Private party restroom trailer rentals for graduations, reunions, birthdays, and backyard gatherings with property-friendly delivery and setup planning."
const canonical =
  "https://www.signatureluxeevents.com/private-event-restroom-trailers"
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical },
}

const eventFeatures = [
  {
    title: "Elegant Design",
    description:
      "Modern finishes and stylish interiors that complement any private event aesthetic.",
    icon: Sparkles,
  },
  {
    title: "Guest Comfort",
    description:
      "Climate-controlled interiors keep guests comfortable in any weather.",
    icon: Thermometer,
  },
  {
    title: "Private Stalls",
    description:
      "Full-size private stalls with real flushing toilets for a premium experience.",
    icon: DoorOpen,
  },
  {
    title: "Fresh Water",
    description:
      "Running water for hand washing with quality soap and paper products.",
    icon: Droplets,
  },
]

const eventTypes = [
  {
    title: "Graduation Parties",
    description:
      "Open-house style celebrations with rotating guests and dense arrival windows. We size trailers for high-volume turnout.",
    icon: GraduationCap,
  },
  {
    title: "Family Reunions",
    description:
      "All-day events at private properties and parks that benefit from dedicated restroom access away from the house.",
    icon: Users,
  },
  {
    title: "Birthday Celebrations",
    description:
      "Milestone birthdays and backyard parties where guest comfort is a priority and indoor traffic needs to be managed.",
    icon: PartyPopper,
  },
  {
    title: "Backyard Gatherings",
    description:
      "Large private property events where keeping guests out of the home improves the hosting experience for everyone.",
    icon: Home,
  },
]

const benefits = [
  {
    title: "Protect Your Indoor Bathrooms",
    description:
      "Keeping restroom traffic outside helps preserve your home interior and reduces post-event cleanup burden. This is especially valuable for high-volume celebrations.",
  },
  {
    title: "Guest Count and Duration Planning",
    description:
      "A realistic guest estimate is the key input for selecting 2, 3, or 4-station units. We account for event length and likely peak usage windows to avoid undersizing.",
  },
  {
    title: "Driveway and Yard Placement",
    description:
      "Most private sites require advance checks for access width, turning space, and stable placement surfaces. We review those details before delivery day.",
  },
]

const eventGallery = [
  {
    id: "p1",
    src: "/images/Special Event Trailer.png",
    alt: "Restroom trailer at private backyard event",
    category: "Events",
  },
  {
    id: "p2",
    src: "/images/Special Event Trailer.png",
    alt: "Luxury restroom trailer setup at backyard party",
    category: "Events",
  },
  {
    id: "p3",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03504-zEWBCoaFRmOx3fWQJRxsUNKyS1RLSU.jpg",
    alt: "Modern vanity station inside private event restroom trailer",
    category: "Interior",
  },
  {
    id: "p4",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03430-tFWoDUOQcCiO6n1GbK4NfiTkB8gEbx.jpg",
    alt: "Bright vanity area in luxury restroom trailer",
    category: "Interior",
  },
]

const privateEventFaqs = [
  {
    question: "Can I rent a trailer for a graduation party at home?",
    answer:
      "Yes. Graduation open houses are a top use case, and we can recommend sizing based on your expected turnout.",
  },
  {
    question: "Will this work in a driveway or backyard?",
    answer:
      "Usually yes. We confirm access and surface conditions ahead of delivery to ensure setup goes smoothly.",
  },
  {
    question: "How far out should I reserve?",
    answer:
      "Peak weekends book sooner, so early booking is recommended. We can still check short-notice availability depending on inventory.",
  },
  {
    question: "How do I know what size trailer I need?",
    answer:
      "Share your expected guest count and event duration and we will recommend the right station count. We account for all-day events with rotating guests differently than fixed-time gatherings.",
  },
  {
    question: "Do you serve areas outside Lansing?",
    answer:
      "Yes. We deliver across Mid-Michigan and nearby cities including Jackson, Howell, Flint, Ann Arbor, and Grand Rapids.",
  },
]

export default function PrivateEventRestroomTrailersPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Private Events"
          title="Private Event Restroom Trailer Rentals"
          description="For backyard graduations, reunions, birthdays, and private property events in Lansing and Mid-Michigan, luxury restroom trailers keep guests comfortable and prevent heavy indoor bathroom traffic."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
          secondaryCta={{ text: "View Gallery", href: "/gallery" }}
        />

        {/* Features */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="What You Get"
              title="Comfort and Presentation Guests Appreciate"
              description="Luxury trailers include flushing toilets, private stalls, sinks, mirrors, lighting, and climate control for a noticeably better experience."
            />
            <div className="mt-12">
              <FeatureGrid features={eventFeatures} columns={4} variant="card" />
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Popular For"
              title="Popular for Graduations, Reunions, and Backyard Parties"
              description="Private events often have dense arrival windows and repeated rushes around food and speeches. We plan trailer sizing to match these patterns."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {eventTypes.map((event, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <event.icon className="w-6 h-6 text-navy" />
                      </div>
                      <CardTitle className="text-lg text-navy">
                        {event.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base md:text-[17px] text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits with Image */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Benefits
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Why Hosts Choose a Luxury Restroom Trailer
                </h2>
                <div className="mt-8 space-y-8">
                  {benefits.map((benefit, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-navy flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-navy" />
                        </div>
                        {benefit.title}
                      </h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed pl-11">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="mt-10 bg-navy hover:bg-navy/90 text-white"
                >
                  <Link href="/request-quote">
                    Reserve a Trailer for Your Private Event
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/Special Event Trailer.png"
                  alt="Luxury restroom trailer set up at a private backyard event"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Gallery"
              title="Private Event Restroom Trailer Photos"
              description="See how our luxury trailers serve private events and backyard celebrations throughout Mid-Michigan."
            />
            <div className="mt-12">
              <GalleryGrid images={eventGallery} columns={4} />
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline" className="border-navy text-navy">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Service Area */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Service Area
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Serving Lansing and Mid-Michigan
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Families in Lansing, East Lansing, Okemos, Haslett, and surrounding 
                  communities commonly use our trailers to support large open-house style 
                  gatherings. We coordinate around neighborhood constraints and event setup timing.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    "Lansing, East Lansing, Okemos, Haslett",
                    "Grand Ledge, DeWitt, Mason",
                    "Jackson, Howell, Ann Arbor",
                    "Flint, Grand Rapids, and beyond",
                  ].map((area, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                      <span className="text-white/90">{area}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 bg-gold text-charcoal hover:bg-gold/90"
                >
                  <Link href="/service-areas">
                    View All Service Areas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Getting a Quote
                </h3>
                <p className="text-white/80 mb-6">
                  The fastest path to an accurate estimate is sharing your event date, 
                  location, estimated headcount, and any site details. We confirm availability 
                  and recommend the right trailer size for your gathering.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Event date and location",
                    "Expected guest count",
                    "Driveway or yard access details",
                    "Power and water availability",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                      <span className="text-white/80 text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gold text-charcoal hover:bg-gold/90">
                  <Link href="/request-quote">
                    Request Availability
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Private Event Restroom Trailer Questions"
            />
            <div className="mt-12 max-w-3xl mx-auto">
              <FAQSection faqs={privateEventFaqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Reserve a Trailer for Your Private Event"
          description="Request availability and receive a custom proposal for your upcoming celebration."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
