import type { ObserverInstanceCallback } from './index'

const observerMap = new Map<
  string,
  {
    id: string
    observer: IntersectionObserver
    elementCallbacksMap: Map<Element, Array<ObserverInstanceCallback>>
    visibleEntriesSet: Set<IntersectionObserverEntry>
  }
>()

// The group callbacks could be created before the observer for the group, so
// it seems cleaner to store them separately.
const observerGroupCallbacksMap = new Map<
  string,
  ((
    entries: IntersectionObserverEntry[],
    visibleEntries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => unknown)[]
>()

export function getObservedElements(observerId: string, sortFn) {
  return sortFn === undefined
    ? Array.from(observerMap?.get(observerId).elementCallbacksMap.keys())
    : Array.from(observerMap?.get(observerId).elementCallbacksMap.keys()).sort(
        sortFn
      )
}

function getDistanceToViewportBottom(element: Element) {
  return Math.min(
    Math.abs(element.getBoundingClientRect().bottom - window.innerHeight),
    Math.abs(element.getBoundingClientRect().top - window.innerHeight)
  )
}

export function getObservedByDistanceToViewportBottom(observerId: string) {
  return getObservedElements(
    observerId,
    (a, b) => getDistanceToViewportBottom(a) - getDistanceToViewportBottom(b)
  )
}

// TODO: only recompute when new elements are observed
export function getObservedByTop(observerId: string) {
  return getObservedElements(
    observerId,
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
  )
}

function isElementBottomVisible(element: Element, padding = 0) {
  return element.getBoundingClientRect().bottom <= window.innerHeight + padding
}

export function getClosestToViewportBottomIndex(observerId: string) {
  const observedByViewport = getObservedByDistanceToViewportBottom(observerId)
  const observedElementsByTop = getObservedByTop(observerId)
  return observedElementsByTop.findIndex(
    (element) => element === observedByViewport[0]
  )
}

function _getObservedElementByDelta(observerId: string, delta: number) {
  const observedByViewport = getObservedByDistanceToViewportBottom(observerId)
  const observedElementsByTop = getObservedByTop(observerId)
  const closestIndex = getClosestToViewportBottomIndex(observerId)
  if (delta >= 0 && isElementBottomVisible(observedByViewport[0])) {
    delta += 1
  }

  return closestIndex + delta < observedElementsByTop.length &&
    closestIndex + delta >= 0
    ? observedElementsByTop[closestIndex + delta]
    : undefined
}

export function getNextObservedElement(observerId: string) {
  return _getObservedElementByDelta(observerId, 0)
}

export function getPreviousObservedElement(observerId: string) {
  return _getObservedElementByDelta(observerId, -1)
}

const RootIds: WeakMap<Element | Document, string> = new WeakMap()
let rootId = 0

let unsupportedValue: boolean | undefined = undefined

/**
 * What should be the default behavior if the IntersectionObserver is unsupported?
 * Ideally the polyfill has been loaded, you can have the following happen:
 * - `undefined`: Throw an error
 * - `true` or `false`: Set the `inView` value to this regardless of intersection state
 * **/
export function defaultFallbackInView(inView: boolean | undefined) {
  unsupportedValue = inView
}

/**
 * Generate a unique ID for the root element
 * @param root
 */
function getRootId(root: IntersectionObserverInit['root']) {
  if (!root) return '0'
  if (RootIds.has(root)) return RootIds.get(root)
  rootId += 1
  RootIds.set(root, rootId.toString())
  return RootIds.get(root)
}

/**
 * Convert the options to a string Id, based on the values.
 * Ensures we can reuse the same observer when observing elements with the same options.
 * @param options
 */
export function optionsToId(
  options: IntersectionObserverInit & { group?: string }
) {
  return Object.keys(options)
    .sort()
    .filter((key) => options[key] !== undefined)
    .map((key) => {
      return `${key}_${key === 'root' ? getRootId(options.root) : options[key]}`
    })
    .toString()
}

export function registerGroupCallback(observerGroupName, callbackFn) {
  observerGroupCallbacksMap.set(observerGroupName, [
    ...(observerGroupCallbacksMap?.get(observerGroupName) ?? []),
    callbackFn,
  ])
}

function createObserver(
  options: IntersectionObserverInit & { group?: string }
) {
  // Create a unique ID for this observer instance, based on the root, root margin and threshold.
  // First call with a group determines the options, which seems better than always having to pass
  // the same options to get the group instance.
  let id = options.group ? options.group : optionsToId(options)
  let instance = observerMap.get(id)

  if (!instance) {
    // Create a map of elements this observer is going to observe. Each element has a list of callbacks that should be triggered, once it comes into view.
    const elementCallbacksMap = new Map<
      Element,
      Array<ObserverInstanceCallback>
    >()
    let thresholds: number[] | readonly number[]

    const calculateInView = (entry) =>
      entry.isIntersecting &&
      thresholds.some((threshold) => entry.intersectionRatio >= threshold)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // While it would be nice if you could just look at isIntersecting to determine if the component is inside the viewport, browsers can't agree on how to use it.
        // -Firefox ignores `threshold` when considering `isIntersecting`, so it will never be false again if `threshold` is > 0
        const inView = calculateInView(entry)

        // @ts-ignore support IntersectionObserver v2
        if (options.trackVisibility && typeof entry.isVisible === 'undefined') {
          // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
          // @ts-ignore
          entry.isVisible = inView
        }

        elementCallbacksMap.get(entry.target)?.forEach((callback) => {
          callback(inView, entry)
        })
        inView
          ? instance.visibleEntriesSet.add(entry)
          : instance.visibleEntriesSet.delete(entry)
      })

      observerGroupCallbacksMap
        .get(options.group)
        ?.forEach((callbackFn) =>
          callbackFn(entries, entries.filter(calculateInView), observer)
        )
    }, options)

    // Ensure we have a valid thresholds array. If not, use the threshold from the options
    thresholds =
      observer.thresholds ||
      (Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold || 0])

    instance = {
      id,
      observer,
      elementCallbacksMap,
      visibleEntriesSet: new Set(),
    }

    observerMap.set(id, instance)
  }

  return instance
}

/**
 * @param element - DOM Element to observe
 * @param callback - Callback function to trigger when intersection status changes
 * @param options - Intersection Observer options
 * @param fallbackInView - Fallback inView value.
 * @return Function - Cleanup function that should be triggered to unregister the observer
 */
export function observe(
  element: Element,
  callback: ObserverInstanceCallback,
  options: IntersectionObserverInit & { group?: string } = {},
  fallbackInView = unsupportedValue
) {
  if (
    typeof window.IntersectionObserver === 'undefined' &&
    fallbackInView !== undefined
  ) {
    const bounds = element.getBoundingClientRect()
    callback(fallbackInView, {
      isIntersecting: fallbackInView,
      target: element,
      intersectionRatio:
        typeof options.threshold === 'number' ? options.threshold : 0,
      time: 0,
      boundingClientRect: bounds,
      intersectionRect: bounds,
      rootBounds: bounds,
    })
    return () => {
      // Nothing to cleanup
    }
  }
  // An observer with the same options can be reused, so lets use this fact
  const { id, observer, elementCallbacksMap } = createObserver(options)

  // Register the callback listener for this element
  let callbacks = elementCallbacksMap.get(element) || []
  if (!elementCallbacksMap.has(element)) {
    elementCallbacksMap.set(element, callbacks)
  }

  callbacks.push(callback)
  observer.observe(element)

  return function unobserve() {
    // Remove the callback from the callback list
    callbacks.splice(callbacks.indexOf(callback), 1)

    if (callbacks.length === 0) {
      // No more callback exists for element, so destroy it
      elementCallbacksMap.delete(element)
      observer.unobserve(element)
    }

    if (elementCallbacksMap.size === 0) {
      // No more elements are being observer by this instance, so destroy it
      observer.disconnect()
      observerMap.delete(id)
    }
  }
}
