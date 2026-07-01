import { useNetwork } from '@renderer/hooks/useNetwork'
import { useClipboard } from '@/hooks/useClipboard'

import './index.scss'
import { CheckIcon, CopyIcon } from 'tdesign-icons-react'

export const IpTag: React.FC = () => {
  const { loading, localIp } = useNetwork()
  const { copy, copied } = useClipboard()

  return (
    <div className="ip-tag">
      {loading ? '加载中...' : `IP ${localIp || '未知'}`}
      <div className="copy-ip no-drag">
        {copied ? (
          <CheckIcon />
        ) : (
          <span onClick={() => copy(localIp)}>
            <CopyIcon />
          </span>
        )}
      </div>
    </div>
  )
}
