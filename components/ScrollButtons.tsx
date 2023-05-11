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

export function useSlideObserver(callbackFn) {
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
    let closest = Infinity
    return Array.from(
      this.currentSlides.size ? this.currentSlides.values() : this.slideList
    ).reduce((closestSlide, currentSlide) => {
      const currentDistance = Math.min(
        Math.abs(
          currentSlide.getBoundingClientRect().bottom - window.innerHeight
        ),
        Math.abs(currentSlide.getBoundingClientRect().top - window.innerHeight)
      )
      if (currentDistance < closest) {
        closest = currentDistance
        return currentSlide
      }
      return closestSlide
    }, undefined)
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
    return document.querySelector(
      `#slide-${Number(this.getClosestSlideToViewportBottom().id.slice(6)) - 1}`
    )
  }

  setupIntersectionObserver() {
    if (typeof document === 'undefined' || typeof this.io !== 'undefined') {
      return
    }
    this.slideList = document.querySelectorAll('div[id^=slide-]')
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.currentSlides.set(entry.target.id, entry.target)
          } else {
            this.currentSlides.delete(entry.target.id)
          }
        })
        this.callbacks.forEach((callbackFn) => callbackFn(entries, this))
      },
      { threshold: 0.01 }
    )
    this.slideList.forEach((el) => {
      this.io.observe(el)
    })
  }
}

const buttonOpacityFn = (show: boolean) => (show ? 'opacity-40' : 'opacity-0')
const buttonSharedCSS = `transition-opacity duration-300 rounded-full pointer h-12 w-12 bg-zinc-100 dark:bg-zinc-500`

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
      className={`${buttonSharedCSS} ${buttonOpacityFn(show)}`}
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
      className={`${buttonSharedCSS} ${buttonOpacityFn(show)}`}
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
      className={`${buttonSharedCSS} ${buttonOpacityFn(show)}`}
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
