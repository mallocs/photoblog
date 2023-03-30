import React, { useEffect } from 'react'
import PortalClientOnly from './PortalClientOnly'

function Modal({ onClose, show, title, children }) {
  useEffect(() => {
    const closeOnEscapeKeyDown = (e) => {
      if ((e.charCode || e.keyCode) === 27) {
        onClose()
      }
    }
    document.body.addEventListener('keydown', closeOnEscapeKeyDown)
    return function cleanup() {
      document.body.removeEventListener('keydown', closeOnEscapeKeyDown)
    }
  }, [onClose])

  return (
    <PortalClientOnly selector="#modal">
      <div
        className={`${
          show ? 'fixed' : 'hidden'
        } fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70 flex justify-center items-center overflow-hidden`}
        onClick={onClose}
      >
        <div
          className="bg-gray-100 max-h-[95vh] overflow-y-scroll w-fit h-max"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </PortalClientOnly>
  )
}

export default Modal
