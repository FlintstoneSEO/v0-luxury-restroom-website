const soroFeaturedImageHostnames = [
  'app.trysoro.com',
  'cdn.trysoro.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/our-restrooms", destination: "/luxury-restroom-trailer-rentals", permanent: true },
      { source: "/request-availability", destination: "/request-quote", permanent: true },
      { source: "/weddings", destination: "/wedding-restroom-trailer-rentals", permanent: true },
      { source: "/special-events", destination: "/private-event-restroom-trailers", permanent: true },
      { source: "/construction-long-term", destination: "/construction-long-term-restroom-trailer-rentals", permanent: true },
      { source: "/disaster-relief-government", destination: "/emergency-disaster-relief-restroom-trailers", permanent: true },
      { source: "/home00736a12", destination: "/", permanent: true },
      { source: "/lansing-mi", destination: "/service-areas/lansing-mi", permanent: true },
      { source: "/east-lansing-mi", destination: "/service-areas/east-lansing-mi", permanent: true },
      { source: "/okemos-mi", destination: "/service-areas/okemos-mi", permanent: true },
      { source: "/haslett-mi", destination: "/service-areas/haslett-mi", permanent: true },
      { source: "/grand-ledge-mi", destination: "/service-areas/grand-ledge-mi", permanent: true },
      { source: "/dewitt-mi", destination: "/service-areas/dewitt-mi", permanent: true },
      { source: "/jackson-mi", destination: "/service-areas/jackson-mi", permanent: true },
      { source: "/howell-mi", destination: "/service-areas/howell-mi", permanent: true },
      { source: "/flint-mi", destination: "/service-areas/flint-mi", permanent: true },
      { source: "/grand-rapids-mi", destination: "/service-areas/grand-rapids-mi", permanent: true },
      { source: "/ann-arbor-mi", destination: "/service-areas/ann-arbor-mi", permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lmytjyqjgjsqqffsulwz.supabase.co',
        pathname: '/**',
      },
      ...soroFeaturedImageHostnames.map((hostname) => ({
        protocol: 'https',
        hostname,
        pathname: '/**',
      })),
    ],
  },
}

export default nextConfig
