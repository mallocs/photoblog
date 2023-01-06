import React, { useState, useEffect, useRef } from 'react'

const UpDoubleArrow = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="4 4 40 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Double Up Arrow</title>
    <path d="m14.1 36.75-2.1-2.1 12-12 12 12-2.1 2.1-9.9-9.9Zm0-12.65L12 22l12-12 12 12-2.1 2.1-9.9-9.9Z" />
  </svg>
)

const UpArrow = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="4 4 40 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Double Up Arrow</title>
    <path d="M14.15 30.75 12 28.6l12-12 12 11.95-2.15 2.15L24 20.85Z" />
  </svg>
)

const DownArrow = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="4 2 40 40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Double Up Arrow</title>
    <path d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z" />
  </svg>
)

function scrollToPosition(position: number) {
  window.scrollTo({
    top: position,
    behavior: 'smooth',
  })
}

function scrollToElement(element: Element) {
  scrollToPosition(
    element.getBoundingClientRect().bottom + window.scrollY - window.innerHeight
  )
}

function scrollToTopFn() {
  scrollToPosition(0)
}

function useSlideObserver(callbackFn) {
  const observerRef = useRef(new SlideObserver())

  useEffect(() => {
    const slideObserver = observerRef.current
    slideObserver.setupIntersectionObserver()
    slideObserver.registerCallback(callbackFn)
    return () => {
      slideObserver.destroy()
    }
  }, [callbackFn])
  return observerRef
}

class SlideObserver {
  static _instance: SlideObserver
  callbacks = []
  currentSlides: Map<string, Element> = new Map()
  io: IntersectionObserver
  slideList: NodeListOf<Element>
  constructor() {
    if (!SlideObserver._instance) {
      SlideObserver._instance = this
    }
    return SlideObserver._instance
  }

  destroy() {
    if (typeof SlideObserver._instance !== 'undefined') {
      delete SlideObserver._instance
    }
  }

  registerCallback(callbackFn) {
    this.callbacks.push(callbackFn)
  }
  getClosestSlideToViewportBottom() {
    return Array.from(this.currentSlides.values())
      .sort(
        (a, b) =>
          a.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom
      )
      .pop()
  }

  isSlideBottomVisible(slideElement: Element) {
    return (
      slideElement.getBoundingClientRect().bottom <= window.innerHeight + 30
    )
  }

  isLastSlide(slideElement: Element) {
    return slideElement === this.slideList[this.slideList.length - 1]
  }
  isFirstSlide(slideElement: Element) {
    return slideElement === this.slideList[0]
  }

  getNextSlide() {
    const closestSlide = this.getClosestSlideToViewportBottom()
    return this.isSlideBottomVisible(closestSlide)
      ? document.querySelector(
          `#slide-${Number(closestSlide.id.slice(6)) + 1}`
        ) || closestSlide
      : closestSlide
  }

  getPreviousSlide() {
    const closestSlide = this.getClosestSlideToViewportBottom()
    return this.isSlideBottomVisible(closestSlide)
      ? document.querySelector(
          `#slide-${Number(closestSlide.id.slice(6)) - 1}`
        ) || closestSlide
      : closestSlide
  }

  setupIntersectionObserver() {
    if (typeof document === 'undefined' || typeof this.io !== 'undefined') {
      return
    }
    this.slideList = document.querySelectorAll('div[id^=slide-]')
    this.io = new IntersectionObserver((entries) => {
      this.callbacks.forEach((callbackFn) => callbackFn(entries, this))
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.currentSlides.set(entry.target.id, entry.target)
        } else {
          this.currentSlides.delete(entry.target.id)
        }
      })
    })
    this.slideList.forEach((el) => {
      this.io.observe(el)
    })
  }
}

const buttonOpacityFn = (show: boolean) => (show ? 'opacity-40' : 'opacity-0')
const buttonSharedCSS = `transition-opacity duration-300 fixed rounded-full pointer h-12 w-12 bg-zinc-100 dark:bg-zinc-500`

export function ScrollToTopButton() {
  const [show, setShowFn] = useState(false)

  useSlideObserver((entries, slideObserver) => {
    entries.forEach((entry) => {
      slideObserver.isFirstSlide(entry.target) &&
        setShowFn(!entry.isIntersecting)
    })
  })

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(
        show
      )} bottom-20 right-8 `}
      title={`Go to top`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToTopFn()
      }}
    >
      <UpDoubleArrow />
    </button>
  )
}

export function ScrollUpButton() {
  const [show, setShowFn] = useState(false)

  const observerRef = useSlideObserver((entries, slideObserver) => {
    entries.forEach((entry) => {
      slideObserver.isFirstSlide(entry.target) &&
        setShowFn(!entry.isIntersecting)
    })
  })

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(show)} bottom-4 right-8`}
      title={`Go to previous image`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToElement(observerRef.current.getPreviousSlide())
      }}
    >
      <UpArrow />
    </button>
  )
}

export function ScrollDownButton() {
  const [show, setShowFn] = useState(false)

  const observerRef = useSlideObserver((entries, slideObserver) => {
    entries.forEach((entry) => {
      slideObserver.isLastSlide(entry.target) &&
        setShowFn(!entry.isIntersecting)
    })
  })

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(
        show
      )} bottom-4 right-[calc(50%_-_1.5rem)]`}
      title={`Go to next image`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToElement(observerRef.current.getNextSlide())
      }}
    >
      <DownArrow />
    </button>
  )
}

// Alternative to using Intersection Observer.
// Uses a throttled scroll listener instead.
// Initially false to be server friendly. Won't render initially.
// distanceFn can be used so threshold doesn't have to be computed
// until client-side and also in case of resizing.
/*

const throttle = (fn, delay) => {
  let time = Date.now()
  return () => {
    if (time + delay - Date.now() <= 0) {
      window.requestAnimationFrame(fn)
      time = Date.now()
    }
  }
}
function useScrollThreshold({ distance = undefined, distanceFn }) {
  const [isPastThreshold, setPastThresholdFn] = useState(false)
  const throttledScrollToTopFn = throttle(
    () =>
      setPastThresholdFn(
        () => document.documentElement.scrollTop > (distance || distanceFn())
      ),
    200
  )
  useEffect(() => {
    setPastThresholdFn(
      document.documentElement.scrollTop > (distance || distanceFn())
    )
    addEventListener('scroll', throttledScrollToTopFn)
    return () => removeEventListener('scroll', throttledScrollToTopFn)
  }, [throttledScrollToTopFn, distance, distanceFn])
  return isPastThreshold
}
*/
