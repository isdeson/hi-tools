import { create } from 'zustand'

interface WindowState {
  fullscreen: boolean
  setFullscreen: (fullscreen: boolean) => void
}

export const useWindowStore = create<WindowState>((set) => ({
  fullscreen: false,

  setFullscreen: (fullscreen) =>
    set({
      fullscreen
    })
}))