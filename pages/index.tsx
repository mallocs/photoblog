import path from 'path'
import fs from 'fs'
import { useCallback, useEffect, useState } from 'react'
import { IndexSEO } from '#/components/shared/SEO'
import PostList from '#/components/PostList'
import { getPropsForPosts } from '#/lib/api'
import Post from '#/interfaces/post'
import { MapButton } from '#/components/shared/buttons/MapButton'
import withSlidesContext from '#/contexts/SlideContext'
import { getClosestToViewportBottomIndex } from '#/lib/intersection-observer-group/observe'
import siteConfig from '#/site.config'
import { useObserverGroupCallback } from '#/lib/intersection-observer-group'

type Props = {
  ogImage?: string
  posts: Post[]
  postCount: number
  preload: number
}

const MapButtonWithCurrentSlides = withSlidesContext(MapButton)

// The first image of the first post should have priority set to high
// for server rendering.
// The post index in view is used to update the image loading attribute to 'eager'
// for slides in the preload range since the browser won't preload them normally.
export default function Index({
  posts: firstPost,
  ogImage,
  postCount,
  preload = 2,
}: Props) {
  const [inViewPostIndex, setInViewPostIndexFn] = useState(0)

  const handleChangePostFn = useCallback(() => {
    const closestPostIndex = getClosestToViewportBottomIndex(
      siteConfig.postObserverGroup
    )
    setInViewPostIndexFn(closestPostIndex)
  }, [])
  useObserverGroupCallback(siteConfig.postObserverGroup, handleChangePostFn)

  const [posts, setPostsFn] = useState([
    ...firstPost,
    ...Array(postCount - 1).fill(undefined),
  ])

  useEffect(() => {
    ;(async () => {
      // higher numbered posts are newer
      for (
        let postIndex = inViewPostIndex;
        postIndex <= Math.min(inViewPostIndex + preload, postCount - 1);
        postIndex++
      ) {
        if (posts[postIndex] === undefined) {
          const updatedPosts = [...posts]
          updatedPosts[postIndex] = await (
            await fetch(
              `${siteConfig.jsonUrl}/post-${postCount - postIndex}.json`
            )
          ).json()
          setPostsFn(updatedPosts)
        }
      }
    })()
  }, [inViewPostIndex, postCount, posts, preload])

  return (
    <>
      <IndexSEO ogImage={ogImage} />
      <div className="mx-auto">
        <div className="fixed right-6 bottom-0 gap-3 flex flex-col"></div>
        <PostList posts={posts} inViewPostIndex={inViewPostIndex} />
      </div>
      <div className="fixed right-6 bottom-0 gap-3 flex flex-col">
        {Boolean(posts[inViewPostIndex]?.slideshow?.showMap) && (
          <div className="hidden md:block ">
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

// write files as 1-indexed starting with the oldest post as post-1.json
// with the newest post as the highest numbered so newer posts won't
// overwrite older posts.
// function postIndexToJsonFilename(postIndex, postCount) {
//   return 'post-' + postCount + '-' + postIndex + '.json'
// }

function writePostJsonFiles() {
  if (!fs.existsSync(siteConfig.jsonDirectory)) {
    fs.mkdirSync(siteConfig.jsonDirectory)
  }
  const fileFolderPath = path.join(process.cwd(), siteConfig.jsonDirectory)
  const {
    props: { posts },
  } = getPropsForPosts()

  posts.forEach((post, index) => {
    try {
      fs.writeFileSync(
        path.join(fileFolderPath, `post-${posts.length - index}.json`),
        JSON.stringify(post)
      )
    } catch (err) {
      console.log('Error writing posts JSON file: ', err)
    }
  })
}
