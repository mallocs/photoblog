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

const PostTitleInImage = ({ children }: TitleProps) => {
  return (
    <h1 className="absolute top-48 left-8 bg-zinc-600/70 border-2 border-zinc-400/30 dark:border-zinc-800/30 max-w-[50%] text-zinc-200 dark:text-zinc-900 rounded-xl text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight md:leading-none mb-12 p-4 text-center md:text-left">
      {children}
    </h1>
  )
}

const PostTitle = ({ children }: TitleProps) => {
  return (
    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight md:leading-none mb-4 md:mb-8 mt-4 text-center md:text-left">
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
      <span className="relative">
        <a id="article-start" />
      </span>
      {slides.length >= 1 && (
        <Slide
          slideIndex={0}
          slide={slides[0]}
          id={`slide-0`}
          key={slides[0]?.src}
        />
      )}

      <div className="max-w-3xl mx-auto px-4">
        {slides.length >= 1 ? (
          <PostTitleInImage>{title}</PostTitleInImage>
        ) : (
          <PostTitle>{title}</PostTitle>
        )}
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
