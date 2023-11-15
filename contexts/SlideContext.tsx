import { createContext } from 'react'
import type PostType from '#/interfaces/post'
import { SlideExternal } from '#/interfaces/slide'

type Props = {
  post: PostType
}

export const SlidesContext = createContext<SlideExternal[] | undefined>(
  undefined
)

export default function withSlidesContext(WrappedComponent) {
  return function ComponentWithSlidesContext(props: Props) {
    return (
      <SlidesContext.Provider value={props.post.slideshow?.slides}>
        <WrappedComponent {...props} />
      </SlidesContext.Provider>
    )
  }
}
