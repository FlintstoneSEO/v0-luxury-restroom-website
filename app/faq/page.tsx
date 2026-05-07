import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ | Signature Luxe Events & Amenities",
  description:
    "Frequently asked questions about luxury restroom trailer rentals in Lansing and Mid-Michigan. Learn about power, water, setup, and booking.",
}

const faqs = [
  {
    question: "How far in advance should I reserve a restroom trailer?",
    answer:
      "We recommend reserving your restroom trailer as early as possible, especially for peak wedding season (May through October). Popular dates can book several months in advance. However, we also accommodate last-minute requests when availability allows. Contact us to check availability for your date.",
  },
  {
    question: "Do your restroom trailers need power?",
    answer:
      "Yes, our trailers require a standard 20 amp power source within 100 feet for climate control and interior lighting. If power isn't available at your location, we can discuss generator rental options to power the trailer.",
  },
  {
    question: "Do your restroom trailers need water?",
    answer:
      "Yes, a water connection within 100 feet is ideal for our fresh water system. This provides running water for hand washing and flushing. If water isn't available, we offer fresh water tank options that can be filled before your event.",
  },
  {
    question: "Can you provide a generator?",
    answer:
      "Yes, we can arrange generator service for events where standard power is not accessible. Let us know about your power situation when requesting availability and we'll include generator options in your proposal if needed.",
  },
  {
    question: "Can the trailer be used if there is no water source nearby?",
    answer:
      "Yes. We offer fresh water tank options for locations without a water hookup. The tank is filled before your event and provides sufficient water for hand washing and flushing throughout your event.",
  },
  {
    question: "How much space is needed for setup?",
    answer:
      "The space required depends on the trailer size. Generally, you'll need a reasonably flat, level area that can accommodate the trailer plus access for our delivery vehicle. We can discuss specific space requirements for your chosen trailer during the proposal process.",
  },
  {
    question: "Are the trailers climate controlled?",
    answer:
      "Yes, all of our luxury restroom trailers feature heating and air conditioning. This ensures your guests are comfortable regardless of weather conditions, whether it's a hot summer wedding or a cool fall festival.",
  },
  {
    question: "Do you provide restroom trailers for weddings?",
    answer:
      "Absolutely! Weddings are one of our most popular event types. Our luxury trailers are perfect for outdoor weddings, backyard celebrations, barn venues, vineyard events, and private estate weddings throughout Lansing and Mid-Michigan.",
  },
  {
    question: "Do you offer long-term restroom trailer rentals?",
    answer:
      "Yes, we offer long-term rentals for construction sites, commercial projects, property renovations, and other extended-need situations. Long-term rentals include flexible scheduling and maintenance support. Contact us to discuss your long-term rental needs.",
  },
  {
    question: "Do you serve areas outside Lansing?",
    answer:
      "Yes! While we're based in Lansing, we serve the entire Mid-Michigan region including East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Holt, Mason, Charlotte, Howell, Jackson, Flint, Ann Arbor, Grand Rapids, and surrounding communities within approximately a 2-hour radius.",
  },
  {
    question: "Are restroom trailers better than porta-potties for weddings?",
    answer:
      "For most couples, yes. Our luxury restroom trailers offer a completely different experience than standard porta-potties. With climate control, private flushing stalls, running water, modern vanity stations, and quality finishes, your guests enjoy a clean, comfortable, and upscale restroom experience that matches the elegance of your special day.",
  },
  {
    question: "How do I request a quote?",
    answer:
      "Simply fill out our Request Availability form with your event date, location, and details. We'll review your information and send you a custom proposal within 1-2 business days. You can also email us directly at info@signatureluxeevents.com.",
  },
]

export default function FAQPage() {
  return (
    <>
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
                  <a href="mailto:info@signatureluxeevents.com">
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
