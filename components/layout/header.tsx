import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { NavigationBehavior } from "@/components/layout/navigation-behavior"
import navigationContent from "@/content/site/navigation.json"

export type NavigationItem = {
  label: string
  href: string
  children?: Array<{ label: string; href: string }>
}

export function Header() {
  const { primary: navigation, cta, logo } = navigationContent
  return (
    <header className="estate-shell estate-header">
      <NavigationBehavior />
      <a className="estate-skip-link" href="#public-content">Skip to content</a>
      <div className="estate-header-inner">
        <Link href="/" className="estate-logo" aria-label="Signature Luxe home">
          <Image src={logo.src} alt={logo.alt} width={300} height={132} sizes="(max-width: 640px) 170px, 210px" />
        </Link>
        <nav className="estate-desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => item.children ? (
            <details key={item.label} className="estate-nav-disclosure">
              <summary>{item.label}<ChevronDown aria-hidden="true" className="h-3 w-3" /></summary>
              <div className="estate-dropdown">
                {item.children.map((child) => <Link key={child.href} href={child.href}>{child.label}</Link>)}
              </div>
            </details>
          ) : <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="estate-header-actions">
          <Button asChild className="estate-header-cta bg-navy text-white hover:bg-navy/90"><Link href={cta.href}>{cta.label}</Link></Button>
          <MobileNavigation navigation={navigation} cta={cta} logo={logo} />
        </div>
      </div>
    </header>
  )
}
