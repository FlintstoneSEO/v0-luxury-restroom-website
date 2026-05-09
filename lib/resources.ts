export type ResourceFaq = {
  question: string
  answer: string
}

export type ResourceSection = {
  heading: string
  content: string[]
}

export type ResourceArticle = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  category: 'Wedding Planning' | 'Event Logistics' | 'Construction & Long-Term'
  publishDate: string
  updatedDate: string
  heroImage: string
  heroImageAlt: string
  primaryKeyword: string
  secondaryKeywords: string[]
  relatedServicePages: { href: string; label: string }[]
  relatedCityPages: { href: string; label: string }[]
  faqs?: ResourceFaq[]
  sections: ResourceSection[]
}

export const resources: ResourceArticle[] = [
  {
    slug: 'how-many-restrooms-for-an-outdoor-wedding',
    title: 'How Many Restrooms Do You Need for an Outdoor Wedding in Michigan?',
    metaTitle: 'How Many Restrooms for Outdoor Wedding | Lansing Planning Guide',
    metaDescription:
      'Learn how to estimate restroom trailer capacity for outdoor weddings in Lansing and Mid-Michigan, including guest count, event length, and alcohol service considerations.',
    excerpt:
      'A practical planning guide to help couples and planners choose the right luxury restroom trailer size for outdoor weddings in Mid-Michigan.',
    category: 'Wedding Planning',
    publishDate: '2026-05-09',
    updatedDate: '2026-05-09',
    heroImage: '/images/Wedding Trailer.png',
    heroImageAlt: 'Luxury restroom trailer at a Michigan outdoor wedding venue',
    primaryKeyword: 'how many restrooms for outdoor wedding',
    secondaryKeywords: ['wedding restroom trailer sizing', 'restroom trailer guest count guide'],
    relatedServicePages: [
      { href: '/wedding-restroom-trailer-rentals', label: 'Wedding Restroom Trailer Rentals' },
      { href: '/request-quote', label: 'Request a Wedding Quote' },
    ],
    relatedCityPages: [
      { href: '/lansing-mi', label: 'Lansing, MI Weddings' },
      { href: '/service-areas/east-lansing-mi', label: 'East Lansing Service Area' },
    ],
    faqs: [
      {
        question: 'Should I size up if alcohol is being served?',
        answer:
          'Yes. Events with bar service typically need more restroom capacity due to increased usage frequency. Sizing up helps reduce lines and keep guests comfortable.',
      },
      {
        question: 'What if my venue has existing restrooms?',
        answer:
          'You can combine venue facilities with a trailer to reduce wait times and improve guest flow. Many planners still choose a trailer to avoid overloading indoor facilities.',
      },
    ],
    sections: [
      {
        heading: 'Start with Guest Count and Event Duration',
        content: [
          'The two biggest variables are total guest count and how long your event lasts. A 4-hour wedding for 120 guests needs less capacity than a full-day celebration with 250 attendees.',
          'As a rule of thumb, plan for peak usage around cocktail hour and immediately after meals. This is when lines usually form if capacity is too tight.',
        ],
      },
      {
        heading: 'Account for Bar Service and Venue Layout',
        content: [
          'If alcohol is served, restroom frequency increases. Add extra capacity when hosting an open bar or extended reception.',
          'Placement also matters. A trailer located too far from main event areas can create bottlenecks, so choose an accessible location near guest traffic.',
        ],
      },
    ],
  },
  {
    slug: 'restroom-trailer-logistics-for-festivals',
    title: 'Festival Restroom Trailer Logistics: Placement, Power, and Guest Flow',
    metaTitle: 'Festival Restroom Trailer Logistics Guide | Mid-Michigan Events',
    metaDescription:
      'Plan restroom trailer logistics for festivals and community events with guidance on placement, access, utility setup, and peak crowd movement.',
    excerpt:
      'A step-by-step checklist for event organizers planning restroom trailer access and operations for high-traffic festivals.',
    category: 'Event Logistics',
    publishDate: '2026-05-09',
    updatedDate: '2026-05-09',
    heroImage: '/images/Special Event Trailer.png',
    heroImageAlt: 'Luxury restroom trailer supporting a community festival event',
    primaryKeyword: 'festival restroom trailer logistics',
    secondaryKeywords: ['event restroom placement', 'festival restroom trailer setup'],
    relatedServicePages: [
      { href: '/festival-community-event-restroom-trailers', label: 'Festival & Community Event Services' },
      { href: '/special-events', label: 'Special Event Restroom Trailer Support' },
    ],
    relatedCityPages: [
      { href: '/service-areas/okemos-mi', label: 'Okemos Service Area' },
      { href: '/service-areas/grand-ledge-mi', label: 'Grand Ledge Service Area' },
    ],
    sections: [
      {
        heading: 'Choose Placement for Visibility and Access',
        content: [
          'Position trailers where guests can find them quickly without disrupting vendor rows, stages, or emergency lanes.',
          'Keep units near primary walkways and provide clear directional signage to reduce confusion during peak attendance periods.',
        ],
      },
    ],
  },
]

export const resourcesBySlug = Object.fromEntries(resources.map((resource) => [resource.slug, resource]))
