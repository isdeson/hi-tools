import { useState } from 'react'

interface UseClipboardOptions {
  successText?: string
}

export function useClipboard(options?: UseClipboardOptions) {
  const [copied, setCopied] = useState(false)

  /**
   * 复制文本到剪贴板
   */
  const copy = async (text: string): Promise<boolean> => {
    if (!text) return false

    try {
      await navigator.clipboard.writeText(text)

      setCopied(true)

      // 2 秒后恢复状态
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      if (options?.successText) {
        console.log(options.successText)
      }

      return true
    } catch (error) {
      console.error('复制失败：', error)
      return false
    }
  }

  return {
    copied,
    copy
  }
}