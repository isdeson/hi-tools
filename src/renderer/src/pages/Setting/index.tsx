import { useState, useEffect } from 'react'
import { Button, MessagePlugin, DialogPlugin } from 'tdesign-react'
import PinInput from '@/components/PinInput'

import './index.scss'

export default function Setting() {
  const [hasPassword, setHasPassword] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)
  const [step, setStep] = useState<'new' | 'confirm'>('new')
  const [newPassword, setNewPassword] = useState('')

  const checkPassword = async () => {
    const config = (await window.api.config.read('auth.json')) as { lockPassword?: string } | null
    setHasPassword(!!config?.lockPassword)
  }

  // 检查是否已设置密码
  useEffect(() => {
    checkPassword()
  }, [])

  const handleClearCache = () => {
    const dialog = DialogPlugin.confirm({
      header: '清空缓存',
      body: '确定要清空所有网络缓存和本地存储数据吗？此操作不可恢复。',
      placement: 'center',
      onConfirm: async () => {
        try {
          await window.api.cache.clear()
          MessagePlugin.success('缓存已清空')
        } catch {
          MessagePlugin.error('清空缓存失败')
        }
        dialog.hide()
      },
      onCancel: () => dialog.hide(),
      onCloseBtnClick: () => dialog.hide()
    })
  }

  // 第一步：输入新密码
  const handleNewPassword = (value: string) => {
    setNewPassword(value)
    setStep('confirm')
  }

  // 第二步：确认密码
  const handleConfirmPassword = async (value: string) => {
    if (value !== newPassword) {
      MessagePlugin.error('两次输入不一致，请重新设置')
      setStep('new')
      setNewPassword('')
      return
    }

    const result = await window.api.auth.setLockPassword(value)
    if (result.success) {
      MessagePlugin.success('锁屏密码设置成功')
      setShowSetPassword(false)
      setHasPassword(true)
      setStep('new')
      setNewPassword('')
    } else {
      MessagePlugin.error(result.message)
    }
  }

  return (
    <div className="setting-page">
      <h3 className="page__title">设置</h3>

      {/* 锁屏密码 */}
      <div className="setting-section">
        <div className="setting-section__header">
          <span className="setting-section__label">锁屏密码</span>
          <span className="setting-section__status">{hasPassword ? '已设置' : '未设置'}</span>
        </div>

        {!showSetPassword ? (
          <Button
            style={{ width: '100px' }}
            onClick={() => {
              setShowSetPassword(true)
              setStep('new')
              setNewPassword('')
            }}
          >
            {hasPassword ? '修改密码' : '设置密码'}
          </Button>
        ) : (
          <div className="setting-section__password">
            <p className="setting-section__tip">
              {step === 'new' ? '请输入6位数字密码' : '请再次输入确认'}
            </p>
            <div className="setting-section__pin-row">
              {step === 'new' && <PinInput key="new" mask onComplete={handleNewPassword} />}
              {step === 'confirm' && (
                <PinInput key="confirm" mask onComplete={handleConfirmPassword} />
              )}
              <Button
                style={{ width: '100px' }}
                shape="round"
                variant="outline"
                theme='primary'
                onClick={() => {
                  setShowSetPassword(false)
                  setStep('new')
                  setNewPassword('')
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 清空缓存 */}
      <div className="setting-section">
        <div className="setting-section__header">
          <span className="setting-section__label">缓存管理</span>
        </div>
        <Button style={{ width: '100px' }} theme="danger" onClick={handleClearCache}>
          清空缓存
        </Button>
        <p className="setting-section__desc">清空网络缓存和本地存储数据</p>
      </div>
    </div>
  )
}
