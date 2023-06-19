import dynamic from 'next/dynamic'

const MapWithNoSSR = dynamic(() => import('#/components/shared/MapContainer'), {
  ssr: false,
})

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
