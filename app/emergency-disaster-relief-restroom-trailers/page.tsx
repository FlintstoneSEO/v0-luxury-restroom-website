import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'emergency disaster relief restroom trailers | Signature Luxe Events', description: 'Premium emergency disaster relief restroom trailers service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('emergency disaster relief restroom trailers', 'https://www.signatureluxeevents.com/emergency-disaster-relief-restroom-trailers')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'emergency disaster relief restroom trailers',item:'/emergency-disaster-relief-restroom-trailers'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='emergency disaster relief restroom trailers' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
