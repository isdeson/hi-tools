import { create } from 'zustand'

interface AuthState {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 是否锁屏状态 */
  isLocked: boolean
  /** 登录邮箱 */
  email: string
  /** 是否已初始化（从缓存恢复） */
  initialized: boolean
  /** 初始化：从缓存恢复登录状态 */
  init: () => Promise<void>
  /** 登录 */
  login: (email: string) => Promise<void>
  /** 登出 */
  logout: () => Promise<void>
  /** 锁屏 */
  lock: () => void
  /** 解锁 */
  unlock: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLocked: false,
  email: '',
  initialized: false,

  init: async () => {
    const cachedEmail = await window.api.storage.get('auth_email') as string | null
    if (cachedEmail) {
      set({ isLoggedIn: true, email: cachedEmail, initialized: true })
    } else {
      set({ initialized: true })
    }
  },

  login: async (email: string) => {
    await window.api.storage.set('auth_email', email)
    set({ isLoggedIn: true, isLocked: false, email })
  },

  logout: async () => {
    await window.api.storage.remove('auth_email')
    set({ isLoggedIn: false, isLocked: false, email: '' })
  },

  lock: () => set({ isLocked: true }),

  unlock: () => set({ isLocked: false })
}))
