import DateFormatter from '#/components/shared/DateFormatter'
import Link from 'next/link'
import type Post from '#/interfaces/post'
import Slideshow from '#/components/shared/Slideshow'
import DateRangeFormatter from '#/components/shared/DateRangeFormatter'

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
            <div className="mb-1 font-medium uppercase">
              {Array.isArray(slideshow.dateRange) ? (
                <DateRangeFormatter dateRange={slideshow.dateRange} />
              ) : (
                <DateFormatter dateString={date} />
              )}
            </div>
            <div className="mb-3">
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          </div>
          {Boolean(slideshow) &&
            Array.isArray(slideshow.slides) &&
            slideshow.slides.length > 0 && (
              <div className="mb-2">
                <Slideshow
                  id={`main-${String(index)}`}
                  slides={slideshow.slides}
                  indexButtonType={slideshow.indexButtonType}
                  priority={index === 0}
                  slug={slug}
                />
              </div>
            )}
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
