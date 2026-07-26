import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { getFaqs } from "@/lib/content/faqs"
import { getSiteSettings } from "@/lib/content/site"

export const metadata: Metadata = {
  title: "FAQ | Signature Luxe Events & Amenities",
  description:
    "Frequently asked questions about luxury restroom trailer rentals in Lansing and Mid-Michigan. Learn about power, water, setup, and booking.",
}

const faqs = getFaqs()
const { business } = getSiteSettings()

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Find answers to common questions about our luxury restroom trailer rentals, setup requirements, and booking process."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
        />

        {/* FAQ Section */}
        <section className="py-20 md:py-28 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <FAQSection faqs={faqs} />
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl">
                Still Have Questions?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We&apos;re happy to help! Reach out directly and we&apos;ll get back to you 
                as soon as possible.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button asChild variant="outline" className="border-navy text-navy">
                  <a href={business.emailHref}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Book?"
          description="Check availability for your date and receive a custom proposal."
          ctaText="Request Availability"
          ctaHref="/request-quote"
          variant="navy"
        />
      </main>
      <Footer />
    </>
  )
}
