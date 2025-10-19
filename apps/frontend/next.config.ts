import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/shared-types',
    '@repo/shared-utils',
    '@repo/shared-config',
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
