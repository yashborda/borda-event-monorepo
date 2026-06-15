import type { NextConfig } from 'next'

// Backend URL the `/api/*` rewrite proxies to. In production this is the
// Render backend URL; in dev it falls back to localhost:3002. Reuses the
// same env var as the direct-upload bypass (video uploads POST straight
// to the backend instead of through this proxy) so admins only set ONE
// URL in Vercel.
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_DIRECT_URL || 'http://localhost:3002'

const nextConfig: NextConfig = {
  transpilePackages: ['@pkg/ui', '@pkg/types'],
  images: {
    // Whitelist remote hosts that <Image> may load.
    //   - localhost:3002/uploads/** — legacy local-disk uploads served by the
    //     backend's static assets handler
    //   - any https host — covers Drive (lh3.googleusercontent.com), avatars,
    //     and anything else stored externally. Matches the website config.
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
