import { app, shell, BrowserWindow, nativeImage, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'
import { registerIpc, unregisterIpc } from './ipc'
import { createTray, destroyTray, setMainWindow } from './tray'


let mainWindow: BrowserWindow | null = null

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    // 窗口初始宽度
    width: 1000,
    // 窗口初始高度
    height: 670,
    // 窗口允许缩放的最小宽度
    minWidth: 900,
    // 窗口允许缩放的最小高度
    minHeight: 600,
    // 创建后先不显示窗口，等页面加载完成后再显示，避免白屏闪烁
    show: false,
    // 自动隐藏顶部菜单栏（Windows/Linux 有效）
    autoHideMenuBar: true,
    // macOS 沉浸式标题栏，仅保留左上角红绿灯按钮
    // 可选值：
    // - default：默认系统标题栏
    // - hidden：完全隐藏标题栏
    // - hiddenInset：隐藏标题栏并保留红绿灯，推荐 macOS 使用
    // - customButtonsOnHover：仅悬停时显示红绿灯
    titleBarStyle: 'hiddenInset',
    // Linux 下设置窗口图标
    // macOS 使用 .icns 文件
    // Windows 使用 .ico 文件
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      // 预加载脚本路径，用于通过 contextBridge 安全地暴露 API 给渲染进程
      preload: join(__dirname, '../preload/index.js'),
      // 是否启用沙箱模式
      // electron-vite 官方模板默认关闭
      // 开发阶段建议保持 false，方便使用 Node API
      sandbox: false,
      // 启用 webview 标签
      webviewTag: true
    },
    // 窗口居中显示
    center: true
  })

  // 页面加载完成后显示窗口
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // 进入全屏
  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('window:fullscreen', true)
  })

  // 退出全屏
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('window:fullscreen', false)
  })

  // 打开外部链接时使用默认浏览器
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {
      action: 'deny'
    }
  })

  // 开发环境
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  }
  // 生产环境
  else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 窗口关闭时释放引用
  mainWindow.on('closed', () => {
    mainWindow = null
    setMainWindow(null)
  })
}

/**
 * 应用启动
 */
app.whenReady().then(() => {
  // Windows AppID
  electronApp.setAppUserModelId('com.hi-tools.app')

  // macOS 设置 Dock 图标（打包后自动生效，开发模式可能被 Electron 默认图标覆盖）
  if (process.platform === 'darwin') {
    const dockIcon = nativeImage.createFromPath(icon)
    if (!dockIcon.isEmpty() && app.dock) {
      app.dock.setIcon(dockIcon)
    }
  }

  // 开发环境快捷键支持
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册 IPC
  registerIpc()

  // 创建系统托盘
  createTray()

  // 创建窗口
  createWindow()

  // 传递主窗口引用给托盘模块
  setMainWindow(mainWindow)

  // 注册全局快捷键唤起窗口（Ctrl+Shift+H / Cmd+Shift+H）
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (!mainWindow) {
      createWindow()
      setMainWindow(mainWindow)
      return
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    mainWindow.focus()
  })

  // macOS Dock 点击重新打开窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭
 */
app.on('window-all-closed', () => {
  // macOS 保持应用驻留
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 应用退出前
 */
app.on('before-quit', () => {
  globalShortcut.unregisterAll()
  unregisterIpc()
  destroyTray()
})

/**
 * 防止第二个实例启动（可选）
 */
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }

      mainWindow.focus()
    }
  })
}
