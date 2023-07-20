// import { IoLogoGitlab } from 'react-icons/io5'

// TODO: These static imports would be preferred, but node throws a typeerror
// in the compose script
// import defaultPicture from './public/assets/authors/default.png'
// import mainAuthorPicture from './public/assets/authors/me.jpg'

const postsDirectory = 'posts'

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
  siteHome: '/',
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
  postsDirectory,
  slideshowInputDirectory: 'inputSlideshows',
  root: './',
  resizedDirectory: 'resized',
  watermarkFile: 'public/assets/watermark.png',
  watermarkOpacity: 0.6,
  saturation: 1.1,
  watermarkSizeRatio: 0.15,
  imageQuality: 75,
  storePicturesInWEBP: false,
  blurSize: 40,
  fadeSpeed: 1200,
  authors: {
    default: {
      name: 'Anonymous',
      pictureURL: '/assets/authors/default.png',
    },
    Joe: { name: 'Joe', pictureURL: '/assets/authors/joe.jpeg' },
  },
  imageFileTypes: ['jpg', 'jpeg', 'gif', 'webp', 'png', 'avif'],
  ignoreFiles: ['.DS_Store'],
  manifestFileName: 'manifest.json',
  postMarkdownFileName: 'post.md',
  postObserverGroup: 'post',
  slideObserverGroup: 'slide',
  jsonDirectory: 'public/json',
  jsonUrl: 'json',
  preloadImages: 2,
  preloadPosts: 2,
  defaultToDarkMode: false,
}

export default siteConfig
