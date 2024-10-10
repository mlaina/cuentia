/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    runtime: 'edge',
  },
  images: {
    domains: ['replicate.delivery']
  },
};

export default nextConfig;
