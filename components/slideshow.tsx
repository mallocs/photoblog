import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { SlideExternal } from '../interfaces/slide'
import css from './slideshow.module.css'

type Props = {
  slides: SlideExternal[]
  slug: string
}

function Slideshow({ slides, slug }: Props) {
  function getSlideIndex(rawIndex) {
    return (rawIndex + slides.length) % slides.length
  }
  const [slideIndex, setSlideIndex] = useState(0)
  // console.log(slides)
  return (
    <>
      <figure className={`${css.slideshowFigure}`}>
        <div className={`${css.slideshow}`}>
          <button onClick={() => setSlideIndex(getSlideIndex(slideIndex - 1))}>
            <span className={`${css.arrow} ${css.left}`}></span>
          </button>
          <Link as={`/posts/${slug}#slide-${slideIndex}`} href="/posts/[slug]">
            <div className={`${css.slider}`}>
              <img
                className={`${css.sliderImage}`}
                alt="slideshow"
                src={slides[slideIndex].url}
              />
            </div>
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault()
              setSlideIndex(getSlideIndex(slideIndex + 1))
            }}
          >
            <span className={`${css.arrow} ${css.right}`}></span>
          </button>
        </div>
        <figcaption
          className={`${css.slideshowCaption} ${
            slides[slideIndex].caption !== undefined ? '' : css.hideCaption
          }`}
        >
          {slides[slideIndex].caption || '\u00A0'}
        </figcaption>
      </figure>
    </>
  )
}
// Needed? <a aria-label={title}>{image}</a>

export default Slideshow
