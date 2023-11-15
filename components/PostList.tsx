import type Post from '#/interfaces/post'
import PostCompact from './PostCompact'

type Props = {
  posts: Post[]
  inViewPostIndex?: number
}

const PostList = ({ posts, inViewPostIndex }: Props) => {
  return (
    <section className="mt-8">
      {posts.filter(Boolean).map((postProps, index) => (
        <PostCompact
          key={postProps.slug}
          {...postProps}
          priority={index === 0}
          inView={inViewPostIndex !== undefined && index === inViewPostIndex}
        />
      ))}
    </section>
  )
}

export default PostList
