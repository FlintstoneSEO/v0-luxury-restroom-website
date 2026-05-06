import Header from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import QuoteRequestForm from '@/components/quote-request-form';
import { Phone, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'Request a Quote | Signature Luxe Events & Amenities',
  description: 'Get a personalized quote for luxury restroom trailer rentals for your wedding, corporate event, or special occasion in Michigan.',
};

export default function RequestQuotePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-navy/5 to-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-4 text-balance">
                Request a Custom Quote
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Tell us about your event and we&apos;ll provide a personalized quote for luxury restroom trailer rental tailored to your needs.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Response within 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>No obligation quote</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-amber-600" />
                <span>Free consultation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
              <QuoteRequestForm />
            </div>
          </div>
        </section>

        {/* What to Expect Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-navy mb-8 text-center">
              What to Expect
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <span className="text-amber-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-navy mb-2">Submit Your Details</h3>
                <p className="text-muted-foreground text-sm">
                  Fill out the form with your event information including date, location, and guest count.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-navy mb-2">Receive Your Quote</h3>
                <p className="text-muted-foreground text-sm">
                  We&apos;ll calculate pricing based on your needs and send a detailed quote within 1-2 business days.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <span className="text-amber-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-navy mb-2">Confirm & Book</h3>
                <p className="text-muted-foreground text-sm">
                  Review your quote, ask any questions, and secure your date with a 25% deposit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Alternative */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted-foreground">
              Prefer to speak with someone directly?{' '}
              <a href="/contact" className="text-amber-600 hover:text-amber-700 font-medium">
                Contact us
              </a>{' '}
              or call{' '}
              <a href="tel:+15555555555" className="text-amber-600 hover:text-amber-700 font-medium">
                (555) 555-5555
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
