import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const root = process.cwd()
const contentRoot = join(root, 'content')
const files = []
const errors = []
const warnings = []
const slugs = new Map()
const faqQuestions = new Map()
const faqOrders = new Map()
const trailerOrders = new Map()

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (!name.startsWith('.')) files.push(path)
  }
}

function inspect(value, source, keyPath = []) {
  if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, source, [...keyPath, String(index)]))
  if (!value || typeof value !== 'object') return
  if (typeof value.src === 'string') {
    if (!value.alt || typeof value.alt !== 'string' || !value.alt.trim()) errors.push(`${source}: image ${value.src} is missing alt text`)
    if (value.src.startsWith('/')) {
      const asset = resolve(root, 'public', value.src.replace(/^\//, ''))
      if (!existsSync(asset)) errors.push(`${source}: image does not exist: ${value.src}`)
    }
  }
  for (const [key, child] of Object.entries(value)) inspect(child, source, [...keyPath, key])
}

walk(contentRoot)
for (const file of files) {
  const source = relative(root, file)
  const extension = extname(file)
  const raw = readFileSync(file, 'utf8')
  if (extension === '.json') {
    try {
      const value = JSON.parse(raw)
      inspect(value, source)
      if (source.startsWith('content/resources/') && typeof value.heroImage === 'string') {
        if (!value.heroImageAlt || !value.heroImageAlt.trim()) errors.push(`${source}: heroImage is missing heroImageAlt`)
        if (value.heroImage.startsWith('/') && !existsSync(resolve(root, 'public', value.heroImage.replace(/^\//, '')))) errors.push(`${source}: hero image does not exist: ${value.heroImage}`)
        if (Number.isNaN(Date.parse(value.publishDate)) || Number.isNaN(Date.parse(value.updatedDate))) errors.push(`${source}: resource dates must be valid`)
      }
      if (typeof value.slug === 'string') {
        const prior = slugs.get(value.slug)
        if (prior) errors.push(`duplicate slug "${value.slug}": ${prior}, ${source}`)
        else slugs.set(value.slug, source)
      }
      if (source.startsWith('content/trailers/') && typeof value.order === 'number') {
        const priorOrder = trailerOrders.get(value.order)
        if (priorOrder) errors.push(`duplicate trailer order ${value.order}: ${priorOrder}, ${source}`)
        else trailerOrders.set(value.order, source)
      }
      if (source.startsWith('content/faqs/') && typeof value.question === 'string') {
        const priorQuestion = faqQuestions.get(value.question)
        if (priorQuestion) errors.push(`duplicate FAQ question "${value.question}": ${priorQuestion}, ${source}`)
        else faqQuestions.set(value.question, source)
        const priorOrder = faqOrders.get(value.order)
        if (priorOrder) errors.push(`duplicate FAQ order ${value.order}: ${priorOrder}, ${source}`)
        else faqOrders.set(value.order, source)
      }
    } catch (error) {
      errors.push(`${source}: invalid JSON (${error.message})`)
    }
  } else if ((extension === '.md' || extension === '.mdx') && !raw.startsWith('---\n')) {
    errors.push(`${source}: Markdown content is missing YAML front matter`)
  }
}

if (!existsSync(join(root, 'public/images/uploads'))) errors.push('public/images/uploads is missing')
if (warnings.length) warnings.forEach((warning) => console.warn(`WARN ${warning}`))
if (errors.length) {
  errors.forEach((error) => console.error(`ERROR ${error}`))
  process.exitCode = 1
} else {
  console.log(`Validated ${files.length} content files; no duplicate JSON slugs/FAQ or trailer keys, missing local images, or missing structured-image alt text found.`)
}
