# Accessibility Standards

Default target: WCAG 2.2 Level AA.

## Planning requirements

- Identify audience-specific access needs, languages, reading levels, media alternatives, and assistive-technology scenarios.
- Include accessibility risks in every page specification.
- Do not select an art direction that depends on low contrast, motion, tiny type, image-only text, hover-only disclosure, or pointer precision.

## Semantic structure

- Use one `main` landmark.
- Provide skip navigation.
- Label multiple navigation regions.
- Use headings to describe content structure, not to obtain a visual size.
- Use lists, tables, figures, captions, addresses, and definition lists where semantically appropriate.
- Prefer native buttons, links, inputs, details/summary, and dialogs.

## Keyboard and focus

- All functionality is keyboard operable.
- Focus order follows meaning.
- Focus is visible and not obscured by sticky UI.
- Dialogs receive focus, contain focus appropriately, have a labelled close mechanism, and restore focus.
- Menus disclose predictably and do not trap focus.
- Drag operations provide a non-drag alternative.

## Contrast and text

- Normal text: at least 4.5:1.
- Qualifying large text: at least 3:1.
- UI components and meaningful graphics: at least 3:1 against adjacent colors.
- Support 200% text resize and 400% zoom/reflow without loss of content or function.
- Do not encode status using color alone.
- Preserve readability when users override text spacing.

## Touch and pointer

WCAG 2.2’s minimum target criterion is not a blanket 44px rule, but this system uses a practical default of 44 by 44 CSS pixels for primary interactive targets where layout allows. Maintain sufficient spacing and provide alternatives for small inline targets.

## Forms

- Persistent visible labels
- Programmatic instructions and autocomplete purposes
- Clear required-state communication
- Errors identified in text and associated with controls
- Error summary linked to fields for long forms
- Suggestions when known
- Confirmation before consequential legal, financial, or data submission
- No placeholder-only labels

## Media and images

- Purpose-based alt text
- Empty alt for decorative images
- Captions for prerecorded synchronized media
- Transcripts for audio and useful video alternatives
- No text baked into images when equivalent HTML text is possible

## Motion

- Respect `prefers-reduced-motion`.
- Remove nonessential parallax, zoom, autoplay, and entrance effects.
- Do not flash content above thresholds.
- Pause, stop, or hide moving content that starts automatically and persists.

## High-risk trends

- Low-contrast neutral-on-neutral palettes
- Text over uncontrolled photography
- Glassmorphism
- Hover-only navigation
- Carousels without pause and controls
- Custom cursor or pointer-dependent interactions
- Horizontal scrolling used for essential content
- Extremely thin fonts
- Animated text that changes reading order
- Placeholder-only forms
- Sticky mobile CTAs that obscure content
- Scroll-jacking and parallax
