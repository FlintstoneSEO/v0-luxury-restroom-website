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
import navigationContent from "@/content/site/navigation.json"

export type NavigationItem = {
  label: string
  href: string
  children?: Array<{ label: string; href: string }>
}


function DesktopNavItems({ items }: { items: NavigationItem[] }) {
  return (
    <>
      {items.map((item) =>
        item.children ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 whitespace-nowrap px-2 py-2 text-sm font-medium text-charcoal hover:text-navy transition-colors xl:px-3 2xl:text-base">
                {item.label}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.label} asChild>
                  <Link href={child.href} className="w-full cursor-pointer">
                    {child.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className="whitespace-nowrap px-2 py-2 text-sm font-medium text-charcoal hover:text-navy transition-colors xl:px-3 2xl:text-base"
          >
            {item.label}
          </Link>
        )
      )}
    </>
  )
}

export function Header() {
  const { primary: navigation, cta, logo } = navigationContent
  const leftNavigation = navigation.slice(0, 4)
  const rightNavigation = navigation.slice(4)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto relative flex h-24 items-center justify-between px-4 lg:px-8">
        <div className="w-10 xl:hidden" />

        <div className="hidden xl:grid xl:w-full xl:grid-cols-[1fr_auto_1fr] xl:items-center xl:gap-4">
          <nav className="flex items-center justify-start gap-1">
            <DesktopNavItems items={leftNavigation} />
          </nav>

          <Link href="/" className="flex items-center justify-center px-4">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={300}
              height={98}
              className="h-24 w-auto max-w-[320px]"
            />
          </Link>

          <div className="flex items-center justify-end gap-2">
            <nav className="flex items-center gap-1">
              <DesktopNavItems items={rightNavigation} />
            </nav>
            <Button asChild className="ml-2 whitespace-nowrap bg-navy text-white hover:bg-navy/90">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center xl:hidden"
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={260}
            height={85}
            className="h-[4.5rem] w-auto max-w-[260px]"
          />
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <div className="xl:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="right" className="w-full max-w-sm bg-white p-0">
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center justify-center p-6 border-b relative">
                <SheetClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Close menu"
                    className="absolute top-4 right-4"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={240}
                  height={78}
                  className="h-20 w-auto"
                />
              </div>
              <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.label} className="py-2">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </span>
                      <div className="mt-2 flex flex-col gap-1 pl-4">
                        {item.children.map((child) => (
                          <SheetClose key={child.label} asChild>
                            <Link
                              href={child.href}
                              className="py-2 text-charcoal hover:text-navy transition-colors"
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <SheetClose key={item.label} asChild>
                      <Link
                        href={item.href}
                        className="py-3 text-charcoal hover:text-navy transition-colors border-b border-border/50"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                )}
              </nav>
              <div className="p-4 border-t">
                <SheetClose asChild>
                  <Button asChild className="w-full bg-navy hover:bg-navy/90 text-white">
                    <Link href={cta.href}>{cta.label}</Link>
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
