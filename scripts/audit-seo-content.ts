import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { finalRoutes, cityPages } from '../lib/seo.ts'
import { resources } from '../lib/resources.ts'

type Finding = { level: 'ERROR' | 'WARN'; message: string }
const findings: Finding[] = []

const add = (level: Finding['level'], message: string) => findings.push({ level, message })
const root = process.cwd()

const META_TITLE_MIN = 35
const META_TITLE_MAX = 65
const META_DESC_MIN = 120
const META_DESC_MAX = 160
const PLACEHOLDER_RE = /\b(todo|lorem|coming soon|placeholder)\b/i
const PRIORITY_CITY_SLUGS = ['lansing-mi', 'east-lansing-mi', 'okemos-mi', 'haslett-mi', 'grand-ledge-mi', 'dewitt-mi'] as const

function existsRoute(route: string): boolean {
  if (route === '/') return fs.existsSync(path.join(root, 'app/page.tsx'))
  const clean = route.replace(/^\//, '')
  return fs.existsSync(path.join(root, 'app', clean, 'page.tsx'))
}

function getCityContentBlock(slug: string, serviceAreasSource: string): string | null {
  const pattern = new RegExp(`['\"]${slug}['\"]\\s*:\\s*\\{([\\s\\S]*?)\\}\\s*,?\\n`, 'm')
  const match = serviceAreasSource.match(pattern)
  return match ? match[1] : null
}

function hasKey(block: string, key: string): boolean {
  return new RegExp(`\\b${key}\\s*:`).test(block)
}

function run() {
  // 1) finalRoutes have a corresponding page/route
  for (const route of finalRoutes) {
    if (!existsRoute(route)) add('ERROR', `Missing route file for finalRoutes entry: ${route}`)
  }

  // 2) City page content checks
  const serviceAreasPath = path.join(root, 'app/service-areas/[citySlug]/page.tsx')
  const serviceAreasSource = fs.readFileSync(serviceAreasPath, 'utf8')

  for (const city of cityPages) {
    const block = getCityContentBlock(city.slug, serviceAreasSource)
    if (!block) {
      add('ERROR', `City content block missing for slug: ${city.slug}`)
      continue
    }

    for (const key of ['intro', 'nearby', 'useCases', 'faqs']) {
      if (!hasKey(block, key)) add('ERROR', `City ${city.slug} missing required field: ${key}`)
    }

    const faqItems = (block.match(/\{\s*q\s*:/g) ?? []).length
    const useCaseItems = (block.match(/useCases\s*:\s*\[([\s\S]*?)\]/)?.[1].match(/'/g)?.length ?? 0) / 2
    if (faqItems === 0) add('ERROR', `City ${city.slug} has no FAQs`)
    if (useCaseItems === 0) add('ERROR', `City ${city.slug} has no use cases`)

    if (PRIORITY_CITY_SLUGS.includes(city.slug as (typeof PRIORITY_CITY_SLUGS)[number])) {
      for (const key of ['venueNote']) {
        if (!hasKey(block, key)) add('WARN', `Priority city ${city.slug} missing expanded field: ${key}`)
      }
      if (faqItems < 4) add('WARN', `Priority city ${city.slug} should have at least 4 FAQs (found ${faqItems})`)
      if (useCaseItems < 4) add('WARN', `Priority city ${city.slug} should have at least 4 use cases (found ${useCaseItems})`)
    }

    if (PLACEHOLDER_RE.test(block)) add('ERROR', `City ${city.slug} contains placeholder text`)
  }

  // 3) Resource checks
  const slugSet = new Set<string>()
  const metaTitleSet = new Map<string, string>()

  for (const resource of resources) {
    const requiredKeys: Array<keyof typeof resource> = [
      'title', 'metaTitle', 'metaDescription', 'category', 'slug', 'sections', 'relatedServicePages', 'relatedCityPages'
    ]

    for (const key of requiredKeys) {
      const value = resource[key]
      if (value == null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
        add('ERROR', `Resource ${resource.slug} missing required field: ${String(key)}`)
      }
    }

    if (!resource.faqs || resource.faqs.length === 0) add('ERROR', `Resource ${resource.slug} missing FAQs`)

    if (resource.metaTitle.length < META_TITLE_MIN || resource.metaTitle.length > META_TITLE_MAX) {
      add('WARN', `Resource ${resource.slug} metaTitle length ${resource.metaTitle.length} outside ${META_TITLE_MIN}-${META_TITLE_MAX}`)
    }
    if (resource.metaDescription.length < META_DESC_MIN || resource.metaDescription.length > META_DESC_MAX) {
      add('WARN', `Resource ${resource.slug} metaDescription length ${resource.metaDescription.length} outside ${META_DESC_MIN}-${META_DESC_MAX}`)
    }

    if (slugSet.has(resource.slug)) add('ERROR', `Duplicate resource slug: ${resource.slug}`)
    slugSet.add(resource.slug)

    const normalizedMetaTitle = resource.metaTitle.trim().toLowerCase()
    if (metaTitleSet.has(normalizedMetaTitle)) {
      add('ERROR', `Duplicate metaTitle between ${metaTitleSet.get(normalizedMetaTitle)} and ${resource.slug}`)
    } else {
      metaTitleSet.set(normalizedMetaTitle, resource.slug)
    }

    for (const faq of resource.faqs ?? []) {
      if (!faq.answer || faq.answer.trim() === '') add('ERROR', `Resource ${resource.slug} has empty FAQ answer: "${faq.question}"`)
    }

    const blob = JSON.stringify(resource)
    if (PLACEHOLDER_RE.test(blob)) add('ERROR', `Resource ${resource.slug} contains placeholder text`)
  }

  // 4) No internal links to legacy URLs except next.config redirects
  const nextConfig = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8')
  const legacySources = [...nextConfig.matchAll(/source:\s*['\"]([^'\"]+)['\"]/g)].map((m) => m[1])
  const candidateFiles = execSync("rg --files app components lib scripts", { encoding: 'utf8', shell: '/bin/bash' })
    .split('\n')
    .filter(Boolean)
    .filter((f: string) => !f.endsWith('next.config.mjs'))

  for (const file of candidateFiles) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    for (const legacy of legacySources) {
      if (legacy === '/') continue
      if (source.includes(legacy)) add('ERROR', `Legacy URL ${legacy} found in ${file}`)
    }
  }

  const errors = findings.filter((f) => f.level === 'ERROR')
  const warns = findings.filter((f) => f.level === 'WARN')

  console.log('\nSEO CONTENT QA REPORT')
  console.log('=====================')
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warns.length}`)

  if (errors.length) {
    console.log('\nERRORS:')
    errors.forEach((f) => console.log(` - ${f.message}`))
  }
  if (warns.length) {
    console.log('\nWARNINGS:')
    warns.forEach((f) => console.log(` - ${f.message}`))
  }

  console.log(`\nStatus: ${errors.length ? 'FAIL' : 'PASS'}`)
  process.exitCode = errors.length ? 1 : 0
}

run()
