import os from 'os'
import { ipcMain } from 'electron'

/** 获取当前局域网 IP */
export function getLocalIp(): string {
  const interfaces = os.networkInterfaces()

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name]

    if (!netList) continue

    for (const net of netList) {
      const netFamily = net.family as string | number
      const isIPv4 = netFamily === 'IPv4' || netFamily === 4

      if (
        isIPv4 &&
        !net.internal &&
        !net.address.startsWith('169.254')
      ) {
        return net.address
      }
    }
  }

  return '127.0.0.1'
}

export function registerNetworkIpc(): void {
  ipcMain.handle('network:get-local-ip', () => {
    return getLocalIp()
  })
}

export function unregisterNetworkIpc(): void {
  ipcMain.removeHandler('network:get-local-ip')
}