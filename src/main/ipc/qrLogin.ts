import { ipcMain, BrowserWindow } from 'electron'
import http from 'http'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getLocalIp } from './network'

let server: http.Server | null = null
let currentToken: string | null = null

/** 生成随机 token */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/** 将图片文件转为 base64 data URL */
function imageToBase64(relativePath: string): string {
  try {
    const filePath = join(__dirname, relativePath)
    const buffer = readFileSync(filePath)
    const ext = relativePath.endsWith('.png') ? 'png' : 'jpeg'
    return `data:image/${ext};base64,${buffer.toString('base64')}`
  } catch {
    return ''
  }
}

/** 确认登录的 HTML 页面 - 移动端优化 */
function getConfirmHtml(): string {
  const logoBase64 = imageToBase64('../../resources/icon.png')
  const bgBase64 = imageToBase64('../../resources/login-background.png')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
  <meta name="theme-color" content="#ffffff">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <title>Hi Tools - 确认登录</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif;
      background: #ffffff;
      color: #1f2329;
    }
    body {
      padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;
      display: flex;
      flex-direction: column;
    }
    .container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 40px;
      width: 100%;
    }
    .logo {
      width: 72px;
      height: 72px;
      border-radius: 16px;
    }
    .title {
      margin-top: 20px;
      font-size: 20px;
      font-weight: 600;
      color: #1f2329;
    }
    .desc {
      margin-top: 8px;
      font-size: 14px;
      color: #8f959e;
      text-align: center;
      line-height: 1.5;
    }
    .btn {
      margin-top: 40px;
      display: block;
      width: 100%;
      padding: 14px 0;
      background: #00becc;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:active { opacity: 0.85; }
    .btn:disabled { opacity: 0.4; }
    .cancel-btn {
      margin-top: 16px;
      background: none;
      border: none;
      font-size: 14px;
      color: #8f959e;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .cancel-btn:active { opacity: 0.6; }
    .bg-bottom {
     width: 100%;
     height: 280px;
     background: url('${bgBase64}') center bottom no-repeat;
     background-size: auto 100%;
     flex-shrink: 0;
    }
    .success-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .check-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(0, 190, 204, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .success-text {
      font-size: 17px;
      font-weight: 600;
      color: #1f2329;
    }
    .success-desc {
      font-size: 14px;
      color: #8f959e;
    }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container" id="loginView">
    <img class="logo" src="${logoBase64}" alt="Hi Tools" />
    <h1 class="title">Hi Tools</h1>
    <p class="desc">请求在桌面端登录</p>
    <button class="btn" id="confirmBtn" onclick="confirmLogin()">确认登录</button>
    <button class="cancel-btn" onclick="cancelLogin()">取消</button>
  </div>

  <div class="container hidden" id="successView">
    <div class="success-view">
      <div class="check-circle">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <path d="M10 24L20 34L38 14" stroke="#00becc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="success-text">登录成功</p>
      <p class="success-desc">你可以关闭此页面</p>
    </div>
  </div>

  <div class="bg-bottom"></div>

  <script>
    var pageToken = new URLSearchParams(window.location.search).get('token');
    async function confirmLogin() {
      var btn = document.getElementById('confirmBtn');
      btn.disabled = true;
      btn.textContent = '登录中...';
      try {
        var res = await fetch('/confirm?token=' + pageToken, { method: 'POST' });
        if (res.ok) {
          document.getElementById('loginView').classList.add('hidden');
          document.getElementById('successView').classList.remove('hidden');
        } else if (res.status === 410) {
          btn.textContent = '页面已失效';
          document.querySelector('.desc').textContent = '请重新扫码';
        }
      } catch(e) {
        btn.disabled = false;
        btn.textContent = '确认登录';
      }
    }
    async function cancelLogin() {
      var res = await fetch('/cancel?token=' + pageToken, { method: 'POST' });
      if (res.ok) {
        document.getElementById('confirmBtn').disabled = true;
        document.getElementById('confirmBtn').textContent = '已取消';
        document.querySelector('.cancel-btn').style.display = 'none';
      } else if (res.status === 410) {
        document.getElementById('confirmBtn').disabled = true;
        document.getElementById('confirmBtn').textContent = '页面已失效';
        document.querySelector('.desc').textContent = '请重新扫码';
        document.querySelector('.cancel-btn').style.display = 'none';
      }
    }
  </script>
</body>
</html>`
}

/** 二维码有效期 3 分钟 */
const QR_EXPIRE_MS = 3 * 60 * 1000
let expireTimer: ReturnType<typeof setTimeout> | null = null

export function registerQrLoginIpc(): void {
  ipcMain.handle('qrLogin:start', async () => {
    // 关闭旧的服务和定时器
    if (server) {
      server.close()
      server = null
    }
    if (expireTimer) {
      clearTimeout(expireTimer)
      expireTimer = null
    }

    currentToken = generateToken()
    const ip = getLocalIp()
    const port = 9527

    return new Promise<string>((resolve, reject) => {
      server = http.createServer((req, res) => {
        if (req.url === `/auth?token=${currentToken}`) {
          // 返回确认页面
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(getConfirmHtml())

          // 通知渲染进程已扫码
          const windows = BrowserWindow.getAllWindows()
          windows.forEach((win) => {
            win.webContents.send('qrLogin:scanned')
          })
        } else if (req.url?.startsWith('/confirm') && req.method === 'POST') {
          // 确认登录 - 校验 token
          const url = new URL(req.url, `http://localhost`)
          const reqToken = url.searchParams.get('token')

          if (!currentToken || reqToken !== currentToken) {
            res.writeHead(410, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: '页面已失效' }))
            return
          }

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))

          const windows = BrowserWindow.getAllWindows()
          windows.forEach((win) => {
            win.webContents.send('qrLogin:confirmed')
          })

          currentToken = null

          setTimeout(() => {
            if (server) {
              server.close()
              server = null
            }
          }, 1000)
        } else if (req.url?.startsWith('/cancel') && req.method === 'POST') {
          // 取消登录 - 校验 token
          const url = new URL(req.url, `http://localhost`)
          const reqToken = url.searchParams.get('token')

          if (!currentToken || reqToken !== currentToken) {
            res.writeHead(410, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: '页面已失效' }))
            return
          }

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))

          const windows = BrowserWindow.getAllWindows()
          windows.forEach((win) => {
            win.webContents.send('qrLogin:cancelled')
          })
        } else {
          res.writeHead(404)
          res.end('Not Found')
        }
      })

      server.listen(port, () => {
        const url = `http://${ip}:${port}/auth?token=${currentToken}`
        resolve(url)

        // 设置过期定时器
        expireTimer = setTimeout(() => {
          const windows = BrowserWindow.getAllWindows()
          windows.forEach((win) => {
            win.webContents.send('qrLogin:expired')
          })
          if (server) {
            server.close()
            server = null
          }
        }, QR_EXPIRE_MS)
      })

      server.on('error', (err) => {
        reject(err)
      })
    })
  })

  ipcMain.handle('qrLogin:stop', () => {
    if (server) {
      server.close()
      server = null
    }
    if (expireTimer) {
      clearTimeout(expireTimer)
      expireTimer = null
    }
    currentToken = null
  })
}

export function unregisterQrLoginIpc(): void {
  if (server) {
    server.close()
    server = null
  }
  if (expireTimer) {
    clearTimeout(expireTimer)
    expireTimer = null
  }
  ipcMain.removeHandler('qrLogin:start')
  ipcMain.removeHandler('qrLogin:stop')
}
