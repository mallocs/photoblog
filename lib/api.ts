import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { SlideExternal } from '../interfaces/slide'
import { slideshowIndexButtonOptions } from '../interfaces/slideshow'
import PostType from '../interfaces/post'
import siteConfig, { siteTitle } from '#/site.config'

// After processing, slideshows should have a subdirectory with this name that includes the processed files
export const postsDirectory = join(process.cwd(), '_posts')

import { processedDirectory, slideshowUrlBase } from '#/site.config'

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('md'))
}

const IMG_EXTENSIONS = ['.jpeg', '.jpg', '.gif', '.png']

// Transform markdown slideshow gray matter to external slideshow data

export function getPostSlides({
  captions = {}, // Captions are optional. Any pictures in the path directory not specified by captions
  // will be added to the end of the array of slides.
  path: currentSlideshowDirectory, // path to slideshow directory in filesystem
}: {
  captions: {
    [key: string]: string
  }
  path: string
}): SlideExternal[] {
  const currentProcessedDirectory = join(
    processedDirectory,
    currentSlideshowDirectory
  )
  const currentSlideshowDirectoryUrl = join(
    slideshowUrlBase,
    currentSlideshowDirectory
  )
  // check if processed image directory exists and
  // check internal directory exists but map to external urls, ie slideshowRootDirectory => slideshowPath
  if (!fs.existsSync(currentProcessedDirectory)) {
    console.error(
      `Error: Couldn't find directory for slideshow: ${currentProcessedDirectory}`
    )
    return []
  }
  if (!fs.existsSync(join(currentProcessedDirectory, 'manifest.json'))) {
    console.error(
      `Error: Couldn't find manifest.json for slideshow: ${join(
        currentProcessedDirectory,
        'manifest.json'
      )}`
    )
    return []
  }

  const manifest = JSON.parse(
    String(fs.readFileSync(join(currentProcessedDirectory, 'manifest.json')))
  )

  return [
    ...Object.entries(captions),
    ...fs
      .readdirSync(currentProcessedDirectory)
      .map((filename) => [filename, ''])
      .filter(([filename, _]) =>
        // filter out non-images and unsupported image filetypes
        IMG_EXTENSIONS.some(
          (ext) =>
            filename.toLowerCase().endsWith(ext) &&
            // filter out slides specified by captions so they aren't duplicated
            !Object.entries(captions).find(
              ([orderedFilename, _]) =>
                orderedFilename.toLowerCase() === filename.toLowerCase()
            )
        )
      ),
    // add in data collected by the processing phase and specified in manifest.json
  ].map(([filename, caption]) => ({
    filename,
    caption,
    url: join(currentSlideshowDirectoryUrl, filename),
    ...(manifest[filename] && {
      url: manifest[filename].url,
      width: manifest[filename].width,
      height: manifest[filename].height,
      blurDataURL: manifest[filename].blurDataURL,
      //  sizesString: manifest[data.filename].sizesString,
    }),
  }))
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
    ...(data.slideshow && {
      slideshow: {
        ...(slideshowIndexButtonOptions.includes(
          data.slideshow.indexButtonType
        ) && {
          indexButtonType: data.slideshow.indexButtonType,
        }),
        slides: getPostSlides(data.slideshow),
      },
    }),
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

export const getPropsForPosts = async ({
  startIndex = 0,
  stopIndex = undefined,
} = {}) => {
  let posts = getAllPosts([
    'title',
    'date',
    'slug',
    'slideshow',
    'author',
    'summary',
    'content',
  ]).slice(startIndex, stopIndex)

  return {
    props: {
      ogImage: `${siteConfig.siteUrl}/api/og?imgUrl=${encodeURIComponent(
        (posts[0]?.slideshow?.slides ?? [])[0]?.url
      )}&title=${encodeURIComponent(siteTitle)}`,
      posts,
    },
  }
}
