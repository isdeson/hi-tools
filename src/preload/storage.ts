import { ipcRenderer } from 'electron'

export const storageApi = {
  /**
   * 获取存储的值
   */
  get: (key: string): Promise<unknown> => {
    return ipcRenderer.invoke('storage:get', key)
  },

  /**
   * 设置存储的值
   */
  set: (key: string, value: unknown): Promise<void> => {
    return ipcRenderer.invoke('storage:set', key, value)
  },

  /**
   * 删除存储的值
   */
  remove: (key: string): Promise<void> => {
    return ipcRenderer.invoke('storage:remove', key)
  },

  /**
   * 获取全部存储数据
   */
  getAll: (): Promise<Record<string, unknown>> => {
    return ipcRenderer.invoke('storage:getAll')
  },

  /**
   * 清空全部存储
   */
  clear: (): Promise<void> => {
    return ipcRenderer.invoke('storage:clear')
  }
}
