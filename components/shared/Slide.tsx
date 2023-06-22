import { SlideExternal } from '#/interfaces/slide'
import { default as NextImage } from 'next/image'
import { default as NextLink } from 'next/link'
import { isDevEnvironment } from '#/lib/isDevEnvironment'
import { useObserverGroup } from '#/lib/intersection-observer-group'
import SlideCaption, { EditableCaption } from '#/components/shared/SlideCaption'
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
      key={slide?.url}
      className="mb-16"
      // @ts-ignore
      // eslint-disable-next-line react/no-unknown-property
      slideindex={slideIndex}
    >
      <figure>
        <NextImage
          className={'!bg-auto object-contain w-full max-h-[180vmin]'}
          alt="slideshow"
          key={slide.url}
          src={slide.url}
          priority={slideIndex === 0}
          width={Number(slide.width)}
          height={Number(slide.height)}
          placeholder="blur"
          blurDataURL={slide.blurDataURL}
          sizes="100vw"
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
  isFading,
  fadeCSS,
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
      // @ts-ignore
      slideindex={slideIndex}
      ref={ref}
      className={isFading ? 'absolute' : 'static'}
      key={slide.url}
      as={linkAs}
      href="/posts/[slug]"
    >
      <NextImage
        style={{
          maxHeight,
          transitionDuration: `${siteConfig.fadeSpeed}ms`,
        }}
        // TODO: !bg-auto seems to be necessary atm because nextjs sets the blur image background-size to
        // cover for some reason.
        className={`!bg-auto object-contain ${fadeCSS}`}
        alt="slideshow"
        priority={priority}
        loading={loading}
        src={slide.url}
        width={Number(slide?.width)}
        height={Number(slide?.height)}
        placeholder={siteConfig.blurSize ? 'blur' : 'empty'}
        blurDataURL={slide?.blurDataURL}
        sizes="100vw"
      />
    </NextLink>
  )
}

export default Slide
