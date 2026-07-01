import { createHashRouter } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import FullscreenLayout from '@/layouts/FullscreenLayout'
import Home from '@/pages/Home'
import Setting from '@/pages/Setting'
import QuickSearch from '@/pages/QuickSearch'
import WebviewPage from '@/pages/Webview'

export interface IRoute {
  /** 菜单显示名称 */
  name: string
  /** 图标名（对应 assets/svg 目录） */
  icon: string
  activeIcon
  /** 路由路径 */
  path: string
  /** 页面组件（与 externalUrl 互斥） */
  Component?: React.ComponentType
  /** 外链地址（使用 webview 渲染） */
  externalUrl?: string
  /** 是否全屏打开（隐藏 sidebar，header 变为工具栏） */
  fullscreen?: boolean
  /** 是否为首页 */
  index?: boolean
}

export const routers: IRoute[] = [
  {
    name: '首页',
    icon: 'nav-home-active',
    activeIcon: 'nav-home-active',
    path: '',
    Component: Home,
    index: true
  },
  {
    name: '哈查查',
    icon: 'nav-search-active',
    activeIcon: 'nav-search-active',
    path: 'quick-search',
    Component: QuickSearch
  },
  {
    name: '哈哈码',
    icon: 'nav-haha-active',
    activeIcon: 'nav-haha-active',
    path: 'haha-code',
    externalUrl: 'https://isdeson.github.io/haha-code/',
    fullscreen: true
  },
  {
    name: '有道',
    icon: 'nav-translate-active',
    activeIcon: 'nav-translate-active',
    path: 'youdao',
    externalUrl: 'https://fanyi.youdao.com/#/TextTranslate',
    fullscreen: true
  },
  {
    name: '设置',
    icon: 'nav-setting-active',
    activeIcon: 'nav-setting-active',
    path: 'setting',
    Component: Setting
  }
]

export const router = createHashRouter([
  {
    path: '/',
    Component: MainLayout,
    children: routers
      .filter((r) => !r.fullscreen)
      .map((item) => ({
        index: item.index,
        path: item.path,
        ...(item.externalUrl
          ? { lazy: async () => ({ Component: () => WebviewPage({ url: item.externalUrl! }) }) }
          : { Component: item.Component })
      }))
  },
  {
    path: '/',
    Component: FullscreenLayout,
    children: routers
      .filter((r) => r.fullscreen)
      .map((item) => ({
        path: item.path,
        ...(item.externalUrl
          ? { lazy: async () => ({ Component: () => WebviewPage({ url: item.externalUrl! }) }) }
          : { Component: item.Component })
      }))
  }
])
