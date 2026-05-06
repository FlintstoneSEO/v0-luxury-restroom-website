import Header from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import QuoteRequestForm from '@/components/quote-request-form';

export const metadata = {
  title: 'Request a Quote | Luxury Restroom Services',
  description: 'Get a personalized quote for your luxury restroom project. Contact our team with your project details.',
};

export default function RequestQuotePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
                Request a Custom Quote
              </h1>
              <p className="text-xl text-gray-600 text-balance">
                Tell us about your luxury restroom vision and we&apos;ll provide a personalized quote tailored to your needs.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuoteRequestForm />
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              What to Expect
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-amber-600 font-bold text-lg mb-3">
                  1. Initial Consultation
                </div>
                <p className="text-gray-600">
                  We review your project details and understand your vision for the perfect luxury restroom.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-amber-600 font-bold text-lg mb-3">
                  2. Expert Assessment
                </div>
                <p className="text-gray-600">
                  Our team evaluates your space and requirements to create a detailed proposal.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-amber-600 font-bold text-lg mb-3">
                  3. Custom Quote
                </div>
                <p className="text-gray-600">
                  Receive a comprehensive quote with timeline, materials, and pricing options.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
