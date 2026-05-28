import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@pkg/ui', '@pkg/types'],
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
