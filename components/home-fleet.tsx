import Link from "next/link"
import Image from "next/image"
import { Users, CheckCircle } from "lucide-react"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"

export function HomeFleet() {
 return (
        <section id="homepage-fleet" className="home-fleet py-20 md:py-28 bg-cream" aria-label="Compare restroom trailers">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Our Fleet"
              title="Choose the Perfect Trailer for Your Event"
              description="We offer 2-station, 3-station, and 4-station configurations to accommodate events of all sizes."
            />
            
            <div className="home-fleet-grid">
            {/* 2-Station Trailer */}
            <div className="home-fleet-option">
              <div className="home-fleet-option-layout">
                <div className="order-1 lg:order-1">
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2Stattion-ZzVBLsh7CDCrCrvb4zy74VpKu6WLfM.jpg"
                      alt="2-Station trailer exterior"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      quality={78}
                      sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1099px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
                    <Link
                      href="/luxury-restroom-trailer-rentals#interior-details"
                      className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      View interior &amp; exterior gallery
                    </Link>
                  </div>
                </div>
                <div className="order-2 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/10 rounded-full mb-4">
                    <Users aria-hidden="true" className="h-5 w-5 text-navy" />
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
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      1 Women&apos;s Room
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      1 Men&apos;s Room
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      Climate Controlled
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      Fresh Water System
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                      <Link href="/luxury-restroom-trailer-rentals#2-station" aria-label="View 2-station trailer details">View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Station Trailer */}
            <div className="home-fleet-option">
              <div className="home-fleet-option-layout">
                <div className="order-1 lg:order-2">
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="/images/3 Station Pro/3Station.jpg"
                      alt="3-Station trailer exterior"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      quality={78}
                      sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1099px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
                    <Link
                      href="/luxury-restroom-trailer-rentals#interior-details"
                      className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      View interior &amp; exterior gallery
                    </Link>
                  </div>
                </div>
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/10 rounded-full mb-4">
                    <Users aria-hidden="true" className="h-5 w-5 text-navy" />
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
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      1 Women&apos;s Room
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      2 Men&apos;s Rooms
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      Climate Controlled
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      Premium Amenities
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                      <Link href="/luxury-restroom-trailer-rentals#3-station" aria-label="View 3-station trailer details">View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Station Trailer */}
            <div className="home-fleet-option">
              <div className="home-fleet-option-layout">
                <div>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4Stattion-reeAizT4CMrw1A2cNJMJrJzkCyVzvD.jpg"
                      alt="4-Station trailer exterior"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      quality={78}
                      sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1099px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
                    <Link
                      href="/luxury-restroom-trailer-rentals#interior-details"
                      className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      View interior &amp; exterior gallery
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy/10 rounded-full mb-4">
                    <Users aria-hidden="true" className="h-5 w-5 text-navy" />
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
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      2 Women&apos;s Rooms
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      2 Men&apos;s Rooms
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      Climate Controlled
                    </li>
                    <li className="flex items-center gap-2 text-base text-charcoal">
                      <CheckCircle aria-hidden="true" className="h-5 w-5 text-navy shrink-0" />
                      High Capacity Events
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                      <Link href="/luxury-restroom-trailer-rentals#4-station" aria-label="View 4-station trailer details">View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

 )
}
