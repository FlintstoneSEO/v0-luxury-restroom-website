import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BriefcaseBusiness, Building2, CalendarCheck, ClipboardCheck, GraduationCap, HardHat, Heart, MapPin, PartyPopper, Sparkles, Tent, type LucideIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'
import { cityPages } from '@/lib/seo'

type CityExtra = { intro: string; nearby: string; venueNote: string; useCases: string[]; faqs: { q: string; a: string }[] }
const cityContent: Record<string, CityExtra> = {
  'lansing-mi': { intro: 'Lansing events range from downtown fundraisers to backyard celebrations, and each site needs practical restroom logistics.', nearby: 'East Lansing, Holt, Mason, and Grand Ledge', venueNote: 'We plan around mixed urban and residential access patterns across the capital region.', useCases: ['wedding weekends', 'corporate and nonprofit events', 'city festivals', 'temporary facility support'], faqs: [{ q: 'How early should I reserve in Lansing?', a: 'Peak weekends are best reserved in advance, especially spring and fall.' }, { q: 'Can you serve parks and private properties?', a: 'Yes, we coordinate access and setup planning for both.' }, { q: 'Do you offer multi-day rentals?', a: 'Yes, including service scheduling for longer events.' }, { q: 'Do you deliver beyond Lansing city limits?', a: 'Yes, throughout Mid-Michigan and nearby markets.' }] },
  'east-lansing-mi': { intro: 'East Lansing often combines campus-adjacent events with private gatherings that need polished guest amenities.', nearby: 'Lansing, Okemos, Haslett, and DeWitt', venueNote: 'We account for tighter load-in windows common around university-area venues.', useCases: ['alumni and graduation events', 'weddings', 'private parties', 'corporate functions'], faqs: [{ q: 'Do you serve East Lansing year-round?', a: 'Yes, based on date availability and routing.' }, { q: 'Can you help with utility planning?', a: 'Yes, we review power and water options before delivery.' }, { q: 'Are trailers suitable for formal events?', a: 'Yes, they are designed for elevated guest comfort.' }, { q: 'Can I request a quote online?', a: 'Yes, through our quote form.' }] },
  'okemos-mi': { intro: 'Okemos hosts private estate events, school celebrations, and community gatherings where comfort and clean presentation matter.', nearby: 'Haslett, East Lansing, Williamston, and Lansing', venueNote: 'We support suburban properties with driveway and yard placement planning.', useCases: ['backyard graduations', 'wedding receptions', 'corporate picnics', 'holiday parties'], faqs: [{ q: 'Can you place a trailer at a private home?', a: 'Yes, after confirming access and surface conditions.' }, { q: 'Do you support graduation season demand?', a: 'Yes, with early reservation recommended.' }, { q: 'Do you deliver to nearby townships?', a: 'Yes, throughout the Okemos area.' }, { q: 'Can you help pick trailer size?', a: 'Yes, based on guest count and duration.' }] },
  'haslett-mi': { intro: 'Haslett events often center on neighborhood celebrations and private outdoor gatherings that need added restroom capacity.', nearby: 'Okemos, East Lansing, Meridian Township, and Bath', venueNote: 'We plan access around residential streets and property layouts.', useCases: ['family reunions', 'birthday celebrations', 'graduation parties', 'small corporate events'], faqs: [{ q: 'Is Haslett in your regular service area?', a: 'Yes, it is part of our Mid-Michigan coverage.' }, { q: 'Can this reduce indoor traffic at parties?', a: 'Yes, that is a major benefit for private hosts.' }, { q: 'Do you handle setup and pickup?', a: 'Yes, full delivery and pickup are included.' }, { q: 'Can rentals span a full weekend?', a: 'Yes, weekend and multi-day options are available.' }] },
  'grand-ledge-mi': { intro: 'Grand Ledge events include river-area gatherings, weddings, and community celebrations that need dependable temporary facilities.', nearby: 'Lansing, Delta Township, Eagle, and Portland', venueNote: 'We coordinate placement for parks, private land, and mixed-surface sites.', useCases: ['weddings and receptions', 'community festivals', 'private parties', 'contractor support'], faqs: [{ q: 'Do you deliver to Grand Ledge venues?', a: 'Yes, across city and surrounding rural areas.' }, { q: 'Can you support multi-day events?', a: 'Yes, including service intervals when needed.' }, { q: 'What utilities are required?', a: 'We review power and water requirements during planning.' }, { q: 'Are long-term rentals available?', a: 'Yes, for projects and temporary facilities.' }] },
  'dewitt-mi': { intro: 'DeWitt combines residential celebrations and project-based site needs where clean temporary restroom access is important.', nearby: 'Lansing, Bath, St. Johns, and East Lansing', venueNote: 'We help plan efficient trailer placement at private properties and work locations.', useCases: ['graduation parties', 'weddings', 'company events', 'construction support'], faqs: [{ q: 'Do you serve DeWitt year-round?', a: 'Yes, with scheduling based on availability.' }, { q: 'Can you advise on station count?', a: 'Yes, we provide sizing recommendations.' }, { q: 'Do you support construction rentals?', a: 'Yes, including recurring service schedules.' }, { q: 'Can I book for a weekend event?', a: 'Yes, weekend bookings are common.' }] },
  'jackson-mi': { intro: 'Jackson hosts regional events, private gatherings, and temporary project needs that benefit from luxury restroom access.', nearby: 'Spring Arbor, Michigan Center, Napoleon, and Grass Lake', venueNote: 'We coordinate timing and placement for both city and rural properties.', useCases: ['wedding weekends', 'community events', 'corporate gatherings', 'facility outage support'], faqs: [{ q: 'Do you deliver to Jackson County?', a: 'Yes, we serve Jackson and nearby communities.' }, { q: 'Can you help for temporary outages?', a: 'Yes, we support short-term temporary needs.' }, { q: 'Are trailers suitable for donor events?', a: 'Yes, they are ideal for polished guest-facing events.' }, { q: 'How do I request pricing?', a: 'Submit your event date, location, and headcount through the quote form.' }] },
  'howell-mi': { intro: 'Howell events range from private celebrations to downtown-adjacent gatherings where guest comfort and site logistics both matter.', nearby: 'Brighton, Fowlerville, Hartland, and Pinckney', venueNote: 'We plan around varied property layouts and event access windows.', useCases: ['backyard parties', 'weddings', 'corporate events', 'long-term temporary facilities'], faqs: [{ q: 'Is Howell within your delivery area?', a: 'Yes, Howell is in our regional coverage.' }, { q: 'Can you handle backyard setups?', a: 'Yes, after site access confirmation.' }, { q: 'Do you offer multi-day service?', a: 'Yes, depending on event duration and needs.' }, { q: 'Can you support construction jobs?', a: 'Yes, with long-term rental options.' }] },
  'flint-mi': { intro: 'Flint-area events and projects often require dependable temporary infrastructure with clear scheduling and service planning.', nearby: 'Grand Blanc, Burton, Davison, and Fenton', venueNote: 'We coordinate placement for urban venues, community spaces, and private properties.', useCases: ['community festivals', 'weddings', 'corporate functions', 'public works support'], faqs: [{ q: 'Do you serve the Flint metro area?', a: 'Yes, including nearby communities.' }, { q: 'Can you support municipal-style events?', a: 'Yes, we coordinate for larger public gatherings.' }, { q: 'Is VIP presentation available?', a: 'Yes, luxury units are ideal for guest-facing occasions.' }, { q: 'Do you offer emergency rentals?', a: 'Yes, based on current availability.' }] },
  'grand-rapids-mi': { intro: 'Grand Rapids has a strong event market with weddings, corporate activations, and regional gatherings that need elevated restroom options.', nearby: 'Wyoming, Kentwood, Ada, and Walker', venueNote: 'We coordinate around busier venue calendars and structured load-in schedules.', useCases: ['wedding receptions', 'corporate galas', 'donor events', 'community festivals', 'temporary project support'], faqs: [{ q: 'Do you deliver to Grand Rapids event venues?', a: 'Yes, throughout the greater Grand Rapids area.' }, { q: 'Can you support upscale corporate events?', a: 'Yes, including VIP-focused restroom planning.' }, { q: 'How early should we reserve?', a: 'Early booking is best for prime weekend dates.' }, { q: 'Do you handle setup logistics?', a: 'Yes, including placement and utility coordination.' }] },
  'ann-arbor-mi': { intro: 'Ann Arbor events include formal weddings, university-adjacent gatherings, and private celebrations that prioritize guest experience.', nearby: 'Ypsilanti, Saline, Dexter, and Chelsea', venueNote: 'We help coordinate tight access windows and polished event presentation expectations.', useCases: ['weddings', 'private estate parties', 'corporate and donor events', 'community gatherings'], faqs: [{ q: 'Do you provide service in Ann Arbor?', a: 'Yes, across Ann Arbor and nearby communities.' }, { q: 'Can this support upscale events?', a: 'Yes, luxury trailers are designed for elevated guest comfort.' }, { q: 'Do you assist with capacity planning?', a: 'Yes, we recommend sizing by attendance and timeline.' }, { q: 'Can I book for a weekend plus setup day?', a: 'Yes, scheduling can be customized.' }] },

  'brighton-mi': { intro: 'Brighton events and private properties often need premium temporary restroom access that feels clean and guest-ready.', nearby: 'Howell, Hartland, South Lyon, and Novi', venueNote: 'We coordinate placement and utility planning for private homes, venues, and project sites.', useCases: ['weddings', 'private parties', 'corporate gatherings', 'project support'], faqs: [{ q: 'Do you serve Brighton event venues?', a: 'Yes, Brighton is part of our regional coverage area.' }, { q: 'Can you support wedding weekends in Brighton?', a: 'Yes, with early booking recommended for peak dates.' }, { q: 'Are long-term rentals available in Brighton?', a: 'Yes, based on schedule and project needs.' }, { q: 'Can you assist with backyard setup logistics?', a: 'Yes, we review access and placement details before delivery.' }] },
  'charlotte-mi': { intro: 'Charlotte hosts community events, family celebrations, and work sites that benefit from reliable restroom trailer planning.', nearby: 'Lansing, Eaton Rapids, Olivet, and Grand Ledge', venueNote: 'We help plan access and setup for both in-town and rural properties.', useCases: ['community events', 'weddings', 'private celebrations', 'construction support'], faqs: [{ q: 'Do you deliver restroom trailers to Charlotte, MI?', a: 'Yes, we serve Charlotte and nearby communities.' }, { q: 'Can you support farm and rural property events?', a: 'Yes, we coordinate setup logistics for rural sites.' }, { q: 'Do you provide multi-day rentals?', a: 'Yes, including service planning for longer timelines.' }, { q: 'Can I get a quote online?', a: 'Yes, submit your event details through our quote form.' }] },
  'battle-creek-mi': { intro: 'Battle Creek events and temporary operations often require clean, dependable restroom access with clear logistics planning.', nearby: 'Marshall, Springfield, Albion, and Kalamazoo', venueNote: 'We coordinate delivery windows and placement for public events, venues, and job sites.', useCases: ['festivals', 'corporate events', 'weddings', 'temporary facilities'], faqs: [{ q: 'Is Battle Creek in your delivery area?', a: 'Yes, based on current routing and availability.' }, { q: 'Can you support public and community events?', a: 'Yes, we help plan capacity and setup for larger gatherings.' }, { q: 'Do you offer construction and long-term options?', a: 'Yes, long-term rentals are available for project needs.' }, { q: 'Can emergency requests be accommodated?', a: 'Yes, subject to current trailer availability.' }] },
  'kalamazoo-mi': { intro: 'Kalamazoo events range from weddings to regional gatherings where premium guest amenities and practical logistics are both important.', nearby: 'Portage, Battle Creek, Mattawan, and Plainwell', venueNote: 'We support venue and private-property setups with planning for access, utilities, and service windows.', useCases: ['weddings', 'corporate events', 'community festivals', 'project-based rentals'], faqs: [{ q: 'Do you provide restroom trailers in Kalamazoo?', a: 'Yes, Kalamazoo is part of our extended service area.' }, { q: 'Can you support upscale wedding and donor events?', a: 'Yes, luxury trailers are ideal for polished guest-facing events.' }, { q: 'Are weekend and multi-day rentals available?', a: 'Yes, based on availability and event timing.' }, { q: 'Do you coordinate setup with venue schedules?', a: 'Yes, we plan around venue access and timeline requirements.' }] },
}



const galleryVisuals = {
  exterior: { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03647-wvGP4IObLWSxCr7Hvk08PhOzDZzM9p.jpg', alt: 'Luxury restroom trailer exterior setup in Michigan' },
  interior: { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03430-tFWoDUOQcCiO6n1GbK4NfiTkB8gEbx.jpg', alt: 'Interior vanity in luxury restroom trailer' },
  wedding: { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f8c856e0-44a2-4c9a-990c-09e671fee136-VkgBsnTDKck69SOzLmlIYiSb3zZeAS.png', alt: 'Wedding restroom trailer setup at a private estate' },
  corporate: { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%208%2C%202026%2C%2009_05_24%20PM-syeWtXVuOA1VbMKhN5WOX5kX6LczSq.png', alt: 'Corporate event restroom trailer rental setup' },
  festival: { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%201%2C%202026%2C%2010_56_46%20PM-H2xCmMMND6AksTZG4HA9OHuDL07tY3.png', alt: 'Festival restroom trailer setup in Michigan' },
  station3: { src: '/images/3 Station Pro/3Station.jpg', alt: '3 Station Pro restroom trailer exterior' },
}

type VisualCard = {
  title: string
  description: string
  href?: string
  icon: LucideIcon
  image: { src: string; alt: string }
}

const matchesAnyKeyword = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword))

const getUseCaseCard = (useCase: string): VisualCard => {
  const normalized = useCase.toLowerCase()

  if (matchesAnyKeyword(normalized, ['wedding', 'reception', 'wedding weekend'])) return { title: useCase, description: 'Elegant guest restroom support for ceremonies, receptions, and full wedding weekends.', icon: Heart, image: galleryVisuals.wedding }
  if (matchesAnyKeyword(normalized, ['graduation', 'alumni'])) return { title: useCase, description: 'Comfortable amenities for graduation parties, alumni events, and school celebrations.', icon: GraduationCap, image: galleryVisuals.corporate }
  if (matchesAnyKeyword(normalized, ['corporate', 'company', 'nonprofit', 'donor'])) return { title: useCase, description: 'Polished trailer presentation for company gatherings, galas, and donor-focused events.', icon: BriefcaseBusiness, image: galleryVisuals.corporate }
  if (matchesAnyKeyword(normalized, ['construction', 'contractor', 'project support', 'public works'])) return { title: useCase, description: 'Reliable trailer placement for active work sites and project-based operations.', icon: HardHat, image: galleryVisuals.station3 }
  if (matchesAnyKeyword(normalized, ['festival', 'community event'])) return { title: useCase, description: 'Guest-ready facilities for public festivals and neighborhood celebrations.', icon: Tent, image: galleryVisuals.festival }
  if (matchesAnyKeyword(normalized, ['private party', 'private celebrations', 'birthday', 'holiday', 'reunion', 'family reunions'])) return { title: useCase, description: 'Refined restroom options for private celebrations and family-hosted gatherings.', icon: PartyPopper, image: galleryVisuals.wedding }
  if (matchesAnyKeyword(normalized, ['temporary facility', 'temporary facilities', 'outage', 'long-term support', 'long-term'])) return { title: useCase, description: 'Dependable restroom access during outages and extended temporary operations.', icon: Building2, image: galleryVisuals.exterior }

  return { title: useCase, description: 'Luxury restroom trailer support tailored to your timeline, guests, and site logistics.', icon: CalendarCheck, image: galleryVisuals.exterior }
}

const exploreServiceCards: VisualCard[] = [
  { href: '/request-quote', title: 'Request a Quote', description: 'Share your event details and get a fast, tailored rental plan.', icon: ClipboardCheck, image: galleryVisuals.exterior },
  { href: '/wedding-restroom-trailer-rentals', title: 'Wedding Restroom Trailers', description: 'Explore premium trailers designed for wedding weekends and receptions.', icon: Heart, image: galleryVisuals.wedding },
  { href: '/luxury-restroom-trailer-rentals', title: 'Luxury Rental Options', description: 'Compare luxury restroom layouts, finishes, and guest-facing amenities.', icon: Sparkles, image: galleryVisuals.interior },
  { href: '/construction-long-term-restroom-trailer-rentals', title: 'Construction & Long-Term Rentals', description: 'Flexible solutions for project sites, multi-week schedules, and recurring service.', icon: HardHat, image: galleryVisuals.station3 },
  { href: '/service-areas', title: 'All Service Areas', description: 'See the Mid-Michigan regions we cover with delivery, setup, and pickup.', icon: MapPin, image: galleryVisuals.exterior },
]
const getCityData = (slug: string) => { const base = cityPages.find((c) => c.slug === slug); return base ? { ...base, ...cityContent[slug] } : null }
export function generateStaticParams() { return cityPages.map((c) => ({ citySlug: c.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> { const { citySlug } = await params; const data = getCityData(citySlug); if (!data) return {}; const title = `Restroom Trailer Rentals ${data.city}, MI`; const description = `Luxury restroom trailer rentals for weddings, events, and project sites in ${data.city}, Michigan with delivery, setup, and service planning.`; const canonical = `https://www.signatureluxeevents.com/service-areas/${data.slug}`; return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, images: [{ url: '/images/Wedding Trailer.png', alt: `Luxury restroom trailer rental service in ${data.city}, Michigan` }] }, twitter: { card: 'summary_large_image', title, description, images: ['/images/Wedding Trailer.png'] } } }

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) { const { citySlug } = await params; const data = getCityData(citySlug); if (!data) notFound(); const business = localBusinessJsonLd(data.city); const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: 'Service Areas', item: '/service-areas' }, { name: `${data.city}, MI`, item: `/service-areas/${data.slug}` }]); const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
return <><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><Header />
<main>
  <section className='bg-navy py-20 md:py-24'>
    <div className='container mx-auto px-4 lg:px-8 text-center max-w-4xl'>
      <p className='text-gold uppercase tracking-[0.2em] text-xs mb-4'>Service Area</p>
      <h1 className='text-4xl md:text-5xl font-serif font-semibold text-white'>Luxury Restroom Trailer Rentals in {data.city}, MI</h1>
      <p className='mt-5 text-white/80 text-lg'>{data.intro} We also serve {data.nearby}.</p>
      <Link href='/request-quote' className='inline-block mt-7 bg-gold text-charcoal px-7 py-3 rounded-md font-medium'>Check Availability in {data.city}</Link>
    </div>
  </section>

  <section className='bg-white py-12'>
    <div className='container mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-6'>
      {[{ title: `Restroom Trailer Rentals for ${data.city} Events`, text: data.venueNote }, { title: 'Planning Delivery, Power, Water, and Placement', text: 'Before delivery, we confirm access paths, surface suitability, and utility planning so setup stays smooth and timeline-friendly.' }].map((card) => (
        <div key={card.title} className='rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm'><h2 className='text-2xl font-semibold text-navy mb-3'>{card.title}</h2><p className='text-charcoal'>{card.text}</p></div>
      ))}
    </div>
  </section>

  <section className='bg-cream py-12'>
    <div className='container mx-auto px-4 lg:px-8'>
      <h2 className='text-2xl font-semibold text-navy mb-2'>Restroom Trailer Rentals for Weddings, Events, and Projects in {data.city}</h2><p className='text-charcoal mb-5'>Popular rental scenarios we support throughout {data.city}, MI and surrounding communities.</p>
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {data.useCases.map((useCase) => {
          const card = getUseCaseCard(useCase)
          return (
            <article key={useCase} className='overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm'>
              <div className='relative h-36'>
                <Image src={card.image.src} alt={card.image.alt} fill className='object-cover' sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw' />
                <div className='absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/10 to-transparent' />
                <div className='absolute left-4 top-4 inline-flex rounded-xl bg-white p-2.5 shadow-sm'>
                  <card.icon className='h-5 w-5 text-navy' />
                </div>
              </div>
              <div className='p-4'>
                <p className='capitalize font-semibold text-navy'>{card.title}</p>
                <p className='mt-1 text-sm leading-relaxed text-charcoal/85'>{card.description}</p>
              </div>
            </article>
          )
        })}
      </div>
      <p className='mt-6 text-charcoal'>Coverage includes {data.nearby} and surrounding Mid-Michigan communities.</p>
    </div>
  </section>

  <section className='bg-white py-12'>
    <div className='container mx-auto px-4 lg:px-8'>
      <h2 className='text-2xl font-semibold text-navy mb-6'>FAQs for {data.city}, MI</h2>
      <div className='grid md:grid-cols-2 gap-4'>
        {data.faqs.map((f) => <div key={f.q} className='rounded-xl border border-gold/20 bg-cream p-6'><h3 className='font-semibold text-navy'>{f.q}</h3><p className='mt-2 text-charcoal'>{f.a}</p></div>)}
      </div>
    </div>
  </section>

  <section className='bg-cream py-12'>
    <div className='container mx-auto px-4 lg:px-8'>
      <h2 className='text-2xl font-semibold text-navy mb-5'>Explore More Services</h2>
      <div className='grid sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        {exploreServiceCards.map((item) => (
          <Link key={item.href} href={item.href ?? '/'} className='group overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-md'>
            <div className='relative h-32'>
              <Image src={item.image.src} alt={item.image.alt} fill className='object-cover transition duration-300 group-hover:scale-[1.02]' sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw' />
              <div className='absolute inset-0 bg-gradient-to-t from-navy/50 via-navy/10 to-transparent' />
              <div className='absolute left-4 top-4 inline-flex rounded-lg bg-white p-2 shadow-sm'>
                <item.icon className='h-5 w-5 text-navy' />
              </div>
            </div>
            <div className='p-4'>
              <p className='font-semibold text-navy'>{item.title}</p>
              <p className='mt-1 text-sm leading-relaxed text-charcoal/85'>{item.description}</p>
              <p className='mt-3 inline-flex items-center text-sm font-medium text-navy'>View page <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5' /></p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
</main><Footer /></>
}
