import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { SlideExternal, SlideMarkdown } from '../interfaces/slide'
import { slideshowIndexButtonOptions } from '../interfaces/slideshow'
import PostType from '../interfaces/post'

// After processing, slideshows should have a subdirectory with this name that includes the processed files
export const postsDirectory = join(process.cwd(), '_posts')

import { PROCESSED_DIRECTORY, SLIDESHOW_URL_BASE } from './constants'

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('md'))
}

const IMG_EXTENSIONS = ['.jpeg', '.jpg', '.gif', '.png']

// Transform markdown slideshow gray matter to external slideshow data
export function getPostSlideshow({
  slides: orderedSlides = [], // optionally define slide order
  captions = {}, // just add captions from markdown
  path: currentSlideshowDirectory, // path to slideshow directory in filesystem
}: {
  slides: SlideMarkdown[]
  captions: {
    [key: string]: string
  }
  path: string
}): SlideExternal[] {
  const currentProcessedDirectory = join(
    PROCESSED_DIRECTORY,
    currentSlideshowDirectory
  )
  const currentSlideshowDirectoryUrl = join(
    SLIDESHOW_URL_BASE,
    currentSlideshowDirectory
  )
  const filenames = fs
    .readdirSync(currentProcessedDirectory)
    .filter(
      (filename) =>
        // filter out non-images and unsupported image filetypes
        IMG_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext)) &&
        // filter out ordered slides so they aren't duplicated
        !orderedSlides.find(
          (slide) => slide.filename.toLowerCase() === filename.toLowerCase()
        )
    )
    .map((filename) => ({
      url: join(currentSlideshowDirectoryUrl, filename),
      filename,
    }))

  // make sure to maintain order given in markdown
  let output: SlideExternal[] = [
    ...orderedSlides.map(({ filename, caption }) => {
      return {
        url: join(currentSlideshowDirectoryUrl, filename),
        filename,
        caption,
      }
    }),
    ...filenames,
  ]

  output = output.map((slide: SlideExternal) =>
    captions.hasOwnProperty(slide.filename)
      ? {
          ...slide,
          caption: captions[slide.filename],
        }
      : slide
  )

  // check if processed image directory exists and
  // check internal directory exists but map to external urls, ie slideshowRootDirectory => slideshowPath
  if (fs.existsSync(currentProcessedDirectory)) {
    const manifest = JSON.parse(
      String(fs.readFileSync(join(currentProcessedDirectory, 'manifest.json')))
    )

    output = output.map((data) => ({
      ...data,
      url: manifest[data.filename].url,
      width: manifest[data.filename].width,
      height: manifest[data.filename].height,
      blurDataURL: manifest[data.filename].blurDataURL,
      //  sizesString: manifest[data.filename].sizesString,
    }))
  }
  return output
}

export function getPostBySlug(
  slug: string,
  fields: string[] = []
): Partial<PostType> {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const post = {
    ...data,
    slug: realSlug,
    content,
    slideshow: {
      ...(data.slideshow.indexButtonType &&
        slideshowIndexButtonOptions.includes(
          data.slideshow.indexButtonType
        ) && {
          indexButtonType: data.slideshow.indexButtonType,
        }),
      slides: getPostSlideshow(data.slideshow),
    },
  }

  return Object.fromEntries(
    Object.entries(post).filter(([key]) => fields.includes(key))
  )
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}
