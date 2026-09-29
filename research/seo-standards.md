# SEO Standards

SEO begins with page purpose and search intent.

## Planning sequence

1. Define the audience and task.
2. Identify search intent and query family.
3. Map one primary purpose to one indexable page.
4. Define supporting questions and internal links.
5. Write the title, meta description, H1, section hierarchy, proof, and structured-data plan.
6. Build semantic content.
7. Validate crawlability, rendering, metadata, and schema.

## Page requirements

- Descriptive, stable, human-readable URL
- Unique, concise title reflecting the page
- Useful meta description, not keyword stuffing
- One descriptive H1 for normal content pages
- Logical heading hierarchy
- Semantic HTML and crawlable links
- Descriptive navigation and anchor text
- Helpful image filenames and purpose-based alt text
- Canonical URL
- Open Graph and social image metadata
- Correct robots directives
- Inclusion in XML sitemap when indexable
- Breadcrumbs for deeper hierarchies
- Internal links to relevant parent, sibling, and next-step pages
- Content that answers the page’s actual intent

## Structured data by industry

- **Nonprofit:** `Organization` or the most accurate subtype, `Event`, `Article`, `BreadcrumbList`, and `FAQPage` only where currently eligible and visibly represented.
- **Sports:** `SportsOrganization`, `SportsTeam` where accurate, `Event`, `Course` only for a genuine educational course, `Product` for merchandise, `BreadcrumbList`.
- **Construction/trades:** most specific `LocalBusiness` subtype available, `Service` as descriptive schema where appropriate, `Offer` only with verified terms, `Review` only for eligible first-party implementation, `BreadcrumbList`.
- **Local services:** specific `LocalBusiness` or `ProfessionalService`, `Person` for verified practitioners, `Service`, `Appointment` actions only when technically and factually supported, `BreadcrumbList`.
- **E-commerce/fashion:** `Product`, `Offer`, `ProductGroup` when variants warrant it, `Organization`, `BreadcrumbList`, merchant return and shipping policy markup where supported.

Structured data must match visible, verified content. Never fabricate ratings, prices, inventory, locations, credentials, awards, or reviews.

## Local SEO architecture

- Create location pages only for real locations or genuinely differentiated service areas.
- Include verified name, address, phone, hours, service area, and contact options.
- Avoid doorway pages that swap city names while repeating identical content.
- Use project, testimonial, team, process, and FAQ evidence specific to the area when available.
- Link service pages and location pages according to actual coverage.

## E-commerce content

- Category pages should serve browsing and search intent with useful names, filters, context, and crawlable product links.
- Product pages need unique product information, variants, sizing, material, care, shipping, returns, imagery, availability, and related products when verified.
- Manage faceted URLs, canonicalization, pagination, and internal search deliberately.
- Avoid manufacturer-copy duplication and thin collection pages.

## Technical checks

- 200 response for indexable canonical pages
- No accidental `noindex`
- Correct canonical and redirect chains
- Sitemap contains only canonical indexable URLs
- Robots file does not block required rendering assets
- Server-render or pre-render critical content when JavaScript rendering creates risk
- Validate schema with Google’s Rich Results Test and schema tools
- Test representative URLs in Search Console after deployment
