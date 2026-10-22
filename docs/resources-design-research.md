# Resources page design

Scope: /resources only, on the existing Signature Estate branch. No deployment.

Reviewed Mobbin references:
- Tripadvisor: https://mobbin.com/sites/sections/d83e4449-d682-417a-8763-fc4f3c9ccb14 — hospitality resource index with photography, category labels and clear article titles. Primary reference.
- Skillshare: https://mobbin.com/sites/sections/8a4d69d4-fd46-4ab6-b4bf-57f6477ee06e — guide cards use excerpts and distinct visual emphasis.

Adaptation: retain navy, ivory, gold and existing typography. Introduce an image-led featured article and compact supporting reading list, topic anchors, paired article columns, service links and a clear quote CTA. Existing article images and alt text are read directly from the content collection. No new business claims or dependencies.

Preserved: all seven guides, four configured featured slugs, category membership, dates, titles, excerpts, editable image fields, service links, quote destination, metadata and CollectionPage structured data. No individual article, CMS schema, admin or customer workflow changes.

Validation: targeted ESLint passed. Local browser checks at 1440, 390 and 320 pixels found no horizontal overflow, all images loaded, all seven article destinations present and all topic anchors resolved. Desktop and phone screenshots reviewed. Hosted CloudCannon editing and production deployment were not tested. Rollback consists of reverting the resources page and its scoped stylesheet.
