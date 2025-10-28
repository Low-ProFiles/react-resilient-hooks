import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  basePath: '/react-resilient-hooks',
  assetPrefix: '/react-resilient-hooks/',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@resilient/core', '@resilient/utils'],
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in development for easier debugging
});

export default pwaConfig(nextConfig);
