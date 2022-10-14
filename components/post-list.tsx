import Avatar from './avatar'
import DateFormatter from './date-formatter'
import CoverSlide from './cover-slide'
import Link from 'next/link'
import type Post from '../interfaces/post'
import Slideshow from './slideshow'
import SectionSeparator from './section-separator'

type Props = {
  posts: Post[]
}

const PostList = ({ posts }: Props) => {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        {posts.map(
          ({ slideshow, slug, title, date, excerpt, author, coverImage }) => (
            <article key={slug}>
              <div className="ml-12 mb-8">
                <div className="mb-4 md:mb-0 text-lg">
                  <DateFormatter dateString={date} />
                </div>
                <h3 className=" text-4xl lg:text-5xl leading-tight">
                  <Link
                    as={`/posts/${slug}#article-start`}
                    href="/posts/[slug]"
                  >
                    <a className="hover:underline">{title}</a>
                  </Link>
                </h3>
              </div>
              <div className="mb-8">
                {slideshow.slides.length > 1 ? (
                  <Slideshow slides={slideshow.slides} slug={slug} />
                ) : (
                  <CoverSlide
                    slug={slug}
                    title={title}
                    slide={slideshow.slides[0]}
                  />
                )}
              </div>
              <div className="max-w-2xl mx-auto mx-6">
                <div className="md:float-left block mb-6 mr-8">
                  <Avatar name={author.name} picture={author.picture} />
                </div>
                <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
              </div>
              <SectionSeparator />
            </article>
          )
        )}
      </div>
    </section>
  )
}

export default PostList
