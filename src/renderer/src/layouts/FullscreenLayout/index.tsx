import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import iconPng from '@/assets/image/icon.png'

import './index.scss'
import { PoweroffIcon } from 'tdesign-icons-react'
import SvgIcon from '@renderer/components/SvgIcon'

export default function FullscreenLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  // 更新导航状态
  const updateNavState = useCallback(() => {
    const webview = document.querySelector('webview') as Electron.WebviewTag | null
    if (webview) {
      setCanGoBack(webview.canGoBack())
      setCanGoForward(webview.canGoForward())
    }
  }, [])

  // 退出全屏
  const handleBack = () => {
    navigate('/')
  }

  // 后退
  const handleGoBack = () => {
    const webview = document.querySelector('webview') as Electron.WebviewTag | null
    if (webview?.canGoBack()) {
      webview.goBack()
    }
  }

  // 前进
  const handleGoForward = () => {
    const webview = document.querySelector('webview') as Electron.WebviewTag | null
    if (webview?.canGoForward()) {
      webview.goForward()
    }
  }

  // 刷新
  const handleRefresh = () => {
    const webview = document.querySelector('webview') as Electron.WebviewTag | null
    if (webview) {
      setLoading(true)
      webview.reload()
    }
  }

  // 监听 webview 加载和导航变化
  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      const webview = document.querySelector('webview') as Electron.WebviewTag | null
      if (!webview) return

      const handleLoaded = () => {
        setLoading(false)
        updateNavState()
      }

      const handleNavigation = () => {
        updateNavState()
      }

      webview.addEventListener('did-finish-load', handleLoaded)
      webview.addEventListener('did-fail-load', handleLoaded)
      webview.addEventListener('did-navigate', handleNavigation)
      webview.addEventListener('did-navigate-in-page', handleNavigation)

      return () => {
        webview.removeEventListener('did-finish-load', handleLoaded)
        webview.removeEventListener('did-fail-load', handleLoaded)
        webview.removeEventListener('did-navigate', handleNavigation)
        webview.removeEventListener('did-navigate-in-page', handleNavigation)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname, updateNavState])

  return (
    <div className="fullscreen-layout">
      {/* Header 工具栏 */}
      <div className="fullscreen-header dragable">
        <div className="fullscreen-header__actions no-drag">
          <button
            className={`fullscreen-header__btn ${!canGoBack ? 'fullscreen-header__btn--disabled' : ''}`}
            onClick={handleGoBack}
            disabled={!canGoBack}
            title="后退"
          >
            <SvgIcon name="arrow-left" size={16.5} />
          </button>
          <button
            className={`fullscreen-header__btn ${!canGoForward ? 'fullscreen-header__btn--disabled' : ''}`}
            onClick={handleGoForward}
            disabled={!canGoForward}
            title="前进"
          >
            <SvgIcon name="arrow-right" size={16.5} />
          </button>
          <button className="fullscreen-header__btn" onClick={handleRefresh} title="刷新">
            <SvgIcon name="refresh" size={17} />
          </button>
        </div>

        {/* 右侧关闭按钮 */}
        <button className="fullscreen-header__close no-drag" onClick={handleBack} title="关闭">
          <PoweroffIcon size={20} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fullscreen-layout__loading">
          <img className="fullscreen-layout__loading-icon" src={iconPng} alt="loading" />
          <p className="fullscreen-layout__loading-text">加载中...</p>
        </div>
      )}

      {/* 内容 */}
      <div className="fullscreen-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
