import { z } from 'zod'
import { seoSchema } from './schemas'

const servicePageDataSchema = z.object({
  _schema: z.literal('service_page_data'),
  slug: z.string().min(1),
  draft: z.boolean().default(true),
  seo: seoSchema,
  data: z.record(z.string(), z.unknown()),
})

export function defineServicePageData<const Content>(content: Content): Content {
  servicePageDataSchema.parse(content)
  return content
}
