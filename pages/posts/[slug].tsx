import { useState, createContext } from 'react'
import { useRouter } from 'next/router'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import ErrorPage from 'next/error'
import Post, { PostTitle } from '#/components/Post'
import { getPostBySlug, getAllPosts } from '#/lib/api'
import markdownToHtml from '#/lib/markdownToHtml'
import type PostType from '#/interfaces/post'
import { SlugSEO } from '#/components/shared/SEO'
import {
  ScrollDownButton,
  ScrollToTopButton,
  ScrollUpButton,
} from '#/components/ScrollButtons'

export const EditContext = createContext(null)

type Props = {
  post: PostType
  morePosts: PostType[]
  editMode?: boolean
  preview?: boolean
  slug: string
}

const CancelIcon = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="4 4 40 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Cancel</title>
    <path d="m16.5 33.6 7.5-7.5 7.5 7.5 2.1-2.1-7.5-7.5 7.5-7.5-2.1-2.1-7.5 7.5-7.5-7.5-2.1 2.1 7.5 7.5-7.5 7.5ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z" />
  </svg>
)

const EditIcon = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="4 4 40 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Edit</title>
    <path d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.1-.85t2.1.85l2.2 2.2q.85.85.85 2.1t-.85 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2Zm-5.35-1.05-1.1-1.1 2.2 2.2Z" />
  </svg>
)

function EditModeButton({ editModeEnabled, enableEditModeFn }) {
  return (
    <button
      title={editModeEnabled ? 'Cancel' : 'Edit Post'}
      onClick={() => enableEditModeFn(!editModeEnabled)}
      type="button"
      className="opacity-70 fixed w-10 h-10 top-8 right-8 inline-block rounded bg-primary p-2 text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
    >
      {editModeEnabled ? <CancelIcon /> : <EditIcon />}
    </button>
  )
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
      <ScrollToTopButton />
      <ScrollUpButton />
      <ScrollDownButton />
      <article className="mb-32">
        <SlugSEO {...post} />
        <Post
          title={post.title}
          date={post.date}
          author={post.author}
          content={post.content}
          slides={post.slideshow.slides}
        />
      </article>
    </div>
  )
}

export default !isDevEnvironment
  ? Page
  : function EditablePage(props: Props) {
      const [editModeEnabled, setEditModeEnabledFn] = useState(false)

      return (
        <EditContext.Provider
          value={{
            editModeEnabled,
            saveFn: ({ filename, caption }, cb) => {
              postData('/api/editCaption', {
                slug: props.slug,
                filename,
                caption,
              }).then(({ data, status }) => {
                cb({ data, status })
              })
            },
          }}
        >
          <EditModeButton
            editModeEnabled={editModeEnabled}
            enableEditModeFn={setEditModeEnabledFn}
          />
          <Page {...props} />
        </EditContext.Provider>
      )
    }

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
