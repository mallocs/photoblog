import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { SlideExternal } from '#/interfaces/slide'
import { slideshowIndexButtonOptions } from '#/interfaces/slideshow'
import PostType from '#/interfaces/post'
import siteConfig from '#/site.config'

// After processing, slideshows should have a subdirectory with this name that includes the processed files
export function getPostSlugs() {
  return fs
    .readdirSync(siteConfig.postsDirectoryFullPath)
    .filter((fileName) => fileName.endsWith('md'))
    .map((filename) => filename.replace(/\.md$/, ''))
}

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
    siteConfig.processedDirectory,
    currentSlideshowDirectory
  )
  const currentSlideshowDirectoryUrl = join(
    siteConfig.slideshowUrlBase,
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

  return (
    [
      ...Object.entries(captions),
      ...fs
        .readdirSync(currentProcessedDirectory)
        .filter(
          (directoryFilename) =>
            // filter out unsupported filetypes
            siteConfig.imageFileTypes.some((ext) =>
              directoryFilename.toLowerCase().endsWith(ext)
            ) &&
            // filter out slides specified by captions so they aren't duplicated
            !Object.entries(captions).find(
              ([captionedFilename, _]) =>
                captionedFilename.toLowerCase() ===
                directoryFilename.toLowerCase()
            )
        )
        .map((filename) => [filename, '']),
    ]
      // filter out images that don't exist in manifest
      .filter(([filename, _]) => {
        if (filename in manifest) {
          return true
        }
        console.error(`File not found in manifest.json: ${filename}`)
        return false
      })
      // add in data collected by the processing phase and specified in manifest.json
      .map(([filename, caption]) => ({
        filename,
        caption,
        url: join(currentSlideshowDirectoryUrl, filename),
        ...(manifest[filename] && {
          url: manifest[filename].url,
          width: manifest[filename].width,
          height: manifest[filename].height,
          geodata: manifest[filename].geodata ?? null,
          blurDataURL: manifest[filename].blurDataURL,
          //  sizesString: manifest[data.filename].sizesString,
        }),
      }))
  )
}

// Assumes a .md file exists in the postsDirectory for the passed slug
// returns a blank matter file on errors
export function getPostMatter(slug: string): matter.GrayMatterFile<string> {
  const fullPath = join(siteConfig.postsDirectoryFullPath, `${slug}.md`)
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    return matter(fileContents)
  } catch (err) {
    console.error(
      `Error reading file ${fullPath} based on slug passed: ${slug}`
    )
  }
  return matter('')
}

export function getPostBySlug(
  slug: string,
  fields: string[] = []
): Partial<PostType> {
  const { data, content } = getPostMatter(slug)
  const post = {
    ...data,
    slug,
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
      )}&title=${encodeURIComponent(siteConfig.siteTitle)}`,
      posts,
    },
  }
}
