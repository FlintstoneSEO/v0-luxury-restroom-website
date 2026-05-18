"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"


export function HomeHero({ heroImage }: { heroImage: { src: string; alt: string; unoptimized?: boolean } }) {
  const handleScrollToNextSection = () => {
    const nextSection =
      document.querySelector<HTMLElement>("[data-home-next-section]") ||
      document.querySelector<HTMLElement>("main section:nth-of-type(2)") ||
      document.querySelector<HTMLElement>("#after-hero")

    nextSection?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden md:items-end">
      {/* Background Image Container */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 md:inset-x-[-6%] md:inset-y-[-10%]">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            unoptimized={heroImage.unoptimized}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center motion-safe:md:animate-hero-ken-burns motion-reduce:scale-100 motion-reduce:animate-none"
          />
        </div>

        {/* Bottom-heavy gradient - keeps top of image visible, darkens bottom for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a36]/95 via-[#1f2a36]/50 via-40% to-transparent" />
        
        {/* Subtle side vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f2a36]/30 via-transparent to-[#1f2a36]/30" />

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 bottom-1/3 h-[28rem] w-[28rem] rounded-full bg-[#DED2C4]/20 blur-3xl motion-safe:md:animate-gold-pulse motion-reduce:animate-none" />
      </div>

      {/* Content - elevated on mobile, anchored lower again on desktop */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 pb-16 pt-28 md:pb-28 md:pt-40 lg:px-8">
          <div className="max-w-2xl motion-safe:animate-hero-enter motion-reduce:animate-none">
            <span className="mb-4 inline-block rounded-full border border-[#DED2C4]/40 bg-[#DED2C4]/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#f4ece2] backdrop-blur-sm">
              Luxury Restroom Trailer Rentals
            </span>
            
            <h1 className="text-balance font-serif text-3xl font-semibold leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
              Luxury Restroom Trailer Rentals in Lansing, MI
            </h1>
            
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/90 drop-shadow-md md:text-lg">
              Clean, modern, climate-controlled restroom trailers for weddings, private parties, corporate events, construction sites, and more throughout Lansing and Mid-Michigan.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group bg-[#DED2C4] px-8 font-semibold text-[#2D3A47] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8dfd4] hover:shadow-[0_14px_26px_rgba(222,210,196,0.35)]"
              >
                <Link href="/request-availability">
                  Request Availability
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/50 bg-white px-8 font-medium text-[#2D3A47] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
              >
                <Link href="/luxury-restroom-trailer-rentals">View Our Restrooms</Link>
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4 text-[#DED2C4]" />
              Based in Lansing, MI. Serving Mid-Michigan within a 2-hour radius.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        aria-label="Scroll to next section"
        onClick={handleScrollToNextSection}
        className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 cursor-pointer rounded-full outline-none transition-transform motion-safe:animate-[bounce-subtle_2s_ease-in-out_infinite] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#DED2C4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2D3A47] pointer-events-auto motion-reduce:animate-none"
      >
        <div className="flex h-12 w-8 justify-center rounded-full border border-white/45 bg-white/10 pt-2 backdrop-blur-sm overflow-hidden">
          <div className="h-3 w-1.5 rounded-full bg-[#DED2C4] motion-safe:animate-scroll-wheel motion-reduce:animate-none" />
        </div>
      </button>
    </section>
  )
}
