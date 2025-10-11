import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/shared-types',
    '@repo/shared-utils',
    '@repo/shared-config',
  ],
};

export default nextConfig;
