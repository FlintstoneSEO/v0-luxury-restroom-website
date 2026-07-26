import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/hero-section'
import { GalleryGrid } from '@/components/gallery-grid'
import { CTASection } from '@/components/cta-section'
import { fetchSiteMedia, getSiteMediaMap, resolveSiteImage } from '@/lib/site-media'
import { getGalleryPage } from '@/lib/content/gallery'

const content = getGalleryPage()

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  alternates: { canonical: content.seo.canonical },
}

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const records = await fetchSiteMedia('gallery')
  const mediaMap = getSiteMediaMap(records)
  const heroImage = resolveSiteImage(mediaMap, 'gallery', 'hero', content.hero.fallbackImage)
  const galleryFeatureImage = resolveSiteImage(mediaMap, 'gallery', content.featureOverride.mediaKey, content.featureOverride.fallbackImage)
  const images = content.images.map((image) => image.id === content.featureOverride.id ? { ...image, src: galleryFeatureImage.src, alt: galleryFeatureImage.alt } : image)

  return (
    <>
      <Header />
      <main>
        <HeroSection
          variant="page"
          eyebrow={content.hero.eyebrow}
          title={content.hero.heading}
          description={content.hero.body}
          primaryCta={{ text: content.hero.primaryCta.label, href: content.hero.primaryCta.href }}
          imageSrc={heroImage.src}
          imageAlt={heroImage.alt}
        />

        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8"><GalleryGrid images={images} columns={3} /></div>
        </section>

        {content.sections.map((section, index) => (
          <section key={section.category} className={`py-20 md:py-28 ${index % 2 === 0 ? 'bg-cream' : 'bg-white'}`}>
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <span className="text-sm font-semibold uppercase tracking-widest text-gold">{section.eyebrow}</span>
                <h2 className="mt-2 text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl text-balance">{section.heading}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{section.body}</p>
              </div>
              <GalleryGrid images={images.filter((image) => image.category === section.category)} columns={section.columns} />
            </div>
          </section>
        ))}

        <CTASection title={content.cta.heading} description={content.cta.body} ctaText={content.cta.label} ctaHref={content.cta.href} variant="navy" />
      </main>
      <Footer />
    </>
  )
}
