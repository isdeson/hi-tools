import { ipcMain, session } from 'electron'

export function registerCacheIpc(): void {
  // 清空应用缓存（网络缓存、localStorage、sessionStorage 等）
  ipcMain.handle('cache:clear', async () => {
    const ses = session.defaultSession
    await ses.clearCache()
    await ses.clearStorageData()
  })
}

export function unregisterCacheIpc(): void {
  ipcMain.removeHandler('cache:clear')
}
