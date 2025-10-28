import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/react-resilient-hooks',
  assetPrefix: '/react-resilient-hooks/',
  images: {
    unoptimized: true,
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in development for easier debugging
});

export default pwaConfig(nextConfig);
