# Homepage hierarchy and fleet refinements

Branch: codex/signature-estate-design. Scope: public homepage only.

## Implementation

Preserved the Signature Estate shell, hero, introduction, content and media bindings. Moved the three-trailer comparison immediately after the introduction, followed by gallery and walkthrough, occasion/service information, existing differentiators, rental process, coverage and final inquiry. All original sections remain available.

Extracted the existing fleet markup into a server-rendered HomeFleet component. Desktop shows three aligned comparisons; tablet uses image-and-copy rows; phones use image-first stacked options. The middle trailer now has image-first DOM order as well as visual order. Added contextual detail-link names and hid decorative fleet icons from assistive technology. Styles are scoped to the homepage fleet. No new client runtime or dependencies.

Existing homepage fields remain consumed through getHomepage. No CloudCannon schemas, content files, media keys, navigation, quote workflows or operational code changed. Existing fleet copy was already hardcoded and remains so; this change does not remove an editing capability.

## Validation

- PASS: targeted ESLint for homepage and fleet component.
- PASS: TypeScript with normal filesystem access. Restricted dependency-link resolution produced misleading cross-repository errors before that successful run.
- PASS: 59 content files validated.
- PASS: SEO content audit, zero errors and two existing description-length warnings.
- PASS: preservation check found no missing original literal href, src, alt, title, description or videoId attributes; CMS files unchanged; three fleet entries retained.
- Browser and production build results recorded separately in output/home-refinements. Hosted CMS editing and real customer workflows were not exercised.

## Content follow-up

The pre-existing three-station walkthrough says two women's rooms and one men's room; fleet copy says one women's room and two men's rooms, or configurable arrangements. Copy was preserved rather than guessing. Verify the actual configuration before changing it. Existing guest-capacity guidance was also retained, not independently validated.

## Rollback

Revert app/page.tsx and remove components/home-fleet.tsx and app/home-refinements.css from this change. No database, route, provider or deployment rollback is needed. Preserve unrelated admin work already present on this branch.


## Compilation recovery and final QA

Normal host access resolves the repository dependency links and local preview requests; restricted execution did not. The existing development preview returned HTTP 200. A clean webpack build using NEXT_DIST_DIR=.next-service-home-verified completed, including TypeScript and all 75 static pages. The final rebuild after restoring catalog anchors also completed (compilation 25.8 seconds, TypeScript 21.3 seconds). See output/home-refinements/build-recovery.log.

The previous temporary .next-home-* output names were not covered by the existing .next-service-* ignore rule. Broadened .gitignore to .next-*/ to keep all isolated Next output out of source discovery and Git. This is a preventive build hygiene fix; the earlier stall was not traced to a single compiler stack frame. Temporary Next-generated TypeScript configuration changes were restored.

The link check found the existing homepage links #2-station, #3-station and #4-station had no targets on the catalog page. Added IDs derived from existing trailer slugs and a sticky-header scroll offset to the corresponding cards, preserving URLs and CMS content.

PASS: targeted ESLint, content validation (59 files), git diff --check, and final production build. No deployment performed.

PASS: final production preview at http://127.0.0.1:3005, HTTP 200. Verified 1440, 1024, 768, 390, 375 and 320px: no horizontal document overflow, one H1, all three fleet images loaded, and zero browser page errors. Reviewed desktop fleet alignment, tablet image/copy rows, phone stacking and headline wrapping. Full-page and fleet captures are in output/home-refinements. Sticky header is hidden only in isolated fleet screenshots so it does not obscure the section; full-page captures preserve it.

PASS: mobile menu opens, Escape closes it and focus returns; skip link focuses main; reduced-motion preference removes fleet image transitions; all four catalog anchors exist; /request-availability redirects to /request-quote with HTTP 200. No form was submitted. See browser-checks.json and review.cjs for repeatable evidence.

Limits: local Chromium verification, not a full screen-reader/WCAG certification or hosted CloudCannon editing test. Customer email, payments and actual availability were not exercised. Original content discrepancies remain documented above.
