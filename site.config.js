// import { IoLogoGitlab } from 'react-icons/io5'

// TODO: These static imports would be preferred, but node throws a typeerror
// in the compose script
// import defaultPicture from './public/assets/authors/default.png'
// import mainAuthorPicture from './public/assets/authors/me.jpg'
import { join } from 'path'

const ASSETS_BASE_FOLDER_PATH = 'public/assets/'
const PROCESSED_DIRECTORY_NAME = 'processed'

const siteConfig = {
  name: 'Photo',
  nameSuffix: 'blog',
  nameSuffixMatchSize: true,
  get siteTitle() {
    return `Demo ${this.name}${this.nameSuffix}`
  },
  description: 'A statically generated photoblog',
  siteProtocol: 'https',
  siteHostname: 'photoblog-eight.vercel.app',
  get siteUrl() {
    return `${this.siteProtocol}://${this.siteHostname}`
  },
  sourceUrl: 'https://github.com/mallocs/photoblog',
  showSiteIcon: true,
  footerMessage:
    'Generated by NextJS <a href="https://github.com/mallocs/photoblog">Photoblog template</a>',
  navbarLinks: [
    {
      name: 'Link 1',
      url: '#link1',
      //    Component: IoLogoGitlab,
    },
    {
      name: 'Link 2',
      url: '#link2',
    },
  ],
  openGraph: {
    imageHeight: 630,
    imageWidth: 1200,
  },
  postsDirectory: '_posts',
  assetsBaseFolderPath: ASSETS_BASE_FOLDER_PATH,
  slideshowFolderPath: ASSETS_BASE_FOLDER_PATH + 'slideshows',
  slideshowUrlBase: '/assets/' + PROCESSED_DIRECTORY_NAME,
  processedDirectory: ASSETS_BASE_FOLDER_PATH + PROCESSED_DIRECTORY_NAME,
  resizedDirectoryName: 'resized',
  watermarkFile: ASSETS_BASE_FOLDER_PATH + 'watermark.png',
  watermarkOpacity: 0.6,
  saturation: 1.1,
  watermarkSizeRatio: 0.15,
  imageQuality: 75,
  storePicturesInWEBP: false,
  blurSize: 40,
  fadeSpeed: 900,
  authors: {
    default: {
      name: 'Anonymous',
      picture: '/assets/authors/default.png',
    },
    Joe: { name: 'Joe', picture: '/assets/authors/joe.jpeg' },
  },
  imageFileTypes: ['jpg', 'jpeg', 'gif', 'webp', 'png', 'avif'],
  ignoreFiles: ['.DS_Store'],
  manifestFileName: 'manifest.json',
}

if (process !== undefined) {
  siteConfig.root = process.cwd()
  siteConfig.postsDirectoryFullPath = join(process.cwd(), '_posts')
}

export default siteConfig
