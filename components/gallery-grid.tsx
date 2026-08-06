"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"

interface GalleryImage {
  id: string
  src: string
  alt: string
  category?: string
}

interface GalleryGridProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
  className?: string
}

export function GalleryGrid({
  images,
  columns = 3,
  className,
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <>
      <div className={cn("grid gap-4", columnClasses[columns], className)}>
        {images.map((image) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setSelectedImage(image)}
            aria-label={`View larger image: ${image.alt}`}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {image.category && (
              <span className="absolute top-3 left-3 text-xs bg-white/90 text-navy px-2 py-1 rounded-full">
                {image.category}
              </span>
            )}
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent
          showCloseButton={false}
          className="h-[92dvh] w-[calc(100vw-1rem)] max-w-[96rem] gap-0 border-none bg-transparent p-0 shadow-none sm:max-w-[calc(100vw-2rem)]"
        >
          <DialogTitle className="sr-only">
            {selectedImage?.alt ?? "Gallery image preview"}
          </DialogTitle>
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-navy/95 shadow-2xl">
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close image preview"
                className="absolute right-3 top-3 z-10 bg-white/90 text-navy shadow-md hover:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy sm:right-4 sm:top-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
            {selectedImage && (
              <div className="relative h-full w-full p-2 sm:p-4">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain p-2 sm:p-4"
                  sizes="96vw"
                  priority
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
