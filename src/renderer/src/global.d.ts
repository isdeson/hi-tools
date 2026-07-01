interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
}

interface NotificationApi {
  send: (options: NotificationOptions) => Promise<void>
}

interface StorageApi {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
  remove: (key: string) => Promise<void>
  getAll: () => Promise<Record<string, unknown>>
  clear: () => Promise<void>
}

interface ConfigApi {
  read: (filename: string) => Promise<unknown>
  write: (filename: string, data: unknown) => Promise<void>
  exists: (filename: string) => Promise<boolean>
  getPath: () => Promise<string>
}

interface CacheApi {
  clear: () => Promise<void>
}

interface MailApi {
  sendCode: (to: string, code: string) => Promise<void>
}

interface VerifyResult {
  success: boolean
  message: string
}

interface AuthApi {
  generateCode: (email: string) => Promise<string>
  verifyCode: (email: string, code: string) => Promise<VerifyResult>
  verifyLockPassword: (password: string) => Promise<boolean>
  setLockPassword: (password: string) => Promise<VerifyResult>
}

interface QrLoginApi {
  start: () => Promise<string>
  stop: () => Promise<void>
  onScanned: (callback: () => void) => void
  onConfirmed: (callback: () => void) => void
  onCancelled: (callback: () => void) => void
  onExpired: (callback: () => void) => void
  removeAllListeners: () => void
}

interface Api {
  onFullscreenChange: (callback: (fullscreen: boolean) => void) => void
  removeFullscreenListener: () => void
  getLocalIp: () => Promise<string>
  getPublicIp: () => Promise<string>
  notification: NotificationApi
  storage: StorageApi
  config: ConfigApi
  cache: CacheApi
  mail: MailApi
  auth: AuthApi
  qrLogin: QrLoginApi
}

declare global {
  interface Window {
    api: Api
  }
}

export {}
