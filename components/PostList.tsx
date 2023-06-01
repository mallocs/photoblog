import type Post from '#/interfaces/post'
import PostCompact from './PostCompact'

type Props = {
  posts: Post[]
}

const PostList = ({ posts }: Props) => {
  return (
    <section className="mt-8">
      {posts.map((postProps, index) => (
        <PostCompact
          key={postProps.slug}
          {...postProps}
          priority={index === 0}
        />
      ))}
    </section>
  )
}

export default PostList
