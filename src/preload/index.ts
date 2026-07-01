import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { windowApi } from './window'
import { networkApi } from './network'
import { notificationApi } from './notification'
import { storageApi } from './storage'
import { configApi } from './config'
import { cacheApi } from './cache'
import { mailApi } from './mail'
import { authApi } from './auth'
import { qrLoginApi } from './qrLogin'

/**
 * 所有自定义 API
 */
const api = {
  ...windowApi,
  ...networkApi,
  notification: notificationApi,
  storage: storageApi,
  config: configApi,
  cache: cacheApi,
  mail: mailApi,
  auth: authApi,
  qrLogin: qrLoginApi
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error(error)
}
