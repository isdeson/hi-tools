import { useWindowStore } from '@/store/window'
import { useAuthStore } from '@/store/auth'
import { MessagePlugin, DialogPlugin } from 'tdesign-react'
import { IpTag } from '../ipTag'
import SvgIcon from '../SvgIcon'

import './index.scss'

export default function AppHeader() {
  const isFullScreen = useWindowStore((state) => state.fullscreen)
  const lock = useAuthStore((state) => state.lock)
  const logout = useAuthStore((state) => state.logout)

  // 锁屏前检查是否设置了密码
  const handleLock = async () => {
    const hasPassword = await window.api.config.exists('auth.json')

    if (!hasPassword) {
      MessagePlugin.warning('请先在设置中配置锁屏密码')
      return
    }

    const config = (await window.api.config.read('auth.json')) as { lockPassword?: string } | null
    if (!config?.lockPassword) {
      MessagePlugin.warning('请先在设置中配置锁屏密码')
      return
    }

    lock()
  }

  // 退出登录（二次确认）
  const handleLogout = () => {
    const dialog = DialogPlugin.confirm({
      header: '退出登录',
      body: '确定要退出登录吗？退出后需要重新登录。',
      placement: 'center',
      onConfirm: () => {
        logout()
        dialog.hide()
      },
      onCancel: () => dialog.hide(),
      onCloseBtnClick: () => dialog.hide()
    })
  }

  return (
    <div className={`app-header dragable ${isFullScreen ? 'app-header--fullscreen' : ''}`}>
      <IpTag />

      {/* 右侧操作区 */}
      <div className="app-header__actions no-drag">
        <SvgIcon name='lock' className="app-header__btn" size={21} onClick={handleLock} color='var(--hi-color-font-gray)' />
        <SvgIcon name='exit-login' className="app-header__btn" size={24} onClick={handleLogout} color='var(--hi-color-font-gray)'/>
      </div>
    </div>
  )
}
