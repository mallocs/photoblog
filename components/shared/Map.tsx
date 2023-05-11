import dynamic from 'next/dynamic'
import { useState } from 'react'

const MapWithNoSSR = dynamic(() => import('#/components/shared/MapContainer'), {
  ssr: false,
})
const ShowMapIcon = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="-120 -50 1200 1200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Show Map</title>
    <path d="m612 936-263-93-179 71q-17 9-33.5-1T120 883V325q0-13 7.5-23t19.5-15l202-71 263 92 178-71q17-8 33.5 1.5T840 268v565q0 11-7.5 19T814 864l-202 72Zm-34-75V356l-196-66v505l196 66Zm60 0 142-47V302l-142 54v505Zm-458-12 142-54V290l-142 47v512Zm458-493v505-505Zm-316-66v505-505Z" />
  </svg>
)

const CancelIcon = () => (
  <svg
    role="img"
    pointerEvents="none"
    viewBox="4 4 40 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Cancel</title>
    <path d="m16.5 33.6 7.5-7.5 7.5 7.5 2.1-2.1-7.5-7.5 7.5-7.5-2.1-2.1-7.5 7.5-7.5-7.5-2.1 2.1 7.5 7.5-7.5 7.5ZM24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z" />
  </svg>
)

export function MapButton() {
  const [showMap, setShowMapFn] = useState(false)
  return (
    <>
      {showMap && <FixedPositionMap />}
      <button
        title={showMap ? 'Close Map' : 'Show Map'}
        onClick={() => setShowMapFn(!showMap)}
        type="button"
        className="hidden md:block transition-opacity duration-300 rounded-full pointer h-12 w-12 bg-zinc-100 dark:bg-zinc-500 opacity-40"
      >
        {showMap ? <CancelIcon /> : <ShowMapIcon />}
      </button>
    </>
  )
}

export function FixedPositionMap() {
  return (
    <div className="fixed bottom-6 right-24 w-80 h-72 p-2 bg-white rounded-lg border-2 border-zinc-400 text-black dark:text-black">
      <div className="absolute translate-x-[-50%] translate-y-[-50%] top-1/2 left-1/2">
        Unknown Coordinates
      </div>
      <MapWithNoSSR />
    </div>
  )
}

export default MapWithNoSSR
