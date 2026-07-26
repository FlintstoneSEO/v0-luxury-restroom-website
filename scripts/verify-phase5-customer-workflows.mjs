import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getAdminAppOrigin, getCustomerWorkflowOrigin, getPublicSiteOrigin } from '../lib/app-origins.ts';

const originVariables = [
  'PUBLIC_SITE_URL',
  'ADMIN_APP_URL',
  'CUSTOMER_WORKFLOW_URL',
  'NEXT_PUBLIC_APP_URL',
  'APP_URL',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'VERCEL_URL',
];

const originalValues = new Map(originVariables.map((name) => [name, process.env[name]]));

function clearOrigins() {
  for (const name of originVariables) delete process.env[name];
}

function restoreOrigins() {
  for (const [name, value] of originalValues) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

async function source(pathname) {
  return readFile(new URL(`../${pathname}`, import.meta.url), 'utf8');
}

try {
  clearOrigins();

  assert.equal(getPublicSiteOrigin(), 'https://www.signatureluxeevents.com');
  assert.equal(getAdminAppOrigin(), 'https://www.signatureluxeevents.com');
  assert.equal(getCustomerWorkflowOrigin(), 'https://www.signatureluxeevents.com');

  process.env.PUBLIC_SITE_URL = 'https://www.example.com/';
  process.env.ADMIN_APP_URL = 'https://admin.example.com';
  process.env.CUSTOMER_WORKFLOW_URL = 'https://secure.example.com';

  assert.equal(getPublicSiteOrigin(), 'https://www.example.com');
  assert.equal(getAdminAppOrigin(), 'https://admin.example.com');
  assert.equal(getCustomerWorkflowOrigin(), 'https://secure.example.com');

  delete process.env.PUBLIC_SITE_URL;
  delete process.env.ADMIN_APP_URL;
  delete process.env.CUSTOMER_WORKFLOW_URL;
  process.env.NEXT_PUBLIC_APP_URL = 'https://legacy.example.com';

  assert.equal(getPublicSiteOrigin(), 'https://legacy.example.com');
  assert.equal(getAdminAppOrigin(), 'https://legacy.example.com');
  assert.equal(getCustomerWorkflowOrigin(), 'https://legacy.example.com');

  process.env.CUSTOMER_WORKFLOW_URL = 'https://secure.example.com/quote';
  assert.throws(
    () => getCustomerWorkflowOrigin(),
    /must be an origin without credentials, a path, query parameters, or a fragment/,
  );

  const [
    nextConfig,
    quotePage,
    approvalClient,
    sendRoute,
    responseRoute,
    messageRoute,
    astroConfig,
  ] = await Promise.all([
    source('next.config.mjs'),
    source('app/quote/[token]/page.tsx'),
    source('app/quote/[token]/quote-approval-client.tsx'),
    source('app/api/admin/quotes/[quoteId]/send/route.ts'),
    source('app/api/quote/[token]/respond/route.ts'),
    source('app/api/quote/[token]/message/route.ts'),
    source('apps/web/astro.config.mjs'),
  ]);

  assert.ok(nextConfig.includes("source: '/quote/:path*'"));
  assert.match(nextConfig, /X-Robots-Tag/);
  assert.match(nextConfig, /Referrer-Policy/);
  assert.match(nextConfig, /private, no-store/);
  assert.match(quotePage, /dynamic = 'force-dynamic'/);
  assert.match(quotePage, /revalidate = 0/);
  assert.match(quotePage, /getPublicSiteOrigin/);
  assert.ok(approvalClient.includes('fetch(`/api/quote/${token}/'));
  assert.match(sendRoute, /getCustomerWorkflowOrigin/);
  assert.match(responseRoute, /getAdminAppOrigin/);
  assert.match(messageRoute, /getAdminAppOrigin/);
  assert.match(astroConfig, /output: 'static'/);

  console.log('Phase 5 customer-workflow boundary verification passed.');
  console.log('- Next.js retains quote request, token, response, and provider ownership.');
  console.log('- Public, admin, and customer workflow origins resolve independently.');
  console.log('- Token pages are dynamic, private, noindex, and no-referrer.');
  console.log('- The approval client keeps token pages and mutation APIs on one origin.');
} finally {
  restoreOrigins();
}
