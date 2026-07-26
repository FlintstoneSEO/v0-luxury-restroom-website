import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const readPage = (pathname) => readFile(new URL(pathname, dist), 'utf8');

const [startHere, faq, features, migrationPilot] = await Promise.all([
  readPage('start-here/index.html'),
  readPage('faq/index.html'),
  readPage('luxury-restroom-trailer-features/index.html'),
  readPage('migration-pilot/index.html'),
]);

const sectionWithMarker = (html, marker) => {
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `Missing ${marker} section marker.`);
  const end = html.indexOf('</section>', start);
  assert.notEqual(end, -1, `Missing closing section for ${marker}.`);
  return html.slice(start, end);
};

const pages = [
  {
    name: 'start-here',
    html: startHere,
    canonical: 'https://www.signatureluxeevents.com/start-here',
    title: 'Restroom Trailer Rental Planning Guide Lansing MI | Signature Luxe Events &amp; Amenities',
  },
  {
    name: 'faq',
    html: faq,
    canonical: 'https://www.signatureluxeevents.com/faq',
    title: 'FAQ | Signature Luxe Events &amp; Amenities',
  },
  {
    name: 'features',
    html: features,
    canonical: 'https://www.signatureluxeevents.com/luxury-restroom-trailer-features',
    title: 'Luxury Restroom Trailer Features &amp; Amenities | Signature Luxe Events',
  },
];

for (const page of pages) {
  assert.ok(
    page.html.includes(`<title>${page.title}</title>`),
    `${page.name} did not preserve its SEO title.`,
  );
  assert.ok(
    page.html.includes(`<link rel="canonical" href="${page.canonical}">`),
    `${page.name} did not preserve its canonical URL.`,
  );
  assert.ok(
    page.html.includes('<meta name="robots" content="noindex,nofollow">'),
    `${page.name} must remain noindex while the production route stays on Next.js.`,
  );
  assert.equal(
    page.html.match(/<h1\b/g)?.length ?? 0,
    1,
    `${page.name} must render exactly one H1.`,
  );
  assert.ok(
    page.html.includes('href="/request-quote"'),
    `${page.name} must preserve the server-owned quote workflow link.`,
  );
  assert.ok(
    page.html.includes('data-component-key="_type"'),
    `${page.name} must render through the editable page-builder array.`,
  );
}

assert.equal(
  faq.match(/"@type":"Question"/g)?.length ?? 0,
  12,
  'FAQ JSON-LD must include the 12 visible reusable questions.',
);
assert.ok(faq.includes('"@type":"FAQPage"'), 'FAQ page schema is missing.');
assert.ok(faq.includes('href="/contact"'), 'FAQ contact link is missing.');
assert.ok(
  faq.includes('href="mailto:info@signatureluxeevents.com"'),
  'FAQ email link is missing.',
);
assert.equal(
  sectionWithMarker(faq, 'data-faq-list').match(/<details\b/g)?.length ?? 0,
  12,
  'FAQ page must render 12 native disclosure controls.',
);

assert.ok(features.includes('"@type":"Service"'), 'Features Service schema is missing.');
assert.ok(features.includes('"@type":"BreadcrumbList"'), 'Features breadcrumb schema is missing.');
assert.equal(
  features.match(/"@type":"Question"/g)?.length ?? 0,
  4,
  'Features FAQ JSON-LD must include the four visible page-specific questions.',
);
assert.equal(
  sectionWithMarker(features, 'data-inline-faqs').match(/<details\b/g)?.length ?? 0,
  4,
  'Features page must render four native disclosure controls.',
);
assert.ok(
  features.includes('href="/gallery"'),
  'Features page must preserve the gallery CTA.',
);
assert.ok(
  features.includes('href="/service-areas"'),
  'Features page must preserve the service-area resource link.',
);

assert.ok(
  migrationPilot.includes('<meta name="robots" content="noindex,nofollow">'),
  'The migration pilot must remain noindex.',
);
assert.ok(
  !`${startHere}${faq}${features}${migrationPilot}`.includes('SUPABASE_SERVICE_ROLE_KEY'),
  'The public HTML must not contain the service-role key identifier.',
);
assert.ok(
  !`${startHere}${faq}${features}`.includes('/api/admin'),
  'The migrated public pages must not link to admin APIs.',
);

const publicDirectory = fileURLToPath(new URL('../../../public/', import.meta.url));
const localImageSources = [...new Set(
  [...features.matchAll(/<img[^>]+src="(\/images\/[^"]+)"/g)]
    .map(([, source]) => decodeURIComponent(source)),
)];

for (const source of localImageSources) {
  const image = await stat(`${publicDirectory}${source.replace(/^\//, '')}`);
  assert.ok(image.isFile() && image.size >= 100, `Invalid local image asset: ${source}`);
}

console.log(
  `Phase 4 verification passed: ${pages.length} routes, 16 FAQ disclosures, structured data, workflow links, editability markers, and ${localImageSources.length} local images.`,
);
