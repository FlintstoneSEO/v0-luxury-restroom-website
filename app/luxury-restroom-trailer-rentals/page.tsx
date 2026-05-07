import { Metadata } from 'next'
import { ServicePageTemplate } from '@/components/service-page-template'

const title = 'Luxury Restroom Trailer Rentals in Lansing, MI | Signature Luxe Events'
const description = 'Book luxury restroom trailer rentals in Lansing, Mid-Michigan, and nearby communities with 2, 3, and 4-station options, delivery, setup, and service planning.'
const canonical = 'https://www.signatureluxeevents.com/luxury-restroom-trailer-rentals'
export const metadata: Metadata = { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }

const sections = [
  { heading: 'Trailer Options for Different Guest Counts', paragraphs: ['Choose 2-station, 3-station, or 4-station options based on attendance and event flow.', 'We help plan capacity around guest surges so lines stay manageable and comfort remains high.'] },
  { heading: 'Why Luxury Trailers Outperform Standard Portable Toilets', paragraphs: ['Luxury units provide flushing toilets, sinks, vanities, lighting, mirrors, and climate control.', 'For weddings and upscale events around Lansing and Mid-Michigan, this better matches the guest experience you want to deliver.'] },
  { heading: 'Site Setup Requirements: Power, Water, and Placement', paragraphs: ['We confirm placement, access, and utility planning before delivery.', 'Early logistics planning reduces delays and keeps setup smooth for hosts and venues.'] },
  { heading: 'Delivery, Setup, and Pickup Across Mid-Michigan', paragraphs: ['We serve Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Jackson, Howell, Flint, Ann Arbor, and Grand Rapids.', 'Pickup and multi-day service scheduling can be coordinated based on your event timeline.'] },
  { heading: 'Planning for Event Flow and Peak Usage Times', paragraphs: ['Demand often spikes during arrival windows, meals, and transitions.', 'We size trailer options around those patterns for stronger operational performance.'] },
  { heading: 'Common Events We Support', paragraphs: ['Weddings, private parties, corporate functions, festivals, and long-term project support are all common use cases.', 'We tailor recommendations to your site, audience, and goals.'] },
]

const faqs = [
  { q: 'How far in advance should I book luxury restroom trailers in Lansing, MI?', a: 'For high-demand spring and fall weekends, booking early is recommended. We can often support shorter timelines when inventory allows.' },
  { q: 'Can you help me choose between a 2, 3, or 4-station trailer?', a: 'Yes. We recommend sizing based on guest count, event duration, and expected peak traffic windows.' },
  { q: 'Do you deliver outside Lansing?', a: 'Yes, we serve Mid-Michigan and surrounding communities including East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Jackson, Howell, Flint, Ann Arbor, and Grand Rapids.' },
  { q: 'What do you need from me for a quote?', a: 'Share your date, location, attendance estimate, and any setup notes so we can provide accurate options quickly.' },
]

export default function Page() {
  return <ServicePageTemplate pageTitle='Luxury Restroom Trailer Rentals' serviceName='Luxury restroom trailer rental' urlPath='/luxury-restroom-trailer-rentals' intro='If you are planning an event in Lansing or anywhere in Mid-Michigan, luxury restroom trailer rentals provide a cleaner, more comfortable experience than standard portable toilets.' ctaTitle='Reserve Luxury Restroom Trailers for Your Event' sections={sections} faqs={faqs} resourceImageSrc='/images/Wedding Trailer.png' resourceImageAlt='Luxury restroom trailer exterior ready for upscale event guests' resourceEyebrow='Luxury Planning' resourceTitle='Helpful Resources for Luxury Trailer Rentals' resourceDescription='Compare sizes, view photos, and review coverage details for premium restroom trailer planning.' />
}
