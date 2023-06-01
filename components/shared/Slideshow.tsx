import React, { useState, useEffect } from 'react'
import { default as NextImage } from 'next/image'
import { default as NextLink } from 'next/link'
import { useSwipeable } from 'react-swipeable'
import { SlideExternal } from '#/interfaces/slide'
import { SlideshowIndexButton } from '#/interfaces/slideshow'
import siteConfig from '#/site.config'
import SlideCaption from '#/components/shared/SlideCaption'
import { SlideshowSlide } from '#/components/shared/Slide'

const SESSION_STORAGE_KEY = 'photoblog-slideshow'

// const loader = ({ src, width, quality }) => {
//   const lastDotIndex = src.lastIndexOf('.')
//   return `${src.slice(0, lastDotIndex)}-w${width}${src.slice(lastDotIndex)}`
// }

const LeftArrow = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="-2 -1 30 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Left Arrow</title>
    <path d="M20 44 0 24 20 4l2.8 2.85L5.65 24 22.8 41.15Z" />
  </svg>
)

function LeftButton({ previousSlideIndex, handleFadeTransitionFn }) {
  return (
    <button
      className={`top-[calc(50%_-_2.4rem)] md:top-[calc(50%_-_5.5rem)] left-0 ${sliderButtonCommonClassNames}`}
      title={`Go to slide ${previousSlideIndex + 1}`}
      onClick={(event) => {
        event.currentTarget.blur()
        handleFadeTransitionFn({
          event,
          goToSlideIndex: previousSlideIndex,
        })
      }}
    >
      <LeftArrow />
    </button>
  )
}

const RightArrow = () => (
  <svg
    role="img"
    pointerEvents="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="6 -2 30 50"
  >
    <title>Right Arrow</title>
    <path d="m15.2 43.9-2.8-2.85L29.55 23.9 12.4 6.75l2.8-2.85 20 20Z" />
  </svg>
)

function RightButton({ nextSlideIndex, handleFadeTransitionFn }) {
  return (
    <button
      className={`absolute top-[calc(50%_-_2.4rem)] md:top-[calc(50%_-_5.5rem)] right-0 ${sliderButtonCommonClassNames}`}
      title={`Go to slide ${nextSlideIndex + 1}`}
      onClick={(event) => {
        handleFadeTransitionFn({
          event,
          goToSlideIndex: nextSlideIndex,
        })
      }}
    >
      <RightArrow />
    </button>
  )
}

function makeSlideshowButtonCSS({ isPressed = false, type }): string {
  if (type === 'dots') {
    return makeDotSlideshowButtonCSS({ isPressed })
  } else if (type === 'images') {
    return makeImgSlideshowButtonCSS({ isPressed })
  } else if (type === 'circles') {
    return makeCircleSlideshowButtonCSS({ isPressed })
  }
  return ''
}

function makeDotSlideshowButtonCSS({
  isPressed = false,
}: {
  isPressed: boolean
}): string {
  return (
    `w-6 h-6 sm:w-5 sm:h-5 rounded-full m-1 border-2 dark:border-zinc-800 ` +
    ` hover:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 ${
      isPressed
        ? ' border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100'
        : ' bg-zinc-400 dark:bg-zinc-500'
    }`
  )
}

function makeCircleSlideshowButtonCSS({
  isPressed = false,
}: {
  isPressed: boolean
}): string {
  return `w-5 h-5 rounded-full m-1 border-zinc-600 border-4 hover:bg-zinc-200 ${
    isPressed ? ' bg-zinc-200' : 'bg-zinc-600'
  }`
}

function makeImgSlideshowButtonCSS({
  isPressed = false,
}: {
  isPressed: boolean
}): string {
  return (
    `m-2 bg-no-repeat bg-cover bg-center shadow-zinc-700 dark:shadow-slate-400` +
    `${
      isPressed
        ? ' border-2 shadow-[1px_1px_5px_-1px]'
        : ' shadow-[3px_3px_5px_1px] hover:border-2 hover:shadow-[1px_1px_5px_-1px]'
    }`
  )
}

const sliderButtonCommonClassNames =
  'absolute w-12 h-18 md:w-20 md:h-36 p-2' +
  ' bg-opacity-40 hover:bg-zinc-300 hover:bg-opacity-80' +
  ' dark:bg-opacity-40 dark:hover:bg-zinc-700 dark:hover:bg-opacity-80 dark:fill-zinc-400'

type Props = {
  slides: SlideExternal[]
  indexButtonType?: SlideshowIndexButton
  slug: string
  priority: boolean
}

function Slideshow({
  slides,
  indexButtonType = 'circles',
  slug,
  priority,
}: Props) {
  const sessionStorageKey = SESSION_STORAGE_KEY + slug
  const [slideIndex, setSlideIndex] = useState(0)

  // 1 is fading in, -1 is fading out
  const [isFading, setIsFading] = useState(Array(slides.length).fill(0))
  const [fadeTimeoutId, setFadeTimeoutId] = useState<
    ReturnType<typeof setTimeout> | number
  >(0)

  useEffect(() => {
    setSlideIndex(Number(window.sessionStorage.getItem(sessionStorageKey)) || 0)
    window.addEventListener('beforeunload', () =>
      window.sessionStorage.removeItem(sessionStorageKey)
    )
    return () => (window.onbeforeunload = null)
  }, [sessionStorageKey])

  function getSlideIndex(rawIndex: number) {
    return (rawIndex + slides.length) % slides.length
  }

  const previousSlideIndex = getSlideIndex(slideIndex - 1)
  const nextSlideIndex = getSlideIndex(slideIndex + 1)
  function getFadeCSS({ index }: { index: number }): string {
    let css = ` transition-opacity ease-out`
    if (isFading[index] !== 0 && index !== slideIndex) {
      return css + ' opacity-0'
    } else if (index === slideIndex) {
      return css + ' opacity-100'
    } else {
      return css + ' hidden'
    }
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
    sessionStorage.setItem(sessionStorageKey, String(goToSlideIndex))
    requestAnimationFrame(() => setSlideIndex(goToSlideIndex))
    setFadeTimeoutId(
      setTimeout(() => {
        requestAnimationFrame(() => setIsFading(Array(slides.length).fill(0)))
      }, siteConfig.fadeSpeed)
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
        <div className={'flex items-end justify-center relative'}>
          {slides.length > 1 && (
            <LeftButton
              handleFadeTransitionFn={handleFadeTransition}
              previousSlideIndex={previousSlideIndex}
            />
          )}
          {slides.map(
            (slide, index) =>
              ([slideIndex, nextSlideIndex, previousSlideIndex].some(
                (i) => index === i
              ) ||
                isFading[index] !== 0) && (
                <SlideshowSlide
                  key={slide.url}
                  slide={slide}
                  isFading={isFading[index] === 1}
                  fadeCSS={getFadeCSS({ index })}
                  priority={priority && index === 0}
                  slideIndex={index}
                  linkAs={`/posts/${slug}#slide-${index}`}
                  // try to lock the height based on the first slide
                  maxHeight={`min(100vh, calc(100vw * ${
                    Number(slides[0].height) / Number(slides[0].width)
                  }))`}
                />
              )
          )}
          {slides.length > 1 && (
            <RightButton
              handleFadeTransitionFn={handleFadeTransition}
              nextSlideIndex={nextSlideIndex}
            />
          )}
        </div>
        <div className="max-w-full">
          <SlideCaption
            caption={slides[slideIndex].caption}
            geodata={slides[slideIndex].geodata}
            dateTimeOriginal={slides[slideIndex].dateTimeOriginal}
            // The caption box should have a stable width, but don't let it be less than the current image width.
            style={{
              maxWidth: `100vw`,
              width: `max(calc(100vh * ${
                Number(slides[slideIndex].width) /
                Number(slides[slideIndex].height)
              }), calc(100vh * ${
                Number(slides[0].width) / Number(slides[0].height)
              })`,
            }}
          />
          {slides.length > 1 && (
            <div className="xl:max-w-[80vw] mx-auto w-fit p-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.url}
                  title={
                    slide.caption
                      ? `${index + 1}: ${slide?.caption.replace(
                          /<a .*>(.*)<\/a>/gi,
                          '$1'
                        )}`
                      : `${index + 1}`
                  }
                  className={makeSlideshowButtonCSS({
                    isPressed: index === slideIndex,
                    type: indexButtonType,
                  })}
                  style={
                    indexButtonType === 'images'
                      ? {
                          width: `${siteConfig.blurSize}px`,
                          height: `${siteConfig.blurSize}px`,
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
          )}
        </div>
      </figure>
    </>
  )
}

export default Slideshow
