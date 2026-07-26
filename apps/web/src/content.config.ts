import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const imageField = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

const seoFields = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  canonical: z.string().url().nullish(),
  image: imageField.nullish(),
  noindex: z.boolean().default(false),
  schema: z.enum(['none', 'faq_page', 'service']).default('none'),
  serviceName: z.string().nullish(),
});

const heroSection = z.object({
  _type: z.literal('hero'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  image: imageField.nullish(),
  primaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }).nullish(),
  secondaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }).nullish(),
});

const textSection = z.object({
  _type: z.literal('text_section'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().min(1),
});

const featureGridSection = z.object({
  _type: z.literal('feature_grid'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  items: z.array(z.object({
    icon: z.enum([
      'calendar',
      'clock',
      'location',
      'power',
      'water',
      'guests',
      'temperature',
      'sparkles',
      'delivery',
    ]),
    title: z.string().min(1),
    description: z.string().min(1),
  })).default([]),
});

const requirementsSection = z.object({
  _type: z.literal('requirements'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  items: z.array(z.object({
    text: z.string().min(1),
  })).default([]),
  aside: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1),
  }),
});

const processSection = z.object({
  _type: z.literal('process'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  steps: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).default([]),
});

const ctaSection = z.object({
  _type: z.literal('cta'),
  heading: z.string().min(1),
  body: z.string().nullish(),
  label: z.string().min(1),
  href: z.string().min(1),
});

const faqListSection = z.object({
  _type: z.literal('faq_list'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  category: z.string().nullish(),
});

const inlineFaqsSection = z.object({
  _type: z.literal('inline_faqs'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  items: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).default([]),
});

const editorialSectionsSection = z.object({
  _type: z.literal('editorial_sections'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  items: z.array(z.object({
    heading: z.string().min(1),
    paragraphs: z.array(z.object({
      text: z.string().min(1),
    })).default([]),
  })).default([]),
});

const linkGridSection = z.object({
  _type: z.literal('link_grid'),
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  image: imageField.nullish(),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1),
    image: imageField.nullish(),
  })).default([]),
});

const pageSections = z.discriminatedUnion('_type', [
  heroSection,
  textSection,
  featureGridSection,
  requirementsSection,
  processSection,
  ctaSection,
  faqListSection,
  inlineFaqsSection,
  editorialSectionsSection,
  linkGridSection,
]);

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: '../../content/pages' }),
  schema: z.object({
    _schema: z.literal('page'),
    title: z.string().min(1),
    description: z.string().min(1),
    draft: z.boolean().default(false),
    sections: z.array(pageSections).default([]),
    seo: seoFields,
  }),
});

const trailers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: '../../content/trailers' }),
  schema: z.object({
    _schema: z.literal('trailer'),
    slug: z.string().min(1),
    draft: z.boolean().default(true),
    order: z.number().int().nonnegative(),
    name: z.string().min(1),
    capacity: z.string().min(1),
    description: z.string().min(1),
    features: z.array(z.string()),
    popular: z.boolean().default(false),
  }),
});

const eventTypes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: '../../content/event-types' }),
  schema: z.object({
    _schema: z.literal('event_type'),
    slug: z.string().min(1),
    draft: z.boolean().default(true),
    seo: seoFields,
    pageTitle: z.string().min(1),
    serviceName: z.string().min(1),
    urlPath: z.string().min(1),
    intro: z.string().min(1),
    ctaTitle: z.string().min(1),
    sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
    resource: z.object({ image: imageField, eyebrow: z.string(), title: z.string(), description: z.string() }),
  }),
});

const serviceAreas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: '../../content/service-areas' }),
  schema: z.object({
    _schema: z.literal('service_area'), slug: z.string(), city: z.string(), state: z.string().length(2),
    draft: z.boolean().default(true), priority: z.boolean().default(false), intro: z.string(), nearby: z.string(),
    venueNote: z.string(), useCases: z.array(z.string()), faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  }).passthrough(),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: '../../content/faqs' }),
  schema: z.object({
    _schema: z.literal('faq'),
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string().min(1),
    order: z.number().int().nonnegative().default(0),
    featured: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: '../../content/testimonials' }),
  schema: z.object({
    _schema: z.literal('testimonial').default('testimonial'),
    customerName: z.string().min(1),
    quote: z.string().min(1),
    eventType: z.string().nullish(),
    eventLocation: z.string().nullish(),
    image: imageField.nullish(),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative().default(0),
    published: z.boolean().default(false),
  }),
});



const resources = defineCollection({
  loader: glob({ pattern: '**/*.json', base: '../../content/resources' }),
  schema: z.object({
    _schema: z.literal('resource'), draft: z.boolean().default(true), slug: z.string(), title: z.string(),
    metaTitle: z.string(), metaDescription: z.string(), excerpt: z.string(), category: z.string(),
    publishDate: z.string(), updatedDate: z.string(), heroImage: z.string(), heroImageAlt: z.string(),
    sections: z.array(z.object({ heading: z.string(), content: z.array(z.string()) })),
  }).passthrough(),
});

export const collections = {
  pages,
  trailers,
  eventTypes,
  serviceAreas,
  faqs,
  testimonials,
  resources,
};
