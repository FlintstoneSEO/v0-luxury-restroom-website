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
  MapPin,
  CalendarDays,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ServiceHero as HeroSection } from "@/components/service-hero"
import { SectionHeader } from "@/components/section-header"
import "./trailer-presentation.css"
import { GalleryGrid } from "@/components/gallery-grid"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd, serviceJsonLd } from "@/lib/seo-schema"
import rawContent from "@/content/service-pages/luxury-restroom-trailers.json"
import { defineServicePageData } from "@/lib/content/service-pages"
import { getAllTrailers } from "@/lib/content/trailers"

const content = defineServicePageData(rawContent)

const { title, description, canonical } = content.seo

export const metadata: Metadata = {
  title, description, alternates: { canonical },
  openGraph: { title, description, url: canonical ?? undefined },
  twitter: { card: "summary_large_image", title, description },
}

const contentIcons = { Thermometer, DoorOpen, Sparkles, Droplets, Zap, Users }

const features = content.data.features.map((item) => ({ ...item, icon: contentIcons[item.icon as keyof typeof contentIcons] }))

const trailerOptions = getAllTrailers()

const setupRequirements = content.data.setupRequirements

const amenities = content.data.amenities

const serviceAreas = content.data.serviceAreas

const faqs = content.data.faqs

const interiorGallery = content.data.interiorGallery

export default function LuxuryRestroomTrailerRentalsPage() {
  const serviceSchema = serviceJsonLd("Luxury restroom trailer rental", canonical)
  const faqSchema = faqJsonLd(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))
  const breadcrumbSchema = breadcrumbJsonLd([{ name: "Home", item: "/" }, { name: "Luxury Restroom Trailer Rentals", item: "/luxury-restroom-trailer-rentals" }])
  const businessSchema = localBusinessJsonLd("Lansing")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <Header />
      <main id="public-content" tabIndex={-1} className="estate-public estate-service">
        {/* Hero */}
        <HeroSection
          variant="page"
          imageSrc="/images/3 Station Pro/3Station.jpg"
          imageAlt="Signature Luxe 3 Station Pro restroom trailer"
          eyebrow="Luxury Restroom Trailers"
          title="Luxury Restroom Trailer Rentals in Lansing, MI"
          description="If you are planning an event in Lansing or anywhere in Mid-Michigan, luxury restroom trailer rentals provide a cleaner, more comfortable experience than standard portable toilets."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
          secondaryCta={{ text: "View Gallery", href: "/gallery" }}
        />

        {/* Features */}
        <section className="catalog-features bg-white" aria-labelledby="catalog-features-heading">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="catalog-features-layout">
              <div className="catalog-features-intro">
                <h2 id="catalog-features-heading">Premium Features &amp; Finishes</h2>
                <p>Every detail is designed for comfort, cleanliness, and a premium guest experience.</p>
                {interiorGallery[0] && <figure className="catalog-interior-photo">
                  <Image src={interiorGallery[0].src} alt={interiorGallery[0].alt} fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" />
                </figure>}
                <Link href="#interior-details" className="estate-text-link">Step Inside Our Trailers<ArrowRight aria-hidden="true" size={18} /></Link>
              </div>
              <div className="catalog-feature-list">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return <div className="catalog-feature" key={feature.title}>
                    <Icon aria-hidden="true" size={26} strokeWidth={1.5} />
                    <div><h3>{feature.title}</h3><p>{feature.description}</p></div>
                  </div>
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Trailer Options */}
        <section className="catalog-options bg-cream" aria-labelledby="catalog-options-heading">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="catalog-options-intro">
              <h2 id="catalog-options-heading">Choose the Right Size for Your Event</h2>
              <p>We offer multiple trailer configurations to match your guest count and space requirements.</p>
            </div>
            <div className="catalog-options-grid">
              {trailerOptions.map((trailer) => (
                <article key={trailer.slug} id={trailer.slug.replace(/-trailer$/, "")}
                  className={`catalog-option scroll-mt-32${trailer.popular ? " catalog-option-popular" : ""}`}
                  aria-labelledby={`${trailer.slug}-heading`}>
                  <div className="catalog-option-label">{trailer.popular && <span>Most Popular</span>}</div>
                  <header>
                    <h3 id={`${trailer.slug}-heading`}>{trailer.name}</h3>
                    <p className="catalog-option-capacity"><Users aria-hidden="true" size={20} />{trailer.capacity}</p>
                  </header>
                  <p className="catalog-option-description">{trailer.description}</p>
                  <ul>{trailer.features.map((feature) => <li key={feature}><CheckCircle aria-hidden="true" size={18} /><span>{feature}</span></li>)}</ul>
                  <Link className="catalog-option-cta" href="/request-quote">Check Availability<ArrowRight aria-hidden="true" size={18} /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Luxury Trailers */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03647-wvGP4IObLWSxCr7Hvk08PhOzDZzM9p.jpg"
                  alt="Professional exterior view of luxury restroom trailer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Why Choose Luxury
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Why Luxury Trailers Outperform Standard Portable Toilets
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Luxury units provide flushing toilets, sinks, vanities, lighting, mirrors, 
                  and climate control. For weddings and upscale events around Lansing and 
                  Mid-Michigan, this better matches the guest experience you want to deliver.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Private flushing stalls vs. open portable units",
                    "Running water for hand washing",
                    "Climate-controlled for all-season events",
                    "Modern vanity stations with mirrors",
                    "Professional appearance that complements your event",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-navy mt-0.5 shrink-0" />
                      <span className="text-charcoal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Interior Gallery */}
        <section id="interior-details" className="scroll-mt-24 py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Interior Details"
              title="Step Inside Our Trailers"
              description="Modern finishes, private stalls, and thoughtful details create a comfortable guest experience."
            />
            <div className="mt-12">
              <GalleryGrid images={interiorGallery} columns={4} />
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline" className="border-navy text-navy">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Setup Requirements + Amenities */}
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
                  Our restroom trailers are designed for easy setup with minimal site 
                  requirements. We confirm placement, access, and utility planning before 
                  delivery to keep setup smooth.
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
                  Everything Included for Your Event
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed">
                  Our trailers come fully stocked and ready for your event. All essential 
                  supplies are included so your guests are taken care of from start to finish.
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

        {/* Service Area */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">
                  Service Area
                </span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                  Delivery & Pickup Across Mid-Michigan
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  We serve Lansing and surrounding Mid-Michigan communities. Pickup and 
                  multi-day service scheduling can be coordinated based on your event timeline.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {serviceAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-navy shrink-0" />
                      <Link href={area.href} className="text-base text-charcoal underline-offset-2 hover:text-navy hover:underline">
                        {area.name}
                      </Link>
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-8 bg-navy hover:bg-navy/90 text-white">
                  <Link href="/service-areas">
                    View All Service Areas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="bg-cream rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy">
                    Booking Tips
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Spring and fall weekends book fastest — reserve early",
                    "Share guest count, date, and location for an accurate quote",
                    "Peak usage planning helps size trailers correctly",
                    "Generator and water tank options available for remote sites",
                    "Multi-day and long-term rental scheduling available",
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-navy mt-0.5 shrink-0" />
                      <span className="text-base text-charcoal leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Luxury Restroom Trailer Questions"
            />
            <div className="mt-12 max-w-3xl mx-auto">
              <FAQSection faqs={faqs} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Reserve Luxury Restroom Trailers for Your Event"
          description="Request availability for your event date and receive a custom proposal."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
