---
name: visual-design-review
description: Use to critique rendered visual hierarchy and composition, adapted to application tasks and states.
---

# visual-design-review

## Activation

Use after a page is rendered or when screenshots are available.

## Purpose

Evaluate strategic fit, hierarchy, page rhythm, composition diversity, type, spacing, content clarity, conversion, and distinctiveness.

## Required inputs

- Full-page screenshots at required widths, including a long-page view where practical
- Page specification
- Art direction
- Project brief

## Workflow

1. Compare rendered result to strategy.
2. Inspect the full page before isolated sections. Ask whether the page has a recognizable rhythm; whether major sections have differentiated roles; whether scale, density, alignment, media behavior, and whitespace change meaningfully; and whether repetition feels intentional.
3. Test whether multiple sections could be swapped without materially changing the experience, whether the long screenshot becomes monotonous, whether the design remains distinctive without the logo or brand name, and whether the composition fits this industry and content.
4. Run the Header and Site-Shell Audit below.
5. Run the Composition Balance and Dead-Space Audit below.
6. Compare desktop and mobile composition maps to the rendered adaptations.
7. Score the rubric. Do not award a strong page-level score merely because individual sections are polished.
8. Identify viewport-specific issues using the exact issue format.
9. Prioritize remediation and re-score.

## Header and Site-Shell Audit

Inspect the header as part of the composition, not as isolated navigation chrome. Compare its structure to the selected art direction and page specification. Review brand placement, navigation hierarchy, CTA emphasis, containment, transparency or surface treatment, relationship to the hero, sticky or scroll states, density, whitespace, and mobile transformation.

Ask whether the shell could be dropped unchanged onto an unrelated project without weakening the design concept. If yes, determine whether that is an intentional neutral choice supported by usability constraints or evidence of default-template behavior.

Flag a conventional `logo left -> nav -> CTA right` shell when it lacks a project-specific rationale, when it conflicts with the selected art direction, or when its spacing and hero relationship make the overall site resemble unrelated builds. Do not penalize the pattern when it is the strongest content- and task-supported solution.

## Composition Balance and Dead-Space Audit

For every hero and major split composition, inspect top and bottom offsets, column start positions, content-block and media heights, visual center of gravity, whitespace distribution, section min-height and viewport-height use, the fold, image focal point, and dominant visual anchors. Review the columns as one composition, not as independently successful regions.

Ask: **Is this negative space actively contributing to the composition, or is it merely unused layout area?** Space should frame, separate, emphasize, or create intentional rhythm. If its purpose is unclear, require remediation or a documented art-direction rationale.

Flag unexplained dead zones; text beginning substantially below adjacent imagery; primary messaging delayed unnecessarily; imbalance caused by arbitrary offsets, bottom alignment, or independently positioned columns; artificial drama created by excessive padding or section height, including unjustified `min-height: 100vh` or `100svh`; and viewport-specific offsets that succeed at only one width. Do not penalize purposeful asymmetry or useful negative space.

## Automatic failures

- A hero contains a large unexplained dead zone caused by layout mechanics rather than art direction.
- Primary hero content is substantially delayed below adjacent media without a compositional purpose.

## Output

Scored review and actionable remediation table.

## References

- `references/design-review-rubric.md`
- `references/screenshot-review-workflow.md`

## Scripts and tools

Use repository-native tooling first. Applicable tools may include browser screenshots, Playwright, axe-core, Lighthouse, HTML validation, schema validation, link checking, and asset-budget scripts. Do not claim a test ran unless evidence was produced.

## Failure conditions

- Required screenshots missing
- Review lacks project context

## Quality checks

- [ ] No vague feedback
- [ ] Every deduction has evidence
- [ ] Automatic failures identified
- [ ] Header/site-shell architecture matches the selected art direction
- [ ] Header-to-hero relationship and mobile transformation were assessed
- [ ] Complete-page rhythm and composition diversity assessed
- [ ] Intentional and accidental repetition distinguished
- [ ] Mobile preserves each major composition's design idea
- [ ] Heroes and major split layouts pass the Composition Balance and Dead-Space Audit
- [ ] Negative space has an identifiable compositional function or documented rationale

## Dependencies

- `frontend-ui-builder`

