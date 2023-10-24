import path from 'path'
import config from './site.config.js'
const { siteHostname, siteProtocol } = config

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
  reactStrictMode: true,
  images: {
    // loader: 'custom',
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: siteProtocol,
        hostname: siteHostname,
      },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack: (config) => {
    // Ensure "require" has a higher priority when matching export conditions.
    // https://webpack.js.org/configuration/resolve/#resolveconditionnames
    config.resolve.conditionNames = ['require']
    config.resolve.alias = {
      ...config.resolve.alias,
      components: [
        path.resolve(process.cwd(), 'overrides'),
        path.resolve(process.cwd(), 'components'),
      ],
    }
    return config
  },
  experimental: {
    scrollRestoration: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // These rewrites are checked after headers/redirects
        // and before all files including _next/public files which
        // allows overriding page files
        // Markdown files should not be exposed.
        {
          source: '/posts/:slug/(.*).md',
          destination: '/404',
        },
      ],
    }
  },
}
export default nextConfig
