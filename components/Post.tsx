import markdownStyles from './markdown-styles.module.css'
import Avatar from '#/components/shared/Avatar'
import DateFormatter from '#/components/shared/DateFormatter'
import type Author from '#/interfaces/author'
import { SlideExternal } from '#/interfaces/slide'
import Slide from '#/components/shared/Slide'
import SlideList from '#/components/shared/SlideList'
import { ReactNode } from 'react'
import DateRangeFormatter from './shared/DateRangeFormatter'

type TitleProps = {
  children?: ReactNode
}

const PostTitle = ({ children }: TitleProps) => {
  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">
      {children}
    </h1>
  )
}

type Props = {
  title: string
  date: string
  slideshowDateRange?: [string, string]
  author: Author | string
  content: string
  slides?: SlideExternal[]
}

const Post = ({
  title,
  date,
  slideshowDateRange,
  author,
  content,
  slides = [],
}: Props) => {
  return (
    <>
      {slides.length >= 1 && (
        <Slide
          slideIndex={0}
          slide={slides[0]}
          id={`slide-0`}
          key={slides[0]?.src}
        />
      )}
      <span className="relative">
        <a id="article-start" className="absolute -top-[50vh]" />
      </span>
      <div className="max-w-3xl mx-auto px-4">
        <PostTitle>{title}</PostTitle>
        <div className="block mb-6">
          <Avatar author={author} />
        </div>
        <div className="mb-6 text-lg uppercase">
          {Array.isArray(slideshowDateRange) ? (
            <DateRangeFormatter dateRange={slideshowDateRange} />
          ) : (
            <DateFormatter dateString={date} />
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        <div
          className={markdownStyles['markdown']}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      {slides.length > 1 && <SlideList slides={slides.slice(1)} />}
    </>
  )
}

export default Post
export { PostTitle }
