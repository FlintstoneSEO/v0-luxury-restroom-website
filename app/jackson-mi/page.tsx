import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'Luxury Restroom Trailer Rentals in Jackson, MI', description: 'Luxury restroom trailer rental in Jackson, MI for weddings, private events, corporate events, construction, and emergency needs.' }

export default function Page() {
  const business = localBusinessJsonLd('Jackson')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'Service Areas',item:'/service-areas'},{name:'Jackson, MI',item:'/jackson-mi'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(business)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='Luxury Restroom Trailer Rentals in Jackson, MI' intro='Signature Luxe provides clean, modern restroom trailer rentals in Jackson and nearby Mid-Michigan communities with responsive service and quote-first planning.' city='Jackson' /></>
}
