import type Author from './author'
import type { SlideshowExternal } from './slideshow'

type PostType = {
  slug: string
  title: string
  date: string
  author: Author
  excerpt: string
  slideshow?: SlideshowExternal
  ogImage?: {
    url: string
  }
  content: string
}

// export const postRequiredFields = [
//   'slug',
//   'title',
//   'date',
//   'author',
//   'excerpt',
//   'content',
// ]

export default PostType
