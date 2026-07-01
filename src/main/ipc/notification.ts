import { ipcMain, Notification } from 'electron'

interface NotificationOptions {
  /** 通知标题 */
  title: string
  /** 通知内容 */
  body: string
  /** 是否静默（不播放提示音） */
  silent?: boolean
}

/**
 * 发送系统通知
 */
function sendNotification(options: NotificationOptions): void {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    silent: options.silent ?? false
  })

  notification.show()
}

export function registerNotificationIpc(): void {
  ipcMain.handle('notification:send', (_event, options: NotificationOptions) => {
    sendNotification(options)
  })
}

export function unregisterNotificationIpc(): void {
  ipcMain.removeHandler('notification:send')
}
