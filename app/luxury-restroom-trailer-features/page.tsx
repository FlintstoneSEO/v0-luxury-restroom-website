import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'luxury restroom trailer features | Signature Luxe Events', description: 'Premium luxury restroom trailer features service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('luxury restroom trailer features', 'https://www.signatureluxeevents.com/luxury-restroom-trailer-features')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'luxury restroom trailer features',item:'/luxury-restroom-trailer-features'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='luxury restroom trailer features' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
