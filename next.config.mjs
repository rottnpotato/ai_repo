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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
          { key: "Access-Control-Expose-Headers", value: "Content-Length" }
        ],
      },
    ]
  },
  // Removed static exports configuration
  // output: 'export',
  // experimental: {
  //   // Ensure all API routes are treated correctly for static export
  //   serverComponentsExternalPackages: [],
  // },
  // Base path if deploying to a subdirectory
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable image optimization during export
  // Optionally configure redirects
  async redirects() {
    return [];
  },
}

export default nextConfig
