import { ipcRenderer } from 'electron'

export const windowApi = {
  /**
   * 监听窗口全屏状态变化
   */
  onFullscreenChange: (callback: (fullscreen: boolean) => void) => {
    ipcRenderer.on('window:fullscreen', (_, fullscreen: boolean) => {
      callback(fullscreen)
    })
  },
  /**
   * 移除全屏监听
   */
  removeFullscreenListener: () => {
    ipcRenderer.removeAllListeners('window:fullscreen')
  }
}