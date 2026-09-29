---
name: responsive-design-review
description: Use to review rendered layouts, dense controls, and task access across mobile, tablet, and desktop widths.
---

# responsive-design-review

## Activation

Use to inspect cross-viewport composition and mobile ergonomics.

## Purpose

Verify deliberate adaptation rather than desktop stacking.

## Required inputs

- Rendered page at 375, 390, 768, 1024, 1440
- Keyboard order
- Page specification

## Workflow

1. Inspect order, wrapping, crop, controls, navigation, density, sticky UI, tables, and overflow.
2. Run the Headline Wrapping Audit at every required viewport.
3. Check 320px reflow and zoom.
4. Recommend exact breakpoint-independent fixes where possible.

## Headline Wrapping Audit

At 375, 390, 768, 1024, and 1440 pixels, inspect every H1, H2, display heading, oversized statement, major CTA label, and relevant navigation label. Check for isolated final characters, punctuation-only lines, broken word fragments, extremely short final lines, avoidable one-word orphans, headings forced to four or more lines by an unnecessarily restrictive measure, hierarchy-damaging phrase breaks, and wrapping that persists despite available horizontal space.

Classify each break as intentional editorial line breaking, unavoidable responsive wrapping, or accidental layout failure. A manual break passes only when it has an art-direction rationale and remains effective across supported viewports. Prefer remediation through grid allocation, inline size, max-width, fluid scale, type size, letter spacing, adjacent column proportions, or composition, in that order, rather than immediately shrinking the type or adding breakpoint-specific breaks.

## Automatic failures

- A prominent heading leaves a single character or punctuation fragment on its own line.
- A prominent heading contains a clearly avoidable broken word.

Apply these failures with language and viewport context; legitimate language-specific wrapping and truly unavoidable narrow-screen behavior require documented rationale rather than an automatic failure.

## Output

Viewport issue matrix with fixes and verification.

## References

- `references/responsive-checklist.md`
- `references/screenshot-review-workflow.md`

## Scripts and tools

Use repository-native tooling first. Applicable tools may include browser screenshots, Playwright, axe-core, Lighthouse, HTML validation, schema validation, link checking, and asset-budget scripts. Do not claim a test ran unless evidence was produced.

## Failure conditions

- Only desktop evidence available

## Quality checks

- [ ] No horizontal overflow
- [ ] Meaning preserved
- [ ] Touch and focus usable
- [ ] Images art-directed
- [ ] Prominent text passes the Headline Wrapping Audit at every required viewport
- [ ] Intentional, unavoidable, and accidental line breaks are distinguished with evidence

## Dependencies

- `frontend-ui-builder`

