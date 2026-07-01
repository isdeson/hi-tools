import { ipcMain, app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

/** 配置文件目录 */
const CONFIG_DIR = join(app.getPath('userData'), 'config')

/**
 * 确保配置目录存在
 */
function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

/**
 * 获取配置文件完整路径
 */
function getConfigPath(filename: string): string {
  // 防止路径穿越
  const safeName = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '')
  return join(CONFIG_DIR, safeName)
}

export function registerConfigIpc(): void {
  // 读取指定配置文件
  ipcMain.handle('config:read', (_event, filename: string) => {
    ensureConfigDir()
    const filePath = getConfigPath(filename)

    if (!existsSync(filePath)) {
      return null
    }

    try {
      const content = readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  })

  // 写入指定配置文件
  ipcMain.handle('config:write', (_event, filename: string, data: unknown) => {
    ensureConfigDir()
    const filePath = getConfigPath(filename)
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  })

  // 检查配置文件是否存在
  ipcMain.handle('config:exists', (_event, filename: string) => {
    const filePath = getConfigPath(filename)
    return existsSync(filePath)
  })

  // 获取配置目录路径（方便调试）
  ipcMain.handle('config:getPath', () => {
    return CONFIG_DIR
  })
}

export function unregisterConfigIpc(): void {
  ipcMain.removeHandler('config:read')
  ipcMain.removeHandler('config:write')
  ipcMain.removeHandler('config:exists')
  ipcMain.removeHandler('config:getPath')
}
