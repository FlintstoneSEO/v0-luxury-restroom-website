# Header and Site-Shell Patterns

Use this document as a decision vocabulary for global navigation and site-shell composition. It is not a template library and not a rotation schedule.

The correct shell should follow from information architecture, brand posture, conversion priority, content density, media, platform constraints, and the selected art direction.

## Selection questions

Before selecting a header structure, answer:

1. How many primary navigation destinations exist, and are they equal in importance?
2. Is there one dominant conversion action, several utility actions, or no action that deserves persistent emphasis?
3. Should the brand mark lead the composition, or should content and navigation lead?
4. Does the hero need visual continuity with the header, or should the shell clearly frame the page?
5. Does the project require account, cart, search, language, location, phone, booking, donation, or other persistent utilities?
6. Is the visual posture editorial, institutional, luxury, local-service, ecommerce, nonprofit, athletic, technical, playful, or another recognizable mode?
7. What changes on mobile besides hiding links?
8. Would the proposed shell still make sense if the logo and colors were removed?
9. Is the shell being selected because it fits this project or because it is familiar?

## Archetype vocabulary

### Classic utility row
Logo at one side, horizontal navigation, and one or more utility or conversion actions.

Use when hierarchy is straightforward and fast scanning matters. Do not treat it as the default merely because it is familiar.

### Centered brand
Brand mark occupies the visual center, with navigation or utilities distributed around it or on a secondary row.

Useful when brand presence is important and navigation depth is moderate.

### Split navigation
Navigation is divided into meaningful groups around a centered brand or structural anchor.

Use when grouping is real and understandable. Avoid artificial symmetry.

### Editorial masthead
A more prominent brand or publication-style masthead sits above or alongside a restrained navigation row.

Useful for story-led, institutional, cultural, media-rich, or history-driven sites.

### Utility-bar system
A slim top layer holds contact, location, language, alerts, audience shortcuts, or other utilities while the main row handles brand and primary navigation.

Use only when the utility layer reduces complexity in the main navigation.

### Compact conversion header
Brand plus a limited navigation set and a strong primary action such as call, book, enroll, donate, or shop.

Useful when the user's main task is clear and persistent conversion access is valuable.

### Hero-integrated navigation
Navigation overlays or visually merges with the hero.

Use only when hero media, contrast, content position, and scroll-state behavior support reliable readability. Define the transition to the scrolled state.

### Floating contained navigation
The shell is visually detached from viewport edges and contained within a floating surface.

Use when the selected art direction supports the object-like treatment. Do not add rounded floating chrome solely to look modern.

### Asymmetric brand-led shell
Brand, message, navigation, or utility areas occupy intentionally unequal visual weight.

Useful when asymmetry is part of the selected composition language.

### Category or mega navigation
Primary navigation exposes grouped destinations, products, services, audiences, or resources.

Use when the IA genuinely requires more depth than a simple row can communicate.

### Vertical rail or sidebar shell
Primary navigation or brand structure is placed vertically on larger screens.

Useful for portfolios, editorial systems, applications, or distinctive desktop experiences where horizontal space and content behavior support it. Mobile must be independently composed.

### Minimal brand shell
Brand plus a very small number of links or utilities, sometimes without a persistent CTA.

Useful for restrained art directions or simple sites where additional chrome would compete with content.

### Multi-row institutional shell
Brand, audience paths, search, utilities, and primary navigation are separated across structured rows.

Useful for organizations with complex audiences or large information architectures. Avoid using it for small sites.

## Header-to-hero relationships

Treat the header and hero as one upper-page composition when appropriate. Common relationships include:

- Separate framed header above hero
- Transparent overlay that becomes solid on scroll
- Shared background or surface
- Header embedded inside the hero grid
- Header visually detached as a floating object
- Compact shell followed by an oversized editorial opening
- Utility bar plus hero-integrated primary navigation
- Minimal shell that intentionally recedes behind the opening content

Choose the relationship deliberately and document contrast, spacing, scroll behavior, focal-point interference, and mobile adaptation.

## Mobile composition

Do not define mobile as "desktop nav becomes hamburger."

Document:

- Brand size and placement
- Which utility or CTA remains visible
- Menu trigger placement and accessible name
- Drawer, sheet, disclosure, fullscreen, accordion, or inline behavior
- Link grouping and hierarchy
- Whether secondary utilities move inside the menu
- Focus entry, focus return, Escape behavior, and background interaction
- Scroll locking when appropriate
- Touch target sizing
- Sticky behavior
- How the menu relates visually to the selected art direction

## Anti-patterns

Flag these unless there is a project-specific rationale:

- Reusing `logo left -> nav -> CTA right` because it is the fastest component to implement
- Applying a transparent hero overlay when the imagery makes contrast unstable
- Adding a pill-shaped floating header to every modern redesign
- Centering a logo while navigation grouping remains arbitrary
- Hiding all meaningful actions inside mobile navigation when one deserves persistent visibility
- Using a mega menu for a shallow site
- Adding a utility bar containing low-value information
- Making every site sticky by default
- Copying another project's shell while only changing colors, fonts, or logo
- Keeping the same header architecture across all three art directions without a documented constraint

## Decision record

For each project, record:

- Chosen archetype or hybrid
- Business and user rationale
- Navigation and utility requirements
- Relationship to hero or first content region
- Desktop behavior
- Sticky or scroll behavior
- Mobile composition
- Accessibility considerations
- Why at least one obvious alternative was rejected
