import path from 'path'
import config from './site.config.js'
const { siteHostname, siteProtocol } = config

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
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
