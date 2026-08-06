import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, MapPin, MapPinned, Clock, Phone } from 'lucide-react'
import business from '@/content/site/business.json'
import footer from '@/content/site/footer.json'
import navigation from '@/content/site/navigation.json'

const socialIcons = { Facebook, Instagram, 'Google Business Profile': MapPinned }

export function Footer() {
  const currentYear = new Date().getFullYear()
  const quickLinks = footer.groups[0]
  const eventTypes = footer.groups[1]

  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Image src={navigation.logo.src} alt={business.name} width={280} height={92} className="h-24 w-auto mb-6 bg-transparent brightness-0 invert opacity-95" />
            <p className="text-white/80 text-base leading-relaxed mb-6">{footer.tagline}</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-gold mt-0.5 shrink-0" /><span className="text-white/80 text-base">{footer.location}</span></div>
              <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-gold mt-0.5 shrink-0" /><a href={business.emailHref} className="text-white/80 text-base hover:text-gold transition-colors">{business.email}</a></div>
              <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-gold mt-0.5 shrink-0" /><a href={business.phoneHref} className="text-white/80 text-base hover:text-gold transition-colors">{business.phone}</a></div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div className="text-white/80 text-base">{footer.hours.map((hours) => <p key={hours}>{hours}</p>)}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{quickLinks.heading}</h3>
            <ul className="space-y-3">{quickLinks.links.map((link) => <li key={link.label}><Link href={link.href} className="text-white/80 text-base hover:text-gold transition-colors">{link.label}</Link></li>)}</ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{eventTypes.heading}</h3>
            <ul className="space-y-3">
              {eventTypes.links.map((link) => <li key={link.label}><Link href={link.href} className="text-white/80 text-base hover:text-gold transition-colors">{link.label}</Link></li>)}
              {eventTypes.cta && <li className="pt-4"><Link href={eventTypes.cta.href} className="inline-flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded text-base font-medium hover:bg-gold/90 transition-colors">{eventTypes.cta.label}</Link></li>}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-2">{footer.serviceAreas.map((area) => <li key={area.label} className="text-white/80 text-base"><Link href={area.href} className="hover:text-gold transition-colors">{area.label}, MI</Link></li>)}</ul>
            <Link href="/service-areas" className="inline-block mt-4 text-gold text-sm hover:underline">View All Service Areas</Link>
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {footer.socials.map((social) => {
                  const Icon = socialIcons[social.label as keyof typeof socialIcons] ?? MapPinned
                  const description = `View ${business.name} on ${social.label}`
                  return <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={description} title={description} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"><Icon aria-hidden="true" className="h-5 w-5" /></a>
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10"><div className="container mx-auto px-4 lg:px-8 py-6"><p className="text-center text-white/60 text-base max-w-3xl mx-auto">{footer.serviceStatement}</p></div></div>
      <div className="border-t border-white/10 bg-charcoal">
        <div className="container mx-auto px-4 lg:px-8 py-4"><div className="text-center text-white/60 text-sm space-y-2">
          <p>&copy; {currentYear} {footer.copyrightName}. All rights reserved.</p>
          <p>Designed by{' '}<a href={footer.credit.href} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 transition-colors">{footer.credit.label}</a></p>
        </div></div>
      </div>
    </footer>
  )
}
