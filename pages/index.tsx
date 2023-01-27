import path from 'path'
import fs from 'fs'
import { useEffect, useState } from 'react'
import { IndexSEO } from '#/components/shared/SEO'
import PostList from '#/components/PostList'
import { getPropsForPosts } from '#/lib/api'
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
      <IndexSEO ogImage={ogImage} />
      <div className="mx-auto">
        <PostList posts={allPosts} />
      </div>
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
