import config from '../next.config.mjs'

export const SOURCE_URL = 'https://www.gitlab.com/mallocs'
export const NAME = 'mallocs'
export const NAME_SUFFIX = '.net'
export const TITLE = `${NAME}${NAME_SUFFIX} photoblog`
export const SUMMARY = ''
export const FOOTER_MESSAGE = '<a href="http://mallocs.net">mallocs</a> © 2022'
export const HOME_OG_IMAGE_URL =
  'https://og-image.vercel.app/Next.js%20https://og-image.vercel.app/Next.js%20Photoblog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svgBlog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg'

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
