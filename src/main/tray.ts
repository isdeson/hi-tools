import { Tray, Menu, clipboard, nativeImage, app, BrowserWindow } from 'electron'
import { join } from 'path'
import { getLocalIp } from './ipc/network'

let tray: Tray | null = null
let mainWindowRef: BrowserWindow | null = null

/**
 * 设置主窗口引用（用于托盘菜单中显示窗口）
 */
export function setMainWindow(win: BrowserWindow | null): void {
  mainWindowRef = win
}

/**
 * 创建系统托盘
 */
export function createTray(): void {
  // macOS 使用 Template 图标（自动适配深浅色模式）
  // Windows/Linux 使用普通图标
  const iconPath =
    process.platform === 'darwin'
      ? join(__dirname, '../../resources/trayTemplate.png')
      : join(__dirname, '../../resources/icon.png')

  const icon = nativeImage.createFromPath(iconPath)

  tray = new Tray(icon)
  tray.setToolTip('Hi Tools')

  updateTrayMenu()
}

/**
 * 更新托盘菜单
 */
function updateTrayMenu(): void {
  if (!tray) return

  const ip = getLocalIp()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: (): void => {
        if (mainWindowRef) {
          mainWindowRef.show()
          mainWindowRef.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: `局域网 IP: ${ip}`,
      enabled: false
    },
    {
      label: '复制局域网 IP',
      click: (): void => {
        const currentIp = getLocalIp()
        clipboard.writeText(currentIp)
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: (): void => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

/**
 * 销毁系统托盘
 */
export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
