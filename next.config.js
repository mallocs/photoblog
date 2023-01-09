const path = require('path')
const { siteHostname, siteProtocol } = require('./site.config')

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    // loader: 'custom',
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: siteProtocol,
        hostname: siteHostname,
        pathname: 'assets',
      },
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
}
module.exports = nextConfig
