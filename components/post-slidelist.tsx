import { SlideExternal } from '../interfaces/slide'

type Props = {
  slides: SlideExternal[]
}

const PostSlideList = ({ slides }: Props) => {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        {slides.map((slide, index) => (
          <div id={`slide-${index}`} key={slide.url} className="mb-16">
            <img src={slide.url} alt={slide.caption} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default PostSlideList
