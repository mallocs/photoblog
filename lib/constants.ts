// import { IoLogoGitlab } from 'react-icons/io5'
import config from '#/next.config.mjs'

export const SOURCE_URL = 'https://gitlab.com/mallocs/photoblog-mallocs'
export const SHOW_SITE_ICON = true
export const NAME = 'Photo'
export const NAME_SUFFIX = 'blog'
export const NAME_SUFFIX_MATCH_SIZE = true
export const TITLE = `Demo ${NAME}${NAME_SUFFIX}`
export const SUMMARY = ''
export const META_DESCRIPTION = 'A statically generated photoblog'
export const FOOTER_MESSAGE =
  'Generated by NextJS <a href="https://gitlab.com/mallocs/photoblog-mallocs">Photoblog template</a>'
export const NAVBAR_LINKS = [
  {
    name: 'Link 1',
    url: '#link1',
    //    Component: IoLogoGitlab,
  },
  {
    name: 'Link 2',
    url: '#link2',
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
