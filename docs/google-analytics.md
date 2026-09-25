# Google Analytics 4

Google Analytics is initialized directly in the root Next.js layout using the
production GA4 measurement ID `G-WWK23290W0`.

The existing Google Tag Manager container `GTM-P5LFZN2` remains installed for
other tag-management needs, but it must not also configure or fire the same GA4
measurement ID. Doing so can create duplicate page views.

## Production configuration

- Google Tag Manager container: `GTM-P5LFZN2`
- GA4 web stream measurement ID: `G-WWK23290W0`
- GA4 installation point: `app/layout.tsx`
- GA4 loading method: direct `gtag.js` initialization through `next/script`

The root layout loads:

1. `https://www.googletagmanager.com/gtag/js?id=G-WWK23290W0`
2. A one-time `gtag('config', 'G-WWK23290W0')` initialization

The existing GTM container remains unchanged.

## Duplicate-tracking guard

Do not create a Google tag, GA4 Configuration tag, or custom HTML tag inside
`GTM-P5LFZN2` that sends data to `G-WWK23290W0` while the direct GA4
integration is active.

If GA4 is later moved back into GTM, remove the direct `gtag.js` integration
from `app/layout.tsx` in the same deployment.

## Verification after deployment

1. Deploy the updated `main` branch.
2. Open `https://signatureluxevents.com`.
3. Use Google's tag detection or Tag Assistant and confirm
   `G-WWK23290W0` is detected.
4. In Google Analytics, open **Reports > Realtime** and verify the test visit.
5. Navigate between public pages and confirm page views are not duplicated.
6. Confirm GTM `GTM-P5LFZN2` still loads for any unrelated tags.

Vercel Analytics and Vercel Speed Insights remain enabled separately in the
root layout.
