import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'corporate event restroom trailers | Signature Luxe Events', description: 'Premium corporate event restroom trailers service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('corporate event restroom trailers', 'https://www.signatureluxeevents.com/corporate-event-restroom-trailers')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'corporate event restroom trailers',item:'/corporate-event-restroom-trailers'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='corporate event restroom trailers' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
