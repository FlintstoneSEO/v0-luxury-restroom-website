"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import type { NavigationItem } from "@/components/layout/header"

function isCurrentPath(pathname: string, href: string) {
  if (href === "#" || !href.startsWith("/")) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function ActiveNavigation({ navigation }: { navigation: NavigationItem[] }) {
  const pathname = usePathname() ?? "/"

  return (
    <nav className="estate-desktop-nav" aria-label="Primary navigation">
      {navigation.map((item) => {
        const activeChild = item.children?.some((child) => isCurrentPath(pathname, child.href)) ?? false

        return item.children ? (
          <details key={item.label} className="estate-nav-disclosure">
            <summary aria-current={activeChild ? "page" : undefined}>
              {item.label}<ChevronDown aria-hidden="true" className="h-3 w-3" />
            </summary>
            <div className="estate-dropdown">
              {item.children.map((child) => {
                const active = isCurrentPath(pathname, child.href)
                return <Link key={child.href} href={child.href} aria-current={active ? "page" : undefined} className={active ? "estate-nav-active" : undefined}>{child.label}</Link>
              })}
            </div>
          </details>
        ) : (
          <Link key={item.href} href={item.href} aria-current={isCurrentPath(pathname, item.href) ? "page" : undefined} className={isCurrentPath(pathname, item.href) ? "estate-nav-active" : undefined}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
