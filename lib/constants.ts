// import { IoLogoGitlab } from 'react-icons/io5'
import config from '../next.config.mjs'

export const SOURCE_URL = 'https://www.gitlab.com/mallocs'
export const NAME = 'Photo'
export const NAME_SUFFIX = 'blog'
export const TITLE = `${NAME}${NAME_SUFFIX} photoblog`
export const SUMMARY = ''
export const FOOTER_MESSAGE = '<a href="http://mallocs.net">mallocs</a> © 2022'
export const NAVBAR_LINKS = [
  {
    name: 'Gitlab',
    url: new URL('https://gitlab.com/mallocs'),
    //    Component: IoLogoGitlab,
  },
  {
    name: 'Github',
    url: new URL('https://github.com/mallocs'),
  },
]
const { protocol, hostname } = config?.images?.remotePatterns[0]
export const OG_EXTERNAL_IMAGES_BASE_URL =
  protocol && hostname ? `${protocol}://${hostname}` : ''
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_WIDTH = 1200
export const FADE_SPEED = 900
export const SLIDESHOW_FOLDER_PATH = config.env._processorSLIDESHOW_FOLDER_PATH
export const SLIDESHOW_URL_BASE = config.env._processorSLIDESHOW_URL_BASE
export const PROCESSED_DIRECTORY = config.env._processorPROCESSED_DIRECTORY
export const RESIZED_DIRECTORY = config.env._processorRESIZED_DIRECTORY
export const WATERMARK_FILE = config.env._processorWATERMARK_FILE
export const IMAGE_QUALITY = config.env._processorIMAGE_QUALITY
export const STORE_PICTURES_IN_WEBP =
  config.env._processorSTORE_PICTURES_IN_WEBP
export const BLUR_SIZE = config.env._processorBLUR_SIZE
