import Avatar from './avatar'
import DateFormatter from './date-formatter'
import CoverSlide from './cover-slide'
import PostTitle from './post-title'
import type Author from '#/interfaces/author'
import { SlideExternal } from '#/interfaces/slide'

type Props = {
  title: string
  coverSlide: SlideExternal
  date: string
  author: Author
}

const PostHeader = ({ title, coverSlide, date, author }: Props) => {
  return (
    <>
      <div className="mb-8 md:mb-16 sm:mx-0">
        <CoverSlide title={title} slide={coverSlide} />
      </div>
      <span className="relative">
        <a id="article-start" className="absolute -top-[50vh]  " />
      </span>
      <div className="max-w-3xl mx-auto px-4 dark:text-zinc-100">
        <PostTitle>{title}</PostTitle>

        <div className="block mb-6">
          <Avatar name={author.name} picture={author.picture} />
        </div>
        <div className="mb-6 text-lg uppercase">
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  )
}

export default PostHeader
