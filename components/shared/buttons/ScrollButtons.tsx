import React, { useState, useEffect } from 'react'
import { UpDoubleArrow, UpArrow, DownArrow } from '#/components/shared/icons'
import {
  getNextObservedElement,
  getPreviousObservedElement,
  getObservedByTop,
  registerGroupCallback,
} from '#/lib/intersection-observer-group/observe'
import { buttonOpacityFn, buttonSharedCSS } from './utils'
import siteConfig from '#/site.config'

function scrollToPosition(position: number) {
  window.scrollTo({
    top: position,
    behavior: 'smooth',
  })
}

function scrollToElement(element: Element, offset = 0) {
  scrollToPosition(
    element.getBoundingClientRect().bottom +
      window.scrollY -
      window.innerHeight +
      offset
  )
}

function scrollToTopFn() {
  scrollToPosition(0)
}

const useIsFirstObservedElementVisible = (observerId, callbackFn) =>
  useEffect(() => {
    registerGroupCallback(siteConfig.slideObserverGroup, (entries) => {
      const topSlide = getObservedByTop(observerId)[0]
      entries.forEach((entry) => {
        entry.target === topSlide && callbackFn(entry.isIntersecting)
      })
    })
  }, [callbackFn, observerId])

const useIsLastObservedElementVisible = (observerId, callbackFn) =>
  useEffect(() => {
    registerGroupCallback(siteConfig.slideObserverGroup, (entries) => {
      const lastSlide = getObservedByTop(observerId).at(-1)
      entries.forEach((entry) => {
        entry.target === lastSlide && callbackFn(entry.isIntersecting)
      })
    })
  }, [callbackFn, observerId])

export function ScrollToTopButton() {
  const [hide, setHideFn] = useState(true)

  useIsFirstObservedElementVisible(siteConfig.slideObserverGroup, setHideFn)

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
  useIsFirstObservedElementVisible(siteConfig.slideObserverGroup, setHideFn)

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(hide)}`}
      title={`Go to previous image`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToElement(
          getPreviousObservedElement(siteConfig.slideObserverGroup)
        )
      }}
    >
      <UpArrow />
    </button>
  )
}

export function ScrollDownButton() {
  const [hide, setHideFn] = useState(false)
  useIsLastObservedElementVisible(siteConfig.slideObserverGroup, setHideFn)

  return (
    <button
      className={`${buttonSharedCSS} ${buttonOpacityFn(hide)}`}
      title={`Go to next image`}
      onClick={(event) => {
        event.currentTarget.blur()
        scrollToElement(
          getNextObservedElement(siteConfig.slideObserverGroup),
          1 // TODO: figure out why sometimes the scrolling gets stuck without this offset.
        )
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
