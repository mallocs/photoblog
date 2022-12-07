import path from 'path'
import fs from 'fs'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import markdownToHtml from '#/lib/markdownToHtml'
import Container from '#/components/container'
import Meta from '#/components/meta'
import PostList from '#/components/post-list'
import SiteName from '#/components/site-name'
import Layout from '#/components/layout'
import Navbar from '#/components/navbar'
import { getPropsForPosts } from '#/lib/api'
import { TITLE } from '#/lib/constants'
import Post from '#/interfaces/post'

type Props = {
  ogImage?: string
  posts: Post[]
}

export default function Index({ posts: firstPost, ogImage }: Props) {
  const [morePosts, setMorePosts] = useState([])

  useEffect(() => {
    ;(async () => {
      const {
        props: { posts },
      } = await (await fetch('/posts.json')).json()
      setMorePosts(posts.slice(1))
    })()
  }, [])

  const allPosts = [...firstPost, ...morePosts]
  return (
    <>
      <Layout>
        <Head>
          <title>{TITLE}</title>
        </Head>
        <Meta ogImage={ogImage} />
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
  await writePostsJson()
  return await getPropsForPosts({ startIndex: 0, stopIndex: 1 })
}

async function writePostsJson() {
  const filePath = path.join(process.cwd(), 'public', 'posts.json')

  const posts = JSON.stringify(await getPropsForPosts())

  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath)
  }

  fs.writeFile(filePath, posts, (err) => {
    if (err) {
      console.log('Error writing posts JSON file: ', err)
    }
  })
}
