import { useEffect } from 'react'

import { useWindowStore } from '@/store/window'

export function useWindowEvents() {
  const setFullscreen = useWindowStore((state) => state.setFullscreen)

  useEffect(() => {
    window.api.onFullscreenChange(setFullscreen)

    return () => {
      window.api.removeFullscreenListener()
    }
  }, [setFullscreen])
}