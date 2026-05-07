import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'private event restroom trailers | Signature Luxe Events', description: 'Premium private event restroom trailers service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('private event restroom trailers', 'https://www.signatureluxeevents.com/private-event-restroom-trailers')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'private event restroom trailers',item:'/private-event-restroom-trailers'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='private event restroom trailers' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
