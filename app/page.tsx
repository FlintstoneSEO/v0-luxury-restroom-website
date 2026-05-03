import Link from "next/link"
import {
  Heart,
  PartyPopper,
  HardHat,
  ShieldCheck,
  Thermometer,
  DoorOpen,
  Sparkles,
  Droplets,
  Presentation,
  Zap,
  MapPin,
  ArrowRight,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { SectionHeader } from "@/components/section-header"
import { ServiceCard } from "@/components/service-card"
import { FeatureGrid } from "@/components/feature-grid"
import { ProcessSteps } from "@/components/process-steps"
import { GalleryGrid } from "@/components/gallery-grid"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"

const services = [
  {
    title: "Weddings",
    description:
      "Elegant restroom trailers for outdoor weddings, backyard celebrations, barn venues, and private estates throughout Mid-Michigan.",
    href: "/weddings",
    icon: Heart,
    imagePlaceholder: "Wedding trailer setup",
  },
  {
    title: "Special Events",
    description:
      "Premium solutions for private parties, corporate events, fundraisers, festivals, and community gatherings.",
    href: "/special-events",
    icon: PartyPopper,
    imagePlaceholder: "Event trailer exterior",
  },
  {
    title: "Construction / Long-Term",
    description:
      "Reliable restroom trailers for construction sites, commercial projects, and extended rental needs.",
    href: "/construction-long-term",
    icon: HardHat,
    imagePlaceholder: "Job site setup",
  },
  {
    title: "Disaster Relief / Government",
    description:
      "Dependable restroom solutions for emergency response, municipal projects, and temporary infrastructure.",
    href: "/disaster-relief-government",
    icon: ShieldCheck,
    imagePlaceholder: "Emergency deployment",
  },
]

const features = [
  { title: "Climate Controlled", icon: Thermometer },
  { title: "Private Flushing Stalls", icon: DoorOpen },
  { title: "Modern Vanity Stations", icon: Sparkles },
  { title: "Fresh Water System", icon: Droplets },
  { title: "Event Ready Presentation", icon: Presentation },
  { title: "Power Access Support", icon: Zap },
]

const processSteps = [
  { number: 1, title: "Request Availability" },
  { number: 2, title: "Share Your Event Details" },
  { number: 3, title: "Receive a Custom Proposal" },
  { number: 4, title: "Approve and Reserve Your Date" },
]

const galleryImages = [
  { 
    id: "1", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03647-wvGP4IObLWSxCr7Hvk08PhOzDZzM9p.jpg",
    alt: "Luxury restroom trailer exterior in Lansing Michigan", 
    category: "Exterior" 
  },
  { 
    id: "2", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03504-zEWBCoaFRmOx3fWQJRxsUNKyS1RLSU.jpg",
    alt: "Modern vanity station inside restroom trailer", 
    category: "Interior" 
  },
  { 
    id: "3", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2008_40_17%20PM-NL7i7EeHuiHMOi8dyFMfz0jREjM8m8.png",
    alt: "Wedding restroom trailer rental in Mid-Michigan", 
    category: "Weddings" 
  },
  { 
    id: "4", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03430-tFWoDUOQcCiO6n1GbK4NfiTkB8gEbx.jpg",
    alt: "Climate controlled restroom trailer interior", 
    category: "Interior" 
  },
  { 
    id: "5", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_19_19%20PM-flItPBW2CyM2JXe8YJpcXdcdJRxIOb.png",
    alt: "Mobile restroom trailer for outdoor events", 
    category: "Events" 
  },
  { 
    id: "6", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Apr%2024%2C%202026%2C%2010_08_32%20PM-R6Ta7a6rys9yAckLBuJnKBPnAZ4mRl.png",
    alt: "Restroom trailer setup at Michigan event venue", 
    category: "Events" 
  },
]

const serviceAreas = [
  "Lansing",
  "East Lansing",
  "Okemos",
  "Haslett",
  "Grand Ledge",
  "DeWitt",
  "Holt",
  "Mason",
  "Charlotte",
  "Howell",
  "Jackson",
  "Flint",
  "Ann Arbor",
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <HeroSection
          eyebrow="Luxury Restroom Trailer Rentals"
          title="Luxury Restroom Trailer Rentals in Lansing, MI"
          description="Clean, modern, climate-controlled restroom trailers for weddings, private parties, corporate events, festivals, construction sites, long-term rentals, and government needs throughout Lansing and Mid-Michigan."
          primaryCta={{ text: "Request Availability", href: "/request-availability" }}
          secondaryCta={{ text: "View Our Restrooms", href: "/our-restrooms" }}
          trustLine="Based in Lansing, MI. Serving Mid-Michigan and surrounding communities within a 2-hour radius."
          imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_57_05%20PM-andQKOFMNL27uuWQLGIkidESuYaaAs.png"
          imageAlt="Luxury restroom trailer at elegant outdoor wedding reception"
        />

        {/* Services Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Our Services"
              title="Restroom Trailer Rentals For Every Occasion"
              description="From elegant weddings to demanding job sites, we provide premium restroom trailer solutions tailored to your specific needs."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* The Signature Luxe Difference */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <span className="text-sm font-medium uppercase tracking-widest text-gold">
                  The Signature Luxe Difference
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl lg:text-5xl text-balance">
                  Comfort. Cleanliness. Class.
                </h2>
                <p className="mt-6 text-lg text-charcoal/80 leading-relaxed text-pretty">
                  Our luxury restroom trailers are designed to provide a clean, polished, and 
                  comfortable experience for your guests, crew, or community. From private events 
                  to long-term rental needs, we deliver restroom solutions that feel professional, 
                  reliable, and event-ready.
                </p>
                <div className="mt-8">
                  <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                    <Link href="/our-restrooms">
                      Explore Our Restrooms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <FeatureGrid features={features} columns={2} variant="compact" />
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas Section */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-medium uppercase tracking-widest text-gold">
                Service Areas
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl lg:text-5xl text-balance">
                Proudly Serving Lansing and Mid-Michigan
              </h2>
              <p className="mt-4 text-lg text-white/80 leading-relaxed">
                Based in Lansing, we deliver luxury restroom trailers throughout Mid-Michigan 
                and surrounding communities within approximately a 2-hour radius.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {serviceAreas.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="text-white text-sm">{area}, MI</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/service-areas">View All Service Areas</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Gallery Preview */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Gallery"
              title="Luxury Details Your Guests Will Appreciate"
              description="Take a closer look at our climate-controlled restroom trailers, modern interiors, and professional event setups."
            />
            <div className="mt-12">
              <GalleryGrid images={galleryImages} columns={3} />
            </div>
            <div className="mt-10 text-center">
              <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="How It Works"
              title="Simple Rental Process"
              description="Getting a luxury restroom trailer for your event is easy. Here&apos;s how it works."
            />
            <div className="mt-12">
              <ProcessSteps steps={processSteps} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Reserve a Luxury Restroom Trailer?"
          description="Check availability for your date and let us help make your event comfortable, clean, and memorable."
          ctaText="Request Availability"
          ctaHref="/request-availability"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
