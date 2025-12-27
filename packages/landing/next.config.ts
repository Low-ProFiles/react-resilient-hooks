import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/react-resilient-hooks',
  assetPrefix: '/react-resilient-hooks/',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-resilient-hooks'],
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: true, // Temporarily disable PWA for debugging
});

export default pwaConfig(nextConfig);
