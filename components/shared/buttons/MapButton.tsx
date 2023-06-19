import { useState } from 'react'
import { ShowMapIcon, CancelIcon } from '#/components/shared/icons'
import { FixedPositionMap } from '#/components/shared/Map'
import { buttonOpacityFn, buttonSharedCSS } from './utils'

export function MapButton() {
  const [showMap, setShowMapFn] = useState(true)
  return (
    <>
      {showMap && <FixedPositionMap />}
      <button
        title={showMap ? 'Close Map' : 'Show Map'}
        onClick={() => setShowMapFn(!showMap)}
        type="button"
        className={`${buttonOpacityFn(false)} ${buttonSharedCSS}`}
      >
        {showMap ? <CancelIcon /> : <ShowMapIcon />}
      </button>
    </>
  )
}
