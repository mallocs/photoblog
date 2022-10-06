// import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { default as NextImage } from 'next/future/image'
import { SlideExternal } from '../interfaces/slide'
import { BLUR_SIZE } from '../lib/constants'

type Props = {
  slides: SlideExternal[]
  slug: string
}

// const loader = ({ src, width, quality }) => {
//   const lastDotIndex = src.lastIndexOf('.')
//   return `${src.slice(0, lastDotIndex)}-w${width}${src.slice(lastDotIndex)}`
// }

async function loadImage(url, obj) {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj)
    obj.onerror = reject
    obj.src = url
  })
}

function Slideshow({ slides, slug }: Props) {
  function getSlideIndex(rawIndex) {
    return (rawIndex + slides.length) % slides.length
  }

  const [slideIndex, setSlideIndex] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(Array(slides.length).fill(false))
  async function preloadImage(index: number) {
    if (!hasLoaded[index]) {
      console.log('loading: ' + index)
      const nextHasLoaded = hasLoaded
      const imagePromise = await loadImage(slides[index]?.url, new Image())
      // const image = new Image()
      // image.src = slides[index]?.url
      nextHasLoaded[index] = imagePromise
      setHasLoaded(nextHasLoaded)
    }
  }

  const previousSlideIndex = getSlideIndex(slideIndex - 1)
  const nextSlideIndex = getSlideIndex(slideIndex + 1)
  useEffect(() => {
    ;(async () => {
      await preloadImage(slideIndex)
      await preloadImage(nextSlideIndex)
      await preloadImage(previousSlideIndex)
    })()
    return () => {
      // cleanup
    }
  }, [slideIndex])

  return (
    <>
      <figure>
        <div
          className={
            'flex justify-between relative min-w-min -mx-5 bg-extra-light-gray'
          }
        >
          <button
            className="absolute top-[calc(50%_-_2rem)] left-0 w-16 h-20"
            onClick={() => setSlideIndex(getSlideIndex(slideIndex - 1))}
          >
            <div className="absolute -top-1  w-16 h-20 bg-extra-light-gray opacity-60"></div>
            <div className=" -mr-4 rotate-45 border-black border-b-4 border-l-4 p-4 inline-block"></div>
          </button>
          <NextImage
            className={'object-contain max-h-screen w-full !bg-auto'}
            // TODO: !bg-auto seems to be necessary atm because next sets the blur image background-size to
            // cover for some reason.
            // loader={loader}
            alt="slideshow"
            src={slides[slideIndex].url}
            width={slides[slideIndex]?.width}
            height={slides[slideIndex]?.height}
            placeholder={BLUR_SIZE ? 'blur' : 'empty'}
            blurDataURL={slides[slideIndex]?.blurDataURL}
            sizes="100vw"
          />
          <button
            className="absolute top-[calc(50%_-_2rem)] right-0 w-16 h-20"
            onClick={(e) => {
              e.preventDefault()
              setSlideIndex(getSlideIndex(slideIndex + 1))
            }}
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
