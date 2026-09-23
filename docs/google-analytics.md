# Google Analytics 4

Google Analytics is deployed through the site's existing Google Tag Manager
container. Do not add a separate `gtag.js` script or a Next.js
`GoogleAnalytics` component while this configuration is active; doing so can
send duplicate page views.

## Production configuration

- Google Tag Manager container: `GTM-P5LFZN2`
- GA4 web stream measurement ID: `G-WWK23290W0`
- Installation point: the root Next.js layout (`app/layout.tsx`)
- Trigger: Initialization - All Pages (or All Pages)

In the `GTM-P5LFZN2` workspace, create a **Google tag** whose Tag ID is
`G-WWK23290W0`, apply the site-wide trigger, test it in Preview mode, and
publish the container. There should be exactly one site-wide Google tag for
this measurement ID. Google Tag Manager owns GA4 loading and page-view
collection; the application must not initialize the same measurement ID
directly.

The App Router root layout loads GTM once for the entire application. Google's
tag handles browser-history changes used by Next.js client-side navigation, so
the application should not send an additional custom `page_view` event unless
the Google tag is deliberately configured not to send one.

## Verification after publishing

1. Open GTM Preview (Tag Assistant) and connect to
   `https://signatureluxevents.com`.
2. Confirm that the Google tag for `G-WWK23290W0` fires once on the initial
   page load.
3. Navigate between several public pages using site links and confirm that one
   page view is recorded for each navigation.
4. In Google Analytics, open **Admin > Data streams** and confirm that
   `G-WWK23290W0` belongs to the production web stream.
5. Check **Reports > Realtime** (or DebugView while previewing) for the test
   session. Reporting can take time outside Realtime and DebugView.
6. Confirm that no second Google tag, GA4 Configuration tag, direct
   `gtag('config', ...)` call, or CMS-injected analytics script uses the same
   measurement ID.

Vercel Analytics and Vercel Speed Insights are separate integrations and
remain enabled in the root layout. They do not replace the GA4 Google tag.

