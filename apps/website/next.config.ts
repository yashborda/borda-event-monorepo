import type { NextConfig } from 'next'

// Backend URL the `/api/*` rewrite proxies to. In production this is the
// Render backend URL; in dev it falls back to localhost:3002 so nothing
// changes for `task dev`. The env var is read at build time on Vercel
// (server-only — never reaches the browser bundle).
const BACKEND = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3002'

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
        destination: `${BACKEND}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
