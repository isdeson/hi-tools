import { useRef, useState, useCallback } from 'react'
import './index.scss'

interface PinInputProps {
  /** 位数，默认 6 */
  length?: number
  /** 输入完成回调 */
  onComplete?: (value: string) => void
  /** 是否密码模式（显示圆点） */
  mask?: boolean
  /** 是否自动聚焦 */
  autoFocus?: boolean
  /** 错误状态 */
  error?: boolean
}

export default function PinInput({
  length = 6,
  onComplete,
  mask = false,
  autoFocus = true,
  error = false
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  // 用 ref 同步保存最新的 values，避免快速输入时闭包拿到旧状态
  const valuesRef = useRef<string[]>(Array(length).fill(''))

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus()
    }
  }, [length])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const val = rawVal.slice(-1)

    if (val && !/^\d$/.test(val)) return

    const newValues = [...valuesRef.current]
    newValues[index] = val
    valuesRef.current = newValues
    setValues(newValues)

    if (val && index < length - 1) {
      focusInput(index + 1)
    }

    // 全部填完触发回调
    if (val && newValues.every((v) => v !== '')) {
      onComplete?.(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentValues = valuesRef.current
      if (currentValues[index]) {
        const newValues = [...currentValues]
        newValues[index] = ''
        valuesRef.current = newValues
        setValues(newValues)
      } else if (index > 0) {
        focusInput(index - 1)
        const newValues = [...currentValues]
        newValues[index - 1] = ''
        valuesRef.current = newValues
        setValues(newValues)
      }
      e.preventDefault()
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

    if (pasteData.length > 0) {
      const newValues = [...valuesRef.current]
      for (let i = 0; i < pasteData.length; i++) {
        newValues[i] = pasteData[i]
      }
      valuesRef.current = newValues
      setValues(newValues)
      focusInput(Math.min(pasteData.length, length - 1))

      if (newValues.every((v) => v !== '')) {
        onComplete?.(newValues.join(''))
      }
    }
  }

  return (
    <div className={`pin-input ${error ? 'pin-input--error' : ''}`} onPaste={handlePaste}>
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type={mask ? 'password' : 'text'}
          inputMode="numeric"
          maxLength={1}
          value={val}
          autoFocus={autoFocus && index === 0}
          className={`pin-input__item ${val ? 'pin-input__item--filled' : ''}`}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}
