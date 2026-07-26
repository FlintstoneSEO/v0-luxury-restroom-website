import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const readPage = (pathname) => readFile(new URL(pathname, dist), 'utf8');

const [showcase, startHere] = await Promise.all([
  readPage('design-system/index.html'),
  readPage('start-here/index.html'),
]);

const assertions = [
  ['showcase is noindex', showcase.includes('<meta name="robots" content="noindex,nofollow">')],
  ['showcase canonical is absolute', showcase.includes('<link rel="canonical" href="https://www.signatureluxeevents.com/design-system">')],
  ['organization JSON-LD exists', showcase.includes('"@type":"Organization"')],
  ['showcase has one h1', (showcase.match(/<h1\b/g) ?? []).length === 1],
  ['mobile navigation uses a dialog', showcase.includes('<dialog id="mobile-navigation"')],
  ['quote workflow link is preserved', showcase.includes('href="/request-quote"')],
  ['bento grid is rendered', showcase.includes('data-bento-grid')],
  ['motion gallery is rendered', showcase.includes('data-motion-gallery')],
  ['images reserve layout dimensions', /<img[^>]+width="1536"[^>]+height="1024"/.test(showcase)],
  ['start-here remains noindex', startHere.includes('<meta name="robots" content="noindex,nofollow">')],
  ['start-here retains one h1', (startHere.match(/<h1\b/g) ?? []).length === 1],
  ['no service-role key name enters public HTML', !`${showcase}${startHere}`.includes('SUPABASE_SERVICE_ROLE_KEY')],
];

const failures = assertions.filter(([, passed]) => !passed);

for (const [label, passed] of assertions) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
}

if (failures.length) {
  process.exitCode = 1;
  throw new Error(`Phase 3 verification failed: ${failures.map(([label]) => label).join(', ')}`);
}

const publicDirectory = fileURLToPath(new URL('../../../public/', import.meta.url));
const localImageSources = [...new Set(
  [...showcase.matchAll(/<img[^>]+src="(\/images\/[^"]+)"/g)]
    .map(([, source]) => decodeURIComponent(source)),
)];

for (const source of localImageSources) {
  const image = await stat(`${publicDirectory}${source.replace(/^\//, '')}`);
  if (!image.isFile() || image.size < 100) {
    throw new Error(`Invalid local image asset: ${source}`);
  }
}

console.log(`PASS ${localImageSources.length} local showcase image assets exist and are non-empty`);
