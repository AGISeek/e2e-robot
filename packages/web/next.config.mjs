/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@e2e-robot/core', '@e2e-robot/agents'],
  experimental: {
    esmExternals: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;