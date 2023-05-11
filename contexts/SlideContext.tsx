import { createContext } from 'react'
import type PostType from '#/interfaces/post'

type Props = {
  post: PostType
}

export const SlidesContext = createContext(null)

export default function withSlidesContext(WrappedComponent) {
  return function ComponentWithSlidesContext(props: Props) {
    return (
      <SlidesContext.Provider value={props.post.slideshow?.slides}>
        <WrappedComponent {...props} />
      </SlidesContext.Provider>
    )
  }
}
