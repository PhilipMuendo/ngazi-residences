import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // pin the workspace root (a stray lockfile in a parent folder would otherwise be picked up)
  turbopack: { root: __dirname },
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2048],
    imageSizes: [96, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
