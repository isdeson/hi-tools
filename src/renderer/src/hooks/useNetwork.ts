import { useEffect, useState } from 'react'

interface NetworkInfo {
  /** 当前局域网 IP */
  localIp: string
  loading: boolean
}

export function useNetwork(): NetworkInfo {
  const [localIp, setLocalIp] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNetworkInfo() {
      try {
        const localIp = await window.api.getLocalIp()
        setLocalIp(localIp)
      } catch (error) {
        console.error('获取网络信息失败：', error)
      } finally {
        setLoading(false)
      }
    }

    loadNetworkInfo()
  }, [])

  return {
    localIp,
    loading
  }
}