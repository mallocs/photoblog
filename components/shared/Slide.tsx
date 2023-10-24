import { SlideExternal } from '#/interfaces/slide'
import { default as NextImage } from 'next/image'
import { default as NextLink } from 'next/link'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import { useObserverGroup } from '#/lib/intersection-observer-group'
import SlideCaption, { EditableCaption } from '#/components/shared/SlideCaption'
import getImageLoader from '#/lib/imageLoaders'
import siteConfig from '#/site.config'

type Props = {
  slide: SlideExternal
  slideIndex: number
  id: string
}

function Slide({ slide, id, slideIndex }: Props) {
  const { ref } = useObserverGroup({
    group: siteConfig.slideObserverGroup,
    rootMargin: '0px 0px 50px 0px',
    threshold: [0, 0.01, 0.99, 1],
  })

  return (
    <div
      ref={ref}
      id={id}
      key={slide?.src}
      className="mb-16"
      // @ts-ignore
      // eslint-disable-next-line react/no-unknown-property
      slideindex={slideIndex}
    >
      <figure>
        <NextImage
          loader={getImageLoader(slide.loader)}
          className={'!bg-auto object-contain w-full max-h-[180vmin]'}
          alt="slideshow"
          key={slide.filename}
          src={slide.src}
          priority={slideIndex === 0}
          width={Number(slide.width)}
          height={Number(slide.height)}
          placeholder="blur"
          blurDataURL={slide.blurDataURL}
          sizes="100vw"
          crossOrigin="anonymous"
        />
        {isDevEnvironment ? (
          <EditableCaption slide={slide} />
        ) : (
          <SlideCaption
            caption={slide.caption}
            geodata={slide.geodata}
            dateTimeOriginal={slide?.dateTimeOriginal}
          />
        )}
      </figure>
    </div>
  )
}

export function SlideshowSlide({
  style,
  css,
  slide,
  priority,
  loading,
  linkAs,
  slideIndex,
  maxHeight,
}) {
  const { ref } = useObserverGroup({
    group: siteConfig.slideObserverGroup,
    rootMargin: '0px 0px 50px 0px',
    threshold: [0, 0.01, 0.99, 1],
  })
  return (
    <NextLink
      style={style}
      className={css}
      // @ts-ignore
      slideindex={slideIndex}
      ref={ref}
      key={slide.src}
      as={linkAs}
      href="/posts/[slug]"
    >
      <NextImage
        style={{
          maxHeight,
        }}
        // TODO: !bg-auto seems to be necessary atm because nextjs sets the blur image background-size to
        // cover for some reason.
        className={`!bg-auto object-contain`}
        loader={getImageLoader(slide.loader)}
        alt="slideshow"
        priority={priority}
        loading={loading}
        src={slide.src}
        width={Number(slide?.width)}
        height={Number(slide?.height)}
        placeholder={siteConfig.blurSize ? 'blur' : 'empty'}
        blurDataURL={slide?.blurDataURL}
        sizes="100vw"
        crossOrigin="anonymous"
      />
    </NextLink>
  )
}

export default Slide
