import Avatar from './avatar'
import DateFormatter from './date-formatter'
import CoverSlide from './cover-slide'
import Link from 'next/link'
import type Post from '#/interfaces/post'
import Slideshow from './slideshow'

type Props = {
  posts: Post[]
}

const PostList = ({ posts }: Props) => {
  return (
    <section className="mt-8">
      {posts.map(({ slideshow, slug, title, date, summary, author }, index) => (
        <article key={slug}>
          <div className="max-w-4xl px-4 mx-auto">
            <h2 className="mb-3 text-4xl lg:text-5xl leading-tight">
              <Link
                className="hover:underline"
                as={`/posts/${slug}#article-start`}
                href="/posts/[slug]"
              >
                {title}
              </Link>
            </h2>
            <div className="mb-1 text-lg uppercase">
              <DateFormatter dateString={date} />
            </div>
            <div className="mb-3">
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          </div>
          <div className="mb-2">
            {slideshow.slides.length > 1 ? (
              <Slideshow
                id={`main-${String(index)}`}
                slides={slideshow.slides}
                indexButtonType={slideshow.indexButtonType}
                priority={index === 0}
                slug={slug}
              />
            ) : (
              <CoverSlide
                slug={slug}
                title={title}
                slide={slideshow.slides[0]}
              />
            )}
          </div>
          <div
            className={`mx-6 pb-8 ${
              index !== posts.length - 1
                ? 'mb-12 border-b border-solid border-zinc-400'
                : ''
            }`}
          ></div>
        </article>
      ))}
    </section>
  )
}

export default PostList
