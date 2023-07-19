import { useState } from 'react'
import { ShowMapIcon, CloseIcon } from '#/components/shared/icons'
import { FixedPositionMap } from '#/components/shared/Map'
import { buttonOpacityFn, buttonSharedCSS } from './utils'

export function MapButton() {
  return (
    <>
      <div className="hidden sm:block lg:hidden">
        <_MapButton show={false} />
      </div>
      <div className="hidden lg:block">
        <_MapButton show />
      </div>
    </>
  )
}

function _MapButton({ show }) {
  const [showMap, setShowMapFn] = useState(show)
  return (
    <>
      {showMap && <FixedPositionMap />}
      <button
        title={showMap ? 'Close Map' : 'Show Map'}
        onClick={() => setShowMapFn(!showMap)}
        type="button"
        className={`${buttonOpacityFn(false)} ${buttonSharedCSS}`}
      >
        {showMap ? <CloseIcon /> : <ShowMapIcon />}
      </button>
    </>
  )
}
