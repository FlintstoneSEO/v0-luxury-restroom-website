/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/request-availability", destination: "/request-quote", permanent: true },
      { source: "/weddings", destination: "/wedding-restroom-trailer-rentals", permanent: true },
      { source: "/special-events", destination: "/private-event-restroom-trailers", permanent: true },
      { source: "/construction-long-term", destination: "/construction-long-term-restroom-trailer-rentals", permanent: true },
      { source: "/disaster-relief-government", destination: "/emergency-disaster-relief-restroom-trailers", permanent: true },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
