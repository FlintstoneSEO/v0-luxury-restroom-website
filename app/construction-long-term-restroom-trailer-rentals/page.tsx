import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'construction long term restroom trailer rentals | Signature Luxe Events', description: 'Premium construction long term restroom trailer rentals service in Lansing, MI and Mid-Michigan with fast quote support.' }

export default function Page() {
  const service = serviceJsonLd('construction long term restroom trailer rentals', 'https://www.signatureluxeevents.com/construction-long-term-restroom-trailer-rentals')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'construction long term restroom trailer rentals',item:'/construction-long-term-restroom-trailer-rentals'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(service)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='construction long term restroom trailer rentals' intro='Serving Lansing, MI and Mid-Michigan with premium restroom trailer rentals tailored for your event or project.' /></>
}
