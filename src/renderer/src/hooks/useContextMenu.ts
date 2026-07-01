import { useState, useEffect, useCallback } from 'react'

/** 菜单项定义 */
export interface ContextMenuItem {
  /** 唯一标识 */
  key: string
  /** 显示文本 */
  label: string
  /** 图标 ReactNode（由调用方传入） */
  icon?: React.ReactNode
  /** 自定义颜色（如红色删除项） */
  color?: string
  /** 是否禁用 */
  disabled?: boolean
}

/** 菜单分组：每个分组是一组菜单项，组与组之间自动渲染分隔线 */
export type ContextMenuGroup = ContextMenuItem[]

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
}

/**
 * 通用右键菜单 Hook
 * 返回菜单状态、触发方法和关闭方法
 */
export function useContextMenu() {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0
  })

  // 打开右键菜单
  const showMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuState({ visible: true, x: e.clientX, y: e.clientY })
  }, [])

  // 关闭菜单
  const hideMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, visible: false }))
  }, [])

  // 点击其他区域 / 右键其他区域 关闭菜单
  useEffect(() => {
    if (!menuState.visible) return
    const handleClose = () => hideMenu()
    document.addEventListener('click', handleClose)
    document.addEventListener('contextmenu', handleClose)
    return () => {
      document.removeEventListener('click', handleClose)
      document.removeEventListener('contextmenu', handleClose)
    }
  }, [menuState.visible, hideMenu])

  return { menuState, showMenu, hideMenu }
}
