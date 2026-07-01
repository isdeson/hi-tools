import { create } from 'zustand'

/** 快捷跳转链接 */
export interface QuickLink {
  id: string
  name: string
  url: string
  /** 排序值 */
  sort: number
}

/** 项目 */
export interface Project {
  id: string
  /** 项目名称 */
  name: string
  /** 项目图标（默认取名称第一个字符） */
  icon?: string
  /** 项目简介 */
  description?: string
  /** 分类 */
  category: string
  /** 默认跳转 URL */
  url?: string
  /** 快捷跳转列表 */
  links: QuickLink[]
}

/** 分类 */
export interface Category {
  id: string
  name: string
  color: string
}

interface QuickSearchState {
  projects: Project[]
  categories: Category[]
  initialized: boolean
  /** 初始化：从存储加载 */
  init: () => Promise<void>
  /** 保存到存储 */
  save: () => Promise<void>
  /** 添加项目 */
  addProject: (project: Omit<Project, 'id'>) => void
  /** 更新项目 */
  updateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => void
  /** 删除项目 */
  deleteProject: (id: string) => void
  /** 添加分类 */
  addCategory: (name: string) => void
  /** 删除分类 */
  deleteCategory: (id: string) => void
  /** 更新分类 */
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void
  /** 导入数据（全量替换） */
  importData: (data: { projects: Project[]; categories: Category[] }) => void
  /** 增量合并导入 */
  mergeImport: (data: { projects: Project[]; categories: Category[] }) => void
  /** 导入指定项目（增量） */
  importSelected: (projects: Project[], categories: Category[]) => void
  /** 导出全部 */
  exportAll: () => { projects: Project[]; categories: Category[] }
  /** 导出单个项目 */
  exportProject: (id: string) => { projects: Project[]; categories: Category[] }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

/** 默认分类 */
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'frontend', name: '前端', color: '#3b82f6' },
  { id: 'backend', name: '后端', color: '#10b981' },
  { id: 'platform', name: '发布平台', color: '#8b5cf6' },
  { id: 'tool', name: '工具', color: '#f59e0b' },
  { id: 'other', name: '其他', color: '#6366f1' }
]

export const useQuickSearchStore = create<QuickSearchState>((set, get) => ({
  projects: [],
  categories: DEFAULT_CATEGORIES,
  initialized: false,

  init: async () => {
    const data = await window.api.storage.get('quickSearch') as {
      projects?: Project[]
      categories?: Category[]
    } | null

    if (data) {
      // 兼容旧数据：给没有 color 的分类补上默认颜色
      const defaultColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#6366f1', '#ec4899', '#ef4444', '#14b8a6']
      const categories = (data.categories || DEFAULT_CATEGORIES).map((c, i) => ({
        ...c,
        color: c.color || defaultColors[i % defaultColors.length]
      }))

      set({
        projects: data.projects || [],
        categories,
        initialized: true
      })
    } else {
      set({ initialized: true })
    }
  },

  save: async () => {
    const { projects, categories } = get()
    await window.api.storage.set('quickSearch', { projects, categories })
  },

  addProject: (project) => {
    const newProject: Project = { ...project, id: generateId() }
    set((state) => ({ projects: [...state.projects, newProject] }))
    // 异步保存
    setTimeout(() => get().save(), 0)
  },

  updateProject: (id, data) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p))
    }))
    setTimeout(() => get().save(), 0)
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id)
    }))
    setTimeout(() => get().save(), 0)
  },

  addCategory: (name) => {
    // 自动分配颜色
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#6366f1', '#ec4899', '#ef4444', '#14b8a6']
    const idx = get().categories.length % colors.length
    const newCategory: Category = { id: generateId(), name, color: colors[idx] }
    set((state) => ({ categories: [...state.categories, newCategory] }))
    setTimeout(() => get().save(), 0)
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id)
    }))
    setTimeout(() => get().save(), 0)
  },

  updateCategory: (id, data) => {
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c))
    }))
    setTimeout(() => get().save(), 0)
  },

  importData: (data) => {
    set({
      projects: data.projects || [],
      categories: data.categories?.length ? data.categories : DEFAULT_CATEGORIES
    })
    setTimeout(() => get().save(), 0)
  },

  mergeImport: (data) => {
    const { projects, categories } = get()
    // 合并分类：按 id 去重，新增不存在的
    const mergedCategories = [...categories]
    for (const cat of (data.categories || [])) {
      if (!mergedCategories.find((c) => c.id === cat.id)) {
        mergedCategories.push(cat)
      }
    }
    // 合并项目：已存在的按名称匹配覆盖，不存在的新增
    const mergedProjects = [...projects]
    for (const p of (data.projects || [])) {
      const existingIndex = mergedProjects.findIndex((ep) => ep.name === p.name)
      if (existingIndex >= 0) {
        // 合并：保留本地 id，更新其他字段
        mergedProjects[existingIndex] = { ...mergedProjects[existingIndex], ...p, id: mergedProjects[existingIndex].id }
      } else {
        mergedProjects.push(p)
      }
    }
    set({ projects: mergedProjects, categories: mergedCategories })
    setTimeout(() => get().save(), 0)
  },

  importSelected: (newProjects, newCategories) => {
    const { projects, categories } = get()
    // 合并分类
    const mergedCategories = [...categories]
    for (const cat of newCategories) {
      if (!mergedCategories.find((c) => c.id === cat.id)) {
        mergedCategories.push(cat)
      }
    }
    // 合并项目
    const mergedProjects = [...projects]
    for (const p of newProjects) {
      const existingIndex = mergedProjects.findIndex((ep) => ep.name === p.name)
      if (existingIndex >= 0) {
        mergedProjects[existingIndex] = { ...mergedProjects[existingIndex], ...p, id: mergedProjects[existingIndex].id }
      } else {
        mergedProjects.push(p)
      }
    }
    set({ projects: mergedProjects, categories: mergedCategories })
    setTimeout(() => get().save(), 0)
  },

  exportAll: () => {
    const { projects, categories } = get()
    return { projects, categories }
  },

  exportProject: (id) => {
    const { projects, categories } = get()
    const project = projects.find((p) => p.id === id)
    if (!project) return { projects: [], categories: [] }
    const cat = categories.find((c) => c.id === project.category)
    return { projects: [project], categories: cat ? [cat] : [] }
  }
}))
