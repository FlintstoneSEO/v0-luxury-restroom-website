import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'Luxury Restroom Trailer Rentals in Haslett, MI', description: 'Luxury restroom trailer rental in Haslett, MI for weddings, private events, corporate events, construction, and emergency needs.' }

export default function Page() {
  const business = localBusinessJsonLd('Haslett')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'Service Areas',item:'/service-areas'},{name:'Haslett, MI',item:'/haslett-mi'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(business)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='Luxury Restroom Trailer Rentals in Haslett, MI' intro='Signature Luxe provides clean, modern restroom trailer rentals in Haslett and nearby Mid-Michigan communities with responsive service and quote-first planning.' city='Haslett' /></>
}
