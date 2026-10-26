# Universal Design Principles

## 1. Strategic hierarchy

A page should communicate, in order:

1. Where the user is
2. What the organization offers or enables
3. Why it is relevant to this user
4. What evidence supports the claim
5. What the user can do next

Use contrast, scale, grouping, position, whitespace, and repetition to create this order. Limit simultaneous high-emphasis elements. When every heading, badge, image, and button demands attention, the hierarchy has failed.

### Type scale

Use a role-based fluid scale rather than arbitrary sizes:

- Body: `clamp(1rem, 0.96rem + 0.2vw, 1.125rem)`
- Small/supporting: 0.8125–0.9375rem, never as a substitute for hierarchy
- H3: roughly 1.25–1.6 times body
- H2: roughly 1.75–2.5 times body
- H1: roughly 2.4–4.5 times body, constrained by content and viewport

These are starting ranges, not a mandate. Editorial brands may use larger display contrast. Dense professional or transactional pages may use a tighter scale.

### Reading measures

- Long-form body copy: usually 45–75 characters per line
- Supporting copy: shorter when adjacent to imagery or controls
- Line height: normally 1.45–1.7 for body text
- Paragraph spacing should make scanning easier without fragmenting related ideas
- Avoid center-aligned multi-sentence paragraphs

## 2. Typography

Select type according to voice, reading task, available weights, language support, performance, and rendering quality.

- Use one family when the brand benefits from coherence or the performance budget is tight.
- Use two families when display and reading roles need meaningful contrast.
- Three families require a documented reason and usually create unnecessary payload and inconsistency.
- Expressive display faces fit campaigns, sports, fashion, arts, and editorial storytelling when limited to short text.
- Conservative text faces fit legal, financial, medical-adjacent, institutional, and complex informational pages.
- Do not use an “industry font” as a shortcut. Construction does not require condensed stencil type; nonprofits do not require friendly geometric sans type.

Headline wrapping is part of the composition. At supported widths, prominent text should not leave isolated characters, punctuation, awkward word fragments, extremely short final lines, or avoidable one-word orphans. When wrapping fails despite available space, adjust layout allocation and measure before reducing type size. Manual breaks are art-direction decisions and must remain effective across viewports.

## 3. Color system

Define semantic roles, not a loose swatch list:

- Canvas and alternate canvas
- Primary text and muted text
- Border and divider
- Brand primary and secondary
- Action primary, hover, active, focus
- Success, warning, error, information
- Image overlay and scrim

Meet WCAG contrast in every actual state. Do not assume a brand color is suitable for body text or buttons.

Use gradients only when they support a brand concept, spatial transition, data meaning, light behavior, or deliberate campaign energy. Avoid them as an automatic method of making a plain layout appear designed.

Dark interfaces are appropriate when media, atmosphere, premium positioning, performance dashboards, or event energy benefit from them. They require careful text contrast, image treatment, focus styling, and avoidance of large regions of pure white text on pure black.

## 4. Layout

Consistency is not sameness. Build consistency through typography, color, spacing systems, interaction behavior, imagery treatment, iconography, and brand voice. Vary composition, scale, density, alignment, section height, media placement, whitespace, content hierarchy, interaction, and sequencing when those changes clarify the page narrative.

Use an intrinsic layout system:

- Page gutters: fluid, with a minimum appropriate for 320–390px screens
- Content containers: choose widths by content role, not one global maximum
- Reading container: narrow
- Standard content container: medium
- Gallery or data container: wide
- Full-bleed media: deliberate and bounded by cropping rules

Vary composition with:

- Editorial split layouts
- Offset image and text
- Full-width documentary sequences
- Timelines
- Comparison tables
- Sticky contextual summaries
- Step-based flows
- Alternating density
- Bands and dividers
- Lists with strong typographic hierarchy
- Data-led proof sections
- Product grids when product comparison is the task

Asymmetry is useful when it guides sequence, creates tension appropriate to the brand, or allows media to carry meaning. It is harmful when it disrupts reading order or produces awkward mobile reflow.

Negative space must frame, separate, emphasize, or create intentional rhythm. In heroes and split layouts, judge text and media as one composition: coordinate their start positions, heights, visual centers, focal points, and relationship to the fold. Viewport-height sizing, excessive padding, bottom alignment, or hard-coded offsets must not manufacture unexplained dead space.

Use `research/section-composition-patterns.md` for a content-driven composition vocabulary. The archetypes are not templates or a requirement to maximize variety.

## 5. Card decision test

Use a card only when all are true:

1. The item is a distinct object.
2. Users benefit from scanning or comparing multiple objects.
3. The item may have its own action or destination.
4. The boundary improves comprehension.

Do not use cards merely to place text on a tinted background. Alternatives include ruled lists, editorial rows, icon-free feature statements, definition lists, tabular comparisons, timelines, and full-bleed storytelling.

## 6. Images

### Selection

Prioritize authentic photographs of people, work, place, products, and outcomes. A technically imperfect real project image can be more credible than polished generic stock.

Reject stock imagery that:

- Depicts implausible teams or staged emotions
- Conflicts with the client’s geography or audience
- Uses familiar, widely repeated compositions
- Suggests services, facilities, diversity, outcomes, or scale the client has not verified

AI imagery must not represent a synthetic person as an actual employee, beneficiary, customer, athlete, project, product, or location. Record its use and review for artifacts, bias, legal risk, and brand credibility.

### Implementation

- Define aspect ratios and focal points.
- Use `srcset`, `sizes`, and `<picture>` when art direction differs by viewport.
- Set intrinsic width and height to prevent layout shifts.
- Prefer AVIF or WebP with suitable fallback.
- Do not lazy-load the LCP image.
- Lazy-load below-the-fold images.
- Write alt text according to purpose, not by mechanically describing pixels.
- Use empty alt text for decorative images.

## 7. Motion

Motion must explain state, hierarchy, causality, continuity, or brand character.

Recommended:

- Immediate hover and pressed feedback
- Short state transitions
- Controlled entrance motion for a small number of meaningful elements
- Progress and status feedback
- Reduced-motion variants

Avoid:

- Animating every section on scroll
- Parallax that disrupts reading
- Long easing that delays interaction
- Autoplay motion competing with primary content
- Layout-triggering animations
- Movement that hides content until JavaScript runs

## 8. Responsive composition

Design mobile from user priorities:

- Reorder only when semantic and keyboard order remain logical.
- Replace wide comparisons with disclosure, scroll regions with labels, or prioritized summaries.
- Preserve key context near controls.
- Re-crop imagery, do not simply shrink it.
- Prevent headings from producing isolated characters, punctuation-only lines, broken fragments, extremely short final lines, or avoidable one-word orphans.
- Keep primary actions reachable without persistent overlays covering content.
- Validate landscape, text zoom, and 320px reflow in addition to named screenshots.
- Preserve the desktop composition's design idea rather than merely stacking columns. Use priority, scale, inset, crop, sequence, or accessible scrolling to carry the hierarchy into mobile.

## 9. Content density and section rhythm

Alternate intensity deliberately. A dense proof or product section may need a quieter explanation afterward. Do not use identical padding on every section. Rhythm can come from changes in column count, measure, background, alignment, media scale, border treatment, and content type, not decorative blobs.

Component reuse and visual consistency are not the same as repeating the same composition. Reuse tokens and primitives aggressively. Reuse major section compositions only when the content relationship genuinely calls for the same structure. A design system should constrain visual language without forcing every page into the same sentence structure.

## 10. Decision record

For each major choice, record:

- Decision
- Evidence or constraint
- Alternatives considered
- Accessibility and performance effects
- Tradeoff
- Validation method
