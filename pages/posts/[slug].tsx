import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import {
  TITLE,
  OG_EXTERNAL_IMAGES_BASE_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from '../../lib/constants'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import SiteName from '../../components/site-name'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import markdownToHtml from '../../lib/markdownToHtml'
import type PostType from '../../interfaces/post'
import PostSlideList from '../../components/post-slidelist'

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
    <Layout preview={preview}>
      <Container>
        <SiteName />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>{`${TITLE} | ${post.title}`}</title>
                <meta name="description" content={`${TITLE} | ${post.title}`} />

                <meta
                  property="og:title"
                  content={`${TITLE} | ${post.title}`}
                />
                <meta
                  property="og:description"
                  content={`${post?.excerpt ?? ''}`}
                />
                <meta property="og:image:width" content={`${OG_IMAGE_WIDTH}`} />
                <meta
                  property="og:image:height"
                  content={`${OG_IMAGE_HEIGHT}`}
                />
                <meta
                  property="og:image"
                  content={`${OG_EXTERNAL_IMAGES_BASE_URL}/api/og?imgUrl=${encodeURIComponent(
                    post.slideshow.slides[0].url
                  )}&title=${encodeURIComponent(post.title)}`}
                />
              </Head>
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
    </Layout>
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
    'excerpt',
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
