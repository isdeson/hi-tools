import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

/** 配置文件目录 */
const CONFIG_DIR = join(app.getPath('userData'), 'config')

/**
 * 同步读取配置文件（供主进程内部使用）
 */
export function readConfigSync(filename: string): unknown {
  const safeName = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '')
  const filePath = join(CONFIG_DIR, safeName)

  if (!existsSync(filePath)) {
    return null
  }

  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}
