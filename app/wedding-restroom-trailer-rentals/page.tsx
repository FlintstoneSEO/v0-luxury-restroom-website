import type { Metadata } from "next"
import Link from "next/link"
import {
  Heart,
  Sparkles,
  Users,
  Thermometer,
  DoorOpen,
  Droplets,
  CheckCircle,
  ArrowRight,
  Camera,
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

const title =
  "Wedding Restroom Trailer Rentals in Lansing & Mid-Michigan | Signature Luxe Events"
const description =
  "Luxury wedding restroom trailer rentals for outdoor weddings, barn venues, estates, and backyard receptions across Lansing and Mid-Michigan with guest-first planning."
const canonical =
  "https://www.signatureluxeevents.com/wedding-restroom-trailer-rentals"
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical },
}

const weddingFeatures = [
  {
    title: "Elegant Design",
    description:
      "Modern finishes and stylish interiors that complement your wedding aesthetic.",
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

const venueTypes = [
  "Outdoor weddings",
  "Backyard celebrations",
  "Barn weddings",
  "Vineyard venues",
  "Private estates",
  "Farm weddings",
  "Garden ceremonies",
  "Rustic venues",
  "Lakeside weddings",
  "Tent receptions",
]

const weddingBenefits = [
  {
    title: "Designed for Wedding Flow",
    description:
      "Wedding timelines create traffic spikes after the ceremony, during cocktail hour, and before dinner. We size trailer options around those peaks so the reception keeps moving and lines stay manageable.",
  },
  {
    title: "Guest Comfort in Formal Attire",
    description:
      "Wedding guests in suits, gowns, and heels expect more than a standard portable unit. Luxury trailers with flushing toilets, private stalls, sinks, mirrors, and lighting create a cleaner and more comfortable experience.",
  },
  {
    title: "Photo-Friendly Placement",
    description:
      "Restroom placement affects more than convenience. We help select a setup spot that supports guest access while staying out of key photo angles, bar lines, and entertainment zones.",
  },
  {
    title: "Protect Your Venue or Property",
    description:
      "Keep guests out of your home or venue&apos;s restrooms. Our trailers handle the traffic while your property stays pristine throughout the celebration.",
  },
]

const weddingGallery = [
  {
    id: "w1",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2008_40_17%20PM-NL7i7EeHuiHMOi8dyFMfz0jREjM8m8.png",
    alt: "Wedding restroom trailer rental Lansing Michigan",
    category: "Weddings",
  },
  {
    id: "w2",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_57_05%20PM-andQKOFMNL27uuWQLGIkidESuYaaAs.png",
    alt: "Luxury restroom trailer at elegant wedding reception",
    category: "Weddings",
  },
  {
    id: "w3",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f8c856e0-44a2-4c9a-990c-09e671fee136-VkgBsnTDKck69SOzLmlIYiSb3zZeAS.png",
    alt: "Restroom trailer at garden estate wedding",
    category: "Weddings",
  },
  {
    id: "w4",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03504-zEWBCoaFRmOx3fWQJRxsUNKyS1RLSU.jpg",
    alt: "Modern vanity station wedding restroom trailer",
    category: "Interior",
  },
]

const weddingFaqs = [
  {
    question: "How far in advance should we book wedding restroom trailers?",
    answer:
      "For popular spring and fall dates, 2 to 4 months is ideal. We can also check shorter timelines based on current inventory and route availability.",
  },
  {
    question: "Can you deliver to barn venues and private properties?",
    answer:
      "Yes. We frequently plan deliveries for barns, estates, and backyard weddings, including access and placement checks before delivery.",
  },
  {
    question: "How do you size trailers for reception flow?",
    answer:
      "We estimate based on guest count, event duration, and traffic peaks during cocktail hour, dinner, and dancing transitions.",
  },
  {
    question: "Can we place the trailer away from ceremony photos?",
    answer:
      "Absolutely. We help identify practical placement that supports guest convenience while protecting key photo and decor sightlines.",
  },
  {
    question: "Do you serve outside Lansing?",
    answer:
      "Yes. We serve Mid-Michigan and nearby regional markets including East Lansing, Okemos, Haslett, Jackson, Howell, Flint, Ann Arbor, and Grand Rapids.",
  },
]

export default function WeddingRestroomTrailerRentalsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Weddings"
          title="Wedding Restroom Trailer Rentals for Outdoor Michigan Celebrations"
          description="From barn venues outside Lansing to private estates and backyard wedding weekends across Mid-Michigan, we help couples plan restroom access that feels polished, photo-ready, and comfortable for guests in formal attire."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
          secondaryCta={{ text: "View Gallery", href: "/gallery" }}
        />

        {/* Why Upgrade */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Upgrade Your Wedding"
              title="Upgrade Your Wedding With a Luxury Restroom Trailer"
              description="Your wedding day should be perfect in every detail. Don&apos;t let restroom facilities be an afterthought."
            />
            <div className="mt-12">
              <FeatureGrid features={weddingFeatures} columns={4} variant="card" />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Benefits
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Why Choose a Luxury Restroom Trailer for Your Wedding?
                </h2>
                <div className="mt-8 space-y-8">
                  {weddingBenefits.map((benefit, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-navy flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4 text-navy" />
                        </div>
                        {benefit.title}
                      </h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed pl-11">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-navy" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy">
                    Perfect For
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {venueTypes.map((venue, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      <span className="text-sm text-charcoal">{venue}</span>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="w-full mt-8 bg-navy hover:bg-navy/90 text-white"
                >
                  <Link href="/request-quote">
                    Check Wedding Date Availability
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Gallery"
              title="Wedding Restroom Trailer Photos"
              description="See how our luxury trailers enhance wedding celebrations throughout Mid-Michigan."
            />
            <div className="mt-12">
              <GalleryGrid images={weddingGallery} columns={4} />
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline" className="border-navy text-navy">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Booking Guidance */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Planning Ahead
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl text-balance">
                  Reserve 2 to 4 Months Ahead for Peak Dates
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Spring and fall Saturdays in Mid-Michigan often book first, especially 
                  for wedding weekends. Planning 2 to 4 months ahead gives the best chance 
                  of securing your preferred trailer size.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Peak season: May through October",
                    "Most popular: 3-station trailer for 150–225 guests",
                    "We serve Lansing, East Lansing, Okemos, Grand Ledge, Mason, Howell, Ann Arbor, and more",
                    "Delivery coordinated around your venue access windows",
                    "Rehearsal dinner and after-party support also available",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Also Compare
                </h3>
                <p className="text-white/80 mb-6">
                  If you are also comparing options for engagement parties, rehearsal 
                  dinners, or after-parties, see our private event page and full luxury 
                  rental overview for planning continuity.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full bg-gold text-charcoal hover:bg-gold/90">
                    <Link href="/request-quote">
                      Check Availability for Your Date
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <Link href="/our-restrooms">View Trailer Options</Link>
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
              title="Wedding Restroom Trailer Questions"
            />
            <div className="mt-12 max-w-3xl mx-auto">
              <FAQSection faqs={weddingFaqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Make Your Wedding Day Perfect"
          description="Request availability for your wedding date and receive a custom proposal."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
