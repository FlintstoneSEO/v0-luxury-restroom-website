import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, MapPin, Clock } from "lucide-react"

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Start Here", href: "/start-here" },
  { name: "Our Restrooms", href: "/our-restrooms" },
  { name: "Service Areas", href: "/service-areas" },
  { name: "Gallery", href: "/gallery" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
]

const eventTypes = [
  { name: "Weddings", href: "/weddings" },
  { name: "Special Events", href: "/special-events" },
  { name: "Construction / Long-Term", href: "/construction-long-term" },
  { name: "Disaster Relief / Government", href: "/disaster-relief-government" },
]

const serviceAreas = [
  "Lansing",
  "East Lansing",
  "Okemos",
  "Haslett",
  "Grand Ledge",
  "DeWitt",
  "Holt",
  "Mason",
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Image
              src="/images/logo.png"
              alt="Signature Luxe Events & Amenities"
              width={180}
              height={54}
              className="h-12 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Luxury restroom trailer rentals for weddings, private parties, corporate events, 
              construction sites, and long-term needs throughout Lansing and Mid-Michigan.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <span className="text-white/80 text-sm">Based in Lansing, MI</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <a 
                  href="mailto:info@signatureluxeevents.com" 
                  className="text-white/80 text-sm hover:text-gold transition-colors"
                >
                  info@signatureluxeevents.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div className="text-white/80 text-sm">
                  <p>Mon - Fri: 9:00 am - 5:00 pm</p>
                  <p>Saturday: 8:00 am - 3:00 pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-white/80 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Types */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Event Types</h3>
            <ul className="space-y-3">
              {eventTypes.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-white/80 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <Link 
                  href="/request-availability"
                  className="inline-flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded text-sm font-medium hover:bg-gold/90 transition-colors"
                >
                  Request Availability
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-2">
              {serviceAreas.map((area) => (
                <li key={area} className="text-white/80 text-sm">
                  {area}, MI
                </li>
              ))}
            </ul>
            <Link 
              href="/service-areas"
              className="inline-block mt-4 text-gold text-sm hover:underline"
            >
              View All Service Areas
            </Link>
            
            {/* Social Links */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Area Statement */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <p className="text-center text-white/60 text-sm max-w-3xl mx-auto">
            Providing luxury restroom trailer rentals throughout Lansing, East Lansing, Okemos, 
            Haslett, Grand Ledge, DeWitt, Holt, Mason, and surrounding Mid-Michigan communities.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 bg-charcoal">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <p className="text-center text-white/60 text-sm">
            &copy; {currentYear} Signature Luxe Events & Amenities. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
