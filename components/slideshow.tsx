// import Link from 'next/link'
import React, { useState } from 'react'
import { default as NextImage } from 'next/future/image'
import { useSwipeable } from 'react-swipeable'
import { SlideExternal } from '../interfaces/slide'
import { BLUR_SIZE } from '../lib/constants'

// TODO: For some reason this isn't working unless it's hard-coded in the css string
const FADE_SPEED = 900

type Props = {
  slides: SlideExternal[]
  slug: string
}

// const loader = ({ src, width, quality }) => {
//   const lastDotIndex = src.lastIndexOf('.')
//   return `${src.slice(0, lastDotIndex)}-w${width}${src.slice(lastDotIndex)}`
// }

function Slideshow({ slides, slug }: Props) {
  const [slideIndex, setSlideIndex] = useState(0)
  // 1 is fading in, -1 is fading out
  const [isFading, setIsFading] = useState(Array(slides.length).fill(0))
  const [fadeTimeoutId, setFadeTimeoutId] = useState<
    ReturnType<typeof setTimeout> | number
  >(0)

  function getSlideIndex(rawIndex: number) {
    return (rawIndex + slides.length) % slides.length
  }

  const previousSlideIndex = getSlideIndex(slideIndex - 1)
  const nextSlideIndex = getSlideIndex(slideIndex + 1)
  function getFadeCSS({ index }: { index: number }): string {
    let css = `!bg-auto transition-opacity duration-[900ms] ease-out`
    if (isFading[index] === -1) {
      // fading out
      css += index === slideIndex ? ' static opacity-100' : '  static opacity-0'
    } else if (isFading[index] === 1) {
      // fading in
      css +=
        index === slideIndex ? '  absolute opacity-100' : '  absolute opacity-0'
    } else if (index === slideIndex) {
      // current slide, done fading
      css += ' static opacity-100'
    } else {
      // everything else
      css += ' static hidden'
    }
    return css
  }

  function handleFadeTransition({
    event,
    currentSlideIndex,
    nextSlideIndex,
  }: {
    event?: React.MouseEvent<HTMLButtonElement>
    currentSlideIndex: number
    nextSlideIndex: number
  }) {
    event && event.preventDefault()
    if (fadeTimeoutId) {
      clearTimeout(fadeTimeoutId)
    }
    const fading = Array(slides.length).fill(0)
    fading[currentSlideIndex] = -1
    fading[nextSlideIndex] = 1
    setIsFading(fading)
    requestAnimationFrame(() => setSlideIndex(getSlideIndex(nextSlideIndex)))
    setFadeTimeoutId(
      setTimeout(() => {
        requestAnimationFrame(() => setIsFading(Array(slides.length).fill(0)))
      }, FADE_SPEED)
    )
  }
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      handleFadeTransition({
        currentSlideIndex: slideIndex,
        nextSlideIndex: getSlideIndex(slideIndex + 1),
      }),
    onSwipedRight: () =>
      handleFadeTransition({
        currentSlideIndex: slideIndex,
        nextSlideIndex: getSlideIndex(slideIndex - 1),
      }),
    delta: 8,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  return (
    <>
      <figure>
        <div
          {...handlers}
          className={
            'flex justify-between relative min-w-min -mx-5 bg-extra-light-gray'
          }
        >
          <button
            className="absolute top-[calc(50%_-_2rem)] left-0 w-16 h-20 z-30"
            onClick={(event) =>
              handleFadeTransition({
                event,
                currentSlideIndex: slideIndex,
                nextSlideIndex: getSlideIndex(slideIndex - 1),
              })
            }
          >
            <div className="absolute -top-1  w-16 h-20 bg-extra-light-gray opacity-60"></div>
            <div className=" -mr-4 rotate-45 border-black border-b-4 border-l-4 p-4 inline-block"></div>
          </button>
          {slides.map((slide, index) => (
            <NextImage
              className={`object-contain max-h-screen w-full ${getFadeCSS({
                index,
              })}`}
              // TODO: !bg-auto seems to be necessary atm because nextjs sets the blur image background-size to
              // cover for some reason.
              alt="slideshow"
              priority={[
                slideIndex,
                nextSlideIndex,
                previousSlideIndex,
              ].includes(index)}
              key={slide.url}
              src={slide.url}
              width={slide?.width}
              height={slide?.height}
              placeholder={BLUR_SIZE ? 'blur' : 'empty'}
              blurDataURL={slide?.blurDataURL}
              sizes="100vw"
            />
          ))}
          <button
            className="absolute top-[calc(50%_-_2rem)] right-0 w-16 h-20 z-30"
            onClick={(event) =>
              handleFadeTransition({
                event,
                currentSlideIndex: slideIndex,
                nextSlideIndex: getSlideIndex(slideIndex + 1),
              })
            }
          >
            <div className="absolute -top-1  w-16 h-20 bg-extra-light-gray opacity-60"></div>
            <div className=" -ml-4 rotate-45 border-black border-t-4 border-r-4 p-4 inline-block"></div>
          </button>
        </div>
        <figcaption className={`bg-gray-300 py-1 px-4  -mx-5`}>
          {slides[slideIndex].caption || '\u00A0'}
        </figcaption>
      </figure>
    </>
  )
}

export default Slideshow

/*
${
            slides[slideIndex].caption !== undefined ? '' : 'invisible'
          }
type Size = [number, string]

//                 srcSet={generateSrcSet(slides[slideIndex].sizes)}
// ${css.arrow} ${css.left}
// Needed? <a aria-label={title}>{image}</a>

  console.log(slides[slideIndex])
  //-rotate-45 relative
  //absolute opacity-30 bg-gray-600 w-16 h-20 -top-10 -left-11
          <Link
            as={`/posts/${slug}#slide-${slideIndex}`}
            href="/posts/[slug]"
          ></Link>
          */
