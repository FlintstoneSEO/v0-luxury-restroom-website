import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import './globals.css'
import { getSiteSettings } from '@/lib/content/site'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const { business, seo } = getSiteSettings()

export const metadata: Metadata = {
  metadataBase: new URL(seo.canonicalOrigin),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.defaultDescription,
  alternates: { canonical: '/' },
  keywords: seo.keywords,
  authors: [{ name: business.name }],
  creator: business.name,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    url: seo.canonicalOrigin,
    siteName: seo.siteName,
    locale: seo.locale,
    type: 'website',
    images: [{ url: seo.defaultImage.src, width: seo.defaultImage.width, height: seo.defaultImage.height, alt: seo.defaultImage.alt }],
  },
  twitter: {
    card: 'summary_large_image', title: seo.defaultTitle,
    description: seo.defaultDescription, images: [seo.defaultImage.src],
  },
  robots: { index: true, follow: true },
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
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  )
}
