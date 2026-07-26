import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const output = new URL('../dist/start-here/index.html', import.meta.url);
const html = await readFile(output, 'utf8');

const count = (pattern) => html.match(pattern)?.length ?? 0;
const expectedComponents = [
  'hero',
  'text_section',
  'feature_grid',
  'requirements',
  'process',
  'cta',
];

assert.match(
  html,
  /<title>Restroom Trailer Rental Planning Guide Lansing MI \| Signature Luxe Events &amp; Amenities<\/title>/,
  'The intended SEO title was not rendered.',
);
assert.match(
  html,
  /<meta name="description" content="Learn what information we need to provide you with a custom restroom trailer rental quote for your event in Lansing and Mid-Michigan\.">/,
  'The existing page description was not preserved.',
);
assert.match(
  html,
  /<link rel="canonical" href="https:\/\/www\.signatureluxeevents\.com\/start-here">/,
  'The corrected canonical URL was not rendered.',
);
assert.match(
  html,
  /<meta name="robots" content="noindex,nofollow">/,
  'The preview-only route must stay noindex until cutover.',
);
assert.equal(count(/<h1(?:\s|>)/g), 1, 'The page must render exactly one H1.');
assert.ok(count(/<h2(?:\s|>)/g) >= 5, 'The page must retain its section heading hierarchy.');
assert.ok(count(/href="\/request-quote"/g) >= 3, 'Quote CTAs must retain the existing workflow URL.');
assert.ok(count(/data-editable="array"/g) >= 6, 'Expected editable section and item arrays.');
assert.ok(count(/data-editable="array-item"/g) >= 20, 'Expected editable sections and nested items.');
assert.equal(count(/data-component-key="_type"/g), 1, 'The page-builder array needs its renderer key.');

for (const component of expectedComponents) {
  assert.match(
    html,
    new RegExp(`data-component="${component}"`),
    `Missing renderer marker for ${component}.`,
  );
}

console.log('Pilot verification passed: SEO, workflow links, heading hierarchy, and renderer markers are present.');
