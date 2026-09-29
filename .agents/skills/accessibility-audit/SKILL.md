---
name: accessibility-audit
description: Use for WCAG review of semantics, keyboard access, focus, forms, dialogs, and errors.
---

# accessibility-audit

## Activation

Use during design, implementation, and release review.

## Purpose

Assess WCAG 2.2 AA using automated and manual evidence.

## Required inputs

- Running site or code
- Core user journeys
- Target browsers

## Workflow

1. Run automated scan.
2. Review semantics and accessible names.
3. Test keyboard and focus.
4. Test zoom/reflow and reduced motion.
5. Review forms, media, menus, dialogs, and errors.
6. Perform screen-reader smoke test.

## Output

Findings mapped to WCAG criterion, severity, fix, and retest.

## References

- `research/accessibility-standards.md`
- `references/accessibility-checklist.md`

## Scripts and tools

Use repository-native tooling first. Applicable tools may include browser screenshots, Playwright, axe-core, Lighthouse, HTML validation, schema validation, link checking, and asset-budget scripts. Do not claim a test ran unless evidence was produced.

## Failure conditions

- Core journey cannot be exercised
- Critical inaccessible component blocks further testing

## Quality checks

- [ ] Manual testing included
- [ ] No false claim of full compliance
- [ ] Blockers separated from enhancements

## Dependencies

- `frontend-ui-builder`

