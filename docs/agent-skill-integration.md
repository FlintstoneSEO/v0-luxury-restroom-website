# Agent skill integration

Source: [FlintstoneSEO/codex-frontend-design-agent](https://github.com/FlintstoneSEO/codex-frontend-design-agent), commit `7f1fc78f703348f9b820e043c644b0b309c95253` (local `main` checkout inspected 2026-09-29). The imported `SKILL.md` bodies come from that commit. Repo-compatible YAML metadata was prepended; `skills-lock.json` records both the upstream SHA-256 (`sourceHash`) and the resulting local SHA-256 (`computedHash`). Shared `references/`, `research/`, and `templates/` files named by those skills were copied from the same commit so local references resolve. For future updates, compare against that commit and reapply the Signature Luxe routing rules in `AGENTS.md`.

## Routing and precedence

| Surface or task | Lead skills | Supporting skills and boundary |
| --- | --- | --- |
| Public Astro and CloudCannon marketing | Existing public design skills, including `gpt-taste` for major visual work | Public SEO, performance, responsive, accessibility, and QA review; CloudCannon content remains editable. |
| Substantial authenticated Next.js admin redesign | `application-redesign` audit, then `admin-ui-redesign` | `admin-workflow-safety` takes precedence for every privileged, data, and customer-visible workflow. `information-architecture` applies to changed navigation. `frontend-ui-builder` applies only after the root implementation gate. |
| Routine isolated admin UI fix | `admin-ui-redesign` | Apply `admin-workflow-safety` if status meaning, actions, authorization, APIs, or customer effects change. |
| Customer quote approval and token flow | `admin-workflow-safety` | Apply accessibility, responsive, implementation, and QA skills to the customer task. Keep this surface separate from marketing CMS and admin navigation. |
| Material visual direction decision | `application-redesign` plus conditional `art-direction-generator` | `design-discovery` only for missing context; use operational task hierarchy, not marketing page rhythm. |
| Rendered admin review | `responsive-design-review`, `accessibility-audit`, `visual-design-review`, `website-qa` | `performance-review` and `anti-template-review` when relevant; verify roles, states, and workflows with evidence. |

The imported skills are general methods. Root `AGENTS.md` and the existing Signature Luxe `admin-workflow-safety` and `admin-ui-redesign` skills define this project's boundaries. Both Signature Luxe skills live in `.agents/skills/`; their duplicate `.codex/skills/` copies were removed after confirming that both copies appeared in skill discovery and that repository routing points to `.agents/skills/`. Do not allow generic marketing composition, public SEO assumptions, or image effects to govern admin or token-based customer workflows.

## Import selection

Imported: `application-redesign`, `information-architecture`, `frontend-ui-builder`, `responsive-design-review`, `accessibility-audit`, `visual-design-review`, `website-qa`, `performance-review`, `anti-template-review`, `design-discovery`, and `art-direction-generator`. The last three are conditional: they support specific quality or direction questions and are not default admin styling instructions.

Left upstream: `site-redesign`, `page-content-planner`, `industry-design-research`, `shopify-store-design`, and `technical-seo-audit`. Their primary scope is public site or commerce strategy rather than the authenticated admin. Existing public design skills remain available. Upstream `application-redesign` mentions `site-redesign` and `technical-seo-audit` for public work; those references are advisory for a different surface and are not admin dependencies.

## Completed cleanup

The repo-scoped `design-taste-frontend`, `design-taste-frontend-v1`, `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, and `redesign-existing-projects` copies had no project callers beyond their lock entries. Their broad or fixed visual defaults overlapped the selected public `gpt-taste` route or the application redesign layer, so those six copies and their lock entries were retired. `gpt-taste` remains for major public marketing design under the limits in `AGENTS.md`. Specialized brand, image, output, and Stitch skills remain available. The two redundant `.codex/skills/` admin copies were also retired; `.agents/skills/` is the single repository source for them.
