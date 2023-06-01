import { useEffect } from 'react'
import { registerGroupCallback, removeGroupCallback } from './observe'

export function useObserverGroupCallback(groupName, fn) {
  useEffect(() => {
    registerGroupCallback(groupName, fn)
    return () => {
      removeGroupCallback(groupName, fn)
    }
  }, [fn, groupName])
}
