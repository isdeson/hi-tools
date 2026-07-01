import { registerNetworkIpc, unregisterNetworkIpc } from './network'
import { registerNotificationIpc, unregisterNotificationIpc } from './notification'
import { registerStorageIpc, unregisterStorageIpc } from './storage'
import { registerConfigIpc, unregisterConfigIpc } from './config'
import { registerCacheIpc, unregisterCacheIpc } from './cache'
import { registerMailIpc, unregisterMailIpc } from './mail'
import { registerAuthIpc, unregisterAuthIpc } from './auth'
import { registerQrLoginIpc, unregisterQrLoginIpc } from './qrLogin'

export function registerIpc(): void {
  registerNetworkIpc()
  registerNotificationIpc()
  registerStorageIpc()
  registerConfigIpc()
  registerCacheIpc()
  registerMailIpc()
  registerAuthIpc()
  registerQrLoginIpc()
}

export function unregisterIpc(): void {
  unregisterNetworkIpc()
  unregisterNotificationIpc()
  unregisterStorageIpc()
  unregisterConfigIpc()
  unregisterCacheIpc()
  unregisterMailIpc()
  unregisterAuthIpc()
  unregisterQrLoginIpc()
}
