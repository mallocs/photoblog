import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { SlideExternal, SlideInternal } from '../interfaces/slide'

const postsDirectory = join(process.cwd(), '_posts')
const slideshowPath = '/assets/slideshows/'
const slideshowRootDirectory = join(process.cwd(), 'public', slideshowPath)

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('md'))
}

const IMG_EXTENSIONS = ['.jpeg', '.jpg', '.gif', '.png']

// Transform internal slideshow gray matter to external slideshow data
export function getPostSlideshow({
  slides = [], // Slides should have filename and caption
  path: slideshowDirectory, // path to slideshow directory in filesystem
}: {
  slides: SlideInternal[] //
  path: string
}): SlideExternal[] {
  // console.log(slides)
  const filenames = fs
    .readdirSync(join(slideshowRootDirectory, slideshowDirectory))
    .filter((filename) =>
      IMG_EXTENSIONS.some(
        (ext) =>
          filename.endsWith(ext) &&
          !slides.find((slide) => slide.filename === filename)
      )
    )
    .map((filename) => ({
      url: join(slideshowPath, slideshowDirectory, filename),
    }))

  const output = [
    ...slides.map(({ filename, caption }) => {
      return {
        url: join(slideshowPath, slideshowDirectory, filename),
        caption,
      }
    }),
    ...filenames,
  ]

  // console.log(output)

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
