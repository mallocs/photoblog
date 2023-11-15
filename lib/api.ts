import fs from 'fs'
import path, { join, parse } from 'path'
import matter from 'gray-matter'
import { SlideExternal } from '#/interfaces/slide'
import PostType from '#/interfaces/post'
import normalizeTag from '#/lib/normalizeTag'
import siteConfig from '#/site.config'
import { vercelLoader, ImageLoaderName } from '#/interfaces/imageLoader'
import { getOGImageUrl } from '#/lib/imageLoaders'

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
    if (slide.dateTimeOriginal === undefined) {
      continue
    }
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
  loader = vercelLoader,
}: {
  captions?: {
    [key: string]: string
  }
  slug: string
  postsDirectory?: string
  manifestFileName?: string
  loader: ImageLoaderName
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
        loader,
        src: join(currentSlideshowDirectoryUrl, filename),
        // manifest.json should be able to override src and other values as needed.
        ...manifest[filename],
      }))
  )
}

export function getPostSlideshow(
  slug,
  {
    captions, // Captions are optional. Any pictures in the path directory not specified by captions
    // will be added to the end of the array of slides.
    indexButtonType = 'dots',
    loader = vercelLoader,
  }: {
    captions: {
      [key: string]: string
    }
    indexButtonType: string
    loader: ImageLoaderName
  } = getPostMatter(slug).data.slideshow ?? {}
) {
  if (!captions) {
    return {}
  }
  const postSlides = getPostSlides({ captions, slug, loader })
  return {
    showMap:
      Boolean(postSlides[0]?.latitude) && Boolean(postSlides[0]?.longitude),
    indexButtonType,
    ...(slug && getEarliestAndLatestSlideDatetime(postSlides)),
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
    .sort((post1, post2) =>
      post2.date === undefined ||
      (post1.date !== undefined && new Date(post1.date) > new Date(post2.date))
        ? -1
        : 1
    )
  return posts
}

export const getPropsForPosts = ({
  tag = null,
  startIndex = 0,
  posts = getAllPosts([
    'title',
    'date',
    'slug',
    'tags',
    'slideshow',
    'author',
    'summary',
    'content',
  ]),
  stopIndex = posts.length,
} = {}) => {
  // json files with the post data are written out by writePostJsonFiles
  const postUrlMap = posts.reduce((accumulator, current, index) => {
    accumulator.set(
      current.slug,
      // higher numbered posts are newer
      `/${siteConfig.jsonUrl}/post-${posts.length - index}.json`
    )
    return accumulator
  }, new Map())
  const outputPosts = posts.filter(
    (post) =>
      tag === null ||
      post.tags?.some((postTag) => normalizeTag(postTag) === normalizeTag(tag))
  )

  return {
    props: {
      ogImage: getOGImageUrl(
        outputPosts[0]?.slideshow?.slides[0],
        siteConfig.siteTitle
      ),
      posts: outputPosts.slice(startIndex, stopIndex),
      fetchUrls: outputPosts.map((post, index) => {
        if (index < stopIndex) {
          return null
        }
        return postUrlMap.get(post.slug)
      }),
      tag,
      // reset state whenever tags changes
      key: tag,
    },
  }
}

// write files as 1-indexed starting with the oldest post as post-1.json
// with the newest post as the highest numbered so newer posts won't
// overwrite older posts.
export function writePostJsonFiles() {
  if (!fs.existsSync(siteConfig.jsonDirectory)) {
    fs.mkdirSync(siteConfig.jsonDirectory)
  }
  const fileFolderPath = path.join(process.cwd(), siteConfig.jsonDirectory)
  const {
    props: { posts },
  } = getPropsForPosts()

  posts.forEach((post, index) => {
    try {
      fs.writeFileSync(
        path.join(fileFolderPath, `post-${posts.length - index}.json`),
        JSON.stringify(post)
      )
    } catch (err) {
      console.log('Error writing posts JSON file: ', err)
    }
  })
}
