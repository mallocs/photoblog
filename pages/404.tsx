import { PageSEO } from '#/components/SEO'
import { getPropsForPosts } from '#/lib/api'
import { siteTitle } from '#/site.config'

type Props = {
  ogImage?: string
}

export default function Custom404({ ogImage }: Props) {
  return (
    <div className="min-h-[65vh] flex flex-col justify-center items-center">
      <PageSEO title={`Page Not Found - ${siteTitle}`} ogImage={ogImage} />
      <div className="flex flex-col items-center justify-start md:flex-row md:items-center md:justify-center md:space-x-6">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-8xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:border-r-2 md:px-6 md:text-8xl md:leading-14">
            404
          </h1>
        </div>
        <div className="max-w-md">
          <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">
            Sorry, nothing to see here.
          </p>
        </div>
      </div>
    </div>
  )
}

export const getStaticProps = async () => {
  return await getPropsForPosts({ startIndex: 0, stopIndex: 1 })
}
