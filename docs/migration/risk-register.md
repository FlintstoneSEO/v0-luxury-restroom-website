# Migration risk register

Scoring: likelihood and impact are Low, Medium, or High. Owners are proposed roles, not assigned people.

| ID | Risk | Likelihood | Impact | Mitigation / gate | Owner |
|---|---|---|---|---|---|
| R1 | Existing quote links break after domain split | Medium | High | Preserve `/quote/**` through path proxy or stable workflow origin; test emailed links | Platform |
| R2 | Service-role key enters Astro/client bundle | Low | High | No operational imports in `apps/web`; bundle/env scan; explicit env allowlist | Security |
| R3 | Quote calculation diverges between apps | Medium | High | One server-owned API/calculation implementation; contract tests | Backend |
| R4 | Quote action and JSON API behave differently | High | High | Reconcile emails/responses before Astro form cutover | Backend |
| R5 | Legacy availability fallback differs from canonical mileage | High | Medium | Decide retire/redirect/consolidate; document 30 vs 50-mile behavior | Product/Backend |
| R6 | Manual distance warning is cleared incorrectly | Medium | High | Server-derived flag; scenario tests; no dismiss-to-clear | Operations |
| R7 | Recalculation overwrites manual or approved pricing | Medium | High | Preserve force confirmation and approval guardrails | Backend/Admin |
| R8 | Quote send partially updates status when email fails | Medium | High | Dedicated idempotency/transaction recovery PR before redesign | Backend |
| R9 | Token consumed before quote response update completes | Low | High | Dedicated transactional/recovery design; test failure injection | Backend |
| R10 | Webhook accepted without configured signature secret | Medium | High | Production configuration gate; fail closed decision in safety PR | Security |
| R11 | Agreement/payment provider retry creates duplicates | Medium | High | Idempotency keys and provider-reference checks | Backend |
| R12 | Final-balance workflow is assumed complete | High | Medium | Treat as decision/open feature until API/provider path exists | Product |
| R13 | Calendar suggests double-booking safety without resource model | High | High | Define trailer assignment/capacity and server conflict rule first | Product/Backend |
| R14 | Admin status families drift out of sync | High | High | Server-owned transition/next-action model; centralized UI labels | Backend/Admin |
| R15 | Current admin/auth becomes cacheable or indexable | Low | High | Preserve dynamic/noindex/auth tests per PR | Admin |
| R16 | SEO slugs/canonicals change | Medium | High | Route manifest, filename parity, crawl and redirect tests | SEO |
| R17 | Soro and CloudCannon both publish blog content | Medium | High | Decide source of truth and import/cutover date | Content/SEO |
| R18 | Local SEO pages become duplicative/thin | Medium | High | Unique-content review and local SEO checklist | SEO/Content |
| R19 | Structured data loses required fields or gains fabricated facts | Medium | High | Compare generated JSON-LD; business-info source of truth | SEO |
| R20 | Analytics events disappear or double fire | Medium | Medium | Tracking inventory and route-level event QA | Marketing |
| R21 | Public media has dual ownership in Supabase and Git | High | Medium | Asset-by-asset ownership matrix before media migration | Content |
| R22 | CloudCannon config allows fields renderer ignores | Medium | Medium | Schema/input/template cross-check; no dead toggles | Web/Content |
| R23 | CloudCannon URL preview does not match Astro output | Medium | Medium | Compare `dist` paths and trailing slash before enabling route | Web |
| R24 | Invalid/missing alt text during media migration | Medium | Medium | Required structured alt fields and editorial checklist | Content/A11y |
| R25 | Excess motion harms accessibility or Core Web Vitals | Low | Medium | Restrained public motion, reduced-motion support, performance budget | Design/Web |
| R26 | Admin redesign becomes decorative or less scannable | Low | Medium | Admin-specific skill, compact task-first acceptance criteria | Design/Admin |
| R27 | Workspace change breaks current build/deploy | Low | High | Keep root scripts unchanged; run root and web builds independently | Platform |
| R28 | ESLint blocker hides new lint regressions | High | Medium | Separate ESLint flat-config PR; use Astro check/build meanwhile | Platform |
| R29 | No automated E2E coverage catches regressions late | High | High | Add Playwright/API workflow tests before customer cutover | QA |
| R30 | Remote Soro feed causes build instability | Medium | Medium | Cached import/fallback and explicit content ownership | Web |
| R31 | CloudCannon content accidentally includes customer data | Low | High | Collection boundary, editor guide, review checklist | Security/Content |
| R32 | Existing redirects conflict with page files | Medium | Medium | One redirect manifest; test effective HTTP behavior | SEO/Platform |
| R33 | Root public directory coupling blocks deployment separation | Medium | Medium | Move/copy assets only in a later asset PR with checksum/parity | Platform |

## Cutover blockers

The public deployment must not switch while any of these remain unresolved:

- R1 customer URL strategy;
- R2 secret/bundle boundary;
- R3/R4 quote API parity;
- R10 webhook production verification;
- R13 booking conflict truth if calendar is marketed as prevention;
- R16 full URL parity;
- R17 blog source ownership;
- R27 independent builds;
- R29 customer workflow regression coverage.

## Review cadence

Review this register at the start and end of every migration PR. New risks receive an ID; mitigated risks remain recorded with evidence rather than being deleted.

