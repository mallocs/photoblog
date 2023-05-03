import DateFormatter from '#/components/shared/DateFormatter'
import Link from 'next/link'
import type Post from '#/interfaces/post'
import Slideshow from '#/components/shared/Slideshow'
import DateRangeFormatter from '#/components/shared/DateRangeFormatter'

type Props = {
  posts: Post[]
}

// Compute a summary string to use with dangerouslySetInnerHTML. Should add a link to
// the main post unless there's no content or summary since the headline is already a
// link.
function getSummary({
  summary,
  content,
  articleStartUrl,
}: {
  summary?: string
  content?: string
  articleStartUrl: string
}): string {
  if (
    (summary === undefined || summary.trim() === '') &&
    (content === undefined || content.trim() === '')
  ) {
    return ''
  }
  return (
    (summary || content?.split('\n\n')[0]) +
    `&nbsp;&nbsp;<a href='${articleStartUrl}'>&gt;&gt;</a>`
  )
}

const getArticleStartUrl = (slug) => `/posts/${slug}#article-start`

const PostList = ({ posts }: Props) => {
  return (
    <section className="mt-8">
      {posts.map(
        ({ content, slideshow, slug, title, date, summary, author }, index) => (
          <article key={slug}>
            <div className="max-w-4xl px-4 mx-auto">
              <h2 className="mb-3 text-4xl lg:text-5xl leading-tight">
                <Link
                  className="hover:underline"
                  as={getArticleStartUrl(slug)}
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
                  dangerouslySetInnerHTML={{
                    __html: getSummary({
                      summary,
                      content,
                      articleStartUrl: getArticleStartUrl(slug),
                    }),
                  }}
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
        )
      )}
    </section>
  )
}

export default PostList
