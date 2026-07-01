import { ipcRenderer } from 'electron'

interface VerifyResult {
  success: boolean
  message: string
}

export const authApi = {
  /**
   * 生成验证码（返回6位数字）
   */
  generateCode: (email: string): Promise<string> => {
    return ipcRenderer.invoke('auth:generateCode', email)
  },

  /**
   * 校验登录验证码
   */
  verifyCode: (email: string, code: string): Promise<VerifyResult> => {
    return ipcRenderer.invoke('auth:verifyCode', email, code)
  },

  /**
   * 校验锁屏密码
   */
  verifyLockPassword: (password: string): Promise<boolean> => {
    return ipcRenderer.invoke('auth:verifyLockPassword', password)
  },

  /**
   * 设置锁屏密码
   */
  setLockPassword: (password: string): Promise<VerifyResult> => {
    return ipcRenderer.invoke('auth:setLockPassword', password)
  }
}
