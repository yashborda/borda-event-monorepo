import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@pkg/ui', '@pkg/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/uploads/**',
      },
      { protocol: 'https', hostname: '**' },
    ],
  },
  turbopack: {
    resolveAlias: {
      '@/lib/utils': '@pkg/ui/lib/utils',
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
    ]
  },
}

export default nextConfig
