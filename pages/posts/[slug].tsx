import { useState, createContext } from 'react'
import { useRouter } from 'next/router'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import noop from '#/lib/noop'
import ErrorPage from 'next/error'
import Post, { PostTitle } from '#/components/Post'
import { getPostBySlug, getAllPosts } from '#/lib/api'
import markdownToHtml from '#/lib/markdownToHtml'
import type PostType from '#/interfaces/post'
import { SlugSEO } from '#/components/shared/SEO'
import SlideListEditable from '#/components/shared/SlideListEditable'
import Modal from '#/components/shared/Modal'
import { MapButton } from '#/components/shared/buttons/MapButton'
import {
  ScrollDownButton,
  ScrollToTopButton,
  ScrollUpButton,
} from '#/components/shared/buttons/ScrollButtons'
import withSlidesContext from '#/contexts/SlideContext'
import {
  CancelButton,
  EditModeButton,
  ReorderButton,
  SubmitReorderButton,
} from '#/components/shared/buttons/EditMode'
import { useObserverGroup } from '#/lib/intersection-observer-group'

type SaveCaptionFnType = (
  { filename, caption }: { filename: string; caption: string },
  cb: ({ data, status }?) => void
) => void

type DeleteFnType = ({ filename }, cb: ({ data, status }?) => void) => void

export type EditContextType = {
  editModeEnabled: boolean
  saveCaptionFn: SaveCaptionFnType
  deletePhotoFn: DeleteFnType
}

export const EditContext = createContext<EditContextType>({
  editModeEnabled: false,
  saveCaptionFn: noop,
  deletePhotoFn: noop,
})

type Props = {
  post: PostType
  morePosts?: PostType[]
  editMode?: boolean
  preview?: boolean
  saveCaptionFn?: SaveCaptionFnType
  deletePhotoFn?: DeleteFnType
}

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return response.json()
}

const Page = withSlidesContext(({ post, morePosts, preview }: Props) => {
  const router = useRouter()

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  const {
    ref,
    inView: topInView,
    entry,
  } = useObserverGroup({
    threshold: [0, 0.01, 0.99, 1],
  })
  return router.isFallback ? (
    <PostTitle>Loading…</PostTitle>
  ) : (
    <div className="mx-auto">
      <div ref={ref} className="absolute top-56" />
      <div className="fixed right-6 bottom-4 gap-3 flex flex-col">
        <ScrollToTopButton />
        <ScrollUpButton />
        {Boolean(post.slideshow?.showMap) && entry !== undefined && (
          <div
            className={`hidden md:block w-12 h-12 transition-opacity duration-300 ${
              Boolean(topInView) ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <MapButton />
          </div>
        )}
      </div>
      <div className="fixed bottom-2 right-[calc(50%_-_1.5rem)]">
        <ScrollDownButton />
      </div>

      <article className="mb-32">
        <SlugSEO {...post} />
        <Post
          title={post.title}
          date={post.date}
          slideshowDateRange={post.slideshow?.dateRange}
          author={post.author}
          content={post.content}
          slides={post.slideshow?.slides}
        />
      </article>
    </div>
  )
})

export function EditablePage(props: Props) {
  const {
    post: { slug, slideshow: { slides = [] } = {} },
    saveCaptionFn: saveCaptionFn = async ({ filename, caption }, cb) => {
      console.log(caption)
      const { data, status } = await postData('/api/editCaption', {
        slug,
        filename,
        caption: caption.replace(/&nbsp;/g, ' ').trim(),
      })
      setSlidesFn(data.slideshow.slides)
      cb({ data, status })
    },
    deletePhotoFn: deletePhotoFn = async ({ filename }, cb) => {
      const { data, status } = await postData('/api/editSlideshow', {
        slug,
        slides: editedSlides,
        deleteFilename: filename,
      })
      setSlidesFn(data.slideshow.slides)
      cb({ data, status })
    },
  } = props
  const [editModeEnabled, setEditModeFn] = useState(false)
  const [reorderModeEnabled, setReorderModeFn] = useState(false)
  const [editedSlides, setEditedSlidesFn] = useState(slides)
  const [orderedSlides, setOrderedSlidesFn] = useState(slides)
  const setSlidesFn = (slides) => {
    setEditedSlidesFn(slides)
    setOrderedSlidesFn(slides)
  }

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialOrderMap = slides.reduce((accumulator, current, index) => {
    accumulator.set(current.src, index)
    return accumulator
  }, new Map<string, number>())

  const onCloseFn = () => {
    setReorderModeFn(false)
    setSlidesFn(editedSlides)
  }

  return (
    <EditContext.Provider
      value={{
        editModeEnabled,
        saveCaptionFn,
        deletePhotoFn,
      }}
    >
      <div className="fixed h-30 top-8 right-8 flex flex-col items-end gap-3 p-3">
        <EditModeButton
          editModeEnabled={editModeEnabled}
          setEditModeFn={setEditModeFn}
        />
        {editModeEnabled && (
          <ReorderButton
            reorderModeEnabled={reorderModeEnabled}
            setReorderModeFn={setReorderModeFn}
          />
        )}
        <Modal
          show={reorderModeEnabled}
          title="Reorder Slides"
          onClose={onCloseFn}
        >
          <div
            className={`fixed w-[500px] text-center h-14 bg-red-300/80 text-lg py-4 ${
              errorMessage === '' ? 'hidden' : ''
            }`}
          >
            {errorMessage}
          </div>
          <div className="fixed mt-2 ml-[440px]">
            <CancelButton cancelFn={onCloseFn} />
          </div>
          <div className="fixed mt-2 ml-4">
            <SubmitReorderButton
              disabled={isSubmitting}
              submitFn={async () => {
                setIsSubmitting(true)
                const { data, status } = await postData('/api/editSlideshow', {
                  slug,
                  slides: orderedSlides,
                })
                setIsSubmitting(false)
                setSlidesFn(data.slideshow.slides)
                if (!data) {
                  setErrorMessage(status)
                }
              }}
            />
          </div>
          <div className="mt-14">
            <SlideListEditable
              initialOrderMap={initialOrderMap}
              slides={orderedSlides}
              setSlideOrderFn={setOrderedSlidesFn}
            />
          </div>
        </Modal>
      </div>
      <Page
        {...props}
        post={{
          ...props.post,
          ...(props.post?.slideshow && {
            slideshow: { ...props.post?.slideshow, slides: editedSlides },
          }),
        }}
      />
    </EditContext.Provider>
  )
}

export default !isDevEnvironment ? Page : EditablePage

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'summary',
    'date',
    'slideshow',
    'slug',
    'author',
    'content',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      slug: params.slug,
      post: {
        ...post,
        content,
      },
    },
  }
}

export function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
