import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '#/components/container'
import PostBody from '#/components/post-body'
import PostHeader from '#/components/post-header'
import { getPostBySlug, getAllPosts } from '#/lib/api'
import PostTitle from '#/components/post-title'
import markdownToHtml from '#/lib/markdownToHtml'
import type PostType from '#/interfaces/post'
import PostSlideList from '#/components/post-slidelist'
import { SlugSEO } from '#/components/SEO'

type Props = {
  post: PostType
  morePosts: PostType[]
  preview?: boolean
}

export default function Post({ post, morePosts, preview }: Props) {
  const router = useRouter()

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Container>
      {router.isFallback ? (
        <PostTitle>Loading…</PostTitle>
      ) : (
        <>
          <article className="mb-32">
            <SlugSEO {...post} />
            <PostHeader
              title={post.title}
              coverSlide={post.slideshow.slides[0]}
              date={post.date}
              author={post.author}
            />
            <PostBody content={post.content} />
            {post.slideshow.slides.length > 1 && (
              <PostSlideList slides={post.slideshow.slides.slice(1)} />
            )}
          </article>
        </>
      )}
    </Container>
  )
}

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'summary',
    'date',
    'slideshow',
    'slug',
    'author',
    'content',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
