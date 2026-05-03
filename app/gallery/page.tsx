import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { GalleryGrid } from "@/components/gallery-grid"
import { CTASection } from "@/components/cta-section"

export const metadata: Metadata = {
  title: "Gallery | Signature Luxe Events & Amenities",
  description:
    "View photos of our luxury restroom trailers, interiors, and event setups in Lansing and Mid-Michigan.",
}

const galleryImages = [
  {
    id: "1",
    alt: "Luxury restroom trailer exterior in Lansing Michigan",
    category: "Exterior",
  },
  {
    id: "2",
    alt: "Climate controlled restroom trailer interior view",
    category: "Interior",
  },
  {
    id: "3",
    alt: "Wedding restroom trailer rental setup in Mid-Michigan",
    category: "Weddings",
  },
  {
    id: "4",
    alt: "Modern vanity station inside luxury restroom trailer",
    category: "Interior",
  },
  {
    id: "5",
    alt: "Private flushing stall in restroom trailer",
    category: "Interior",
  },
  {
    id: "6",
    alt: "Mobile restroom trailer for outdoor events Michigan",
    category: "Exterior",
  },
  {
    id: "7",
    alt: "Restroom trailer setup at private estate wedding",
    category: "Weddings",
  },
  {
    id: "8",
    alt: "Corporate event restroom trailer rental Lansing",
    category: "Events",
  },
  {
    id: "9",
    alt: "Luxury restroom trailer delivery and setup",
    category: "Setup",
  },
  {
    id: "10",
    alt: "Clean modern restroom trailer hand washing station",
    category: "Interior",
  },
  {
    id: "11",
    alt: "Festival restroom trailer rental Michigan",
    category: "Events",
  },
  {
    id: "12",
    alt: "Climate controlled restroom trailer exterior night view",
    category: "Exterior",
  },
]

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Gallery"
          title="See Our Luxury Restroom Trailers"
          description="Explore our climate-controlled trailers, modern interiors, and professional event setups across Lansing and Mid-Michigan."
          primaryCta={{ text: "Request Availability", href: "/request-availability" }}
        />

        {/* Gallery Grid */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <GalleryGrid images={galleryImages} columns={3} />
          </div>
        </section>

        {/* Exterior Photos Section */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm font-medium uppercase tracking-widest text-gold">
                Exterior Views
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                Professional Event Presentation
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our trailers are designed to complement your event setting with a clean, 
                professional appearance that blends seamlessly with your venue.
              </p>
            </div>
            <GalleryGrid
              images={galleryImages.filter((img) => img.category === "Exterior")}
              columns={3}
            />
          </div>
        </section>

        {/* Interior Photos Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm font-medium uppercase tracking-widest text-gold">
                Interior Details
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                Luxury Finishes Inside
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Step inside to discover modern vanity stations, private flushing stalls, 
                climate control, and thoughtful details your guests will appreciate.
              </p>
            </div>
            <GalleryGrid
              images={galleryImages.filter((img) => img.category === "Interior")}
              columns={4}
            />
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Like What You See?"
          description="Request availability for your upcoming event and experience the Signature Luxe difference."
          ctaText="Request Availability"
          ctaHref="/request-availability"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
