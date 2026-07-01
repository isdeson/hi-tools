import { ipcMain } from 'electron'
import { readConfigSync } from '../utils/config'

/** 验证码缓存：email -> { code, expireAt } */
const codeCache = new Map<string, { code: string; expireAt: number }>()

/** 验证码有效期 5 分钟 */
const CODE_EXPIRE_MS = 5 * 60 * 1000

/**
 * 生成 6 位随机数字验证码
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

interface AuthConfig {
  /** 允许登录的邮箱列表 */
  allowedEmails: string[]
  /** 锁屏密码（6位数字） */
  lockPassword: string
}

export function registerAuthIpc(): void {
  // 生成验证码并返回（同时触发邮件发送由渲染进程协调）
  ipcMain.handle('auth:generateCode', (_event, email: string) => {
    const code = generateCode()
    const expireAt = Date.now() + CODE_EXPIRE_MS

    codeCache.set(email, { code, expireAt })

    return code
  })

  // 校验登录验证码
  ipcMain.handle('auth:verifyCode', (_event, email: string, code: string) => {
    const cached = codeCache.get(email)

    if (!cached) {
      return { success: false, message: '验证码不存在，请重新获取' }
    }

    if (Date.now() > cached.expireAt) {
      codeCache.delete(email)
      return { success: false, message: '验证码已过期，请重新获取' }
    }

    if (cached.code !== code) {
      return { success: false, message: '验证码错误' }
    }

    // 验证通过，清除缓存
    codeCache.delete(email)

    // 检查邮箱是否在允许列表中
    const authConfig = readConfigSync('auth.json') as AuthConfig | null

    if (authConfig?.allowedEmails && !authConfig.allowedEmails.includes(email)) {
      return { success: false, message: '该邮箱未被授权登录' }
    }

    return { success: true, message: '登录成功' }
  })

  // 校验锁屏密码
  ipcMain.handle('auth:verifyLockPassword', (_event, password: string) => {
    const authConfig = readConfigSync('auth.json') as AuthConfig | null

    if (!authConfig?.lockPassword) {
      // 未设置锁屏密码，默认 000000
      return password === '000000'
    }

    return password === authConfig.lockPassword
  })

  // 设置锁屏密码
  ipcMain.handle('auth:setLockPassword', (_event, password: string) => {
    if (password.length !== 6 || !/^\d{6}$/.test(password)) {
      return { success: false, message: '密码必须为6位数字' }
    }

    // 通过 config IPC 写入（这里直接用 fs 写入）
    const { writeFileSync, existsSync, mkdirSync } = require('fs')
    const { join } = require('path')
    const { app } = require('electron')

    const configDir = join(app.getPath('userData'), 'config')
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }

    const configPath = join(configDir, 'auth.json')
    let config: AuthConfig = { allowedEmails: [], lockPassword: '' }

    if (existsSync(configPath)) {
      try {
        config = JSON.parse(require('fs').readFileSync(configPath, 'utf-8'))
      } catch {
        // ignore
      }
    }

    config.lockPassword = password
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')

    return { success: true, message: '锁屏密码设置成功' }
  })
}

export function unregisterAuthIpc(): void {
  ipcMain.removeHandler('auth:generateCode')
  ipcMain.removeHandler('auth:verifyCode')
  ipcMain.removeHandler('auth:verifyLockPassword')
  ipcMain.removeHandler('auth:setLockPassword')
}
