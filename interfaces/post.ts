import type Author from './author'
import type { SlideshowExternal } from './slideshow'

type PostType = {
  slug: string
  title: string
  date: string
  lastModified?: string
  author: Author
  summary: string
  tags?: string[]
  slideshow?: SlideshowExternal
  ogImage?: {
    url: string
  }
  content: string
  priority: boolean
}

export default PostType
