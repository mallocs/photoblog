import fs from 'fs'
import { join, parse } from 'path'
import matter from 'gray-matter'
import { SlideExternal } from '#/interfaces/slide'
import PostType from '#/interfaces/post'
import siteConfig from '#/site.config'

// After processing, posts directory should have a subdirectory with this name that includes the processed files
export function getPostSlugs() {
  return fs
    .readdirSync(siteConfig.postsDirectory, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        fs.existsSync(
          join(
            siteConfig.postsDirectory,
            dirent.name,
            siteConfig.postMarkdownFileName
          )
        )
    )
    .map((dirent) => dirent.name)
}

function getEarliestAndLatestSlideDatetime(slides: SlideExternal[]): {
  slides: SlideExternal[]
  dateRange?: [string, string]
} {
  if (!slides[0]?.dateTimeOriginal) {
    return { slides }
  }
  let earliestSlide = slides[0].dateTimeOriginal
  let latestSlide = slides[0].dateTimeOriginal

  for (let slide of slides) {
    let currentDate = new Date(slide.dateTimeOriginal)
    if (currentDate < new Date(earliestSlide)) {
      earliestSlide = slide.dateTimeOriginal
    } else if (currentDate > new Date(latestSlide)) {
      latestSlide = slide.dateTimeOriginal
    }
  }

  return {
    slides,
    dateRange: [earliestSlide, latestSlide],
  }
}

// Transform markdown slideshow gray matter to external slideshow data
function getPostSlides({
  captions = {}, // see getPostSlideshow comments
  slug: currentSlideshowDirectory,
  postsDirectory = siteConfig.postsDirectory,
  manifestFileName = siteConfig.manifestFileName,
}: {
  captions?: {
    [key: string]: string
  }
  slug: string
  postsDirectory?: string
  manifestFileName?: string
}): SlideExternal[] {
  const currentPostDirectory = join(postsDirectory, currentSlideshowDirectory)
  const currentSlideshowDirectoryUrl = join(
    '/',
    postsDirectory,
    currentSlideshowDirectory
  )

  if (!fs.existsSync(currentPostDirectory)) {
    console.error(
      `Error: Couldn't find directory for slideshow: ${currentPostDirectory}`
    )
    return []
  }
  if (!fs.existsSync(join(currentPostDirectory, manifestFileName))) {
    console.error(
      `Error: Couldn't find manifest.json for slideshow: ${join(
        currentPostDirectory,
        manifestFileName
      )}`
    )
    return []
  }

  const manifest = JSON.parse(
    String(fs.readFileSync(join(currentPostDirectory, manifestFileName)))
  )

  return (
    [
      ...Object.entries(captions),
      ...fs
        .readdirSync(currentPostDirectory)
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
        if (filename in manifest || parse(filename).name in manifest) {
          return true
        }
        console.error(`File not found in ${manifestFileName}: ${filename}`)
        return false
      })
      // add in data collected by the processing phase and specified in manifest.json
      // TODO: use exif data directly and remove manifest.json
      .map(([filename, caption]) => ({
        filename,
        caption,
        ...manifest[filename],
        url: join(currentSlideshowDirectoryUrl, filename),
      }))
  )
}

function getPostSlideshow(
  slug,
  {
    captions = {}, // Captions are optional. Any pictures in the path directory not specified by captions
    // will be added to the end of the array of slides.
    indexButtonType = 'dots',
    geocode = false,
  }: {
    captions: {
      [key: string]: string
    }
    indexButtonType: string
    geocode: boolean | string
  }
) {
  return {
    showMap: Boolean(geocode) && geocode !== 'no',
    indexButtonType,
    ...(slug &&
      getEarliestAndLatestSlideDatetime(getPostSlides({ captions, slug }))),
  }
}

// Assumes a .md file exists in the postsDirectory for the passed slug
// returns a blank matter file on errors
export function getPostMatter(slug: string): matter.GrayMatterFile<string> {
  const fullPath = join(
    siteConfig.postsDirectory,
    slug,
    siteConfig.postMarkdownFileName
  )
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
    slideshow: getPostSlideshow(slug, data.slideshow),
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
      ogImage:
        posts[0]?.slideshow?.slides === undefined
          ? null
          : `${siteConfig.siteUrl}/api/og?imgUrl=${encodeURIComponent(
              (posts[0]?.slideshow?.slides ?? [])[0]?.url
            )}&title=${encodeURIComponent(siteConfig.siteTitle)}`,
      posts,
    },
  }
}
