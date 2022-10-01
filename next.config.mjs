/**
 * @type {import('next').NextConfig}
 */
const ASSETS_BASE_FOLDER_PATH = 'public/assets/'
const PROCESSED_DIRECTORY_NAME = 'processed'
const nextConfig = {
  images: {
    // loader: 'custom',
    imageSizes: [], // [256], //[16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [], // [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'new.mallocs.net',
        port: '',
        pathname: 'assets',
      },
    ],
  },
  env: {
    _processorASSETS_BASE_FOLDER_PATH: ASSETS_BASE_FOLDER_PATH,
    _processorSLIDESHOW_FOLDER_PATH: ASSETS_BASE_FOLDER_PATH + 'slideshows',
    _processorSLIDESHOW_URL_BASE: '/assets/' + PROCESSED_DIRECTORY_NAME,
    _processorPROCESSED_DIRECTORY:
      ASSETS_BASE_FOLDER_PATH + PROCESSED_DIRECTORY_NAME,
    _processorWATERMARK_FILE: ASSETS_BASE_FOLDER_PATH + 'logo.png',
    _processorWATERMARK_OPACITY: 0.6,
    _processorSATURATION: 1.1,
    _processorWATERMARK_RATIO: 0.15,
    _processorIMAGE_QUALITY: 75,
    _processorSTORE_PICTURES_IN_WEBP: false,
    _processorGENERATE_AND_USE_BLUR_IMAGES: false,
  },
}

export default nextConfig
