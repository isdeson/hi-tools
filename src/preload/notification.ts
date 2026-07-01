import { ipcRenderer } from 'electron'

interface NotificationOptions {
  /** 通知标题 */
  title: string
  /** 通知内容 */
  body: string
  /** 是否静默 */
  silent?: boolean
}

export const notificationApi = {
  /**
   * 发送系统通知
   */
  send: (options: NotificationOptions): Promise<void> => {
    return ipcRenderer.invoke('notification:send', options)
  }
}
