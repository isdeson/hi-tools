import { useState, useRef } from 'react'
import { Input, Button, Select, MessagePlugin, Dialog } from 'tdesign-react'
import { Project, QuickLink, Category } from '@/store/quickSearch'

import './ProjectForm.scss'
import { AddIcon, CloseIcon, ViewListIcon } from 'tdesign-icons-react'

interface ProjectFormProps {
  project: Project | null
  categories: Category[]
  defaultCategory?: string
  onSubmit: (data: Omit<Project, 'id'>) => void
  onClose: () => void
}

function generateLinkId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

export default function ProjectForm({ project, categories, defaultCategory, onSubmit, onClose }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [category, setCategory] = useState(project?.category || defaultCategory || categories[0]?.id || '')
  const [url, setUrl] = useState(project?.url || '')
  const [links, setLinks] = useState<QuickLink[]>(
    project?.links?.length
      ? [...project.links].sort((a, b) => a.sort - b.sort)
      : []
  )

  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddLink = () => {
    setLinks([...links, { id: generateLinkId(), name: '', url: '', sort: links.length }])
  }

  const handleUpdateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleDragStart = (index: number) => { dragIndexRef.current = index }
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index) }
  const handleDrop = (index: number) => {
    const fromIndex = dragIndexRef.current
    if (fromIndex === null || fromIndex === index) { setDragOverIndex(null); return }
    const newLinks = [...links]
    const [moved] = newLinks.splice(fromIndex, 1)
    newLinks.splice(index, 0, moved)
    setLinks(newLinks)
    dragIndexRef.current = null
    setDragOverIndex(null)
  }
  const handleDragEnd = () => { dragIndexRef.current = null; setDragOverIndex(null) }

  const handleSubmit = () => {
    if (!name.trim()) { MessagePlugin.warning('请输入项目名称'); return }
    if (!category) { MessagePlugin.warning('请选择分类'); return }
    const validLinks = links.filter((l) => l.name.trim() && l.url.trim()).map((l, i) => ({ ...l, sort: i }))
    onSubmit({ name: name.trim(), description: description.trim() || undefined, category, url: url.trim() || undefined, links: validLinks })
  }

  return (
    <Dialog
      visible
      attach="body"
      placement="center"
      header={project ? '编辑项目' : '添加项目'}
      width={700}
      onClose={onClose}
      footer={
        <div className="project-form__footer">
          <Button theme="primary" variant="outline" onClick={onClose}>取消</Button>
          <Button theme="primary" onClick={handleSubmit}>{project ? '保存' : '添加'}</Button>
        </div>
      }
    >
      <div
        className="project-form__content"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
        }}
      >
        <div className="project-form__left">
          <div className="project-form__field">
            <label>名称</label>
            <Input value={name} onChange={(v) => setName(v as string)} placeholder="项目名称" />
          </div>
          <div className="project-form__field">
            <label>分类</label>
            <Select value={category} onChange={(v) => setCategory(v as string)} options={categories.map((c) => ({ label: c.name, value: c.id }))} />
          </div>
          <div className="project-form__field">
            <label>简介</label>
            <Input value={description} onChange={(v) => setDescription(v as string)} placeholder="一句话简介（可选）" />
          </div>
          <div className="project-form__field">
            <label>跳转地址</label>
            <Input value={url} onChange={(v) => setUrl(v as string)} placeholder="https://（可选）" />
          </div>
        </div>

        <div className="project-form__right">
          <p className="project-form__section-title">外链配置（拖拽可跳转排序）</p>
          <div className="project-form__links">
            {links.map((link, index) => (
              <div
                key={link.id}
                className={`project-form__link-row ${dragOverIndex === index ? 'project-form__link-row--dragover' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                <div className="project-form__link-handle">
                  <ViewListIcon />
                </div>
                <div className="project-form__link-inputs">
                  <Input borderless value={link.name} onChange={(v) => handleUpdateLink(index, 'name', v as string)} placeholder="名称" />
                  <Input borderless value={link.url} onChange={(v) => handleUpdateLink(index, 'url', v as string)} placeholder="https://" />
                </div>
                <button className="project-form__link-remove" onClick={() => handleRemoveLink(index)}>
                  <CloseIcon />
                </button>
              </div>
            ))}
            <Button theme="primary" className="project-form__link-add" onClick={handleAddLink} icon={<AddIcon/>} variant='text'>
              添加链接
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
