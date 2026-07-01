import { useEffect, useRef } from 'react'
import './index.scss'

interface WebviewPageProps {
  url: string
}

export default function WebviewPage({ url }: WebviewPageProps) {
  const webviewRef = useRef<Electron.WebviewTag>(null)

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    // 拦截新窗口请求，在当前 webview 内打开
    const handleNewWindow = (e: Event) => {
      const event = e as CustomEvent & { url: string }
      if (event.url) {
        webview.loadURL(event.url)
      }
    }

    webview.addEventListener('new-window', handleNewWindow)

    return () => {
      webview.removeEventListener('new-window', handleNewWindow)
    }
  }, [])

  return (
    <div className="webview-page">
      <webview
        ref={webviewRef as React.RefObject<Electron.WebviewTag>}
        className="webview-page__frame"
        src={url}
      />
    </div>
  )
}
