import { useState, createContext } from 'react'
import { useRouter } from 'next/router'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import ErrorPage from 'next/error'
import Post, { PostTitle } from '#/components/Post'
import { getPostBySlug, getAllPosts } from '#/lib/api'
import markdownToHtml from '#/lib/markdownToHtml'
import type PostType from '#/interfaces/post'
import { SlugSEO } from '#/components/shared/SEO'
import SlideListEditable from '#/components/shared/SlideListEditable'
import Modal from '#/components/shared/Modal'
import { MapButton } from '#/components/shared/Map'
import {
  ScrollDownButton,
  ScrollToTopButton,
  ScrollUpButton,
} from '#/components/ScrollButtons'
import withSlidesContext from '#/contexts/SlideContext'
import {
  CancelButton,
  EditModeButton,
  ReorderButton,
  SubmitReorderButton,
} from '#/components/shared/buttons/EditMode'

export const EditContext = createContext(null)

type Props = {
  post: PostType
  morePosts: PostType[]
  editMode?: boolean
  preview?: boolean
  slug: string
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

function Page({ post, morePosts, preview }: Props) {
  const router = useRouter()

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return router.isFallback ? (
    <PostTitle>Loading…</PostTitle>
  ) : (
    <div className="mx-auto">
      <div className="fixed right-6 bottom-0 gap-3 flex flex-col">
        <ScrollToTopButton />
        <ScrollUpButton />
        {Boolean(post.slideshow?.showMap) && (
          <div className="hidden md:block ">
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
}

export default withSlidesContext(
  !isDevEnvironment
    ? Page
    : function EditablePage(props: Props) {
        const {
          slug,
          post: {
            slideshow: { slides = [] },
          },
        } = props
        const [editModeEnabled, setEditModeFn] = useState(false)
        const [reorderModeEnabled, setReorderModeFn] = useState(false)
        const [editedSlides, setSlidesFn] = useState(slides)
        const [errorMessage, setErrorMessage] = useState('')
        const [isSubmitting, setIsSubmitting] = useState(false)

        const initialOrderMap = slides.reduce((accumulator, current, index) => {
          accumulator.set(current.url, index)
          return accumulator
        }, new Map<string, number>())

        const onCloseFn = () => {
          setReorderModeFn(false)
          setSlidesFn(slides)
        }

        return (
          <EditContext.Provider
            value={{
              editModeEnabled,
              saveFn: async ({ filename, caption }, cb) => {
                const { data, status } = await postData('/api/editCaption', {
                  slug,
                  filename,
                  caption,
                })
                cb({ data, status })
              },
              deleteFn: async ({ filename }, cb) => {
                const filteredSlides = editedSlides.filter(
                  (slide) => slide.filename !== filename
                )
                const { data, status } = await postData('/api/editSlideshow', {
                  slug,
                  slides: filteredSlides,
                  deleteFilename: filename,
                })
                setSlidesFn(data.slides)
                cb({ data, status })
              },
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
                      const { data, status } = await postData(
                        '/api/editSlideshow',
                        {
                          slug,
                          slides: editedSlides,
                        }
                      )
                      setIsSubmitting(false)

                      if (!data) {
                        setErrorMessage(status)
                      }
                    }}
                  />
                </div>
                <div className="mt-14">
                  <SlideListEditable
                    initialOrderMap={initialOrderMap}
                    slides={editedSlides}
                    setSlideOrderFn={setSlidesFn}
                  />
                </div>
              </Modal>
            </div>
            <Page
              {...props}
              post={{
                ...props.post,
                slideshow: { ...props.post.slideshow, slides: editedSlides },
              }}
            />
          </EditContext.Provider>
        )
      }
)

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

export async function getStaticPaths() {
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
