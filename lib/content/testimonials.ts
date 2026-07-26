import { readJsonCollection } from './collection-files'
import { testimonialSchema, type Testimonial } from './schemas'

let testimonialCache: Testimonial[] | undefined

export function getTestimonials(options?: { featured?: boolean }): Testimonial[] {
  const content = testimonialCache ??= readJsonCollection('testimonials', testimonialSchema).sort((a, b) => a.order - b.order)
  return content.filter((testimonial) =>
    testimonial.published && (options?.featured === undefined || testimonial.featured === options.featured),
  )
}
