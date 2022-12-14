import Head from 'next/head'
import { useRouter } from 'next/router'
import { TITLE } from '#/lib/constants'
import siteConfig from '#/site.config'
import type PostType from '#/interfaces/post'

type Props = {
  ogImage?: string
  title?: string
}

//      <meta name="robots" content="follow, index" />

const CommonSEO = ({
  title,
  description,
  ogType, // https://ogp.me/?fbclid=IwAR0Dr3Rb3tw1W5wjFtuRMZfwewM2vlrSnNp-_ZKlvCzo5nKuX2TuTqt0kU8#types
  ogImage,
  twImage = ogImage,
  canonicalUrl = undefined,
}) => {
  const router = useRouter()
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        property="og:url"
        content={`${siteConfig.siteUrl}${router.asPath}`}
      />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={TITLE} />
      <meta property="og:description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={ogImage} />
      <meta
        property="og:image:width"
        content={`${siteConfig.openGraph.imageWidth}`}
      />
      <meta
        property="og:image:height"
        content={`${siteConfig.openGraph.imageHeight}`}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twImage} />
      <link
        rel="canonical"
        href={
          canonicalUrl ? canonicalUrl : `${siteConfig.siteUrl}${router.asPath}`
        }
      />
    </Head>
  )
}

export const SlugSEO = ({
  title,
  summary,
  slideshow,
  date,
  lastModified,
}: PostType) => {
  const publishedAt = new Date(date).toISOString()
  const modifiedAt = new Date(lastModified || date).toISOString()

  return (
    <>
      <CommonSEO
        title={title}
        description={summary}
        ogType="article"
        ogImage={`${siteConfig.siteUrl}/api/og?imgUrl=${encodeURIComponent(
          slideshow.slides[0].url
        )}&title=${encodeURIComponent(title)}`}
      />

      <Head>
        {date && (
          <meta property="article:published_time" content={publishedAt} />
        )}
        {lastModified && (
          <meta property="article:modified_time" content={modifiedAt} />
        )}
      </Head>
    </>
  )
}

export const IndexSEO = ({ ogImage }: Props) => {
  return (
    <CommonSEO
      title={TITLE}
      description={siteConfig.description}
      ogType="website"
      ogImage={ogImage}
    />
  )
}

export const PageSEO = ({ ogImage, title = TITLE }: Props) => {
  return (
    <CommonSEO
      title={title}
      description={siteConfig.description}
      ogType="website"
      ogImage={ogImage}
    />
  )
}
