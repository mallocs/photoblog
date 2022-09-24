// import Link from 'next/link'
import React, { useState } from 'react'
import Image from 'next/future/image'
import { SlideExternal } from '../interfaces/slide'

type Props = {
  slides: SlideExternal[]
  slug: string
}

const loader = ({ src, width, quality }) => {
  const lastDotIndex = src.lastIndexOf('.')
  return `${src.slice(0, lastDotIndex)}-w${width}${src.slice(lastDotIndex)}`
}

function Slideshow({ slides, slug }: Props) {
  function getSlideIndex(rawIndex) {
    return (rawIndex + slides.length) % slides.length
  }
  const [slideIndex, setSlideIndex] = useState(0)

  return (
    <>
      <figure>
        <div className={'flex justify-between relative min-w-min -mx-5'}>
          <button
            className="absolute top-[calc(50%_-_2rem)] left-0 w-16 h-20"
            onClick={() => setSlideIndex(getSlideIndex(slideIndex - 1))}
          >
            <div className="absolute -top-1  w-16 h-20 bg-white opacity-60"></div>
            <div className=" -mr-4 rotate-45 border-black border-b-4 border-l-4 p-4 inline-block"></div>
          </button>

          <Image
            className={'object-contain max-h-screen w-full cursor-pointer'}
            loader={loader}
            alt="slideshow"
            src={slides[slideIndex].url}
            width={slides[slideIndex]?.width}
            height={slides[slideIndex]?.height}
            sizes="100vw"
          />

          <button
            className="absolute top-[calc(50%_-_2rem)] right-0 w-16 h-20"
            onClick={(e) => {
              e.preventDefault()
              setSlideIndex(getSlideIndex(slideIndex + 1))
            }}
          >
            <div className="absolute -top-1  w-16 h-20 bg-white opacity-60"></div>
            <div className=" -ml-4 rotate-45 border-black border-t-4 border-r-4 p-4 inline-block"></div>
          </button>
        </div>
        <figcaption
          className={`bg-gray-300 py-1 px-4 ${
            slides[slideIndex].caption !== undefined ? '' : 'invisible'
          } -mx-5`}
        >
          {slides[slideIndex].caption || '\u00A0'}
        </figcaption>
      </figure>
    </>
  )
}

export default Slideshow

/*
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
