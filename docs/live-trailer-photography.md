# Live trailer photography

Implemented on `codex/signature-estate-design`; local preview only, no deployment.

## Scope and placement

- Homepage: a shared Daytime / Lights on scene after the fleet; new interior, evening and MSU tailgate images in the existing gallery; actual tailgate photo in its event tile.
- Private events: the same day/night feature and three event photos in the existing gallery.
- Trailer rentals: four actual interior photographs added to Step Inside Our Trailers.
- Gallery: eight distinct supplied images added, retaining the previous images and identifiers.

The scene uses complete photographs, not an aligned comparison slider, because the camera positions differ. There is no autoplay. Buttons have pressed states, visible focus, 48px minimum height and keyboard support. The caption announces changes, and transitions respect reduced motion.

## Assets and editing

Eight distinct photographs were selected from fourteen supplied files; near-duplicate interiors and night views were omitted. Originals in Downloads remain untouched. WebP copies in `public/images/live-events` are orientation-corrected, bounded to 1920px and compressed, with metadata removed. Next Image supplies responsive delivery. No scenery or trailer features were generated or retouched.

Source mapping and dimensions: `output/live-photos/asset-manifest.json`.

CloudCannon homepage fields `dayNight` and `tailgateImage` control the scene, captions, button labels and tailgate photo. The private-events scene shares the homepage values. Gallery collections and service-page galleries retain their existing editing model. The homepage schema template and typed validator include the new fields. Existing media overrides, routes, CTAs, SEO fields and operational workflows are preserved. The university location is user-supplied; no endorsement or client relationship was added.

## Validation

- PASS: production webpack build, TypeScript, all 75 generated pages.
- PASS: targeted ESLint, 59 content files validated, official CloudCannon configuration schema validation, diff whitespace check.
- PASS: production Chrome checks on homepage at 1440, 1024, 768, 390, 375 and 320px; gallery, trailer and private-event pages at 1440 and 390px. New images load, no horizontal overflow or page errors.
- PASS: keyboard day/night selection and reduced-motion behavior. Desktop and mobile screenshots recorded in `output/live-photos`.
- The existing gallery lightbox did not restore focus on dismissal. Added a reference to its opening button and explicit focus restoration; mobile Chrome opening, Escape dismissal and focus-return checks pass.
- Informational link and SEO audits completed; existing legacy-link and metadata-length advisories remain in the saved audit logs. This work does not rewrite SEO copy.
- Hosted CloudCannon editing and production behavior were not exercised; nothing was deployed. Existing transactional flows were not submitted or changed.

Rollback: remove the optional scene/tailgate fields and corresponding component usage, and remove only the new `live-*` gallery entries. Keep prior photos and unrelated branch changes.
