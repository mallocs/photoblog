import { default as NextImage } from 'next/future/image'
import Link from 'next/link'
import { SlideExternal } from '../interfaces/slide'

type Props = {
  title: string
  slide: SlideExternal
  slug?: string
}

const CoverSlide = ({ title, slide, slug }: Props) => {
  const image = (
    <NextImage
      className={'object-contain w-full max-h-[180vmin]'}
      alt={`Cover image for ${title}`}
      key={slide.url}
      src={slide.url}
      width={slide?.width}
      height={slide?.height}
      placeholder="blur"
      blurDataURL={slide?.blurDataURL}
      sizes="100vw"
    />
  )
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </div>
  )
}

export default CoverSlide
