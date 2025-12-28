import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/react-resilient-hooks' : '',
  assetPrefix: isProd ? '/react-resilient-hooks/' : '',
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
