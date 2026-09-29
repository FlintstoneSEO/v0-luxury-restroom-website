# Performance Standards

## User-experience targets

At the 75th percentile of real visits:

- LCP ≤ 2.5 seconds
- INP ≤ 200 milliseconds
- CLS ≤ 0.1

Lighthouse is a laboratory diagnostic. It cannot replace field measurement, and Total Blocking Time is only a lab proxy for interaction responsiveness.

## Design-stage controls

- Identify the likely LCP element in the page specification.
- Define image aspect ratios and responsive sources.
- Limit font families, weights, and character sets.
- Avoid autoplay background video by default.
- Challenge carousels, animation libraries, chat widgets, maps, social embeds, and marketing tags.
- Reserve dimensions for media, embeds, ads, and injected UI.

## Recommended initial budgets

Budgets are engineering guardrails, not universal guarantees. Measure compressed transfer on a representative primary route.

| Site type | Initial JS | Initial CSS | Initial images | Fonts | Third-party |
|---|---:|---:|---:|---:|---:|
| Local business | ≤ 120 KB | ≤ 70 KB | ≤ 700 KB | ≤ 120 KB | ≤ 100 KB |
| Nonprofit | ≤ 150 KB | ≤ 80 KB | ≤ 900 KB | ≤ 150 KB | ≤ 150 KB |
| Sports/media-heavy | ≤ 180 KB | ≤ 90 KB | ≤ 1.2 MB | ≤ 150 KB | ≤ 180 KB |
| E-commerce | ≤ 220 KB | ≤ 100 KB | ≤ 1.3 MB | ≤ 160 KB | ≤ 250 KB |

Values are compressed transfer targets for initial load. Lazy-loaded galleries are separate but still require total-page discipline.

## Images

- AVIF/WebP where supported and visually suitable
- `srcset` and `sizes`
- Correct intrinsic dimensions
- Aggressive but visually reviewed compression
- No lazy loading on the LCP image
- Lazy load offscreen media
- Preload only the true LCP asset when evidence supports it
- Use mobile art direction when desktop crops waste bytes or meaning

## Fonts

- Prefer system fonts or a small self-hosted subset when appropriate.
- Use WOFF2.
- Load only required weights/styles.
- Consider variable fonts only when the single variable file beats the static set.
- Use `font-display` deliberately.
- Preload only critical fonts.
- Avoid using icon fonts.

## JavaScript and hydration

- Render static content as HTML.
- Hydrate only interactive islands.
- Avoid global client state for simple content pages.
- Split heavy widgets by route and interaction.
- Remove unused libraries and duplicate utilities.
- Audit long tasks and event handlers.
- Delay nonessential third-party scripts until consent or interaction where appropriate.

## Animation

Prefer transform and opacity. Limit simultaneous effects. Disable or simplify effects for reduced motion and lower-powered devices.

## Release gate

- Performance budget passes in CI for representative routes.
- No severe regression from the agreed baseline.
- LCP asset and request chain are understood.
- CLS sources are eliminated or documented.
- Main-thread blocking scripts are attributed.
- Third-party scripts have an owner and business purpose.
