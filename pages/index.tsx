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
}

const MapButtonWithCurrentSlides = withSlidesContext(MapButton)

// The first image of the first post should have priority set to high
// for server rendering.
// The post index in view is used to update the image loading attribute to 'eager'
// for slides in the preload range since the browser won't preload them normally.
export default function Index({ posts: firstPost, ogImage }: Props) {
  const [inViewPostIndex, setInViewPostIndexFn] = useState(0)

  const handleChangePostFn = useCallback(() => {
    setInViewPostIndexFn(
      getClosestToViewportBottomIndex(siteConfig.postObserverGroup)
    )
  }, [])
  useObserverGroupCallback(siteConfig.postObserverGroup, handleChangePostFn)

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
        <div className="fixed right-6 bottom-0 gap-3 flex flex-col"></div>
        <PostList posts={allPosts} inViewPostIndex={inViewPostIndex} />
      </div>
      <div className="fixed right-6 bottom-0 gap-3 flex flex-col">
        {Boolean(allPosts[inViewPostIndex].slideshow?.showMap) && (
          <div className="hidden md:block ">
            <MapButtonWithCurrentSlides post={allPosts[inViewPostIndex]} />
          </div>
        )}
      </div>
    </>
  )
}

export const getStaticProps = () => {
  writePostsJson()
  return getPropsForPosts({ startIndex: 0, stopIndex: 1 })
}

function writePostsJson() {
  const filePath = path.join(process.cwd(), 'public', 'posts.json')
  const posts = JSON.stringify(getPropsForPosts())
  if (fs.existsSync(filePath)) {
    fs.promises.unlink(filePath)
  }
  fs.writeFile(filePath, posts, (err) => {
    if (err) {
      console.log('Error writing posts JSON file: ', err)
    }
  })
}
