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
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03647-wvGP4IObLWSxCr7Hvk08PhOzDZzM9p.jpg",
    alt: "Luxury restroom trailer exterior in Lansing Michigan",
    category: "Exterior",
  },
  {
    id: "2",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03504-zEWBCoaFRmOx3fWQJRxsUNKyS1RLSU.jpg",
    alt: "Modern vanity station with succulent artwork inside restroom trailer",
    category: "Interior",
  },
  {
    id: "3",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2008_40_17%20PM-NL7i7EeHuiHMOi8dyFMfz0jREjM8m8.png",
    alt: "Wedding restroom trailer rental setup in Mid-Michigan",
    category: "Weddings",
  },
  {
    id: "4",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03430-tFWoDUOQcCiO6n1GbK4NfiTkB8gEbx.jpg",
    alt: "Modern vanity station inside luxury restroom trailer",
    category: "Interior",
  },
  {
    id: "5",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03520-SllxtiCxRUBTroLepm40y033UcPvDf.jpg",
    alt: "Private flushing stall in restroom trailer",
    category: "Interior",
  },
  {
    id: "6",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Apr%2024%2C%202026%2C%2010_08_32%20PM-R6Ta7a6rys9yAckLBuJnKBPnAZ4mRl.png",
    alt: "Mobile restroom trailer for outdoor events Michigan",
    category: "Exterior",
  },
  {
    id: "7",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f8c856e0-44a2-4c9a-990c-09e671fee136-VkgBsnTDKck69SOzLmlIYiSb3zZeAS.png",
    alt: "Restroom trailer setup at private estate wedding",
    category: "Weddings",
  },
  {
    id: "8",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_05_24%20PM-syeWtXVuOA1VbMKhN5WOX5kX6LczSq.png",
    alt: "Corporate gala event restroom trailer rental",
    category: "Events",
  },
  {
    id: "9",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Feb%2010%2C%202026%2C%2009_22_04%20PM-0pHz7fSqklvOSoLzCnYIMT8fp3gRoJ.png",
    alt: "Luxury restroom trailer at poolside reception",
    category: "Events",
  },
  {
    id: "10",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03401-zJLPWwUHkUivbGQTOGaiePJW9U8rli.jpg",
    alt: "Men's restroom interior with urinal and toilet",
    category: "Interior",
  },
  {
    id: "11",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_56_46%20PM-H2xCmMMND6AksTZG4HA9OHuDL07tY3.png",
    alt: "Festival restroom trailer rental Michigan",
    category: "Events",
  },
  {
    id: "12",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_19_19%20PM-flItPBW2CyM2JXe8YJpcXdcdJRxIOb.png",
    alt: "Climate controlled restroom trailer evening event",
    category: "Exterior",
  },
  {
    id: "13",
    src: "/images/3 Station Pro/3Station.jpg",
    alt: "3 Station Pro luxury restroom trailer exterior view",
    category: "3 Station",
  },
  {
    id: "14",
    src: "/images/3 Station Pro/3Station1.jpg",
    alt: "3 Station Pro restroom interior with modern fixtures",
    category: "3 Station",
  },
  {
    id: "15",
    src: "/images/3 Station Pro/3Station2.jpg",
    alt: "3 Station Pro vanity station and amenities",
    category: "3 Station",
  },
  {
    id: "16",
    src: "/images/3 Station Pro/3Station3.jpg",
    alt: "3 Station Pro private flushing stalls",
    category: "3 Station",
  },
  {
    id: "17",
    src: "/images/3 Station Pro/3Station4.jpg",
    alt: "3 Station Pro climate control and lighting",
    category: "3 Station",
  },
  {
    id: "18",
    src: "/images/3 Station Pro/3Station5.jpg",
    alt: "3 Station Pro restroom trailer setup",
    category: "3 Station",
  },
  {
    id: "19",
    src: "/images/3 Station Pro/3Station5.webp",
    alt: "3 Station Pro luxury restroom features",
    category: "3 Station",
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

        {/* 3 Station Pro Section */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm font-medium uppercase tracking-widest text-gold">
                3 Station Pro
              </span>
              <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">
                Premium 3-Station Restroom Trailer
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our flagship 3-station restroom trailer offers the ultimate in luxury and convenience,
                featuring climate control, modern fixtures, and spacious interiors perfect for larger events.
              </p>
            </div>
            <GalleryGrid
              images={galleryImages.filter((img) => img.category === "3 Station")}
              columns={3}
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
