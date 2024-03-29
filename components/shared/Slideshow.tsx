import React, { useState, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { SlideExternal } from '#/interfaces/slide'
import { SlideshowIndexButton } from '#/interfaces/slideshow'
import siteConfig from '#/site.config'
import SlideCaption from '#/components/shared/SlideCaption'
import { SlideshowSlide } from '#/components/shared/Slide'
import { LeftArrow, RightArrow } from '#/components/shared/icons'
import useIsClientSide from '#/hooks/isClientSide'

const SESSION_STORAGE_KEY = 'photoblog-slideshow'

// const loader = ({ src, width, quality }) => {
//   const lastDotIndex = src.lastIndexOf('.')
//   return `${src.slice(0, lastDotIndex)}-w${width}${src.slice(lastDotIndex)}`
// }

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

function RightButton({ nextSlideIndex, handleFadeTransitionFn }) {
  return (
    <button
      className={`top-[calc(50%_-_2.4rem)] md:top-[calc(50%_-_5.5rem)] right-0 ${sliderButtonCommonClassNames}`}
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
  'absolute z-20 w-12 h-18 md:w-20 md:h-36 p-2' +
  ' bg-opacity-40 hover:bg-zinc-300 hover:bg-opacity-80' +
  ' dark:bg-opacity-40 dark:hover:bg-zinc-700 dark:hover:bg-opacity-80 dark:fill-zinc-400'

type Props = {
  slides: SlideExternal[]
  indexButtonType?: SlideshowIndexButton
  slug: string
  priority: boolean
  inView: boolean
}

function isInPreloadRange(
  slideIndex: number,
  currentIndex: number,
  slideCount: number,
  preload = siteConfig.preloadImages ?? 2
) {
  return (
    Math.abs(slideIndex - currentIndex) <= preload ||
    Math.abs(slideIndex - currentIndex) >= slideCount - preload
  )
}

function Slideshow({
  slides,
  indexButtonType = 'circles',
  slug,
  priority,
  inView,
}: Props) {
  const isClientSide = useIsClientSide()
  const sessionStorageKey = SESSION_STORAGE_KEY + slug
  const [currentSlideIndex, setSlideIndex] = useState(0)

  // 1 is fading in, -1 is fading out
  const [isFading, setIsFading] = useState(Array(slides.length).fill(0))
  const [fadeTimeoutId, setFadeTimeoutId] = useState<
    ReturnType<typeof setTimeout> | number
  >(0)

  useEffect(() => {
    setSlideIndex(Number(window.sessionStorage.getItem(sessionStorageKey)) || 0)
    const removeSessionStorageItemFn = () =>
      window.sessionStorage.removeItem(sessionStorageKey)
    window.addEventListener('beforeunload', removeSessionStorageItemFn)
    return () => {
      window.removeEventListener('beforeunload', removeSessionStorageItemFn)
    }
  }, [sessionStorageKey])

  function getSlideIndex(rawIndex: number) {
    return (rawIndex + slides.length) % slides.length
  }

  const previousSlideIndex = getSlideIndex(currentSlideIndex - 1)
  const nextSlideIndex = getSlideIndex(currentSlideIndex + 1)
  function getFadeCSS({ index }: { index: number }): string {
    // NOTE: passing transition duration as a style since tailwind doesn't seem to update
    // when using arbitrary values and changing them.
    // TODO: pointer-events-none since the slide width is acting weird while fading.
    let css = `transition-opacity ease-in-out ${
      isFading[index] === 1 ? 'absolute left-0 pointer-events-none' : ''
    }`
    if (isFading[index] !== 0 && index !== currentSlideIndex) {
      return css + ' opacity-0 pointer-events-none'
    } else if (index === currentSlideIndex) {
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
    fading[currentSlideIndex] = -1
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
        <div className="relative">
          {slides.length > 1 && (
            <>
              <LeftButton
                handleFadeTransitionFn={handleFadeTransition}
                previousSlideIndex={previousSlideIndex}
              />
              <RightButton
                handleFadeTransitionFn={handleFadeTransition}
                nextSlideIndex={nextSlideIndex}
              />
            </>
          )}
          <div
            className={
              'flex items-center justify-center bg-zinc-200 dark:bg-zinc-500 mx-auto'
            }
            style={{
              maxWidth: `100vw`,
              width: `calc(100vh * ${
                Number(slides[0].width) / Number(slides[0].height)
              })`,
            }}
          >
            {slides.map(
              (slide, index) =>
                ([currentSlideIndex, nextSlideIndex, previousSlideIndex].some(
                  (i) => index === i
                ) ||
                  isFading[index] !== 0) && (
                  <SlideshowSlide
                    key={slide.src}
                    slide={slide}
                    style={{ transitionDuration: `${siteConfig.fadeSpeed}ms` }}
                    css={getFadeCSS({ index })}
                    priority={priority && index === 0 ? true : undefined}
                    loading={
                      isClientSide &&
                      inView &&
                      isInPreloadRange(currentSlideIndex, index, slides.length)
                        ? 'eager'
                        : undefined
                    }
                    slideIndex={index}
                    linkAs={`/posts/${slug}#slide-${index}`}
                    // try to lock the height based on the first slide
                    maxHeight={`min(100vh, calc(100vw * ${
                      Number(slides[0].height) / Number(slides[0].width)
                    }))`}
                  />
                )
            )}
          </div>
        </div>
        <div className="max-w-full">
          <SlideCaption
            caption={slides[currentSlideIndex].caption}
            geodata={slides[currentSlideIndex].geodata}
            dateTimeOriginal={slides[currentSlideIndex].dateTimeOriginal}
            // The caption box should have a stable width, but don't let it be less than the current image width.
            style={{
              maxWidth: `100vw`,
              width: `max(calc(100vh * ${
                Number(slides[currentSlideIndex].width) /
                Number(slides[currentSlideIndex].height)
              }), calc(100vh * ${
                Number(slides[0].width) / Number(slides[0].height)
              })`,
            }}
          />
          {slides.length > 1 && (
            <div className="xl:max-w-[80vw] mx-auto w-fit p-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.src}
                  title={
                    slide.caption
                      ? `${index + 1}: ${slide?.caption.replace(
                          /<a .*>(.*)<\/a>/gi,
                          '$1'
                        )}`
                      : `${index + 1}`
                  }
                  className={makeSlideshowButtonCSS({
                    isPressed: index === currentSlideIndex,
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
