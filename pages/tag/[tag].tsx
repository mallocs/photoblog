export { default } from '#/pages/index'
import { getPropsForPosts, getAllPosts } from '#/lib/api'
import normalizeTag from '#/lib/normalizeTag'

type Params = {
  params: {
    tag: string
  }
}

export function getStaticProps({ params }: Params) {
  return getPropsForPosts({
    tag: normalizeTag(params.tag),
    startIndex: 0,
    stopIndex: 1,
  })
}

type WithPost = Required<{ tags: string[] }>

export async function getStaticPaths() {
  const posts = getAllPosts(['tags'])

  return {
    paths: posts
      .filter((post): post is WithPost => post.tags !== undefined)
      .flatMap((post) =>
        post.tags!.map((tag) => ({
          params: {
            tag: normalizeTag(tag),
          },
        }))
      ),
    fallback: false,
  }
}
