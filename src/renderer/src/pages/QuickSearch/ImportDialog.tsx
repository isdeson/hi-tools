import { useState } from 'react'
import { Button, Checkbox, Dialog } from 'tdesign-react'
import { Project, Category } from '@/store/quickSearch'

import './ImportDialog.scss'

interface ImportDialogProps {
  data: { projects: Project[]; categories: Category[] }
  onImportAll: () => void
  onImportSelected: (projects: Project[], categories: Category[]) => void
  onClose: () => void
}

export default function ImportDialog({
  data,
  onImportAll,
  onImportSelected,
  onClose
}: ImportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectAll = () => {
    if (selectedIds.length === data.projects.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.projects.map((p) => p.id))
    }
  }

  const handleImportSelected = () => {
    const selected = data.projects.filter((p) => selectedIds.includes(p.id))
    const categoryIds = [...new Set(selected.map((p) => p.category))]
    const categories = data.categories.filter((c) => categoryIds.includes(c.id))
    onImportSelected(selected, categories)
  }

  return (
    <Dialog
      visible
      attach="body"
      placement="center"
      header={`导入项目（共 ${data.projects.length} 个）`}
      width={550}
      onClose={onClose}
      footer={
        <div className="import-dialog__footer">
          <Button variant="outline" onClick={selectAll}>
            {selectedIds.length === data.projects.length ? '取消全选' : '全选'}
          </Button>
          <div className="import-dialog__footer-right">
            <Button variant="outline" onClick={onImportAll} style={{ width: '100px' }}>
              全部导入
            </Button>
            <Button
              theme="primary"
              onClick={handleImportSelected}
              disabled={selectedIds.length === 0}
              style={{ width: '150px' }}
            >
              导入选中 ({selectedIds.length})
            </Button>
          </div>
        </div>
      }
    >
      <div className="import-dialog__list">
        {data.projects.map((project) => {
          return (
            <div
              key={project.id}
              className="import-dialog__item"
              onClick={() => toggleSelect(project.id)}
            >
              <Checkbox checked={selectedIds.includes(project.id)} />
              <div className="import-dialog__item-infos">
                <div className="import-dialog__item-name">{project.name}</div>
                {project.description && (
                  <div className="import-dialog__item-desc">{project.description}</div>
                )}
              </div>
            </div>
          )
        })}
        {data.projects.map((project) => {
          return (
            <div
              key={project.id}
              className="import-dialog__item"
              onClick={() => toggleSelect(project.id)}
            >
              <Checkbox checked={selectedIds.includes(project.id)} />
              <div className="import-dialog__item-infos">
                <div className="import-dialog__item-name">{project.name}</div>
                {project.description && (
                  <div className="import-dialog__item-desc">{project.description}</div>
                )}
              </div>
            </div>
          )
        })}
        {data.projects.map((project) => {
          return (
            <div
              key={project.id}
              className="import-dialog__item"
              onClick={() => toggleSelect(project.id)}
            >
              <Checkbox checked={selectedIds.includes(project.id)} />
              <div className="import-dialog__item-infos">
                <div className="import-dialog__item-name">{project.name}</div>
                {project.description && (
                  <div className="import-dialog__item-desc">{project.description}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Dialog>
  )
}
