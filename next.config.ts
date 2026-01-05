import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
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

};

export default nextConfig;
