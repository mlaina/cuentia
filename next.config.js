import createNextIntlPlugin from 'next-intl/plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'cuentia.vercel.app' },
      { protocol: 'https', hostname: 'imagins.ai' }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false
      }
    }
    return config
  }
}

export default createNextIntlPlugin()(nextConfig)
