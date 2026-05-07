import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'festival community event restroom trailers | Signature Luxe Events', description: 'Premium festival community event restroom trailers service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('festival community event restroom trailers', 'https://www.signatureluxeevents.com/festival-community-event-restroom-trailers')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'festival community event restroom trailers',item:'/festival-community-event-restroom-trailers'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='festival community event restroom trailers' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
