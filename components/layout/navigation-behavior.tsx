"use client"

import { useEffect } from "react"

/** Dismiss the public navigation without adding state to server-rendered links. */
export function NavigationBehavior() {
  useEffect(() => {
    const disclosures = Array.from(document.querySelectorAll<HTMLDetailsElement>(".estate-nav-disclosure"))
    const onToggle = (event: Event) => {
      const active = event.currentTarget as HTMLDetailsElement
      if (active.open) disclosures.forEach((other) => { if (other !== active) other.open = false })
    }
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return
      const target = event.target
      disclosures.forEach((item) => { if (!item.contains(target)) item.open = false })
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      disclosures.forEach((item) => {
        if (!item.open) return
        item.open = false
        item.querySelector("summary")?.focus()
      })
    }
    disclosures.forEach((item) => item.addEventListener("toggle", onToggle))
    document.addEventListener("click", onClick)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      disclosures.forEach((item) => item.removeEventListener("toggle", onToggle))
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])
  return null
}
