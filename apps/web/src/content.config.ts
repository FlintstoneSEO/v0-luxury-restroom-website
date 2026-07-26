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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/trailers' }),
  schema: z.object({
    name: z.string().min(1),
    summary: z.string().min(1),
    capacity: z.string().min(1),
    stations: z.number().int().positive(),
    featuredImage: imageField,
    gallery: z.array(imageField).default([]),
    features: z.array(z.string()).default([]),
    seo: seoFields,
    draft: z.boolean().default(false),
  }),
});

const eventTypes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/event-types' }),
  schema: z.object({
    name: z.string().min(1),
    summary: z.string().min(1),
    featuredImage: imageField,
    relatedTrailers: z.array(z.string()).default([]),
    faqs: z.array(z.string()).default([]),
    sections: z.array(pageSections).default([]),
    seo: seoFields,
    draft: z.boolean().default(false),
  }),
});

const serviceAreas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/service-areas' }),
  schema: z.object({
    city: z.string().min(1),
    state: z.string().length(2),
    summary: z.string().min(1),
    nearbyAreas: z.array(z.string()).default([]),
    featuredImage: imageField.nullish(),
    faqs: z.array(z.string()).default([]),
    seo: seoFields,
    draft: z.boolean().default(false),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string().min(1),
    order: z.number().int().nonnegative().default(0),
    featured: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/testimonials' }),
  schema: z.object({
    customerName: z.string().min(1),
    quote: z.string().min(1),
    eventType: z.string().nullish(),
    eventLocation: z.string().nullish(),
    image: imageField.nullish(),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative().default(0),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    excerpt: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().nullish(),
    author: z.string().min(1),
    featuredImage: imageField,
    categories: z.array(z.string()).default([]),
    seo: seoFields,
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  pages,
  trailers,
  eventTypes,
  serviceAreas,
  faqs,
  testimonials,
  blog,
};
