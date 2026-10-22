import { DayNightScene } from "@/components/day-night-scene"
import "./home-refinements.css"
import { HomeFleet } from "@/components/home-fleet"
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
  CheckCircle,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/section-header"
import { ServiceCard } from "@/components/service-card"
import { FeatureGrid } from "@/components/feature-grid"
import { ProcessSteps } from "@/components/process-steps"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { HomeHero } from "@/components/home-hero"
import { LiteYouTubeEmbed } from "@/components/lite-youtube-embed"
import type { Metadata } from "next"
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo-schema"
import { fetchHomepageMedia, getHomepageMediaMap, resolveHomepageImage } from "@/lib/homepage-media"
import { getHomepage } from "@/lib/content/pages"


export const revalidate = 3600

const homepageContent = getHomepage()

export const metadata: Metadata = {
  title: homepageContent.seo.title,
  description: homepageContent.seo.description,
  alternates: { canonical: homepageContent.seo.canonical ?? '/' },
  robots: homepageContent.seo.noindex ? { index: false, follow: false } : undefined,
}

const featureIcons = {
  temperature: Thermometer,
  door: DoorOpen,
  sparkles: Sparkles,
  water: Droplets,
  presentation: Presentation,
  power: Zap,
}

const features = homepageContent.features.map((feature) => ({ ...feature, icon: featureIcons[feature.icon] }))
const processSteps = homepageContent.processSteps
const galleryImages = homepageContent.galleryImages
const serviceAreas = homepageContent.serviceAreas


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

  const homepageMedia = {
    weddings: weddingsImage,
    private_parties: privatePartiesImage,
    corporate_events: corporateEventsImage,
    festivals: festivalsImage,
    special_events: specialEventsImage,
    trailer_gallery: trailerGalleryImage,
  }
  const services = homepageContent.services.map((service) => {
    const image = homepageMedia[service.mediaKey as keyof typeof homepageMedia]
    return { ...service, imageSrc: image.src, imageAlt: image.alt, imageUnoptimized: image.unoptimized }
  })

  const eventScenarios = homepageContent.eventScenarios.map((scenario) => ({
    ...homepageMedia[scenario.mediaKey as keyof typeof homepageMedia],
    displayLabel: scenario.label,
    mediaKey: scenario.mediaKey,
    href: ({ weddings: '/wedding-restroom-trailer-rentals', private_parties: '/private-event-restroom-trailers', corporate_events: '/corporate-event-restroom-trailers', festivals: '/festival-community-event-restroom-trailers' } as Record<string, string>)[scenario.mediaKey] ?? '/luxury-restroom-trailer-rentals',
  }))

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
      <main id="public-content" tabIndex={-1} className="estate-public">
        <HomeHero heroImage={heroImage} content={homepageContent.hero} />

        <section className="estate-assurance" aria-label="Restroom amenities and service region">
          <div className="estate-assurance-inner">
            {features.slice(0, 3).map((feature) => (
              <div key={feature.title} className="estate-assurance-item">
                <feature.icon aria-hidden="true" /><span>{feature.title}</span>
              </div>
            ))}
            <div className="estate-assurance-item"><MapPin aria-hidden="true" /><span>Lansing &amp; Mid-Michigan</span></div>
          </div>
        </section>

        {homepageContent.introduction && (
          <section className="estate-intro">
            <div className="container mx-auto px-4 lg:px-8 estate-intro-grid">
              <div className="estate-intro-image">
                <Image src={homepageContent.introduction.image.src} alt={homepageContent.introduction.image.alt}
                  fill className="object-cover" sizes="(max-width: 900px) 100vw, 50vw" />
              </div>
              <div className="estate-intro-copy">
                <h2>{homepageContent.introduction.heading}</h2>
                <p>{homepageContent.introduction.body}</p>
                <Link className="estate-text-link" href={homepageContent.introduction.cta.href}>
                  {homepageContent.introduction.cta.label}<ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <HomeFleet />

        {homepageContent.dayNight && <DayNightScene content={homepageContent.dayNight} />}

        {/* Gallery Preview */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Gallery"
              title="Luxury Details Your Guests Will Appreciate"
              description="Take a closer look at our climate-controlled restroom trailers, modern interiors, and professional event setups."
            />
            <div className="mt-12">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.slice(0, 3).map((image) => (
                  <Link
                    key={image.id}
                    href="/gallery"
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      quality={78}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 24px), 33vw"
                    />
                    {image.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs text-navy">
                        {image.category}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-10 text-center">
              <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Video Walkthrough Section */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
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
              
              {/* Lightweight click-to-play YouTube video */}
              <div className="relative">
                <LiteYouTubeEmbed
                  videoId="jtWx3MlGOQI"
                  title="3-Station Luxury Restroom Trailer Walkthrough"
                  className="aspect-video overflow-hidden rounded-2xl bg-charcoal shadow-2xl"
                />
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/20 rounded-full blur-2xl" />
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Event Scenarios Showcase */}
        <section id="homepage-events" className="home-occasions" aria-labelledby="home-occasions-heading">
          <div className="home-occasions-heading">
            <h2 id="home-occasions-heading">From Elegant Weddings to Job Sites</h2>
            <div><p>Find your setting. Explore the possibilities.</p><Link href="/luxury-restroom-trailer-rentals" className="estate-text-link">Explore our trailers<ArrowRight aria-hidden="true" size={18} /></Link></div>
          </div>
          <div className="home-occasions-grid">
            {eventScenarios.map((scenario) => (
              <Link key={scenario.displayLabel} href={scenario.href} className={`home-occasion home-occasion-${scenario.mediaKey}`}>
                <div className="home-occasion-image"><Image src={scenario.src} alt={scenario.alt} unoptimized={scenario.unoptimized} fill className="object-cover" quality={78} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 42vw" /></div>
                <div className="home-occasion-caption"><h3>{scenario.displayLabel}</h3><ArrowRight aria-hidden="true" size={20} /></div>
              </Link>
            ))}
            <Link href="/service-areas/east-lansing-mi" className="home-occasion home-occasion-tailgates">
              <div className="home-occasion-image"><Image src={homepageContent.tailgateImage?.src ?? trailerGalleryImage.src} alt={homepageContent.tailgateImage?.alt ?? trailerGalleryImage.alt} unoptimized={homepageContent.tailgateImage ? false : trailerGalleryImage.unoptimized} fill className="object-cover" quality={78} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 34vw" /></div>
              <div className="home-occasion-caption"><h3>MSU Tailgates</h3><ArrowRight aria-hidden="true" size={20} /></div>
            </Link>
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

        {/* Service Areas Section */}
        <section className="py-20 md:py-28 bg-navy">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-gold">
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
