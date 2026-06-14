import type { NextConfig } from 'next'

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
        destination: 'http://localhost:3002/api/:path*',
      },
    ]
  },
}

export default nextConfig
