# Local SEO QA Checklist

## Metadata checks
- Confirm `app/layout.tsx` has `metadataBase`, homepage canonical, default title/template, Open Graph image, and Twitter card.
- Confirm each key marketing page has a specific title, description, and canonical URL.

## Sitemap checks
- Verify `app/sitemap.ts` includes all public service pages and city service-area pages.
- Verify private/admin/quote token URLs are excluded.

## Robots checks
- Verify `app/robots.ts` allows public pages and disallows `/admin`, `/api`, and `/quote`.
- Verify sitemap URL is `https://www.signatureluxeevents.com/sitemap.xml`.

## Noindex checks
- Verify admin pages include `robots: { index: false, follow: false }` metadata.
- Verify quote token review pages include `robots: { index: false, follow: false }` metadata.

## Schema checks
- Validate LocalBusiness schema includes accurate business details only (no fabricated links, phone, or address).
- Validate Service schema includes service type, provider, URL, area served, and realistic service descriptions without fabricated pricing.
- Validate FAQ/Breadcrumb schema outputs on related pages.

## City page checks
- Confirm city pages have unique intros, useful local content, FAQs, and non-duplicative nearby-area context.
- Confirm city metadata includes canonical, Open Graph, and Twitter data.
- Confirm city headings remain readable and not keyword-stuffed.

## Service page checks
- Confirm each service page includes descriptive metadata and relevant internal links.
- Confirm image alt text is descriptive and contextually local where appropriate.

## Google Business Profile reminder
- Keep Google Business Profile categories, service areas, hours, and phone aligned with website messaging.

## NAP consistency reminder
- Keep business name, phone, and public location formatting consistent across site, GBP, and major directories.

## Internal linking reminder
- Ensure service pages link to city pages and quote page.
- Ensure city pages link back to core service pages and quote flow.
