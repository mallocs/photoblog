import { default as NextImage } from 'next/future/image'
import { SlideExternal } from '../interfaces/slide'

type Props = {
  slides: SlideExternal[]
}

const PostSlideList = ({ slides }: Props) => {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        {slides.map((slide, index) => (
          <div id={`slide-${index}`} key={slide?.url} className="mb-16">
            <figure>
              <NextImage
                className={'object-contain w-full max-h-[180vmin]'}
                alt="slideshow"
                key={slide.url}
                src={slide.url}
                width={slide?.width}
                height={slide?.height}
                placeholder="blur"
                blurDataURL={slide?.blurDataURL}
                sizes="100vw"
              />
              <figcaption className={'bg-gray-300 py-1 px-4'}>
                {slide?.caption || '\u00A0'}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PostSlideList
