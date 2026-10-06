import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // every image is a local static asset, so optimised variants can be cached for a long time
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
  },
};

export default nextConfig;
