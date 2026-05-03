import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { RequestAvailabilityForm } from "@/components/request-availability-form"

export const metadata: Metadata = {
  title: "Request Availability | Signature Luxe Events & Amenities",
  description:
    "Request availability for luxury restroom trailer rentals in Lansing, Mid-Michigan, and surrounding Michigan communities.",
}

const nextSteps = [
  {
    number: 1,
    title: "Submit your event details",
    description: "Fill out the form with your event information.",
  },
  {
    number: 2,
    title: "We review your date, location, and setup needs",
    description: "Our team evaluates your requirements.",
  },
  {
    number: 3,
    title: "You receive a custom proposal",
    description: "Get pricing and trailer recommendations.",
  },
  {
    number: 4,
    title: "Approve your proposal and reserve your date",
    description: "Secure your trailer for your event.",
  },
]

export default function RequestAvailabilityPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Request Availability"
          title="Request Availability for Your Event"
          description="Tell us about your event and we&apos;ll provide a custom proposal within 1-2 business days."
        />

        {/* Form Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Form */}
              <div className="lg:col-span-2">
                <div className="bg-cream rounded-2xl p-8 lg:p-10">
                  <h2 className="text-2xl font-serif font-semibold text-navy mb-2">
                    Event Details
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Please provide as much detail as possible so we can give you 
                    an accurate proposal.
                  </p>
                  <RequestAvailabilityForm />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* What Happens Next */}
                  <div className="bg-navy rounded-2xl p-6 lg:p-8 text-white">
                    <h3 className="text-lg font-semibold mb-6">
                      What Happens Next
                    </h3>
                    <div className="space-y-6">
                      {nextSteps.map((step) => (
                        <div key={step.number} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-charcoal font-semibold text-sm shrink-0">
                            {step.number}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {step.title}
                            </h4>
                            <p className="text-sm text-white/70 mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="bg-cream rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-navy mb-4">
                      Quick Info
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Proposals sent within 1-2 business days",
                        "No obligation to book",
                        "Serving Lansing and Mid-Michigan",
                        "Weddings, events, and long-term rentals",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-navy mt-0.5 shrink-0" />
                          <span className="text-sm text-charcoal">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact Alternative */}
                  <div className="bg-cream rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-navy mb-2">
                      Prefer Email?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      You can also reach us directly at:
                    </p>
                    <a
                      href="mailto:info@signatureluxeevents.com"
                      className="text-navy font-medium hover:underline"
                    >
                      info@signatureluxeevents.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Area Note */}
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
              Providing luxury restroom trailer rentals throughout Lansing, East Lansing, 
              Okemos, Haslett, Grand Ledge, DeWitt, Holt, Mason, and surrounding 
              Mid-Michigan communities within approximately a 2-hour radius.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
