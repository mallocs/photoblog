import { default as NextImage } from 'next/image'
import { SlideExternal } from '#/interfaces/slide'

type Props = {
  slides: SlideExternal[]
}

const PostSlideList = ({ slides }: Props) => {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        {slides.map((slide, index) => (
          <div id={`slide-${index + 1}`} key={slide?.url} className="mb-16">
            <figure>
              <NextImage
                className={'object-contain w-full max-h-[180vmin]'}
                alt="slideshow"
                key={slide.url}
                src={slide.url}
                width={Number(slide?.width)}
                height={Number(slide?.height)}
                placeholder="blur"
                blurDataURL={slide?.blurDataURL}
                sizes="100vw"
              />
              <figcaption
                className="bg-zinc-300 dark:bg-zinc-400 py-1 px-4 mx-auto"
                dangerouslySetInnerHTML={{
                  __html: slide?.caption || '\u00A0',
                }}
              ></figcaption>
            </figure>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PostSlideList
