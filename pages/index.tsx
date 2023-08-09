import { useCallback, useEffect, useState } from 'react'
import { IndexSEO } from '#/components/shared/SEO'
import PostList from '#/components/PostList'
import { getPropsForPosts, writePostJsonFiles } from '#/lib/api'
import Post from '#/interfaces/post'
import { MapButton } from '#/components/shared/buttons/MapButton'
import withSlidesContext from '#/contexts/SlideContext'
import { getClosestToViewportBottomIndex } from '#/lib/intersection-observer-group/observe'
import { useObserverGroupCallback } from '#/lib/intersection-observer-group'
import siteConfig from '#/site.config'

type Props = {
  ogImage?: string
  posts: Post[]
  fetchUrls: string | null[]
  preload: number
}

const MapButtonWithCurrentSlides = withSlidesContext(MapButton)

// The first image of the first post should have priority set to high
// for server rendering.
// The post index in view is used to update the image loading attribute to 'eager'
// for slides in the preload range since the browser won't preload them normally.
export default function Index({
  posts: serverRenderedPosts,
  fetchUrls,
  ogImage,
  preload = siteConfig.preloadPosts,
}: Props) {
  const [inViewPostIndex, setInViewPostIndexFn] = useState(null)

  const handleChangePostFn = useCallback(() => {
    const closestPostIndex = getClosestToViewportBottomIndex(
      siteConfig.postObserverGroup,
      true
    )
    setInViewPostIndexFn(closestPostIndex)
  }, [])
  useObserverGroupCallback(siteConfig.postObserverGroup, handleChangePostFn)

  const [posts, setPostsFn] = useState([
    ...serverRenderedPosts,
    ...Array(fetchUrls.length - 1).fill(undefined),
  ])

  useEffect(() => {
    ;(async () => {
      for (
        let postIndex = inViewPostIndex;
        postIndex <= Math.min(inViewPostIndex + preload, fetchUrls.length - 1);
        postIndex++
      ) {
        if (posts[postIndex] === undefined && fetchUrls[postIndex]) {
          const updatedPosts = [...posts]
          updatedPosts[postIndex] = await (
            await fetch(fetchUrls[postIndex])
          ).json()
          setPostsFn(updatedPosts)
        }
      }
    })()
  }, [inViewPostIndex, posts, preload, fetchUrls])

  return (
    <>
      <IndexSEO ogImage={ogImage} />
      <div className="mx-auto">
        <PostList posts={posts} inViewPostIndex={inViewPostIndex} />
      </div>
      <div className="fixed right-6 bottom-4 flex flex-col">
        {Boolean(posts[inViewPostIndex]?.slideshow?.showMap) && (
          <div className="hidden md:block">
            <MapButtonWithCurrentSlides post={posts[inViewPostIndex]} />
          </div>
        )}
      </div>
    </>
  )
}

export const getStaticProps = () => {
  writePostJsonFiles()
  return getPropsForPosts({ startIndex: 0, stopIndex: 1 })
}
