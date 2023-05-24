import React, { useState, useEffect, useRef } from 'react'
import {
  getNextObservedElement,
  getPreviousObservedElement,
  getObservedByTop,
  registerGroupCallback,
} from '#/lib/intersection-observer-group/observe'

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

const buttonOpacityFn = (hide: boolean) => (hide ? 'opacity-0' : 'opacity-40')
const buttonSharedCSS = `transition-opacity duration-300 rounded-full pointer h-12 w-12 bg-zinc-100 dark:bg-zinc-500`

const useIsFirstObservedElementVisible = (observerId, callbackFn) =>
  useEffect(() => {
    registerGroupCallback('slide', (entries) => {
      const topSlide = getObservedByTop(observerId)[0]
      entries.forEach((entry) => {
        entry.target === topSlide && callbackFn(entry.isIntersecting)
      })
    })
  }, [callbackFn, observerId])

const useIsLastObservedElementVisible = (observerId, callbackFn) =>
  useEffect(() => {
    registerGroupCallback('slide', (entries) => {
      const lastSlide = getObservedByTop(observerId).at(-1)
      entries.forEach((entry) => {
        entry.target === lastSlide && callbackFn(entry.isIntersecting)
      })
    })
  }, [callbackFn, observerId])

export function ScrollToTopButton() {
  const [hide, setHideFn] = useState(true)

  useIsFirstObservedElementVisible('slide', setHideFn)

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(hide)}`}
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
  const [hide, setHideFn] = useState(true)
  useIsFirstObservedElementVisible('slide', setHideFn)

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(hide)}`}
      title={`Go to previous image`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToElement(getPreviousObservedElement('slide'))
      }}
    >
      <UpArrow />
    </button>
  )
}

export function ScrollDownButton() {
  const [hide, setHideFn] = useState(false)
  useIsLastObservedElementVisible('slide', setHideFn)

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(hide)}`}
      title={`Go to next image`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToElement(getNextObservedElement('slide'))
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
