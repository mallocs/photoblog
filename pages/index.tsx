import Head from 'next/head'
import markdownToHtml from '../lib/markdownToHtml'
import Container from '../components/container'
import PostList from '../components/post-list'
import SiteName from '../components/site-name'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { getAllPosts } from '../lib/api'
import { TITLE } from '../lib/constants'
import Post from '../interfaces/post'

type Props = {
  allPosts: Post[]
}

export default function Index({ allPosts }: Props) {
  // console.log(allPosts)
  return (
    <>
      <Layout>
        <Head>
          <title>{TITLE}</title>
        </Head>
        <Container>
          <SiteName />
          <Navbar />
          <PostList posts={allPosts} />
        </Container>
      </Layout>
    </>
  )
}

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'slideshow',
    'author',
    'excerpt',
    'content',
  ])

  for (const post of allPosts) {
    // extract first paragraph as the excerpt if there's no excerpt
    post.excerpt =
      post.excerpt ||
      (await markdownToHtml(
        post?.content?.split('\n').slice(0, 2).join('') || ''
      )) ||
      ''
  }

  return {
    props: { allPosts },
  }
}
