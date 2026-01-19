import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable source maps in development to prevent 404 errors for non-existent source files
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/src/lib/fetch.ts',
        destination: '/api/empty', // Return empty response
      },
    ]
  },

};

export default nextConfig;
