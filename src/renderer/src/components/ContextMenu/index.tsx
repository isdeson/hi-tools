import { useRef, useEffect } from 'react'
import { ContextMenuGroup } from '@/hooks/useContextMenu'
import './index.scss'

interface ContextMenuProps {
  /** 是否显示 */
  visible: boolean
  /** 菜单定位 x 坐标（鼠标位置） */
  x: number
  /** 菜单定位 y 坐标（鼠标位置） */
  y: number
  /** 菜单项分组列表，组与组之间渲染分隔线 */
  groups: ContextMenuGroup[]
  /** 点击菜单项回调 */
  onClick: (key: string) => void
}

/**
 * 通用右键菜单组件（仿 Figma 桌面端风格）
 * 支持分组、自定义颜色、边界翻转
 */
export default function ContextMenu({ visible, x, y, groups, onClick }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // 边界检测：右侧/底部放不下时翻转到鼠标左侧/上方
  useEffect(() => {
    if (!visible || !menuRef.current) return
    const el = menuRef.current
    const rect = el.getBoundingClientRect()
    const viewW = window.innerWidth
    const viewH = window.innerHeight

    // 水平方向：优先右侧，放不下就翻到鼠标左侧
    let adjustedX = x
    if (x + rect.width > viewW) {
      adjustedX = x - rect.width
    }
    if (adjustedX < 4) adjustedX = 4

    // 垂直方向：优先下方，放不下就翻到鼠标上方
    let adjustedY = y
    if (y + rect.height > viewH) {
      adjustedY = y - rect.height
    }
    if (adjustedY < 4) adjustedY = 4

    el.style.left = `${adjustedX}px`
    el.style.top = `${adjustedY}px`
  }, [visible, x, y])

  if (!visible) return null

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="context-menu__group">
          {/* 组间分隔线（第一组不加） */}
          {groupIndex > 0 && <div className="context-menu__divider" />}
          {group.map((item) => (
            <div
              key={item.key}
              className={[
                'context-menu__item',
                item.disabled ? 'context-menu__item--disabled' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              style={item.color ? { color: item.color } : undefined}
              onClick={() => {
                if (item.disabled) return
                onClick(item.key)
              }}
            >
              {item.icon && <span className="context-menu__item-icon">{item.icon}</span>}
              <span className="context-menu__item-label">{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
