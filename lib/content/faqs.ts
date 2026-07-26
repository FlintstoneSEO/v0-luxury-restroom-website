import { readJsonCollection } from './collection-files'
import { faqSchema, type Faq } from './schemas'

let faqCache: Faq[] | undefined

export function getFaqs(options?: { featured?: boolean; category?: string }): Faq[] {
  const content = faqCache ??= readJsonCollection('faqs', faqSchema).sort((a, b) => a.order - b.order)
  return content.filter((faq) =>
    (options?.featured === undefined || faq.featured === options.featured) &&
    (!options?.category || faq.category === options.category),
  )
}
