import DateFormatter from '#/components/shared/DateFormatter'
import Link from 'next/link'
import Slideshow from '#/components/shared/Slideshow'
import DateRangeFormatter from '#/components/shared/DateRangeFormatter'
import type Post from '#/interfaces/post'
import { useObserverGroup } from '#/lib/intersection-observer-group'
import siteConfig from '#/site.config'

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

function PostCompact({
  content,
  slideshow,
  slug,
  title,
  date,
  summary,
  author,
  priority,
}: Post) {
  const { ref } = useObserverGroup({
    group: siteConfig.postObserverGroup,
    rootMargin: '0px 0px 50px 0px',
    threshold: [0, 0.1, 1], // [...Array.from(Array(5).keys())].map((item) => item / 5),
  })
  return (
    <article
      ref={ref}
      className="mb-12 mx-6 pb-8 border-b border-solid border-zinc-400 last:border-none"
    >
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
              slides={slideshow.slides}
              indexButtonType={slideshow.indexButtonType}
              priority={priority}
              slug={slug}
            />
          </div>
        )}
    </article>
  )
}

export default PostCompact
