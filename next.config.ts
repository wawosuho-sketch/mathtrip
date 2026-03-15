import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/mathtrip',
  assetPrefix: '/mathtrip',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
