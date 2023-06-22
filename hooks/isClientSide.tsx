import { useState, useEffect } from 'react'

export default function useIsClientSide() {
  const [isClientSide, setIsClientSideFn] = useState(false)
  useEffect(() => {
    setIsClientSideFn(true)
  }, [])
  return isClientSide
}
