import { ipcRenderer } from 'electron'

export const qrLoginApi = {
  /**
   * 启动扫码登录服务，返回二维码 URL
   */
  start: (): Promise<string> => {
    return ipcRenderer.invoke('qrLogin:start')
  },

  /**
   * 停止扫码登录服务
   */
  stop: (): Promise<void> => {
    return ipcRenderer.invoke('qrLogin:stop')
  },

  /**
   * 监听已扫码事件
   */
  onScanned: (callback: () => void): void => {
    ipcRenderer.on('qrLogin:scanned', () => callback())
  },

  /**
   * 监听扫码确认登录事件
   */
  onConfirmed: (callback: () => void): void => {
    ipcRenderer.on('qrLogin:confirmed', () => callback())
  },

  /**
   * 监听取消事件
   */
  onCancelled: (callback: () => void): void => {
    ipcRenderer.on('qrLogin:cancelled', () => callback())
  },

  /**
   * 监听过期事件
   */
  onExpired: (callback: () => void): void => {
    ipcRenderer.on('qrLogin:expired', () => callback())
  },

  /**
   * 移除所有监听
   */
  removeAllListeners: (): void => {
    ipcRenderer.removeAllListeners('qrLogin:scanned')
    ipcRenderer.removeAllListeners('qrLogin:confirmed')
    ipcRenderer.removeAllListeners('qrLogin:cancelled')
    ipcRenderer.removeAllListeners('qrLogin:expired')
  }
}
