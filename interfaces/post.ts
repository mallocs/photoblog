import type Author from './author'
import type { SlideshowExternal } from './slideshow'

type PostType = {
  slug: string
  title: string
  date: string
  lastModified?: string
  author: Author
  summary: string
  slideshow?: SlideshowExternal
  ogImage?: {
    url: string
  }
  content: string
}

export default PostType
