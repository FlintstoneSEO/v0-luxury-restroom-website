"use client"

import { useId, useState } from "react"
import Image from "next/image"
import type { HomepageContent } from "@/lib/content/schemas"
import "./day-night-scene.css"

export function DayNightScene({ content }: { content: NonNullable<HomepageContent["dayNight"]> }) {
  const [selected, setSelected] = useState<"day" | "night">("day")
  const id = useId()
  const active = content[selected]

  return (
    <section className="day-night-scene" aria-labelledby={`${id}-heading`}>
      <div className="day-night-intro">
        <div>
          <h2 id={`${id}-heading`}>{content.heading}</h2>
          <p>{content.body}</p>
        </div>
        <div className="day-night-controls" role="group" aria-label={content.heading}>
          {(["day", "night"] as const).map((view) => (
            <button key={view} type="button" aria-pressed={selected === view}
              aria-controls={`${id}-photo`} onClick={() => setSelected(view)}>
              {content[view].label}
            </button>
          ))}
        </div>
      </div>
      <figure id={`${id}-photo`}>
        <div className="day-night-images">
          {(["day", "night"] as const).map((view) => (
            <Image key={view} src={content[view].src}
              alt={selected === view ? content[view].alt : ""}
              aria-hidden={selected !== view} fill quality={78}
              sizes="(max-width: 1440px) 100vw, 1440px"
              className={selected === view ? "is-visible" : ""} />
          ))}
        </div>
        <figcaption aria-live="polite" aria-atomic="true">{active.caption}</figcaption>
      </figure>
    </section>
  )
}
