import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { SlideExternal, SlideInternal } from '../interfaces/slide'

// After processing, slideshows should have a subdirectory with this name that includes the processed files
export const postsDirectory = join(process.cwd(), '_posts')

import { PROCESSED_DIRECTORY, SLIDESHOW_URL_BASE } from './constants'

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('md'))
}

const IMG_EXTENSIONS = ['.jpeg', '.jpg', '.gif', '.png']

// Transform internal slideshow gray matter to external slideshow data
export function getPostSlideshow({
  slides = [], // Slides should have filename and caption
  path: currentSlideshowDirectory, // path to slideshow directory in filesystem
}: {
  slides: SlideInternal[]
  path: string
}): SlideExternal[] {
  // console.log(slides)

  const filenames = fs
    .readdirSync(join(PROCESSED_DIRECTORY, currentSlideshowDirectory))
    .filter((filename) =>
      IMG_EXTENSIONS.some(
        (ext) =>
          filename.toLowerCase().endsWith(ext) &&
          !slides.find(
            (slide) => slide.filename.toLowerCase() === filename.toLowerCase()
          )
      )
    )
    .map((filename) => ({
      url: join(SLIDESHOW_URL_BASE, currentSlideshowDirectory, filename),
      filename,
    }))

  // make sure to maintain order given in markdown
  let output = [
    ...slides.map(({ filename, caption }) => {
      return {
        url: join(SLIDESHOW_URL_BASE, currentSlideshowDirectory, filename),
        filename,
        caption,
      }
    }),
    ...filenames,
  ]

  // check if processed image directory exists and
  // check internal directory exists but map to external urls, ie slideshowRootDirectory => slideshowPath
  if (fs.existsSync(join(PROCESSED_DIRECTORY, currentSlideshowDirectory))) {
    const manifest = JSON.parse(
      String(
        fs.readFileSync(
          join(PROCESSED_DIRECTORY, currentSlideshowDirectory, 'manifest.json')
        )
      )
    )

    output = output.map((data) => ({
      ...data,
      url: join(SLIDESHOW_URL_BASE, currentSlideshowDirectory, data.filename),
      width: manifest[data.filename].width,
      height: manifest[data.filename].height,
      sizesString: manifest[data.filename].sizesString,
    }))
  }
  return output
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  type Items = {
    [key: string]: string
  }

  const items: Items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
    if (field === 'slideshow') {
      items[field] = {
        ...data[field],
        slides: getPostSlideshow(data[field]),
      }
    }
  })

  // console.log(items)
  return items
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}
