import { Metadata } from 'next'
import { SeoPage } from '@/components/seo-page'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = { title: 'Luxury Restroom Trailer Rentals in Okemos, MI', description: 'Luxury restroom trailer rental in Okemos, MI for weddings, private events, corporate events, construction, and emergency needs.' }

export default function Page() {
  const business = localBusinessJsonLd('Okemos')
  const breadcrumbs = breadcrumbJsonLd([{name:'Home',item:'/'},{name:'Service Areas',item:'/service-areas'},{name:'Okemos, MI',item:'/okemos-mi'}])
  return <><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(business)}}/><script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}/><SeoPage title='Luxury Restroom Trailer Rentals in Okemos, MI' intro='Signature Luxe provides clean, modern restroom trailer rentals in Okemos and nearby Mid-Michigan communities with responsive service and quote-first planning.' city='Okemos' /></>
}
