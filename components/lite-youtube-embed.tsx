"use client"

import Image from "next/image"
import { useState } from "react"
import { Play } from "lucide-react"

interface LiteYouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
}

export function LiteYouTubeEmbed({ videoId, title, className }: LiteYouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className={className}>
      {isPlaying ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          type="button"
          aria-label={`Play video: ${title}`}
          onClick={() => setIsPlaying(true)}
          className="group relative h-full w-full overflow-hidden bg-charcoal text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/70"
        >
          <Image
            src={thumbnail}
            alt="Video thumbnail for 3-Station Luxury Restroom Trailer Walkthrough"
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent transition-colors group-hover:from-charcoal/60" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-navy shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-9 w-9 fill-current" aria-hidden="true" />
          </span>
          <span className="absolute bottom-5 left-5 right-5 text-base font-semibold text-white drop-shadow md:text-lg">
            Watch the 3-station trailer walkthrough
          </span>
        </button>
      )}
    </div>
  )
}
