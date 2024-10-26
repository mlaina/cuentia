/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    runtime: 'edge',
  },
  images: {
    domains: ['replicate.delivery', 'localhost', 'cuentia.vercel.app', 'imagedelivery.net']
  },
};

export default nextConfig;
