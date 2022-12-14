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
    <section>
      {posts.map(({ slideshow, slug, title, date, summary, author }, index) => (
        <article key={slug}>
          <div className="mb-2 ml-8">
            <div className="mb-1 md:mb-0 text-lg uppercase">
              <DateFormatter dateString={date} />
            </div>
            <h2 className="text-4xl lg:text-5xl leading-tight">
              <Link
                className="hover:underline"
                as={`/posts/${slug}#article-start`}
                href="/posts/[slug]"
              >
                {title}
              </Link>
            </h2>
          </div>
          <div className="mb-8">
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
            className={`mx-6 pb-28 ${
              index !== posts.length - 1
                ? 'mb-24 border-b border-solid border-zinc-400'
                : ''
            }`}
          >
            <div className="max-w-2xl mx-auto">
              <div className="mb-3 mr-8 sm:float-left">
                <Avatar name={author.name} picture={author.picture} />
              </div>
              <div
                className="text-lg leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

export default PostList
