import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'wedding restroom trailer rentals | Signature Luxe Events', description: 'Premium wedding restroom trailer rentals service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('wedding restroom trailer rentals', 'https://www.signatureluxeevents.com/wedding-restroom-trailer-rentals')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'wedding restroom trailer rentals',item:'/wedding-restroom-trailer-rentals'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='wedding restroom trailer rentals' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
