import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ShowMapIcon, CancelIcon } from '#/components/shared/icons'

const MapWithNoSSR = dynamic(() => import('#/components/shared/MapContainer'), {
  ssr: false,
})

export function MapButton() {
  const [showMap, setShowMapFn] = useState(true)
  return (
    <>
      {showMap && <FixedPositionMap />}
      <button
        title={showMap ? 'Close Map' : 'Show Map'}
        onClick={() => setShowMapFn(!showMap)}
        type="button"
        className="transition-opacity duration-300 rounded-full pointer h-12 w-12 bg-zinc-100 dark:bg-zinc-500 opacity-40"
      >
        {showMap ? <CancelIcon /> : <ShowMapIcon />}
      </button>
    </>
  )
}

export function FixedPositionMap() {
  return (
    <div className="fixed bottom-12 right-24 w-72 h-64 p-2 bg-white rounded-lg border-2 border-zinc-400 text-black dark:text-black">
      <div className="absolute top-0 bottom-0 left-0 right-0 m-auto w-fit h-fit">
        Unknown Coordinates
      </div>
      <MapWithNoSSR />
    </div>
  )
}

export default MapWithNoSSR
