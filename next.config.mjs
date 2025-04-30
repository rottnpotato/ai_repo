/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },
  // Removed static exports configuration
  // output: 'export',
  experimental: {
    // Ensure all API routes are treated correctly for static export
    serverComponentsExternalPackages: [],
  },
  // Base path if deploying to a subdirectory
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable image optimization during export
  // Optionally configure redirects
  async redirects() {
    return [];
  },
}

export default nextConfig
