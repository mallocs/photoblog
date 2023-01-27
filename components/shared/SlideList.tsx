import { SlideExternal } from '#/interfaces/slide'
import Slide from '#/components/shared/Slide'

type Props = {
  slides: SlideExternal[]
}

function SlideList({ slides }: Props) {
  return (
    <section>
      <div className="mb-8 md:mb-16 sm:mx-0">
        {slides.map((slide, index) => (
          <Slide slide={slide} id={`slide-${index + 1}`} key={slide?.url} />
        ))}
      </div>
    </section>
  )
}

export default SlideList
