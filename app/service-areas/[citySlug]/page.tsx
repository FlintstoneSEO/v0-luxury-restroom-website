import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BriefcaseBusiness, Building2, CalendarCheck, ClipboardCheck, GraduationCap, HardHat, Heart, MapPin, PartyPopper, Sparkles, Tent, type LucideIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo-schema'
import { cityPages } from '@/lib/seo'

import { cityContent, enhancedCityContent, priorityCitySlugs } from '@/lib/city-pages'

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
const cityMeta: Record<string, { title: string; description: string }> = {
  'lansing-mi': { title: 'Luxury Restroom Trailer Rentals in Lansing, MI', description: 'Rent luxury restroom trailers in Lansing, MI for weddings, private parties, corporate events, construction sites, and outdoor gatherings.' },
  'east-lansing-mi': { title: 'Luxury Restroom Trailer Rentals in East Lansing, MI', description: 'Luxury restroom trailer rentals in East Lansing, MI for MSU tailgates, graduations, weddings, private parties, and outdoor events.' },
  'okemos-mi': { title: 'Luxury Restroom Trailer Rentals in Okemos, MI', description: 'Rent luxury restroom trailers in Okemos, MI for weddings, backyard parties, graduation events, corporate gatherings, and outdoor celebrations.' },
  'haslett-mi': { title: 'Luxury Restroom Trailer Rentals in Haslett, MI', description: 'Luxury restroom trailer rentals in Haslett, MI for Lake Lansing area events, backyard parties, weddings, graduations, and private gatherings.' },
  'grand-ledge-mi': { title: 'Luxury Restroom Trailer Rentals in Grand Ledge, MI', description: 'Luxury restroom trailer rentals in Grand Ledge, MI for outdoor weddings, park gatherings, family events, and private celebrations.' },
  'dewitt-mi': { title: 'Luxury Restroom Trailer Rentals in DeWitt, MI', description: 'Rent luxury restroom trailers in DeWitt, MI for weddings, family events, park gatherings, community events, and private parties.' },
  'holt-mi': { title: 'Luxury Restroom Trailer Rentals in Holt, MI', description: 'Luxury restroom trailer rentals in Holt, MI for backyard parties, graduations, weddings, family gatherings, and outdoor events.' },
  'mason-mi': { title: 'Luxury Restroom Trailer Rentals in Mason, MI', description: 'Rent luxury restroom trailers in Mason, MI for fairground events, outdoor weddings, expos, private parties, and community gatherings.' },
}
const getCityData = (slug: string) => { const base = cityPages.find((c) => c.slug === slug); return base ? { ...base, ...cityContent[slug], ...enhancedCityContent[slug] } : null }
export function generateStaticParams() { return cityPages.map((c) => ({ citySlug: c.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> { const { citySlug } = await params; const data = getCityData(citySlug); if (!data) return {}; const isPriorityCity = priorityCitySlugs.has(data.slug); const meta = cityMeta[data.slug]; const title = meta?.title ?? (isPriorityCity ? `Luxury Restroom Trailer Rentals in ${data.city}, MI | Signature Luxe Events` : `Restroom Trailer Rentals ${data.city}, MI`); const description = meta?.description ?? (isPriorityCity ? `Luxury restroom trailer rentals in ${data.city}, MI for weddings, private events, corporate gatherings, festivals, construction projects, and long-term needs with delivery and setup planning.` : `Luxury restroom trailer rentals for weddings, events, and project sites in ${data.city}, Michigan with delivery, setup, and service planning.`); const canonical = `https://www.signatureluxeevents.com/service-areas/${data.slug}`; return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, images: [{ url: '/images/Wedding Trailer.png', alt: `Climate-controlled luxury restroom trailer rental in ${data.city}, Michigan` }] }, twitter: { card: 'summary_large_image', title, description, images: ['/images/Wedding Trailer.png'] } } }

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) { const { citySlug } = await params; const data = getCityData(citySlug); if (!data) notFound(); const business = localBusinessJsonLd(data.city); const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: 'Service Areas', item: '/service-areas' }, { name: `${data.city}, MI`, item: `/service-areas/${data.slug}` }]); const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
return <><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} /><script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><Header />
<main>
  <section className='bg-navy py-20 md:py-24'>
    <div className='container mx-auto px-4 lg:px-8 text-center max-w-4xl'>
      <p className='text-gold uppercase tracking-[0.2em] text-xs mb-4'>Service Area</p>
      <h1 className='text-4xl md:text-5xl font-serif font-semibold text-white'>Luxury Restroom Trailer Rentals in {data.city}, MI</h1>
      <p className='mt-5 text-base md:text-lg leading-relaxed text-white/80'>{data.intro} We also serve {data.nearby}.</p>
      <Link href='/request-quote' className='inline-block mt-7 bg-gold text-charcoal px-7 py-3 rounded-md font-medium'>Check Availability in {data.city}</Link>
    </div>
  </section>

  <section className='bg-white py-12'>
    <div className='container mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-6'>
      {[{ title: `Restroom Trailer Rentals for ${data.city} Events`, text: data.venueNote }, { title: 'Planning Delivery, Power, Water, and Placement', text: 'Before delivery, we confirm access paths, surface suitability, and utility planning so setup stays smooth and timeline-friendly.' }].map((card) => (
        <div key={card.title} className='rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm'><h2 className='text-2xl font-semibold text-navy mb-3'>{card.title}</h2><p className='text-base md:text-lg leading-relaxed text-charcoal'>{card.text}</p></div>
      ))}
    </div>
  </section>

  <section className='bg-cream py-12'>
    <div className='container mx-auto px-4 lg:px-8'>
      <h2 className='text-2xl font-semibold text-navy mb-2'>Restroom Trailer Rentals for Weddings, Events, and Projects in {data.city}</h2><p className='text-base md:text-lg leading-relaxed text-charcoal mb-5'>Popular rental scenarios we support throughout {data.city}, MI and surrounding communities.</p>
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
                <p className='mt-1 text-base md:text-[17px] leading-relaxed text-charcoal/85'>{card.description}</p>
              </div>
            </article>
          )
        })}
      </div>
      <p className='mt-6 text-base md:text-lg leading-relaxed text-charcoal'>Coverage includes {data.nearby} and surrounding Mid-Michigan communities.</p>
    </div>
  </section>

  {data.localOverview && <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Local overview</h2><div className='space-y-3'>{data.localOverview.map((item) => <p key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</p>)}</div></div></section>}

  {data.weddingUseCase && <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Wedding restroom trailer rentals in {data.city}</h2><ul className='list-disc pl-6 space-y-2'>{data.weddingUseCase.map((item) => <li key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</li>)}</ul></div></section>}
  {data.privateEventUseCase && <section className='bg-cream py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Private party and backyard restroom trailer rentals</h2><ul className='list-disc pl-6 space-y-2'>{data.privateEventUseCase.map((item) => <li key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</li>)}</ul></div></section>}
  {data.corporateFestivalUseCase && <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Corporate, festival, and community event restroom support</h2><ul className='list-disc pl-6 space-y-2'>{data.corporateFestivalUseCase.map((item) => <li key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</li>)}</ul></div></section>}
  {data.constructionLongTermUseCase && <section className='bg-cream py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Construction and long-term restroom trailer rentals</h2><ul className='list-disc pl-6 space-y-2'>{data.constructionLongTermUseCase.map((item) => <li key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</li>)}</ul></div></section>}
  {data.setupLogistics && <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Delivery, power, water, placement, and access planning</h2><ul className='list-disc pl-6 space-y-2'>{data.setupLogistics.map((item) => <li key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</li>)}</ul></div></section>}
  <section className='bg-cream py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Trailer options available in {data.city}</h2><p className='text-base md:text-lg leading-relaxed text-charcoal'>Our <Link className='text-navy underline underline-offset-2' href='/luxury-restroom-trailer-rentals'>luxury restroom trailer lineup</Link> includes 2-station units for intimate weddings and backyard parties, 3-station units for mid-sized weddings, corporate events, and graduation parties, plus 4-station trailers for community gatherings and larger guest counts.</p></div></section>
  {data.seasonalPlanning && <section className='bg-cream py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Seasonal planning notes</h2><ul className='list-disc pl-6 space-y-2'>{data.seasonalPlanning.map((item) => <li key={item} className='text-base md:text-lg leading-relaxed text-charcoal'>{item}</li>)}</ul></div></section>}
  {data.nearbyCommunities && <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Nearby communities served</h2><p className='text-base md:text-lg leading-relaxed text-charcoal'>{data.nearbyCommunities.join(', ')}.</p></div></section>}
  {data.resourceLinks && <section className='bg-cream py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Related resources</h2><div className='grid md:grid-cols-2 gap-3'>{data.resourceLinks.map((item) => <Link key={item.href} href={item.href} className='rounded-xl border border-gold/20 bg-white p-4 text-navy hover:border-gold/50'>{item.label}</Link>)}</div></div></section>}
  {data.serviceLinks && <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Related services</h2><div className='grid md:grid-cols-2 gap-3'>{data.serviceLinks.map((item) => <Link key={item.href} href={item.href} className='rounded-xl border border-gold/20 bg-cream p-4 text-navy hover:border-gold/50'>{item.label}</Link>)}</div></div></section>}
  <section className='bg-white py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Plan by event type</h2><p className='text-base md:text-lg leading-relaxed text-charcoal'>Explore more planning pages for <Link href='/weddings' className='underline'>weddings</Link>, <Link href='/special-events' className='underline'>special events</Link>, <Link href='/construction-long-term' className='underline'>construction and long-term rentals</Link>, and <Link href='/disaster-relief-government' className='underline'>disaster relief and government support</Link>. You can also <Link href='/request-availability' className='underline'>check availability</Link> or view all <Link href='/service-areas' className='underline'>service areas</Link>.</p></div></section>
  {data.trustNote && <section className='bg-cream py-12'><div className='container mx-auto px-4 lg:px-8'><h2 className='text-2xl font-semibold text-navy mb-4'>Trust note</h2><p className='text-base md:text-lg leading-relaxed text-charcoal'>{data.trustNote}</p></div></section>}

  <section className='bg-white py-12'>
    <div className='container mx-auto px-4 lg:px-8'>
      <h2 className='text-2xl font-semibold text-navy mb-6'>FAQs for {data.city}, MI</h2>
      <div className='grid md:grid-cols-2 gap-4'>
        {data.faqs.map((f) => <div key={f.q} className='rounded-xl border border-gold/20 bg-cream p-6'><h3 className='font-semibold text-navy'>{f.q}</h3><p className='mt-2 text-base md:text-lg leading-relaxed text-charcoal'>{f.a}</p></div>)}
      </div>
    </div>
  </section>
  <section className='bg-navy py-12'>
    <div className='container mx-auto px-4 lg:px-8 text-center'>
      <h2 className='text-2xl font-semibold text-white mb-3'>Get a quote for {data.city}, MI</h2>
      <p className='text-white/80 mb-6'>Tell us your date, guest count, and location to receive a tailored restroom trailer recommendation.</p>
      <Link href='/request-quote' className='inline-block bg-gold text-charcoal px-7 py-3 rounded-md font-medium'>Request Your Quote</Link>
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
              <p className='mt-1 text-base md:text-[17px] leading-relaxed text-charcoal/85'>{item.description}</p>
              <p className='mt-3 inline-flex items-center text-base font-medium text-navy'>View page <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5' /></p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
</main><Footer /></>
}
