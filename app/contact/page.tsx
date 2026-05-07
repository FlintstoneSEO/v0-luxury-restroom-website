"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Mail, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero-section"
import { CTASection } from "@/components/cta-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { submitContactForm, ContactFormState } from "@/app/actions/contact"

const initialState: ContactFormState = {
  success: false,
  message: '',
}

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <HeroSection
          variant="page"
          eyebrow="Contact Us"
          title="Get in Touch"
          description="Have questions about our luxury restroom trailers or want to discuss your event? We&apos;d love to hear from you."
          primaryCta={{ text: "Request Availability", href: "/request-quote" }}
        />

        {/* Contact Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-serif font-semibold tracking-tight text-navy md:text-4xl">
                  Contact Information
                </h2>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  Reach out to us directly or fill out the form and we&apos;ll get 
                  back to you as soon as possible.
                </p>

                <div className="mt-10 space-y-8">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">Email</h3>
                      <a
                        href="mailto:info@signatureluxeevents.com"
                        className="text-muted-foreground hover:text-navy transition-colors"
                      >
                        info@signatureluxeevents.com
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">Location</h3>
                      <p className="text-muted-foreground">Lansing, MI</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Serving Mid-Michigan and communities within a 2-hour radius
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">Business Hours</h3>
                      <div className="text-muted-foreground space-y-1 mt-1">
                        <p>Monday - Friday: 9:00 am - 5:00 pm</p>
                        <p>Saturday: 8:00 am - 3:00 pm</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-12 p-6 bg-cream rounded-xl">
                  <h3 className="font-semibold text-navy mb-4">
                    Looking to book a restroom trailer?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Use our availability form for the fastest response on quotes 
                    and reservations.
                  </p>
                  <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                    <Link href="/request-quote">
                      Request Availability
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-cream rounded-2xl p-8 lg:p-10">
                <h2 className="text-2xl font-serif font-semibold text-navy mb-6">
                  Send Us a Message
                </h2>

                {state.success ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-navy mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We&apos;ll get back to you as soon 
                      as possible.
                    </p>
                  </div>
                ) : (
                  <form action={formAction} className="space-y-6">
                    {state.message && !state.success && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">{state.message}</p>
                      </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="name">Name *</FieldLabel>
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="Your name"
                        />
                        {state.errors?.name && (
                          <p className="text-sm text-red-600 mt-1">{state.errors.name[0]}</p>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="email">Email *</FieldLabel>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                        />
                        {state.errors?.email && (
                          <p className="text-sm text-red-600 mt-1">{state.errors.email[0]}</p>
                        )}
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 555-5555"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="subject">Subject *</FieldLabel>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        placeholder="How can we help?"
                      />
                      {state.errors?.subject && (
                        <p className="text-sm text-red-600 mt-1">{state.errors.subject[0]}</p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="message">Message *</FieldLabel>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us more about your question or inquiry..."
                      />
                      {state.errors?.message && (
                        <p className="text-sm text-red-600 mt-1">{state.errors.message[0]}</p>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-navy hover:bg-navy/90 text-white"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Spinner className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Service Area Statement */}
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
              Providing luxury restroom trailer rentals throughout Lansing, East Lansing, 
              Okemos, Haslett, Grand Ledge, DeWitt, Holt, Mason, and surrounding 
              Mid-Michigan communities.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Reserve a Luxury Restroom Trailer?"
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
