---
name: performance-review
description: Use when runtime, payload, hydration, media, or Core Web Vitals require measurement.
---

# performance-review

## Activation

Use when designing media-heavy features or validating runtime performance.

## Purpose

Measure budgets and diagnose LCP, INP proxies/field data, CLS, payload, fonts, images, hydration, and third parties.

## Required inputs

- Running build
- Performance budget
- Representative routes and devices

## Workflow

1. Build production output.
2. Measure compressed assets and Lighthouse.
3. Inspect LCP request chain, CLS sources, long tasks, hydration, fonts, images, third parties.
4. Compare baseline and budget.

## Output

Metrics, budget table, causes, prioritized fixes, and regression status.

## References

- `research/performance-standards.md`

## Scripts and tools

Use repository-native tooling first. Applicable tools may include browser screenshots, Playwright, axe-core, Lighthouse, HTML validation, schema validation, link checking, and asset-budget scripts. Do not claim a test ran unless evidence was produced.

## Failure conditions

- Only development build available
- No representative route

## Quality checks

- [ ] Field/lab distinction stated
- [ ] Root cause attributed
- [ ] Regression quantified

## Dependencies

- `frontend-ui-builder`

