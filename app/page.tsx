import Link from "next/link"
import Image from "next/image"
import {
  Thermometer,
  DoorOpen,
  Sparkles,
  Droplets,
  Presentation,
  Zap,
  MapPin,
  ArrowRight,
  Play,
  Users,
  CheckCircle,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/section-header"
import { ServiceCard } from "@/components/service-card"
import { FeatureGrid } from "@/components/feature-grid"
import { ProcessSteps } from "@/components/process-steps"
import { GalleryGrid } from "@/components/gallery-grid"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { HomeHero } from "@/components/home-hero"
import type { Metadata } from "next"
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo-schema"
import { fetchHomepageMedia, getHomepageMediaMap, resolveHomepageImage } from "@/lib/homepage-media"


export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: 'Luxury Restroom Trailer Rentals Lansing MI | Signature Luxe Events',
  description:
    'Rent luxury restroom trailers in Lansing, MI for weddings, private events, corporate events, festivals, construction sites, and long-term needs.',
  alternates: { canonical: '/' },
}

const features = [
  { title: "Climate Controlled", icon: Thermometer },
  { title: "Private Flushing Stalls", icon: DoorOpen },
  { title: "Modern Vanity Stations", icon: Sparkles },
  { title: "Fresh Water System", icon: Droplets },
  { title: "Event Ready Presentation", icon: Presentation },
  { title: "Power Access Support", icon: Zap },
]

const processSteps = [
  { number: 1, title: "Check Availability" },
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
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion2-XnFvvRp9dg0l3UMsQjxxTXQ6sRYgSI.jpg",
    alt: "Modern vanity station with succulent decor", 
    category: "Interior" 
  },
  { 
    id: "3", 
    src: "/images/Wedding Trailer.png",
    alt: "Wedding restroom trailer rental in Mid-Michigan", 
    category: "Weddings" 
  },
  { 
    id: "4", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4Stattion2-TjkXrrTaVwy3CswhDQSAdCK80Grr59.jpg",
    alt: "4-Station vanity with succulent artwork", 
    category: "Interior" 
  },
  { 
    id: "5", 
    src: "/images/Special Event Trailer.png",
    alt: "Mobile restroom trailer for outdoor events", 
    category: "Events" 
  },
  { 
    id: "6", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion4-CFlX5FxXUKJ43DEnRyhr5BWnmbQ0p2.jpg",
    alt: "2-Station interior with tree ring artwork", 
    category: "Interior" 
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

export default async function HomePage() {
  const mediaRecords = await fetchHomepageMedia()
  const mediaMap = getHomepageMediaMap(mediaRecords)

  const heroImage = resolveHomepageImage(mediaMap, "hero")
  const weddingsImage = resolveHomepageImage(mediaMap, "weddings")
  const privatePartiesImage = resolveHomepageImage(mediaMap, "private_parties")
  const corporateEventsImage = resolveHomepageImage(mediaMap, "corporate_events")
  const festivalsImage = resolveHomepageImage(mediaMap, "festivals")
  const specialEventsImage = resolveHomepageImage(mediaMap, "special_events")
  const trailerGalleryImage = resolveHomepageImage(mediaMap, "trailer_gallery")

  const services = [
    { title: "Weddings", description: "Elegant restroom trailers for outdoor weddings, backyard celebrations, barn venues, and private estates throughout Mid-Michigan.", href: "/wedding-restroom-trailer-rentals", imageSrc: weddingsImage.src, imageAlt: weddingsImage.alt, imageUnoptimized: weddingsImage.unoptimized },
    { title: "Special Events", description: "Premium solutions for private parties, corporate events, fundraisers, festivals, and community gatherings.", href: "/private-event-restroom-trailers", imageSrc: specialEventsImage.src, imageAlt: specialEventsImage.alt, imageUnoptimized: specialEventsImage.unoptimized },
    { title: "Construction / Long-Term", description: "Reliable restroom trailers for construction sites, commercial projects, and extended rental needs.", href: "/construction-long-term-restroom-trailer-rentals", imageSrc: trailerGalleryImage.src, imageAlt: trailerGalleryImage.alt, imageUnoptimized: trailerGalleryImage.unoptimized },
    { title: "Disaster Relief / Government", description: "Dependable restroom solutions for emergency response, municipal projects, and temporary infrastructure.", href: "/emergency-disaster-relief-restroom-trailers", imageSrc: festivalsImage.src, imageAlt: festivalsImage.alt, imageUnoptimized: festivalsImage.unoptimized },
  ]

  const eventScenarios = [
    { ...weddingsImage, displayLabel: "Weddings" },
    { ...privatePartiesImage, displayLabel: "Parties" },
    { ...corporateEventsImage, displayLabel: "Corporate" },
    { ...festivalsImage, displayLabel: "Festivals" },
  ]

  const business = localBusinessJsonLd("Lansing")
  const website = websiteJsonLd()
  const organization = organizationJsonLd()
  const video = {"@context":"https://schema.org","@type":"VideoObject",name:"Luxury Restroom Trailer Walkthrough",description:"Walkthrough of Signature Luxe Events & Amenities 3-station luxury restroom trailer for weddings and events in Lansing and Mid-Michigan.",thumbnailUrl:"https://img.youtube.com/vi/jtWx3MlGOQI/hqdefault.jpg",uploadDate:"2026-03-01",embedUrl:"https://www.youtube.com/embed/jtWx3MlGOQI",publisher:{"@type":"Organization",name:"Signature Luxe Events & Amenities"}}
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(video) }} />
      <Header />
      <main>
        <HomeHero heroImage={heroImage} />

        {/* Event Scenarios Showcase */}
        <section data-home-next-section className="py-16 bg-white border-b border-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-sm font-semibold uppercase tracking-widest text-navy">
                Perfect For Any Occasion
              </span>
              <h2 className="mt-2 text-2xl font-serif font-semibold text-navy">
                From Elegant Weddings to Job Sites
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {eventScenarios.map((scenario, index) => (
                <div key={index} className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer">
                  <Image
                    src={scenario.src}
                    alt={scenario.alt}
                    unoptimized={scenario.unoptimized}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-gold/90 text-navy text-sm font-medium rounded-full">
                      {scenario.displayLabel}
                    </span>
                  </div>
                </div>
              ))}

            <div className="mt-6 max-w-md mx-auto">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-gold/30 shadow-md">
                <Image
                  src={trailerGalleryImage.src}
                  alt={trailerGalleryImage.alt}
                  unoptimized={trailerGalleryImage.unoptimized}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 448px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-gold text-navy text-xs font-semibold uppercase tracking-wide">
                  MSU Tailgates
                </span>
              </div>
            </div>
            </div>
          </div>
        </section>

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

        {/* Video Walkthrough Section */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-navy">
                  Take a Tour
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl lg:text-5xl text-balance">
                  See Inside Our 3-Station Trailer
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Watch a complete walkthrough of our most popular 3-station luxury restroom trailer. 
                  See the modern finishes, private stalls, climate control system, and all the 
                  amenities that make our trailers stand out.
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                    <span>2 Women&apos;s rooms + 1 Men&apos;s room</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                    <span>Private flushing toilets in each stall</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                    <span>Modern vanities with stainless sinks</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-gold shrink-0" />
                    <span>Climate controlled for year-round comfort</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button asChild className="bg-gold hover:bg-gold/90 text-navy font-semibold">
                    <Link href="/luxury-restroom-trailer-rentals">
                      Explore All Trailer Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* YouTube Video Embed */}
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-charcoal">
                  <iframe
                    src="https://www.youtube.com/embed/jtWx3MlGOQI?si=scm0lmNbll48Mw1a"
                    title="3-Station Luxury Restroom Trailer Walkthrough"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/20 rounded-full blur-2xl" />
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Trailer Options Showcase */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Our Fleet"
              title="Choose the Perfect Trailer for Your Event"
              description="We offer 2-station, 3-station, and 4-station configurations to accommodate events of all sizes."
            />
            
            {/* 2-Station Trailer */}
            <div className="mt-16">
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-1 lg:order-1 grid grid-cols-2 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion-ZzVBLsh7CDCrCrvb4zy74VpKu6WLfM.jpg"
                      alt="2-Station trailer exterior"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion4-CFlX5FxXUKJ43DEnRyhr5BWnmbQ0p2.jpg"
                      alt="2-Station interior with vanity and stall"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion2-XnFvvRp9dg0l3UMsQjxxTXQ6sRYgSI.jpg"
                      alt="2-Station vanity with succulent decor"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion1-4GfdXllyd7ETnO32bWZUfthPIJilPs.jpg"
                      alt="2-Station private stall with artwork"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </div>
                <div className="order-2 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/10 rounded-full mb-4">
                    <Users className="h-5 w-5 text-navy" />
                    <span className="text-base font-medium text-navy">Perfect for 50-100 guests</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-navy">
                    2-Station Trailer
                  </h3>
                  <p className="mt-4 text-base md:text-lg text-charcoal/80 leading-relaxed">
                    Our compact 2-station trailer features one women&apos;s room and one men&apos;s room, 
                    each with private stalls, modern vanities, and climate control. Ideal for 
                    intimate weddings, small parties, and residential events.
                  </p>
                  <ul className="mt-6 grid grid-cols-2 gap-3">
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      1 Women&apos;s Room
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      1 Men&apos;s Room
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      Climate Controlled
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      Fresh Water System
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                      <Link href="/luxury-restroom-trailer-rentals#2-station">View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Station Trailer */}
            <div className="mt-20">
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/10 rounded-full mb-4">
                    <Users className="h-5 w-5 text-navy" />
                    <span className="text-base font-medium text-navy">Perfect for 75-150 guests</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-navy">
                    3-Station Trailer
                  </h3>
                  <p className="mt-4 text-base md:text-lg text-charcoal/80 leading-relaxed">
                    Our versatile 3-station trailer offers the perfect balance of capacity and luxury,
                    featuring one women&apos;s room and two men&apos;s rooms, or customizable configurations.
                    Ideal for mid-sized weddings, corporate events, and community gatherings.
                  </p>
                  <ul className="mt-6 grid grid-cols-2 gap-3">
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      1 Women&apos;s Room
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      2 Men&apos;s Rooms
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      Climate Controlled
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      Premium Amenities
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                      <Link href="/luxury-restroom-trailer-rentals#3-station">View Details</Link>
                    </Button>
                  </div>
                </div>
                <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/3 Station Pro/3Station.jpg"
                      alt="3-Station trailer exterior"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/3 Station Pro/3Station1.jpg"
                      alt="3-Station interior overview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/3 Station Pro/3Station2.jpg"
                      alt="3-Station vanity with modern amenities"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/3 Station Pro/3Station3.jpg"
                      alt="3-Station private stall"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Station Trailer */}
            <div className="mt-20">
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4Stattion-reeAizT4CMrw1A2cNJMJrJzkCyVzvD.jpg"
                      alt="4-Station trailer exterior"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4Stattion1-Vgb2lLAmjazOrZaf0jRCtPD6XnwkZr.jpg"
                      alt="4-Station interior overview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4Stattion2-TjkXrrTaVwy3CswhDQSAdCK80Grr59.jpg"
                      alt="4-Station vanity with succulent artwork"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4Stattion3-2zdfq5PwGMaOVIZemEogYgoK88AZVC.jpg"
                      alt="4-Station private stall"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/10 rounded-full mb-4">
                    <Users className="h-5 w-5 text-navy" />
                    <span className="text-base font-medium text-navy">Perfect for 100-200+ guests</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-navy">
                    4-Station Trailer
                  </h3>
                  <p className="mt-4 text-base md:text-lg text-charcoal/80 leading-relaxed">
                    Our larger 4-station trailer features two women&apos;s rooms and two men&apos;s rooms, 
                    providing ample capacity for larger events. Each station includes private stalls, 
                    modern vanities with succulent artwork, and full climate control.
                  </p>
                  <ul className="mt-6 grid grid-cols-2 gap-3">
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      2 Women&apos;s Rooms
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      2 Men&apos;s Rooms
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      Climate Controlled
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle className="h-5 w-5 text-navy shrink-0" />
                      High Capacity Events
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                      <Link href="/luxury-restroom-trailer-rentals#4-station">View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Signature Luxe Difference */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-navy">
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
                    <Link href="/luxury-restroom-trailer-rentals">
                      Explore Our Restrooms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-cream rounded-2xl p-8 shadow-sm">
                <FeatureGrid features={features} columns={2} variant="compact" />
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas Section */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-navy">
                Service Areas
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-white md:text-4xl lg:text-5xl text-balance">
                Proudly Serving Lansing and Mid-Michigan
              </h2>
              <p className="mt-4 text-lg text-white/85 leading-relaxed">
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
                  <MapPin className="h-5 w-5 text-gold" />
                  <span className="text-white text-base">{area}, MI</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-navy/95 hover:text-gold transition-colors"
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
          ctaText="Check Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
