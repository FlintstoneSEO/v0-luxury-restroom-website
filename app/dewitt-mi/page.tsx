import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'Luxury Restroom Trailer Rentals in Dewitt, MI', description: 'Luxury restroom trailer rental in Dewitt, MI for weddings, private events, corporate events, construction, and emergency needs.' }

export default function Page() {
  const business = localBusinessJsonLd('Dewitt')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'Service Areas',item:'/service-areas'},{name:'Dewitt, MI',item:'/dewitt-mi'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(business)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='Luxury Restroom Trailer Rentals in Dewitt, MI' intro='Signature Luxe provides clean, modern restroom trailer rentals in Dewitt and nearby Mid-Michigan communities with responsive service and quote-first planning.' city='Dewitt' /></>
}
