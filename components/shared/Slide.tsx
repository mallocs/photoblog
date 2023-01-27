import { SlideExternal } from '#/interfaces/slide'
import { default as NextImage } from 'next/image'

type Props = {
  slide: SlideExternal
  id: string
}

function Slide({ slide, id }: Props) {
  return (
    <div id={id} key={slide?.url} className="mb-16">
      <figure>
        <NextImage
          className={'!bg-auto object-contain w-full max-h-[180vmin]'}
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
  )
}
export default Slide
