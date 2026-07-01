import { ipcRenderer } from 'electron'

export const configApi = {
  /**
   * 读取配置文件
   */
  read: (filename: string): Promise<unknown> => {
    return ipcRenderer.invoke('config:read', filename)
  },

  /**
   * 写入配置文件
   */
  write: (filename: string, data: unknown): Promise<void> => {
    return ipcRenderer.invoke('config:write', filename, data)
  },

  /**
   * 检查配置文件是否存在
   */
  exists: (filename: string): Promise<boolean> => {
    return ipcRenderer.invoke('config:exists', filename)
  },

  /**
   * 获取配置目录路径
   */
  getPath: (): Promise<string> => {
    return ipcRenderer.invoke('config:getPath')
  }
}
