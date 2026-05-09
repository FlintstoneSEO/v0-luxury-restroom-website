import fs from 'node:fs'
import path from 'node:path'
import { finalRoutes, cityPages } from '../lib/seo.ts'
import { resources } from '../lib/resources.ts'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'components', 'lib']
const VALID_EXTENSIONS = new Set(['.ts', '.tsx'])
const LOW_LINK_THRESHOLD = Number(process.env.SEO_AUDIT_LOW_THRESHOLD ?? 2)

const LEGACY_URLS = [
  '/our-restrooms',
  '/weddings',
  '/special-events',
  '/construction-/-long-term',
  '/disaster-relief-/-government',
]

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    if (!entry.isFile()) continue
    const ext = path.extname(entry.name)
    if (VALID_EXTENSIONS.has(ext)) files.push(fullPath)
  }

  return files
}

function normalizeUrl(url: string): string {
  const withoutHash = url.split('#')[0]
  const withoutQuery = withoutHash.split('?')[0]
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) return withoutQuery.slice(0, -1)
  return withoutQuery
}

function findInternalLinks(content: string): string[] {
  // Matches href="/...", href='...', href={`/...`}, and plain string constants '/...'
  const regex = /(?:href|to|item|urlPath|pathname)\s*[:=]\s*(?:\{\s*)?(["'`])(\/[A-Za-z0-9\-/_?=#.&]*)\1/g
  const matches: string[] = []

  for (const match of content.matchAll(regex)) {
    const raw = match[2]
    if (!raw || raw.startsWith('//')) continue
    matches.push(normalizeUrl(raw))
  }

  return matches
}

function printSection(title: string, rows: Array<{ url: string; count: number }>) {
  console.log(`\n${title}`)
  if (!rows.length) {
    console.log('  (none)')
    return
  }
  for (const row of rows) {
    console.log(`  ${String(row.count).padStart(4, ' ')}  ${row.url}`)
  }
}

function audit() {
  const files = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  const counts = new Map<string, number>()

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const links = findInternalLinks(content)
    for (const link of links) {
      counts.set(link, (counts.get(link) ?? 0) + 1)
    }
  }

  const allInternal = [...counts.entries()]
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => (a.url > b.url ? 1 : -1))

  const lowOrZeroFinalRoutes = finalRoutes
    .map((url) => ({ url: normalizeUrl(url), count: counts.get(normalizeUrl(url)) ?? 0 }))
    .filter((row) => row.count <= LOW_LINK_THRESHOLD)
    .sort((a, b) => a.count - b.count || a.url.localeCompare(b.url))

  const cityUrls = cityPages.map((city) => `/service-areas/${city.slug}`)
  const lowOrZeroCityPages = cityUrls
    .map((url) => ({ url, count: counts.get(url) ?? 0 }))
    .filter((row) => row.count <= LOW_LINK_THRESHOLD)
    .sort((a, b) => a.count - b.count || a.url.localeCompare(b.url))

  const resourceUrls = resources.map((resource) => `/resources/${resource.slug}`)
  const lowOrZeroResourcePages = resourceUrls
    .map((url) => ({ url, count: counts.get(url) ?? 0 }))
    .filter((row) => row.count <= LOW_LINK_THRESHOLD)
    .sort((a, b) => a.count - b.count || a.url.localeCompare(b.url))

  const legacyRows = LEGACY_URLS.map((url) => ({ url, count: counts.get(url) ?? 0 }))

  console.log('=== Internal Link Audit ===')
  console.log(`Scanned files: ${files.length}`)
  console.log(`Unique internal URLs found: ${allInternal.length}`)
  console.log(`Low-link threshold: <= ${LOW_LINK_THRESHOLD}`)

  printSection('All internal URLs found (count desc)', [...allInternal].sort((a, b) => b.count - a.count || a.url.localeCompare(b.url)))
  printSection('finalRoutes with zero/low internal links', lowOrZeroFinalRoutes)
  printSection('City pages with zero/low internal links', lowOrZeroCityPages)
  printSection('Resource articles with zero/low internal links', lowOrZeroResourcePages)
  printSection('Legacy URL checks', legacyRows)

  console.log('\nAudit complete. This report is informational and does not fail builds.')
}

audit()
