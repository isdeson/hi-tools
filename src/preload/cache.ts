import { ipcRenderer } from 'electron'

export const cacheApi = {
  /**
   * 清空应用缓存
   */
  clear: (): Promise<void> => {
    return ipcRenderer.invoke('cache:clear')
  }
}
