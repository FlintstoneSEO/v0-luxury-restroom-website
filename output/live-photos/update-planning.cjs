const fs=require('fs');const path='app/start-here/page.tsx';let s=fs.readFileSync(path,'utf8');s=s.replace('import Link from "next/link"','import Link from "next/link"\nimport Image from "next/image"\nimport { getGalleryPage } from "@/lib/content/gallery"\nimport "./planning-guide.css"');for(const line of ['  ClipboardList,','  Send,','import { HeroSection } from "@/components/hero-section"','import { SectionHeader } from "@/components/section-header"','import { FeatureGrid } from "@/components/feature-grid"','import { ProcessSteps } from "@/components/process-steps"','import { CTASection } from "@/components/cta-section"','import { Button } from "@/components/ui/button"'])s=s.replace(line+'\r\n','').replace(line+'\n','');s=s.slice(0,s.indexOf('export default function StartHerePage()'))+`
const photos = getGalleryPage().images
const eventPhoto = photos.find((photo) => photo.id === "live-event-daylight")
const setupPhoto = photos.find((photo) => photo.id === "live-trailer-night-detail")

export default function StartHerePage() {
  return <>
    <Header />
    <main id="public-content" tabIndex={-1} className="estate-public planning-guide">
      <section className="planning-hero">
        <div className="planning-hero-copy">
          <h1>Planning Your Restroom Trailer Rental</h1>
          <p>Every event is unique. Here&apos;s what we need to know to provide you with the perfect restroom trailer solution for your occasion.</p>
          <div className="planning-actions"><Link href="/request-quote" className="planning-button">Request Availability<ArrowRight aria-hidden="true" size={18} /></Link><a href="#planning-details" className="estate-text-link">Plan your setup<ArrowRight aria-hidden="true" size={18} /></a></div>
        </div>
        {eventPhoto && <figure className="planning-hero-photo"><Image src={eventPhoto.src} alt={eventPhoto.alt} fill priority sizes="(max-width: 900px) 100vw, 55vw" className="object-cover" /></figure>}
      </section>
      <nav className="planning-jumps" aria-label="Planning guide sections"><a href="#planning-details">What we need to know<ArrowRight aria-hidden="true" size={16} /></a><a href="#planning-site">What your site needs<ArrowRight aria-hidden="true" size={16} /></a><a href="#planning-process">What happens next<ArrowRight aria-hidden="true" size={16} /></a></nav>

      <section className="planning-details planning-width" id="planning-details" aria-labelledby="planning-details-heading">
        <div className="planning-section-intro"><h2>Every Event Setup Is Different</h2><p>Whether you&apos;re planning an elegant wedding, a corporate event, or need long-term restroom solutions for a job site, we tailor our service to fit your specific needs. To provide you with an accurate quote, we&apos;ll need some details about your event.</p></div>
        <div className="planning-checklist-heading"><h3 id="planning-details-heading">What We Need to Know</h3><p>Help us understand your event so we can recommend the best solution. Check off the details you have ready; these checks are just for your planning and aren&apos;t sent or saved.</p></div>
        <div className="planning-checklist">{considerations.map((item, index) => {
          const Icon = item.icon
          return <label className="planning-check" key={item.title} htmlFor={\`planning-detail-\${index}\`}><Icon aria-hidden="true" size={24} strokeWidth={1.5} /><span><strong>{item.title}</strong><span>{item.description}</span></span><input type="checkbox" id={\`planning-detail-\${index}\`} aria-label={\`\${item.title} details ready\`} /></label>
        })}</div>
      </section>

      <section className="planning-site" id="planning-site" aria-labelledby="planning-site-heading">
        <div className="planning-width planning-site-grid">
          {setupPhoto && <figure className="planning-site-photo"><Image src={setupPhoto.src} alt={setupPhoto.alt} fill sizes="(max-width: 900px) 100vw, 45vw" className="object-cover" /></figure>}
          <div className="planning-site-copy"><h2 id="planning-site-heading">What Your Site Needs</h2><p>Our luxury restroom trailers require a few basic utilities for operation. Don&apos;t worry if you&apos;re not sure about your site&apos;s setup — we can help you figure it out.</p>
            <ul>{["20 amp power source within 100 feet", "Water connection within 100 feet", "Generator available if power isn't nearby", "Reasonably flat ground for trailer placement"].map((item) => <li key={item}><CheckCircle aria-hidden="true" size={20} /><span>{item}</span></li>)}</ul>
            <div className="planning-site-help"><h3>Not sure about your setup?</h3><p>That&apos;s okay! When you request availability, just let us know what you&apos;re unsure about and we&apos;ll help you figure out the best solution for your location.</p><Link href="/request-quote" className="planning-button">Get Help With Setup<ArrowRight aria-hidden="true" size={18} /></Link></div>
          </div>
        </div>
      </section>

      <section className="planning-width planning-process" id="planning-process" aria-labelledby="planning-process-heading">
        <div className="planning-section-intro"><h2 id="planning-process-heading">What Happens After You Request Availability</h2><p>From your initial request to event day, here&apos;s what to expect.</p></div>
        <ol>{nextSteps.map((step) => <li key={step.number}><span className="planning-step-number" aria-hidden="true">{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
      </section>

      <section className="planning-ready"><div className="planning-width planning-ready-inner"><div><h2>Ready to Get Started?</h2><p>Tell us about your event and we&apos;ll provide a custom proposal within 1-2 business days.</p></div><Link href="/request-quote" className="planning-button">Request Availability<ArrowRight aria-hidden="true" size={18} /></Link></div></section>
    </main>
    <Footer />
  </>
}
`;fs.writeFileSync(path,s);
