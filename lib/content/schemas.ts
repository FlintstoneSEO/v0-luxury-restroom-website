import { z } from 'zod'

export const linkSchema = z.object({ label: z.string().min(1), href: z.string().min(1) })
export const imageSchema = z.object({ src: z.string().min(1), alt: z.string().min(1) })
export const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  canonical: z.string().min(1).nullable().optional(),
  image: imageSchema.nullish(),
  noindex: z.boolean().default(false),
  schema: z.enum(['none', 'faq_page', 'service']).default('none'),
})
export const homepageSchema = z.object({
  _schema: z.literal('homepage'),
  slug: z.literal('home'),
  draft: z.boolean().default(false),
  seo: seoSchema,
  hero: z.object({
    eyebrow: z.string().min(1), heading: z.string().min(1), body: z.string().min(1),
    primaryCta: linkSchema, secondaryCta: linkSchema, location: z.string().min(1),
  }),
  features: z.array(z.object({ title: z.string(), icon: z.enum(['temperature', 'door', 'sparkles', 'water', 'presentation', 'power']) })),
  galleryImages: z.array(imageSchema.extend({ id: z.string(), category: z.string() })),
  processSteps: z.array(z.object({ number: z.number().int().positive(), title: z.string().min(1) })),
  services: z.array(z.object({ title: z.string(), description: z.string(), href: z.string(), mediaKey: z.string() })),
  eventScenarios: z.array(z.object({ label: z.string(), mediaKey: z.string() })),
  serviceAreas: z.array(z.string().min(1)),
})
export const navigationSchema = z.object({
  utilityMessage: z.string(),
  primary: z.array(linkSchema.extend({ children: z.array(linkSchema).optional() })).min(1),
  cta: linkSchema,
  logo: imageSchema,
})
export const footerSchema = z.object({
  tagline: z.string().min(1),
  location: z.string().min(1),
  hours: z.array(z.string().min(1)).min(1),
  groups: z.array(z.object({ heading: z.string().min(1), links: z.array(linkSchema), cta: linkSchema.optional() })),
  serviceAreas: z.array(linkSchema),
  serviceStatement: z.string().min(1),
  socials: z.array(linkSchema),
  copyrightName: z.string().min(1),
  credit: linkSchema,
})
export const businessSchema = z.object({
  name: z.string().min(1), phone: z.string().min(1), phoneHref: z.string().startsWith('tel:'),
  serviceRegion: z.string().min(1), email: z.string().email(), emailHref: z.string().startsWith('mailto:'),
})
export const seoDefaultsSchema = z.object({
  siteName: z.string().min(1), defaultTitle: z.string().min(1), titleTemplate: z.string().min(1),
  defaultDescription: z.string().min(1), canonicalOrigin: z.string().url(),
  defaultImage: imageSchema.extend({ width: z.number().int().positive(), height: z.number().int().positive() }),
  keywords: z.array(z.string().min(1)), locale: z.string().min(1),
})
export const faqSchema = z.object({
  _schema: z.literal('faq'), question: z.string().min(1), answer: z.string().min(1),
  category: z.string().min(1), order: z.number().int().nonnegative(), featured: z.boolean().default(false),
})
export const trailerSchema = z.object({
  _schema: z.literal('trailer'), slug: z.string().min(1), draft: z.boolean().default(true), order: z.number().int().nonnegative(),
  name: z.string().min(1), capacity: z.string().min(1), description: z.string().min(1),
  features: z.array(z.string().min(1)), popular: z.boolean().default(false),
})
export const galleryPageSchema = z.object({
  _schema: z.literal('gallery'), slug: z.literal('gallery'), seo: seoSchema,
  hero: z.object({ eyebrow: z.string(), heading: z.string(), body: z.string(), primaryCta: linkSchema, fallbackImage: imageSchema }),
  images: z.array(imageSchema.extend({ id: z.string(), category: z.string() })),
  sections: z.array(z.object({ category: z.string(), eyebrow: z.string(), heading: z.string(), body: z.string(), columns: z.union([z.literal(2), z.literal(3), z.literal(4)]) })),
  featureOverride: z.object({ id: z.string(), mediaKey: z.string(), fallbackImage: imageSchema }),
  cta: z.object({ heading: z.string(), body: z.string(), label: z.string(), href: z.string() }),
})
export const eventTypeSchema = z.object({
  _schema: z.literal('event_type'), slug: z.string().min(1), draft: z.boolean().default(true), seo: seoSchema,
  pageTitle: z.string().min(1), serviceName: z.string().min(1), urlPath: z.string().startsWith('/'),
  intro: z.string().min(1), ctaTitle: z.string().min(1),
  sections: z.array(z.object({ heading: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1) })).min(1),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })),
  resource: z.object({ image: imageSchema, eyebrow: z.string().min(1), title: z.string().min(1), description: z.string().min(1) }),
})
export const testimonialSchema = z.object({
  _schema: z.literal('testimonial').default('testimonial'), customerName: z.string().min(1), quote: z.string().min(1),
  eventType: z.string().nullish(), eventLocation: z.string().nullish(), image: imageSchema.nullish(),
  featured: z.boolean().default(false), order: z.number().int().nonnegative().default(0), published: z.boolean().default(false),
})

export type HomepageContent = z.infer<typeof homepageSchema>
export type Navigation = z.infer<typeof navigationSchema>
export type FooterContent = z.infer<typeof footerSchema>
export type Business = z.infer<typeof businessSchema>
export type SeoDefaults = z.infer<typeof seoDefaultsSchema>
export type Faq = z.infer<typeof faqSchema>
export type Testimonial = z.infer<typeof testimonialSchema>

export type EventType = z.infer<typeof eventTypeSchema>

export type GalleryPageContent = z.infer<typeof galleryPageSchema>

export type Trailer = z.infer<typeof trailerSchema>

const relatedLinkSchema = z.object({ href: z.string().min(1), label: z.string().min(1) })
export const serviceAreaSchema = z.object({
  _schema: z.literal('service_area'), slug: z.string().min(1), city: z.string().min(1), state: z.string().length(2),
  draft: z.boolean().default(true), priority: z.boolean().default(false), intro: z.string().min(1), nearby: z.string().min(1),
  venueNote: z.string().min(1), useCases: z.array(z.string().min(1)), faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  localOverview: z.array(z.string()).optional(), weddingUseCase: z.array(z.string()).optional(), privateEventUseCase: z.array(z.string()).optional(),
  corporateFestivalUseCase: z.array(z.string()).optional(), constructionLongTermUseCase: z.array(z.string()).optional(),
  setupLogistics: z.array(z.string()).optional(), seasonalPlanning: z.array(z.string()).optional(), nearbyCommunities: z.array(z.string()).optional(),
  resourceLinks: z.array(relatedLinkSchema).optional(), serviceLinks: z.array(relatedLinkSchema).optional(), trustNote: z.string().optional(),
})
export const resourceSchema = z.object({
  _schema: z.literal('resource'), draft: z.boolean().default(true), slug: z.string().min(1), title: z.string().min(1),
  metaTitle: z.string().min(1), metaDescription: z.string().min(1), excerpt: z.string().min(1),
  category: z.enum(['Wedding Planning', 'Event Logistics', 'Construction & Long-Term']),
  publishDate: z.string().date(), updatedDate: z.string().date(), heroImage: z.string().min(1), heroImageAlt: z.string().min(1),
  primaryKeyword: z.string().min(1), secondaryKeywords: z.array(z.string()), relatedServicePages: z.array(relatedLinkSchema),
  relatedCityPages: z.array(relatedLinkSchema), relatedResources: z.array(relatedLinkSchema),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  sections: z.array(z.object({ heading: z.string(), content: z.array(z.string()) })),
})
export type ServiceArea = z.infer<typeof serviceAreaSchema>
export type ResourceArticle = z.infer<typeof resourceSchema>
export const serviceAreaIndexSchema = z.object({
  _schema: z.literal('service_area_index'), seo: seoSchema, primarySlugs: z.array(z.string()), featuredSlugs: z.array(z.string()),
  extendedSlugs: z.array(z.string()), additionalMarkets: z.array(z.string()),
})
export const resourceIndexSchema = z.object({
  _schema: z.literal('resource_index'), seo: seoSchema, featuredSlugs: z.array(z.string()), serviceLinks: z.array(relatedLinkSchema),
})
