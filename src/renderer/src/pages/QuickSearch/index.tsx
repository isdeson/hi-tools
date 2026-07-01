import { useEffect, useState, useMemo } from 'react'
import { Button, Input, MessagePlugin, DialogPlugin } from 'tdesign-react'
import { useQuickSearchStore, Project, Category } from '@/store/quickSearch'
import dayjs from 'dayjs'
import { matchPinyin } from '@/utils/pinyinSearch'
import SvgIcon from '@/components/SvgIcon'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import CategoryEditor from './CategoryEditor'
import ImportDialog from './ImportDialog'
import { useContextMenu, ContextMenuGroup } from '@/hooks/useContextMenu'
import ContextMenu from '@/components/ContextMenu'

import './index.scss'
import {
  AddIcon,
  ExportIcon,
  ImportIcon,
  SearchIcon,
  BrowseIcon,
  Edit1Icon,
  DeleteIcon,
  LinkIcon
} from 'tdesign-icons-react'

export default function QuickSearch() {
  const {
    projects,
    categories,
    initialized,
    init,
    addProject,
    updateProject,
    deleteProject,
    addCategory,
    deleteCategory,
    updateCategory,
    mergeImport,
    importSelected,
    exportAll,
    exportProject
  } = useQuickSearchStore()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [importData, setImportData] = useState<{
    projects: Project[]
    categories: Category[]
  } | null>(null)

  // 项目卡片右键菜单
  const { menuState, showMenu, hideMenu } = useContextMenu()
  const [contextTarget, setContextTarget] = useState<Project | null>(null)

  // 分类胶囊右键菜单
  const { menuState: catMenuState, showMenu: showCatMenu, hideMenu: hideCatMenu } = useContextMenu()
  const [catContextTarget, setCatContextTarget] = useState<Category | null>(null)

  // 项目卡片右键菜单分组
  const projectMenuGroups: ContextMenuGroup[] = useMemo(
    () => [
      [
        { key: 'open', label: '打开链接', icon: <BrowseIcon size={16} /> },
        { key: 'copyUrl', label: '复制链接', icon: <LinkIcon size={16} /> }
      ],
      [
        { key: 'edit', label: '编辑', icon: <Edit1Icon size={16} /> },
        { key: 'export', label: '导出', icon: <ExportIcon size={16} /> }
      ],
      [
        { key: 'delete', label: '删除', icon: <DeleteIcon size={16} />, color: 'var(--td-error-color)' }
      ]
    ],
    []
  )

  // 分类胶囊右键菜单分组
  const categoryMenuGroups: ContextMenuGroup[] = useMemo(
    () => [
      [
        { key: 'editCat', label: '编辑分类', icon: <Edit1Icon size={16} /> }
      ],
      [
        { key: 'deleteCat', label: '删除分类', icon: <DeleteIcon size={16} />, color: 'var(--td-error-color)' }
      ]
    ],
    []
  )

  // 分类右键菜单触发
  const handleCatContextMenu = (e: React.MouseEvent, cat: Category) => {
    setCatContextTarget(cat)
    showCatMenu(e)
  }

  // 分类右键菜单点击
  const handleCatMenuClick = (key: string) => {
    hideCatMenu()
    if (!catContextTarget) return
    switch (key) {
      case 'editCat':
        setEditingCategory(catContextTarget)
        break
      case 'deleteCat':
        handleCategoryDelete(catContextTarget.id)
        break
    }
  }

  // 右键菜单触发
  const handleCardContextMenu = (e: React.MouseEvent, project: Project) => {
    setContextTarget(project)
    showMenu(e)
  }

  // 右键菜单点击
  const handleMenuClick = (key: string) => {
    hideMenu()
    if (!contextTarget) return
    switch (key) {
      case 'open':
        if (contextTarget.url) handleOpenUrl(contextTarget.url)
        break
      case 'copyUrl':
        if (contextTarget.url) {
          navigator.clipboard.writeText(contextTarget.url)
          MessagePlugin.success('已复制链接')
        }
        break
      case 'edit':
        handleEdit(contextTarget)
        break
      case 'export':
        handleExportProject(contextTarget.id)
        break
      case 'delete':
        handleDelete(contextTarget.id)
        break
    }
  }

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  // 获取分类下项目数量
  // const getCategoryCount = (catId: string) => {
  //   return projects.filter((p) => p.category === catId).length
  // }

  // 按分类 + 搜索筛选
  const filteredProjects = projects.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (searchKeyword) {
      const nameMatch = matchPinyin(p.name, searchKeyword)
      const descMatch = p.description ? matchPinyin(p.description, searchKeyword) : false
      if (!nameMatch && !descMatch) return false
    }
    return true
  })

  // 打开浏览器
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank')
  }

  // 编辑项目
  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  // 删除项目
  const handleDelete = (id: string) => {
    const deleteDialog = DialogPlugin.confirm({
      header: '删除项目',
      body: '删除后不可恢复，确定要删除该项目吗？',
      placement: 'center',
      onConfirm: () => {
        deleteProject(id)
        MessagePlugin.success('已删除')
        deleteDialog.hide()
      },
      onCancel: () => {
        deleteDialog.hide()
      },
      onCloseBtnClick: () => {
        deleteDialog.hide()
      }
    })
  }

  // 表单提交
  const handleFormSubmit = (data: Omit<Project, 'id'>) => {
    if (editingProject) {
      updateProject(editingProject.id, data)
      MessagePlugin.success('已更新')
    } else {
      addProject(data)
      MessagePlugin.success('已添加')
    }
    setShowForm(false)
    setEditingProject(null)
  }

  // 导出全部
  const handleExportAll = () => {
    const data = exportAll()
    downloadJson(data, 'hi-tools-all')
  }

  // 导出单个项目
  const handleExportProject = (id: string) => {
    const data = exportProject(id)
    const project = data.projects[0]
    downloadJson(data, project ? project.name : 'project')
  }

  // 下载 JSON
  const downloadJson = (data: unknown, name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}-${dayjs().format('YYYY-MM-DD')}.json`
    a.click()
    URL.revokeObjectURL(url)
    MessagePlugin.success('导出成功')
  }

  // 导入：打开文件选择
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.projects) {
          setImportData(data)
        } else {
          MessagePlugin.error('文件格式不正确')
        }
      } catch {
        MessagePlugin.error('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  // 分类编辑保存（支持新建）
  const handleCategorySave = (id: string | null, data: { name: string; color: string }) => {
    if (id) {
      updateCategory(id, data)
      MessagePlugin.success('分类已更新')
    } else {
      addCategory(data.name)
      // 新建后更新颜色（addCategory 自动分配了颜色，需要覆盖）
      const newest = useQuickSearchStore.getState().categories.slice(-1)[0]
      if (newest) updateCategory(newest.id, { color: data.color })
      MessagePlugin.success('分类已创建')
    }
    setEditingCategory(null)
    setShowCategoryInput(false)
  }

  // 分类删除（二次确认）
  const handleCategoryDelete = (id: string) => {
    const dialog = DialogPlugin.confirm({
      header: '删除分类',
      body: '删除分类后，该分类下的项目不会被删除。确定要删除吗？',
      placement: 'center',
      onConfirm: () => {
        deleteCategory(id)
        setEditingCategory(null)
        if (activeCategory === id) setActiveCategory('all')
        MessagePlugin.success('分类已删除')
        dialog.hide()
      },
      onCancel: () => dialog.hide(),
      onCloseBtnClick: () => dialog.hide()
    })
  }

  if (!initialized) return null

  return (
    <div className="quick-search">
      {/* 顶部操作栏 */}
      <div className="quick-search__header">
         <h3 className="page__title">哈查查</h3>

        <div className="quick-search__toolbar">
          <Input
            className="quick-search__search"
            value={searchKeyword}
            onChange={(v) => setSearchKeyword(v as string)}
            placeholder="输入名称、简介搜索、支持拼音搜索"
            clearable
            prefixIcon={<SearchIcon />}
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="quick-search__categories">
        <Button
          theme="primary"
          shape="round"
          variant={activeCategory === 'all' ? 'base' : 'outline'}
          ghost={activeCategory !== 'all'}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            theme="primary"
            shape="round"
            variant={activeCategory === cat.id ? 'base' : 'outline'}
            ghost={activeCategory !== cat.id}
            onClick={() => setActiveCategory(cat.id)}
            onContextMenu={(e) => handleCatContextMenu(e, cat)}
          >
            {cat.name}
          </Button>
        ))}
        <Button
          theme="primary"
          shape="round"
          variant="outline"
          ghost
          onClick={() => setShowCategoryInput(true)}
        >
          <AddIcon />
        </Button>
      </div>

      {/* 项目列表 */}
      <div
        className={`quick-search__grid ${filteredProjects.length === 0 ? 'quick-search__grid--empty' : ''}`}
      >
        {filteredProjects.length === 0 ? (
          <div className="quick-search__empty">
            <SvgIcon name="empty" size={120} color="var(--hi-color-font-gray)" />
            <p>暂无数据</p>
            <Button
              icon={<AddIcon />}
              className="quick-search__empty-add"
              size="medium"
              shape="round"
              theme="primary"
              onClick={() => {
                setEditingProject(null)
                setShowForm(true)
              }}
            >
              添加项目
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              category={categories.find((c) => c.id === project.category)}
              selectMode={false}
              selected={false}
              onSelect={() => {}}
              onOpen={handleOpenUrl}
              onContextMenu={(e) => handleCardContextMenu(e, project)}
            />
          ))
        )}
      </div>

      {/* 悬浮添加按钮 */}
      <div className="quick-search__fab-buttons">
        <Button
          theme="primary"
          className="quick-search__fab-buttons-item"
          onClick={() => {
            setEditingProject(null)
            setShowForm(true)
          }}
          title="添加项目"
        >
          <AddIcon size={22} />
        </Button>

        <Button
          theme="primary"
          className="quick-search__fab-buttons-item"
          onClick={handleImport}
          title="导入项目"
        >
          <ImportIcon size={22} />
        </Button>
        
        <Button
          theme="primary"
          className="quick-search__fab-buttons-item"
          onClick={handleExportAll}
          title="导出项目"
        >
          <ExportIcon size={22} />
        </Button>
      </div>

      {/* 添加/编辑项目弹窗 */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          categories={categories}
          defaultCategory={activeCategory !== 'all' ? activeCategory : undefined}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingProject(null)
          }}
        />
      )}

      {/* 编辑/新建分类弹窗 */}
      {(editingCategory || showCategoryInput) && (
        <CategoryEditor
          category={editingCategory}
          onSave={handleCategorySave}
          onDelete={handleCategoryDelete}
          onClose={() => {
            setEditingCategory(null)
            setShowCategoryInput(false)
          }}
        />
      )}

      {/* 导入选择弹窗 */}
      {importData && (
        <ImportDialog
          data={importData}
          onImportAll={() => {
            mergeImport(importData)
            setImportData(null)
            MessagePlugin.success('全部导入成功')
          }}
          onImportSelected={(selectedProjects, selectedCategories) => {
            importSelected(selectedProjects, selectedCategories)
            setImportData(null)
            MessagePlugin.success('导入成功')
          }}
          onClose={() => setImportData(null)}
        />
      )}

      {/* 项目卡片右键菜单 */}
      <ContextMenu
        visible={menuState.visible}
        x={menuState.x}
        y={menuState.y}
        groups={projectMenuGroups}
        onClick={handleMenuClick}
      />

      {/* 分类胶囊右键菜单 */}
      <ContextMenu
        visible={catMenuState.visible}
        x={catMenuState.x}
        y={catMenuState.y}
        groups={categoryMenuGroups}
        onClick={handleCatMenuClick}
      />
    </div>
  )
}
