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

export async function getStaticPaths() {
  const posts = getAllPosts(['tags'])

  return {
    paths: posts
      .filter((post) => post.tags !== undefined)
      .flatMap((post) =>
        post.tags.map((tag) => ({
          params: {
            tag: normalizeTag(tag),
          },
        }))
      ),
    fallback: false,
  }
}
