import type { Metadata } from 'next'
import { ServicePageTemplate } from '@/components/service-page-template'
import { getEventTypeOrThrow } from '@/lib/content/event-types'

const content = getEventTypeOrThrow('festivals-community-events')

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  alternates: { canonical: content.seo.canonical },
  openGraph: { title: content.seo.title, description: content.seo.description, url: content.seo.canonical ?? content.urlPath },
  twitter: { card: 'summary_large_image', title: content.seo.title, description: content.seo.description },
}

export default function Page() {
  return <ServicePageTemplate
    pageTitle={content.pageTitle}
    serviceName={content.serviceName}
    urlPath={content.urlPath}
    intro={content.intro}
    ctaTitle={content.ctaTitle}
    sections={content.sections}
    faqs={content.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))}
    resourceImageSrc={content.resource.image.src}
    resourceImageAlt={content.resource.image.alt}
    resourceEyebrow={content.resource.eyebrow}
    resourceTitle={content.resource.title}
    resourceDescription={content.resource.description}
  />
}
