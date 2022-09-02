import type Author from './author'
import type { SlideExternal } from './slide'

type PostType = {
  slug: string
  title: string
  date: string
  coverImage: string
  author: Author
  excerpt: string
  slideshow?: {
    path: string
    slides: SlideExternal[]
  }
  ogImage: {
    url: string
  }
  content: string
}

export default PostType
