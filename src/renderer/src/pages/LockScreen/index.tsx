import { useState, useCallback } from 'react'
import { MessagePlugin, Button } from 'tdesign-react'
import PinInput from '@/components/PinInput'
import { SystemLockedIcon } from 'tdesign-icons-react'
import { useAuthStore } from '@/store/auth'

import './index.scss'

interface LockScreenProps {
  onUnlock: () => void
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [error, setError] = useState(false)
  const logout = useAuthStore((s) => s.logout)

  const handleComplete = useCallback(async (password: string) => {
    setError(false)

    const success = await window.api.auth.verifyLockPassword(password)

    if (success) {
      onUnlock()
    } else {
      setError(true)
      MessagePlugin.error('密码错误')
      // 抖动后重置
      setTimeout(() => setError(false), 500)
    }
  }, [onUnlock])

  return (
    <div className="lock-screen">
      <div className="lock-screen__content">
        <div className="lock-screen__icon">
          <SystemLockedIcon size={70} fillColor={["transparent","transparent"]} strokeColor={["#181818","currentColor"]} strokeWidth={1.5}/>
        </div>
        <h2 className="lock-screen__title">Hi Tools 已锁定</h2>
        <p className="lock-screen__desc">输入 6 位密码解锁</p>
        <PinInput mask onComplete={handleComplete} error={error} />
        <Button
          variant="text"
          className="lock-screen__logout"
          onClick={logout}
        >
          退出登录
        </Button>
      </div>
    </div>
  )
}
