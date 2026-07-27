"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { NavigationItem } from "@/components/layout/header"

type MobileNavigationProps = {
  navigation: NavigationItem[]
  cta: { label: string; href: string }
  logo: { src: string; alt: string }
}

export function MobileNavigation({ navigation, cta, logo }: MobileNavigationProps) {
  return (
    <Sheet>
      <div className="xl:hidden">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="right" className="w-full max-w-sm bg-white p-0">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-center border-b p-6">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={240}
              height={78}
              className="h-20 w-auto"
              sizes="240px"
            />
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.label} className="py-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="mt-2 flex flex-col gap-1 pl-4">
                    {item.children.map((child) => (
                      <SheetClose key={child.label} asChild>
                        <Link
                          href={child.href}
                          className="py-2 text-charcoal transition-colors hover:text-navy"
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
                    className="border-b border-border/50 py-3 text-charcoal transition-colors hover:text-navy"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              )
            )}
          </nav>
          <div className="border-t p-4">
            <SheetClose asChild>
              <Button asChild className="w-full bg-navy text-white hover:bg-navy/90">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
