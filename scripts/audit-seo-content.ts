import fs from 'node:fs'
import path from 'node:path'
// @ts-ignore
import { finalRoutes, cityPages } from '../lib/seo.ts'
// @ts-ignore
import { resources } from '../lib/resources.ts'
// @ts-ignore
import { cityContent, priorityCitySlugs } from '../lib/city-pages.ts'

const strict = process.env.SEO_AUDIT_STRICT === 'true'
const errors: string[] = []
const warnings: string[] = []

const requiredCityFields = ['intro', 'nearby', 'venueNote', 'useCases', 'faqs'] as const
const requiredPriorityFields = ['localOverview','weddingUseCase','privateEventUseCase','corporateFestivalUseCase','constructionLongTermUseCase','setupLogistics','seasonalPlanning','resourceLinks','serviceLinks'] as const
const requiredResourceFields = ['slug','title','metaTitle','metaDescription','excerpt','category','publishDate','updatedDate','heroImage','heroImageAlt','primaryKeyword','secondaryKeywords','relatedServicePages','relatedCityPages','relatedResources','sections','faqs'] as const
const placeholders = ['todo','lorem','placeholder','coming soon','sample text']
const legacyLinks = new Set(['/our-restrooms','/weddings','/special-events','/construction-long-term','/disaster-relief-government','/lansing-mi','/east-lansing-mi','/okemos-mi'])

const finalRouteSet = new Set(finalRoutes)
const cityPageSet = new Set(cityPages.map((city) => `/service-areas/${city.slug}`))
const resourceSet = new Set(resources.map((resource) => `/resources/${resource.slug}`))

function hasRoute(route: string) {
  const page = route === '/'
    ? path.join(process.cwd(), 'app/page.tsx')
    : path.join(process.cwd(), 'app', route.slice(1), 'page.tsx')
  return fs.existsSync(page)
}

function printGroup(label: string, items: string[]) {
  console.log(`\n${label} (${items.length})`)
  if (!items.length) return console.log('  (none)')
  for (const item of items) console.log(`  - ${item}`)
}

for (const route of finalRoutes) if (!hasRoute(route)) errors.push(`Missing app page for finalRoutes entry: ${route}`)
if (!hasRoute('/resources')) errors.push('Missing /resources page')
if (!fs.existsSync(path.join(process.cwd(), 'app/resources/[slug]/page.tsx'))) errors.push('Missing /resources/[slug] page')
if (!fs.existsSync(path.join(process.cwd(), 'app/service-areas/[citySlug]/page.tsx'))) errors.push('Missing /service-areas/[citySlug] page')

for (const city of cityPages) {
  const data = (cityContent as Record<string, any>)[city.slug]
  if (!data) { errors.push(`Missing cityContent entry for ${city.slug}`); continue }
  for (const field of requiredCityFields) if (!(field in data)) errors.push(`City ${city.slug} missing field: ${field}`)
  if (Array.isArray(data.useCases) && data.useCases.length < 3) errors.push(`City ${city.slug} has fewer than 3 use cases`)
  if (Array.isArray(data.faqs) && data.faqs.length < 3) errors.push(`City ${city.slug} has fewer than 3 FAQs`)
  if ((priorityCitySlugs as Set<string>).has(city.slug)) {
    for (const field of requiredPriorityFields) if (!(field in data)) errors.push(`Priority city ${city.slug} missing expanded field: ${field}`)
  }

  for (const link of data.resourceLinks ?? []) if (!resourceSet.has(link.href)) errors.push(`City ${city.slug} resourceLinks href does not exist in resources: ${link.href}`)
  for (const link of data.serviceLinks ?? []) if (!finalRouteSet.has(link.href)) errors.push(`City ${city.slug} serviceLinks href does not exist in finalRoutes: ${link.href}`)
}

const slugSeen = new Set<string>(), titleSeen = new Set<string>(), keywordSeen = new Set<string>()
for (const resource of resources as any[]) {
  for (const field of requiredResourceFields) if (!(field in resource)) errors.push(`Resource ${resource.slug ?? '(no slug)'} missing field: ${field}`)

  for (const link of resource.relatedResources ?? []) if (!resourceSet.has(link.href)) errors.push(`Resource ${resource.slug} relatedResources href does not exist in resources: ${link.href}`)
  for (const link of resource.relatedServicePages ?? []) if (!finalRouteSet.has(link.href)) errors.push(`Resource ${resource.slug} relatedServicePages href does not exist in finalRoutes: ${link.href}`)
  for (const link of resource.relatedCityPages ?? []) if (!cityPageSet.has(link.href)) errors.push(`Resource ${resource.slug} relatedCityPages href does not exist in cityPages: ${link.href}`)

  if ((resource.sections?.length ?? 0) < 3) errors.push(`Resource ${resource.slug} has fewer than 3 sections`)
  if ((resource.faqs?.length ?? 0) < 4) errors.push(`Resource ${resource.slug} has fewer than 4 FAQs`)
  if ((resource.relatedServicePages?.length ?? 0) < 2) errors.push(`Resource ${resource.slug} has fewer than 2 related service pages`)
  if ((resource.relatedCityPages?.length ?? 0) < 2) errors.push(`Resource ${resource.slug} has fewer than 2 related city pages`)
  if ((resource.relatedResources?.length ?? 0) < 2) errors.push(`Resource ${resource.slug} has fewer than 2 related resources`)

  if (resource.metaTitle?.length < 35 || resource.metaTitle?.length > 65) warnings.push(`Resource ${resource.slug} metaTitle length ${resource.metaTitle?.length} (target 35-65)`)
  if (resource.metaDescription?.length < 120 || resource.metaDescription?.length > 160) warnings.push(`Resource ${resource.slug} metaDescription length ${resource.metaDescription?.length} (target 120-160)`)

  if (slugSeen.has(resource.slug)) errors.push(`Duplicate resource slug: ${resource.slug}`)
  slugSeen.add(resource.slug)
  if (titleSeen.has(resource.metaTitle)) errors.push(`Duplicate metaTitle: ${resource.metaTitle}`)
  titleSeen.add(resource.metaTitle)
  if (keywordSeen.has(resource.primaryKeyword)) errors.push(`Duplicate primaryKeyword: ${resource.primaryKeyword}`)
  keywordSeen.add(resource.primaryKeyword)

  const resourceText = JSON.stringify(resource).toLowerCase()
  for (const term of placeholders) if (resourceText.includes(term)) errors.push(`Resource ${resource.slug} includes placeholder term: "${term}"`)

  for (const rel of [...(resource.relatedServicePages ?? []), ...(resource.relatedCityPages ?? []), ...(resource.relatedResources ?? [])]) {
    if (legacyLinks.has(rel.href)) errors.push(`Resource ${resource.slug} includes legacy related link: ${rel.href}`)
  }
}

console.log('=== SEO Content Audit ===')
printGroup('Errors (fix before publishing)', errors)
printGroup('Warnings (improvements)', warnings)
console.log('\nUsage:')
console.log('  npm run seo:audit-content')
console.log('  SEO_AUDIT_STRICT=true npm run seo:audit-content')

if (strict && errors.length) {
  console.error(`\nStrict mode enabled. Failing due to ${errors.length} error(s).`)
  process.exit(1)
}

console.log('\nAudit complete.')
