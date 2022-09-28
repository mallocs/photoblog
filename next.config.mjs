/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    loader: 'custom',
    imageSizes: [256], //[16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '300',
        pathname: 'assets',
      },
    ],
  },
  env: {
    _processorSLIDESHOW_FOLDER_PATH: 'public/assets/slideshows',
    _processorSLIDESHOW_URL_BASE: '/assets/slideshows/',
    _processorPROCESSED_DIRECTORY: 'processed',
    _processorWATERMARK_FILE: 'public/assets/watermark.png',
    _processorWATERMARK_OPACITY: 0.6,
    _processorSATURATION: 1.1,
    _processorWATERMARK_RATIO: 0.15,
    _processorIMAGE_QUALITY: 75,
    _processorSTORE_PICTURES_IN_WEBP: false,
    _processorGENERATE_AND_USE_BLUR_IMAGES: true,
  },
}

export default nextConfig
