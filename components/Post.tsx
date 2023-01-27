import markdownStyles from './markdown-styles.module.css'
import Avatar from '#/components/shared/Avatar'
import DateFormatter from '#/components/shared/date-formatter'
import type Author from '#/interfaces/author'
import { SlideExternal } from '#/interfaces/slide'
import Slide from '#/components/shared/Slide'
import SlideList from '#/components/shared/SlideList'
import { ReactNode } from 'react'

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
  author: Author
  content: string
  slides: SlideExternal[]
}

const Post = ({ title, date, author, content, slides }: Props) => {
  return (
    <>
      <Slide slide={slides[0]} id={`slide-0`} key={slides[0]?.url} />
      <span className="relative">
        <a id="article-start" className="absolute -top-[50vh]" />
      </span>
      <div className="max-w-3xl mx-auto px-4">
        <PostTitle>{title}</PostTitle>
        <div className="block mb-6">
          <Avatar name={author.name} picture={author.picture} />
        </div>
        <div className="mb-6 text-lg uppercase">
          <DateFormatter dateString={date} />
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
