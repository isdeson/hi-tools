import { useState, useCallback, useRef, useEffect } from 'react'
import { Input, Button, MessagePlugin } from 'tdesign-react'
import QRCode from 'qrcode'
import PinInput from '@/components/PinInput'

import './index.scss'

interface LoginProps {
  onSuccess: (account: string) => void
}

type LoginMode = 'phone' | 'email' | 'qrcode'
type FormStep = 'input' | 'code'

/**
 * 格式化手机号为 344 格式
 */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

/**
 * 获取手机号纯数字
 */
function getPhoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export default function Login({ onSuccess }: LoginProps) {
  const [mode, setMode] = useState<LoginMode>('phone')

  // 表单状态
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [formStep, setFormStep] = useState<FormStep>('input')
  const [code, setCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState(false)
  const codeRef = useRef('')

  // 扫码状态
  const [qrStatus, setQrStatus] = useState<'waiting' | 'scanned' | 'confirmed' | 'cancelled' | 'expired'>('waiting')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)

  // 当前账号
  const currentAccount = mode === 'phone' ? getPhoneDigits(phone) : email

  // 校验：中国大陆手机号（1开头第二位3-9，共11位）
  const isValidPhone = (val: string): boolean => /^1[3-9]\d{9}$/.test(val)
  const isValidEmail = (val: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  // 切换 Tab 时重置表单
  const handleSwitchMode = (newMode: LoginMode) => {
    setMode(newMode)
    setFormStep('input')
    setCode('')
    setInputCode('')
    setError(false)
  }

  // 获取验证码
  const handleGetCode = useCallback(async () => {
    if (mode === 'phone') {
      const digits = getPhoneDigits(phone)
      if (!digits) {
        MessagePlugin.warning('请输入手机号')
        return
      }
      if (!isValidPhone(digits)) {
        MessagePlugin.warning('请输入有效的手机号')
        return
      }
    } else {
      if (!email.trim()) {
        MessagePlugin.warning('请输入邮箱地址')
        return
      }
      if (!isValidEmail(email)) {
        MessagePlugin.warning('请输入有效的邮箱格式')
        return
      }
    }

    const generatedCode = await window.api.auth.generateCode(currentAccount)
    codeRef.current = generatedCode
    setCode(generatedCode)
    setInputCode('')
    setFormStep('code')
  }, [mode, phone, email, currentAccount])

  // PinInput 输入完成
  const handlePinComplete = useCallback((value: string) => {
    setInputCode(value)
    if (value === codeRef.current) {
      MessagePlugin.success('登录成功')
      onSuccess(currentAccount)
    } else {
      setError(true)
      MessagePlugin.error('验证码错误')
      setTimeout(() => setError(false), 500)
    }
  }, [currentAccount, onSuccess])

  // 手动确认登录
  const handleConfirm = useCallback(() => {
    if (!inputCode || inputCode.length !== 6) {
      MessagePlugin.warning('请输入完整的6位验证码')
      return
    }
    if (inputCode === codeRef.current) {
      MessagePlugin.success('登录成功')
      onSuccess(currentAccount)
    } else {
      setError(true)
      MessagePlugin.error('验证码错误')
      setTimeout(() => setError(false), 500)
    }
  }, [inputCode, currentAccount, onSuccess])

  // 手机号输入处理
  const handlePhoneChange = (val: string | number) => {
    setPhone(formatPhone(String(val)))
  }

  // 启动扫码登录
  const startQrLogin = useCallback(async () => {
    setQrLoading(true)
    setQrStatus('waiting')
    try {
      const url = await window.api.qrLogin.start()
      const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2 })
      setQrDataUrl(dataUrl)
    } catch {
      MessagePlugin.error('启动扫码服务失败')
    } finally {
      setQrLoading(false)
    }
  }, [])

  // 监听扫码状态
  useEffect(() => {
    if (mode === 'qrcode') {
      startQrLogin()

      window.api.qrLogin.onScanned(() => {
        setQrStatus('scanned')
      })

      window.api.qrLogin.onConfirmed(() => {
        setQrStatus('confirmed')
        MessagePlugin.success('登录成功')
        onSuccess('qrcode-user')
      })

      window.api.qrLogin.onCancelled(() => {
        setQrStatus('cancelled')
      })

      window.api.qrLogin.onExpired(() => {
        setQrStatus('expired')
      })

      return () => {
        window.api.qrLogin.removeAllListeners()
        window.api.qrLogin.stop()
      }
    }
  }, [mode, startQrLogin, onSuccess])

  // 渲染表单输入（手机号/邮箱共享结构）
  const renderFormInput = () => {
    if (formStep === 'input') {
      return (
        <>
          <p className="login-form__desc">
            {mode === 'phone' ? '输入手机号获取验证码' : '输入邮箱地址获取验证码'}
          </p>
          <Input
            value={mode === 'phone' ? phone : email}
            onChange={(val) => mode === 'phone' ? handlePhoneChange(val) : setEmail(val as string)}
            placeholder={mode === 'phone' ? '请输入手机号' : '请输入邮箱'}
            size="large"
            onEnter={handleGetCode}
          />
          <Button
            theme="primary"
            size="large"
            block
            onClick={handleGetCode}
            style={{ marginTop: 26 }}
          >
            获取验证码
          </Button>
        </>
      )
    }

    return (
      <>
        <p className="login-form__desc">你的验证码为 <strong className="login-form__code-inline">{code}</strong></p>
       <div className="login-form__pin-input">
         <PinInput  onComplete={handlePinComplete} error={error} />
       </div>
        <Button
          theme="primary"
          size="large"
          block
          onClick={handleConfirm}
          style={{ marginTop: 20 }}
        >
          确认登录
        </Button>
        <div className="login-form__actions">
          <button className="login-form__text-btn" onClick={handleGetCode}>
            重新获取
          </button>
          <button className="login-form__text-btn" onClick={() => setFormStep('input')}>
            {mode === 'phone' ? '更换手机号' : '更换邮箱'}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="login-page">
      {/* 左侧插图区 */}
      <div className="login-page__left"></div>

      {/* 右侧表单区 */}
      <div className="login-page__right">
        <div className="login-form">
          {/* Tab 切换 */}
          <div className="login-form__tabs">
            <button
              className={`login-form__tab ${mode === 'phone' ? 'login-form__tab--active' : ''}`}
              onClick={() => handleSwitchMode('phone')}
            >
              手机号登录
            </button>
            <button
              className={`login-form__tab ${mode === 'email' ? 'login-form__tab--active' : ''}`}
              onClick={() => handleSwitchMode('email')}
            >
              邮箱登录
            </button>
            <button
              className={`login-form__tab ${mode === 'qrcode' ? 'login-form__tab--active' : ''}`}
              onClick={() => handleSwitchMode('qrcode')}
            >
              扫码登录
            </button>
          </div>

          {/* 手机号/邮箱登录 */}
          {(mode === 'phone' || mode === 'email') && (
            <div className="login-form__content">
              {renderFormInput()}
            </div>
          )}

          {/* 扫码登录 */}
          {mode === 'qrcode' && (
            <div className="login-form__content login-form__qr">
              {qrLoading ? (
                <div className="login-form__qr-loading">加载中...</div>
              ) : qrDataUrl ? (
                <div className="login-form__qr-wrapper">
                  <img className="login-form__qr-img" src={qrDataUrl} alt="登录二维码" />
                  {qrStatus !== 'waiting' && (
                    <div className="login-form__qr-mask">
                      {qrStatus === 'scanned' && <span>已扫码，请在手机上确认</span>}
                      {qrStatus === 'confirmed' && <span>已确认，正在登录...</span>}
                      {qrStatus === 'cancelled' && <span>已取消</span>}
                      {qrStatus === 'expired' && <span>二维码已过期</span>}
                    </div>
                  )}
                </div>
              ) : null}
              <p className="login-form__qr-desc">使用手机扫描二维码登录</p>
              <button className="login-form__qr-refresh" onClick={startQrLogin}>
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                  <path d="M40 24C40 32.84 32.84 40 24 40C15.16 40 8 32.84 8 24C8 15.16 15.16 8 24 8C29.52 8 34.4 10.72 37.4 14.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M36 6V16H26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>刷新二维码</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
