import { default as NextImage } from 'next/image'
import Link from 'next/link'
import { SlideExternal } from '#/interfaces/slide'

type Props = {
  title: string
  slide: SlideExternal
  slug?: string
}

const CoverSlide = ({ title, slide, slug }: Props) => {
  const image = (
    <NextImage
      // TODO: !bg-auto seems to be necessary atm because nextjs sets the blur image background-size to
      // cover for some reason.
      className={'!bg-auto object-contain w-full max-h-[100vh]'}
      alt={`Cover image for ${title}`}
      src={slide.url}
      width={Number(slide?.width)}
      height={Number(slide?.height)}
      placeholder="blur"
      blurDataURL={slide?.blurDataURL}
      sizes="100vw"
    />
  )
  return (
    <div className="sm:mx-0 bg-zinc-200 dark:bg-zinc-800">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}

export default CoverSlide
