import { useEffect } from 'react'
import { useWindowEvents } from '@/hooks/useWindowEvents'
import { useAuthStore } from '@/store/auth'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import Login from '@/pages/Login'
import LockScreen from '@/pages/LockScreen'

import './App.scss'

function App(): React.JSX.Element {
  useWindowEvents()

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isLocked = useAuthStore((state) => state.isLocked)
  const initialized = useAuthStore((state) => state.initialized)
  const init = useAuthStore((state) => state.init)
  const login = useAuthStore((state) => state.login)
  const unlock = useAuthStore((state) => state.unlock)

  // 初始化：从缓存恢复登录状态
  useEffect(() => {
    init()
  }, [init])

  // 未初始化时显示空白，避免闪烁
  if (!initialized) {
    return <div className="app" />
  }

  // 未登录：显示登录页
  if (!isLoggedIn) {
    return <Login onSuccess={(email) => login(email)} />
  }

  return (
    <div className="app">
      <RouterProvider router={router} />

      {/* 锁屏覆盖层 */}
      {isLocked && <LockScreen onUnlock={unlock} />}
    </div>
  )
}

export default App
