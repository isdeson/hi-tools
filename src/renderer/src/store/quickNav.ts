import { create } from 'zustand'

/** 快捷导航项 */
export interface NavItem {
  id: string
  /** 显示名称 */
  name: string
  /** 跳转链接 */
  url: string
  /** 图标（emoji 或首字符） */
  icon?: string
  /** 排序值，数字越小越靠前 */
  sort: number
  /** 是否置顶收藏 */
  pinned?: boolean
}

interface QuickNavState {
  items: NavItem[]
  initialized: boolean
  /** 初始化：从存储加载 */
  init: () => Promise<void>
  /** 保存到存储 */
  save: () => Promise<void>
  /** 添加导航项 */
  addItem: (data: Omit<NavItem, 'id' | 'sort'>) => void
  /** 更新导航项 */
  updateItem: (id: string, data: Partial<Omit<NavItem, 'id'>>) => void
  /** 删除导航项 */
  deleteItem: (id: string) => void
  /** 切换置顶状态 */
  togglePin: (id: string) => void
  /** 上移排序 */
  moveUp: (id: string) => void
  /** 下移排序 */
  moveDown: (id: string) => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

/** 排序规则：置顶优先，同级按 sort 升序 */
function sortItems(items: NavItem[]): NavItem[] {
  return [...items].sort((a, b) => {
    // 置顶项排在前面
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    // 同级按 sort 升序
    return a.sort - b.sort
  })
}

export const useQuickNavStore = create<QuickNavState>((set, get) => ({
  items: [],
  initialized: false,

  init: async () => {
    const data = (await window.api.storage.get('quickNav')) as NavItem[] | null
    if (data && Array.isArray(data)) {
      set({ items: sortItems(data), initialized: true })
    } else {
      set({ initialized: true })
    }
  },

  save: async () => {
    const { items } = get()
    await window.api.storage.set('quickNav', items)
  },

  addItem: (data) => {
    const { items } = get()
    const maxSort = items.length > 0 ? Math.max(...items.map((i) => i.sort)) : 0
    const newItem: NavItem = { ...data, id: generateId(), sort: maxSort + 1 }
    set((state) => ({ items: sortItems([...state.items, newItem]) }))
    setTimeout(() => get().save(), 0)
  },

  updateItem: (id, data) => {
    set((state) => ({
      items: sortItems(state.items.map((item) => (item.id === id ? { ...item, ...data } : item)))
    }))
    setTimeout(() => get().save(), 0)
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    }))
    setTimeout(() => get().save(), 0)
  },

  togglePin: (id) => {
    set((state) => ({
      items: sortItems(
        state.items.map((item) =>
          item.id === id ? { ...item, pinned: !item.pinned } : item
        )
      )
    }))
    setTimeout(() => get().save(), 0)
  },

  moveUp: (id) => {
    const { items } = get()
    const idx = items.findIndex((i) => i.id === id)
    if (idx <= 0) return
    // 和前一个交换 sort 值
    const prev = items[idx - 1]
    const curr = items[idx]
    const tempSort = curr.sort
    set((state) => ({
      items: sortItems(
        state.items.map((item) => {
          if (item.id === curr.id) return { ...item, sort: prev.sort }
          if (item.id === prev.id) return { ...item, sort: tempSort }
          return item
        })
      )
    }))
    setTimeout(() => get().save(), 0)
  },

  moveDown: (id) => {
    const { items } = get()
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0 || idx >= items.length - 1) return
    // 和后一个交换 sort 值
    const next = items[idx + 1]
    const curr = items[idx]
    const tempSort = curr.sort
    set((state) => ({
      items: sortItems(
        state.items.map((item) => {
          if (item.id === curr.id) return { ...item, sort: next.sort }
          if (item.id === next.id) return { ...item, sort: tempSort }
          return item
        })
      )
    }))
    setTimeout(() => get().save(), 0)
  }
}))
