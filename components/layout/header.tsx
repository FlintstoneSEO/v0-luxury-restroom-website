import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
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
          <details key={item.label} className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap px-2 py-2 text-sm font-medium text-charcoal transition-colors hover:text-navy focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 xl:px-3 2xl:text-base [&::-webkit-details-marker]:hidden">
                {item.label}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 rounded-md border border-border bg-white p-1 shadow-lg">
              {item.children.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="block w-full rounded-sm px-2 py-1.5 text-sm text-charcoal outline-none transition-colors hover:bg-cream hover:text-navy focus-visible:bg-cream"
                  >
                    {child.label}
                  </Link>
              ))}
            </div>
          </details>
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
              sizes="300px"
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
            sizes="260px"
          />
        </Link>

        <MobileNavigation navigation={navigation} cta={cta} logo={logo} />
      </div>
    </header>
  )
}
