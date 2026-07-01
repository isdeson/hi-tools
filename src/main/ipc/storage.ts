import { ipcMain, app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

/** 存储文件路径 */
const STORAGE_DIR = join(app.getPath('userData'), 'storage')
const STORAGE_FILE = join(STORAGE_DIR, 'data.json')

/**
 * 确保存储目录存在
 */
function ensureStorageDir(): void {
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

/**
 * 读取完整存储数据
 */
function readStorage(): Record<string, unknown> {
  ensureStorageDir()

  if (!existsSync(STORAGE_FILE)) {
    return {}
  }

  try {
    const content = readFileSync(STORAGE_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

/**
 * 写入完整存储数据
 */
function writeStorage(data: Record<string, unknown>): void {
  ensureStorageDir()
  writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function registerStorageIpc(): void {
  // 获取指定 key 的值
  ipcMain.handle('storage:get', (_event, key: string) => {
    const data = readStorage()
    return data[key] ?? null
  })

  // 设置指定 key 的值
  ipcMain.handle('storage:set', (_event, key: string, value: unknown) => {
    const data = readStorage()
    data[key] = value
    writeStorage(data)
  })

  // 删除指定 key
  ipcMain.handle('storage:remove', (_event, key: string) => {
    const data = readStorage()
    delete data[key]
    writeStorage(data)
  })

  // 获取全部数据
  ipcMain.handle('storage:getAll', () => {
    return readStorage()
  })

  // 清空全部数据
  ipcMain.handle('storage:clear', () => {
    writeStorage({})
  })
}

export function unregisterStorageIpc(): void {
  ipcMain.removeHandler('storage:get')
  ipcMain.removeHandler('storage:set')
  ipcMain.removeHandler('storage:remove')
  ipcMain.removeHandler('storage:getAll')
  ipcMain.removeHandler('storage:clear')
}
