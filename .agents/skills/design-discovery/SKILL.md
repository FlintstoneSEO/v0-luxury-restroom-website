---
name: design-discovery
description: Use when material project context is missing before design decisions.
---

# design-discovery

## Activation

Use when a website project lacks a complete, verified brief.

## Purpose

Collect and normalize business, audience, brand, content, conversion, SEO, accessibility, media, and technical constraints.

## Required inputs

- Client or stakeholder input
- Existing site and assets
- Known constraints

## Workflow

1. Read existing project files first.
2. Populate the discovery template.
3. Ask precise questions for material gaps.
4. Mark unknowns and assumptions.
5. Produce project brief JSON and a missing-input register.

## Output

Completed discovery document, `project-brief.json`, assumptions and blockers.

## References

- `references/client-discovery-template.md`
- `templates/project-brief.example.json`

## Scripts and tools

Use repository-native tooling first. Applicable tools may include browser screenshots, Playwright, axe-core, Lighthouse, HTML validation, schema validation, link checking, and asset-budget scripts. Do not claim a test ran unless evidence was produced.

## Failure conditions

- Primary conversion or audience remains materially unknown
- Facts would need to be fabricated

## Quality checks

- [ ] No invented facts
- [ ] Every missing item has an owner
- [ ] Brief is sufficient to generate art directions

## Dependencies

- None

