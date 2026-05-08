import type { Metadata } from "next"
import Link from "next/link"
import {
  Heart,
  Sparkles,
  Users,
  ShieldCheck,
  Thermometer,
  DoorOpen,
  Droplets,
  CheckCircle,
  ArrowRight,
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

export const metadata: Metadata = {
  title: "Wedding Restroom Trailer Rentals Lansing MI | Signature Luxe Events",
  description:
    "Luxury restroom trailer rentals for outdoor weddings, backyard weddings, barn weddings, private estates, and event venues in Lansing and Mid-Michigan.",
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
    title: "More Than Just a Restroom",
    description:
      "Your guests will appreciate the upgraded experience. From the moment they step inside, they&apos;ll notice the difference from standard portable restrooms.",
  },
  {
    title: "Protect Your Venue or Property",
    description:
      "Keep guests out of your home or venue&apos;s restrooms. Our trailers handle the traffic while your property stays pristine.",
  },
  {
    title: "Improve Guest Flow",
    description:
      "Strategically placed restroom trailers reduce wait times and keep your reception running smoothly.",
  },
]

const weddingGallery = [
  { 
    id: "w1", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2008_40_17%20PM-NL7i7EeHuiHMOi8dyFMfz0jREjM8m8.png",
    alt: "Wedding restroom trailer rental Lansing Michigan", 
    category: "Weddings" 
  },
  { 
    id: "w2", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_57_05%20PM-andQKOFMNL27uuWQLGIkidESuYaaAs.png",
    alt: "Luxury restroom trailer at elegant wedding reception", 
    category: "Weddings" 
  },
  { 
    id: "w3", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f8c856e0-44a2-4c9a-990c-09e671fee136-VkgBsnTDKck69SOzLmlIYiSb3zZeAS.png",
    alt: "Restroom trailer at garden estate wedding", 
    category: "Weddings" 
  },
  { 
    id: "w4", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03504-zEWBCoaFRmOx3fWQJRxsUNKyS1RLSU.jpg",
    alt: "Modern vanity station wedding restroom trailer", 
    category: "Interior" 
  },
]

const weddingFaqs = [
  {
    question: "When should I book my wedding restroom trailer?",
    answer:
      "We recommend booking as early as possible, especially for peak wedding season (May through October). Popular dates can book 6-12 months in advance. Contact us early to ensure availability for your wedding date.",
  },
  {
    question: "What size trailer do I need for my wedding?",
    answer:
      "Trailer size depends on your guest count. For weddings up to 150 guests, our 2-station trailer works well. For 150-225 guests, consider our 3-station trailer. For 250+ guests, our 4-station trailer is recommended. We&apos;ll help you choose the right size during the proposal process.",
  },
  {
    question: "Can the trailer be delivered to any venue?",
    answer:
      "We can deliver to most wedding venues, private properties, farms, estates, and outdoor locations in our service area. We just need reasonably flat ground and access for our delivery vehicle. Let us know your venue details and we&apos;ll confirm we can accommodate your location.",
  },
  {
    question: "Do you deliver for weddings outside Lansing?",
    answer:
      "Yes! We serve weddings throughout Mid-Michigan including East Lansing, Okemos, Grand Ledge, Mason, Howell, Ann Arbor, and communities within approximately a 2-hour radius of Lansing.",
  },
]

export default function WeddingsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Weddings"
          title="Wedding Restroom Trailer Rentals in Lansing, MI"
          description="Give your guests a clean, comfortable, and upscale restroom experience for your outdoor wedding, private estate celebration, barn wedding, or venue event in Lansing and Mid-Michigan."
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
                <h3 className="text-xl font-semibold text-navy mb-6">
                  Perfect For
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {venueTypes.map((venue, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      <span className="text-base text-charcoal">{venue}</span>
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
