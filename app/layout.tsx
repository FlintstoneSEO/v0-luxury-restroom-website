import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.signatureluxeevents.com'),
  title: {
    default: 'Luxury Restroom Trailer Rentals Lansing MI | Signature Luxe Events',
    template: '%s | Signature Luxe Events & Amenities',
  },
  description: 'Rent luxury restroom trailers in Lansing, MI for weddings, private parties, corporate events, festivals, construction sites, and long-term use throughout Mid-Michigan.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'luxury restroom trailer rental Lansing MI',
    'restroom trailer rental Lansing MI',
    'wedding restroom trailer rental Lansing MI',
    'luxury portable restroom rental Michigan',
    'mobile restroom trailer rental Michigan',
    'event restroom trailer rental Lansing',
    'restroom trailer rentals Mid-Michigan',
  ],
  authors: [{ name: 'Signature Luxe Events & Amenities' }],
  creator: 'Signature Luxe Events & Amenities',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png' }],
  },
  openGraph: {
    title: 'Luxury Restroom Trailer Rentals Lansing MI | Signature Luxe Events',
    description: 'Rent luxury restroom trailers in Lansing, MI for weddings, private parties, corporate events, festivals, construction sites, and long-term use throughout Mid-Michigan.',
    url: 'https://www.signatureluxeevents.com',
    siteName: 'Signature Luxe Events & Amenities',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/Wedding Trailer.png',
        width: 1200,
        height: 630,
        alt: 'Signature Luxe luxury restroom trailer at an outdoor Michigan wedding event',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Restroom Trailer Rentals Lansing MI | Signature Luxe Events',
    description: 'Rent luxury restroom trailers in Lansing, MI for weddings, private parties, corporate events, festivals, construction sites, and long-term use throughout Mid-Michigan.',
    images: ['/images/Wedding Trailer.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#2d3a47',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} bg-background`}>
      <head />
      <body className="font-sans antialiased">
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P5LFZN2');`}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P5LFZN2"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
