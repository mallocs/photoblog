import React, { useEffect, useState } from 'react'
import Slide from '../interfaces/slide'
import css from './slideshow.module.css'

type Props = {
  slides: Slide[]
}

function Slideshow({ slides }: Props) {
  function getSlideIndex(rawIndex) {
    return (rawIndex + slides.length) % slides.length
  }
  const [slideIndex, setSlideIndex] = useState(0)
  // console.log(slides)
  return (
    <>
      <div className={`${css.slideshow}`}>
        <button onClick={() => setSlideIndex(getSlideIndex(slideIndex - 1))}>
          <span className={`${css.arrow} ${css.left}`}></span>
        </button>
        <div className={`${css.slider}`}>
          <figure>
            <img
              className={`${css.sliderImage}`}
              alt="slideshow"
              src={slides[slideIndex].url}
            />
            <figcaption>{slides[slideIndex].caption}</figcaption>
          </figure>
        </div>
        <button onClick={() => setSlideIndex(getSlideIndex(slideIndex + 1))}>
          <span className={`${css.arrow} ${css.right}`}></span>
        </button>
      </div>
    </>
  )
}

export default Slideshow
