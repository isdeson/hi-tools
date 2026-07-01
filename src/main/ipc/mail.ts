import { ipcMain } from 'electron'
import nodemailer from 'nodemailer'
import { readConfigSync } from '../utils/config'

interface MailConfig {
  /** SMTP 服务器地址 */
  host: string
  /** SMTP 端口 */
  port: number
  /** 是否使用 SSL */
  secure: boolean
  /** 发件人邮箱 */
  user: string
  /** 授权码/密码 */
  pass: string
}

/**
 * 生成 Apple 风格验证码 HTML 邮件模板
 */
function buildVerificationHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="460" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);padding:48px 40px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="width:56px;height:56px;background:linear-gradient(135deg,#36d1dc,#5b86e5);border-radius:14px;display:inline-block;"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#1d1d1f;">Hi Tools 验证码</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;color:#86868b;line-height:1.6;">您的验证码如下，有效期 5 分钟。<br>请勿将此验证码分享给他人。</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:#f5f5f7;border-radius:8px;padding:16px 32px;letter-spacing:8px;font-size:32px;font-weight:700;color:#1d1d1f;">${code}</div>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:#86868b;">如果您没有请求此验证码，请忽略这封邮件。</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * 发送验证码邮件
 */
async function sendVerificationMail(to: string, code: string): Promise<void> {
  const mailConfig = readConfigSync('mail.json') as MailConfig | null

  if (!mailConfig) {
    throw new Error('邮件配置不存在，请先在 config/mail.json 中配置 SMTP 信息')
  }

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass
    }
  })

  await transporter.sendMail({
    from: `"Hi Tools" <${mailConfig.user}>`,
    to,
    subject: 'Hi Tools 验证码',
    html: buildVerificationHtml(code)
  })
}

export function registerMailIpc(): void {
  ipcMain.handle('mail:sendCode', async (_event, to: string, code: string) => {
    await sendVerificationMail(to, code)
  })
}

export function unregisterMailIpc(): void {
  ipcMain.removeHandler('mail:sendCode')
}
