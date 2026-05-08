"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Start Here", href: "/start-here" },
  { name: "Luxury Restroom Trailers", href: "/luxury-restroom-trailer-rentals" },
  {
    name: "Event Types",
    href: "#",
    children: [
      { name: "Weddings", href: "/wedding-restroom-trailer-rentals" },
      { name: "Private Events", href: "/private-event-restroom-trailers" },
      { name: "Construction / Long-Term", href: "/construction-long-term-restroom-trailer-rentals" },
      { name: "Emergency / Disaster Relief", href: "/emergency-disaster-relief-restroom-trailers" },
    ],
  },
  { name: "Service Areas", href: "/service-areas" },
  { name: "Gallery", href: "/gallery" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
]

const leftNavigation = navigation.slice(0, 4)
const rightNavigation = navigation.slice(4)

function DesktopNavItems({ items }: { items: typeof navigation }) {
  return (
    <>
      {items.map((item) =>
        item.children ? (
          <DropdownMenu key={item.name}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-2 text-base font-medium text-charcoal hover:text-navy transition-colors">
                {item.name}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.name} asChild>
                  <Link href={child.href} className="w-full cursor-pointer">
                    {child.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            key={item.name}
            href={item.href}
            className="px-3 py-2 text-base font-medium text-charcoal hover:text-navy transition-colors"
          >
            {item.name}
          </Link>
        )
      )}
    </>
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 lg:px-8 relative">
        <div className="lg:hidden w-10" />

        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:w-full lg:gap-4">
          <nav className="flex items-center justify-start gap-1">
            <DesktopNavItems items={leftNavigation} />
          </nav>

          <Link href="/" className="flex items-center justify-center px-4">
            <Image
              src="/images/logo.png"
              alt="Signature Luxe Events & Amenities - Luxury Restroom Trailer Rentals in Lansing, MI"
              width={300}
              height={98}
              className="h-20 w-auto max-w-[320px]"
              priority
            />
          </Link>

          <div className="flex items-center justify-end gap-2">
            <nav className="flex items-center gap-1">
              <DesktopNavItems items={rightNavigation} />
            </nav>
            <Button asChild className="ml-2 bg-navy hover:bg-navy/90 text-white">
              <Link href="/request-quote">Check Availability</Link>
            </Button>
          </div>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden flex items-center"
        >
          <Image
            src="/images/logo.png"
            alt="Signature Luxe Events & Amenities - Luxury Restroom Trailer Rentals in Lansing, MI"
            width={260}
            height={85}
            className="h-[4.5rem] w-auto max-w-[260px]"
            priority
          />
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <div className="lg:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="right" className="w-full max-w-sm bg-white p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <Image
                  src="/images/logo.png"
                  alt="Signature Luxe Events & Amenities"
                  width={170}
                  height={52}
                  className="h-12 w-auto"
                />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.name} className="py-2">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.name}
                      </span>
                      <div className="mt-2 flex flex-col gap-1 pl-4">
                        {item.children.map((child) => (
                          <SheetClose key={child.name} asChild>
                            <Link
                              href={child.href}
                              className="py-2 text-charcoal hover:text-navy transition-colors"
                            >
                              {child.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <SheetClose key={item.name} asChild>
                      <Link
                        href={item.href}
                        className="py-3 text-charcoal hover:text-navy transition-colors border-b border-border/50"
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  )
                )}
              </nav>
              <div className="p-4 border-t">
                <SheetClose asChild>
                  <Button asChild className="w-full bg-navy hover:bg-navy/90 text-white">
                    <Link href="/request-quote">Check Availability</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
