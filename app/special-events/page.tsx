import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  PartyPopper,
  Building2,
  Music,
  Heart,
  Users,
  CalendarDays,
  Sparkles,
  CheckCircle,
  ArrowRight,
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

export const metadata: Metadata = {
  title: "Special Event Restroom Trailer Rentals Lansing MI | Signature Luxe Events",
  description:
    "Premium restroom trailer rentals for private parties, corporate events, fundraisers, festivals, community gatherings, reunions, and upscale celebrations throughout Mid-Michigan.",
}

const eventTypes = [
  {
    title: "Private Parties",
    description:
      "Graduation parties, birthday celebrations, anniversary events, and backyard gatherings.",
    icon: PartyPopper,
  },
  {
    title: "Corporate Events",
    description:
      "Company picnics, outdoor meetings, team building events, and client appreciation gatherings.",
    icon: Building2,
  },
  {
    title: "Festivals",
    description:
      "Music festivals, food festivals, art fairs, and community celebrations.",
    icon: Music,
  },
  {
    title: "Fundraisers",
    description:
      "Charity galas, golf outings, benefit dinners, and nonprofit events.",
    icon: Heart,
  },
  {
    title: "Community Events",
    description:
      "Block parties, church gatherings, school events, and neighborhood celebrations.",
    icon: Users,
  },
  {
    title: "Reunions",
    description:
      "Family reunions, class reunions, and group gatherings.",
    icon: CalendarDays,
  },
]

const features = [
  {
    title: "Professional Presentation",
    description: "Clean, polished appearance that enhances your event.",
    icon: Sparkles,
  },
  {
    title: "Guest Comfort",
    description: "Climate-controlled interiors for any weather.",
    icon: Users,
  },
  {
    title: "Reliable Service",
    description: "On-time delivery and professional setup.",
    icon: CheckCircle,
  },
]

const eventFaqs = [
  {
    question: "What types of special events do you serve?",
    answer:
      "We provide restroom trailers for a wide variety of events including private parties, corporate events, festivals, fundraisers, community gatherings, reunions, outdoor celebrations, and more. If you have guests who need restroom facilities, we can help.",
  },
  {
    question: "How much notice do you need for event rentals?",
    answer:
      "We recommend contacting us as early as possible to ensure availability, especially for weekend events during peak season. However, we understand that events sometimes come together quickly and we accommodate last-minute requests when possible.",
  },
  {
    question: "Can you accommodate large festivals or community events?",
    answer:
      "Yes! For larger events, we can discuss multiple trailer options or recommend the appropriate trailer size for your expected attendance. Contact us with your event details and we&apos;ll help you determine the best solution.",
  },
  {
    question: "Do you offer multi-day event rentals?",
    answer:
      "Absolutely. Whether your event spans a weekend or several days, we can customize a rental package to fit your schedule. Extended rentals may include servicing between event days depending on usage.",
  },
]

export default function SpecialEventsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Special Events"
          title="Special Event Restroom Trailer Rentals in Lansing, MI"
          description="Premium restroom trailer rentals for private parties, corporate events, fundraisers, festivals, community gatherings, reunions, and upscale celebrations throughout Mid-Michigan."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
        />

        {/* Built for Events */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                Premium Solutions
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                Built for Events That Need More Than Standard Restrooms
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                When your event calls for something better than porta-potties, our luxury 
                restroom trailers deliver a clean, comfortable, and upscale experience 
                that your guests will appreciate.
              </p>
            </div>
            <div className="mt-12">
              <FeatureGrid features={features} columns={3} variant="card" />
            </div>
          </div>
        </section>

        {/* Event Image Gallery */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_05_24%20PM-syeWtXVuOA1VbMKhN5WOX5kX6LczSq.png"
                  alt="Restroom trailer at benefit gala event"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Apr%2024%2C%202026%2C%2010_08_32%20PM-R6Ta7a6rys9yAckLBuJnKBPnAZ4mRl.png"
                  alt="Restroom trailer at backyard party"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_56_46%20PM-H2xCmMMND6AksTZG4HA9OHuDL07tY3.png"
                  alt="Restroom trailer at outdoor festival"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Ideal For"
              title="Perfect for Your Special Occasion"
              description="From intimate gatherings to large community events, we have solutions for every occasion."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventTypes.map((event, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <event.icon className="w-6 h-6 text-navy" />
                      </div>
                      <CardTitle className="text-xl text-navy">
                        {event.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comfort and Presentation */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  The Experience
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Comfort and Presentation Matter
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Your event reflects on you. Whether you&apos;re hosting a corporate 
                  client event, a family celebration, or a community gathering, the 
                  details matter. Our luxury restroom trailers ensure your guests 
                  have a comfortable, clean experience that enhances your event.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Climate-controlled interiors",
                    "Private flushing stalls",
                    "Modern vanity stations",
                    "Fresh water and quality supplies",
                    "Professional appearance",
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
                  Service Area
                </h3>
                <p className="text-white/80 mb-6">
                  We serve special events throughout Lansing, East Lansing, Okemos, 
                  Grand Ledge, Howell, Ann Arbor, and surrounding Mid-Michigan 
                  communities within approximately a 2-hour radius.
                </p>
                <Button asChild className="bg-gold text-charcoal hover:bg-gold/90">
                  <Link href="/service-areas">
                    View All Service Areas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Special Event Questions"
            />
            <div className="mt-12 max-w-3xl mx-auto">
              <FAQSection faqs={eventFaqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Plan Your Special Event"
          description="Request availability and receive a custom proposal for your upcoming event."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="gold"
        />
      </main>
      <Footer />
    </>
  )
}
