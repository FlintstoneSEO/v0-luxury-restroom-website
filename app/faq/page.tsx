import type { Metadata } from "next"
import Link from "next/link"
import { ArrowDown, ArrowRight, Mail, Plus } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getFaqs } from "@/lib/content/faqs"
import { getSiteSettings } from "@/lib/content/site"
import "./faq-guide.css"

export const metadata: Metadata = {
  title: "FAQ | Signature Luxe Events & Amenities",
  description: "Frequently asked questions about luxury restroom trailer rentals in Lansing and Mid-Michigan. Learn about power, water, setup, and booking.",
}

const faqs = getFaqs()
const { business } = getSiteSettings()
const topics = [
  { id: "booking", title: "Booking & delivery", categories: ["general", "booking", "service"] },
  { id: "setup", title: "Site setup", categories: ["setup"] },
  { id: "amenities", title: "Comfort & amenities", categories: ["amenities"] },
  { id: "events", title: "Events & longer rentals", categories: ["events"] },
]
const knownCategories = new Set(topics.flatMap((topic) => topic.categories))
const groups = [
  ...topics.map((topic) => ({ ...topic, questions: faqs.filter((faq) => topic.categories.includes(faq.category)) })),
  { id: "other", title: "Other questions", questions: faqs.filter((faq) => !knownCategories.has(faq.category)) },
].filter((group) => group.questions.length > 0)
const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
}

export default function FAQPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <Header />
    <main id="public-content" tabIndex={-1} className="estate-public faq-guide">
      <section className="faq-guide-hero" aria-labelledby="faq-heading">
        <div className="faq-guide-width">
          <div className="faq-guide-hero-grid">
            <h1 id="faq-heading">Frequently Asked Questions</h1>
            <div className="faq-guide-intro">
              <p>Find answers to common questions about our luxury restroom trailer rentals, setup requirements, and booking process.</p>
              <a href="#faq-topics" className="estate-text-link">Explore the answers<ArrowDown aria-hidden="true" size={18} /></a>
            </div>
          </div>
          <div className="faq-guide-hero-note"><span>What to Know Before You Reserve</span><Link href="/request-quote">Request Availability<ArrowRight aria-hidden="true" size={18} /></Link></div>
        </div>
      </section>

      <div className="faq-guide-width faq-guide-body" id="faq-topics">
        <aside className="faq-guide-sidebar">
          <nav aria-label="FAQ topics">
            <h2>Find your answer</h2>
            {groups.map((group) => <a href={`#faq-${group.id}`} key={group.id}><span>{group.title}</span><ArrowRight aria-hidden="true" size={16} /></a>)}
          </nav>
          <div className="faq-guide-help">
            <p>Still Have Questions?</p>
            <Link href="/contact">Contact Us<ArrowRight aria-hidden="true" size={16} /></Link>
            <a href={business.emailHref}><Mail aria-hidden="true" size={16} />Email Us</a>
          </div>
        </aside>
        <div className="faq-guide-answers">
          {groups.map((group) => <section id={`faq-${group.id}`} className="faq-guide-group" aria-labelledby={`faq-${group.id}-heading`} key={group.id}>
            <h2 id={`faq-${group.id}-heading`}>{group.title}</h2>
            {group.questions.map((faq) => <details key={faq.question} className="faq-guide-question">
              <summary><span>{faq.question}</span><Plus className="faq-guide-plus" aria-hidden="true" size={20} /></summary>
              <div className="faq-guide-answer"><p>{faq.answer}</p></div>
            </details>)}
          </section>)}
        </div>
      </div>

      <section className="faq-guide-closing" aria-labelledby="faq-help-heading">
        <div className="faq-guide-width faq-guide-closing-grid">
          <div>
            <h2 id="faq-help-heading">Still Have Questions?</h2>
            <p>We&apos;re happy to help! Reach out directly and we&apos;ll get back to you as soon as possible.</p>
            <div className="faq-guide-contact-links"><Link href="/contact">Contact Us<ArrowRight aria-hidden="true" size={18} /></Link><a href={business.emailHref}><Mail aria-hidden="true" size={18} />Email Us</a></div>
          </div>
          <div className="faq-guide-booking">
            <h2>Ready to Book?</h2>
            <p>Check availability for your date and receive a custom proposal.</p>
            <Link href="/request-quote" className="faq-guide-booking-link">Request Availability<ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
