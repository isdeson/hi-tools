import { ipcRenderer } from 'electron'

export const mailApi = {
  /**
   * 发送验证码邮件
   */
  sendCode: (to: string, code: string): Promise<void> => {
    return ipcRenderer.invoke('mail:sendCode', to, code)
  }
}
