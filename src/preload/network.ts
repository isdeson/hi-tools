import { ipcRenderer } from 'electron'

export const networkApi = {
  /**
   * 获取当前局域网 IP
   */
  getLocalIp: (): Promise<string> => {
    return ipcRenderer.invoke('network:get-local-ip')
  },
  /**
   * 获取公网 IP
   */
  getPublicIp: (): Promise<string> => {
    return ipcRenderer.invoke('network:get-public-ip')
  }
}
