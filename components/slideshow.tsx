// import Link from 'next/link'
import React, { useState } from 'react'
import { default as NextImage } from 'next/future/image'
import { useSwipeable } from 'react-swipeable'
import { SlideExternal } from '../interfaces/slide'
import { SlideshowIndexButton } from '../interfaces/slideshow'

import { BLUR_SIZE, FADE_SPEED } from '../lib/constants'

type Props = {
  slides: SlideExternal[]
  indexButtonType?: SlideshowIndexButton
  slug: string
}

// const loader = ({ src, width, quality }) => {
//   const lastDotIndex = src.lastIndexOf('.')
//   return `${src.slice(0, lastDotIndex)}-w${width}${src.slice(lastDotIndex)}`
// }

function makeSlideshowButtonCSS({ isPressed = false, type }): string {
  if (type === 'circles') {
    return makeCircleSlideshowButtonCSS({ isPressed })
  }
  if (type === 'images') {
    return makeImgSlideshowButtonCSS({ isPressed })
  }
  return ''
}

function makeCircleSlideshowButtonCSS({
  isPressed = false,
}: {
  isPressed: boolean
}): string {
  return `w-5 h-5 rounded-full m-1 border-zinc-700 border-4 hover:bg-zinc-100 ${
    isPressed ? 'bg-zinc-100' : 'bg-zinc-700'
  }`
}

function makeImgSlideshowButtonCSS({
  isPressed = false,
}: {
  isPressed: boolean
}): string {
  return (
    `m-2 bg-no-repeat bg-cover bg-center shadow-[3px_3px_5px_1px] shadow-zinc-700 ` +
    `${
      isPressed
        ? 'border-2 shadow-[1px_1px_5px_-1px]'
        : 'hover:border-2 hover:shadow-[1px_1px_5px_-1px]'
    }`
  )
}

function Slideshow({ slides, indexButtonType = 'circles', slug }: Props) {
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
    let css = ` transition-opacity ease-out`
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
    goToSlideIndex,
  }: {
    event?: React.MouseEvent<HTMLButtonElement>
    goToSlideIndex: number
  }) {
    event && event.preventDefault()
    if (fadeTimeoutId) {
      clearTimeout(fadeTimeoutId)
    }
    const fading = Array(slides.length).fill(0)
    fading[slideIndex] = -1
    fading[goToSlideIndex] = 1
    setIsFading(fading)
    requestAnimationFrame(() => setSlideIndex(goToSlideIndex))
    setFadeTimeoutId(
      setTimeout(() => {
        requestAnimationFrame(() => setIsFading(Array(slides.length).fill(0)))
      }, FADE_SPEED)
    )
  }
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      handleFadeTransition({
        goToSlideIndex: nextSlideIndex,
      }),
    onSwipedRight: () =>
      handleFadeTransition({
        goToSlideIndex: previousSlideIndex,
      }),
    delta: 8,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  return (
    <>
      <figure {...swipeHandlers}>
        <div className={'flex justify-center relative min-w-min bg-zinc-100'}>
          <button
            className="absolute top-[calc(50%_-_2rem)] left-0 w-16 h-20 z-30"
            title={`Go to slide ${previousSlideIndex + 1}`}
            onClick={(event) =>
              handleFadeTransition({
                event,
                goToSlideIndex: previousSlideIndex,
              })
            }
          >
            <div className="absolute -top-1 w-16 h-20 bg-zinc-100 opacity-60"></div>
            <div className="ml-4 rotate-45 border-black border-b-4 border-l-4 p-4 inline-block"></div>
          </button>

          {slides.map(
            (slide, index) =>
              ([slideIndex, nextSlideIndex, previousSlideIndex].some(
                (i) => index === i
              ) ||
                isFading[index] !== 0) && (
                <NextImage
                  style={{
                    transitionDuration: `${FADE_SPEED}ms`,
                  }}
                  className={`!bg-auto max-h-screen object-contain ${getFadeCSS(
                    {
                      index,
                    }
                  )}`}
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
              )
          )}
          <button
            className="absolute top-[calc(50%_-_2rem)] right-0 w-16 h-20 z-30"
            title={`Go to slide ${nextSlideIndex + 1}`}
            onClick={(event) =>
              handleFadeTransition({
                event,
                goToSlideIndex: nextSlideIndex,
              })
            }
          >
            <div className="absolute -top-1 w-16 h-20 bg-zinc-100 opacity-60"></div>
            <div className="mr-4 rotate-45 border-black border-t-4 border-r-4 p-4 inline-block"></div>
          </button>
        </div>
        <div className="bg-zinc-100 max-w-full">
          <figcaption
            className="bg-zinc-300 py-1 px-4 mx-auto"
            // The caption box should have a stable width, but don't let it be less than the current image width.
            style={{
              minWidth: `calc(100vh * ${
                Number(slides[slideIndex].width) /
                Number(slides[slideIndex].height)
              })`,
              width: `calc(100vh * ${
                Number(slides[0].width) / Number(slides[0].height)
              })`,
            }}
          >
            {/* Using || so empty strings don't collapse. 0, null, and undefined also get replaced */}
            {slides[slideIndex].caption || '\u00A0'}
          </figcaption>
          <div className="xl:max-w-[80vw] mx-auto w-fit p-4">
            {slides.map((slide, index) => (
              <button
                key={slide.url}
                title={
                  slide.caption
                    ? `${index + 1}: ${slide?.caption}`
                    : `${index + 1}`
                }
                className={makeSlideshowButtonCSS({
                  isPressed: index === slideIndex,
                  type: indexButtonType,
                })}
                style={
                  indexButtonType === 'images'
                    ? {
                        width: `${BLUR_SIZE}px`,
                        height: `${BLUR_SIZE}px`,
                        backgroundImage: `url(${slide?.blurDataURL})`,
                      }
                    : {}
                }
                onClick={(event) =>
                  handleFadeTransition({
                    event,
                    goToSlideIndex: index,
                  })
                }
              >
                {'\u00A0'}
              </button>
            ))}
          </div>
        </div>
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
