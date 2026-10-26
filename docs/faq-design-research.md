# FAQ redesign

## Observed problem and direction

The previous page used a generic hero, a single uncategorized list of twelve questions, then separate contact and booking sections. The shared hero description also inherited a pale text color from the homepage treatment. The replacement uses dedicated FAQ styles with dark readable text, a concise editorial introduction, topic navigation, grouped answers and a combined contact/booking closing section.

The audience is event hosts and site planners evaluating restroom trailer rental requirements. The primary conversion remains Request Availability, with contact and email available for unresolved planning questions. Preserve the Signature Estate ivory, navy, gold and serif identity.

## Mobbin references reviewed

- [Eventbrite](https://mobbin.com/sites/sections/9864a56d-bfe1-42e7-8acb-9759e194323e): strongest category match. A topic label beside the questions makes a long FAQ easier to scan; restrained dividers and expansion controls keep the answer primary. Adapted into a topic sidebar and grouped sections.
- [OpenTable](https://mobbin.com/sites/sections/73417349-613a-4f1f-aab5-de24be9c6e72): readable answer measure, simple introduction and generous spacing. Its actual reference concerns reservation API support, so content and technical-product conventions were not adopted.
- [Mews](https://mobbin.com/sites/sections/821e8f68-6c77-47ef-8be8-fdc98ebedccd): clear expanded/collapsed question treatment. Hospitality software rather than a rental business; used only as a secondary interaction reference.
- [TravelPerk](https://mobbin.com/sites/sections/ea9a9e33-a90b-47aa-9f0b-2e6b61b956d0): spacious accordion rows; its plan-comparison context does not fit this page.
- [Mixpanel](https://mobbin.com/sites/sections/4e2b3fad-4cb8-4536-a6cd-a93cba9e4a44): returned by the venue query, reviewed and rejected as the primary direction because analytics software is unrelated to the audience.

## Reading path and implementation

Introduction → topic navigation → booking/delivery, setup, amenities, events → contact or request availability. Desktop topic links stay visible while reading; they become an ordinary stacked navigation on mobile. No decorative photo is needed to answer practical setup questions; photography remains on the fleet and event pages.

All twelve original questions and answers remain sourced from the CloudCannon FAQ collection. Existing category values, ordering within groups, contact destinations, metadata and FAQ JSON-LD are preserved. Unrecognized future categories appear in Other questions rather than disappearing. No business claims were added. The separate Astro content page is unchanged.

Native details/summary provides keyboard-operable, independently expandable answers with no new client JavaScript. Answers remain in server-rendered HTML. Page-scoped CSS avoids changing other FAQ components. Visible focus, large controls, readable contrast and scroll offsets support keyboard and mobile access.

## Validation and limits

Local Chrome review at 1440, 768, 390 and 320px: all twelve questions present; no horizontal overflow; keyboard opens answers; no browser page errors. Screenshots saved under output/live-photos/faq-*.png. Hosted CMS editing and production deployment were not exercised. No deployment performed.
