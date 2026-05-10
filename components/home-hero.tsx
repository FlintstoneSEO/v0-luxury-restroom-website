"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const HERO_IMAGE =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_57_05%20PM-andQKOFMNL27uuWQLGIkidESuYaaAs.png"

export function HomeHero() {
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) return

    const onScroll = () => {
      setOffsetY(window.scrollY * 0.2)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-[-4%] motion-reduce:inset-0"
          style={{ transform: `translate3d(0, ${offsetY}px, 0)` }}
        >
          <Image
            src={HERO_IMAGE}
            alt="Luxury restroom trailer rental in Lansing Michigan for weddings and outdoor events"
            fill
            priority
            sizes="100vw"
            className="object-cover motion-safe:animate-hero-ken-burns motion-reduce:scale-100 motion-reduce:animate-none"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-[#1f2a36]/92 via-[#2D3A47]/78 to-[#2D3A47]/58" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a36]/88 via-transparent to-[#2D3A47]/36" />

        <div className="pointer-events-none absolute -right-20 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-[#DED2C4]/35 blur-3xl motion-safe:animate-gold-pulse motion-reduce:animate-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-28 md:py-32 lg:px-8">
        <div className="w-full max-w-3xl rounded-3xl border border-white/30 bg-white/10 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-10 motion-safe:animate-hero-enter motion-reduce:animate-none">
          <span className="mb-5 inline-block rounded-full border border-[#DED2C4]/60 bg-[#DED2C4]/20 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#f4ece2]">
            Luxury Restroom Trailer Rentals
          </span>
          <h1 className="text-balance font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Luxury Restroom Trailer Rentals in Lansing, Michigan
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/90 md:text-xl">
            Elegant, climate-controlled restroom trailers for weddings, private parties, corporate events, and special occasions across Mid-Michigan.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group bg-[#DED2C4] px-8 font-semibold text-[#2D3A47] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8dfd4] hover:shadow-[0_14px_26px_rgba(222,210,196,0.35)]"
            >
              <Link href="/request-quote">
                Request a Quote
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/45 bg-white/95 px-8 text-[#2D3A47] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
            >
              <Link href="/luxury-restroom-trailer-rentals">View Our Trailers</Link>
            </Button>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#2D3A47]/45 px-4 py-2 text-sm text-white/90">
            <MapPin className="h-4 w-4 text-[#DED2C4]" />
            Serving Lansing and surrounding Michigan communities
          </p>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 motion-safe:animate-scroll-indicator motion-reduce:animate-none">
        <div className="flex h-11 w-7 justify-center rounded-full border border-white/45 bg-white/10 pt-2 backdrop-blur-sm">
          <div className="h-3 w-1.5 rounded-full bg-[#DED2C4]" />
        </div>
      </div>
    </section>
  )
}
