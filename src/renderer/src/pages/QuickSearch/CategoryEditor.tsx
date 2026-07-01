import { useState } from 'react'
import { Input, Button, Dialog } from 'tdesign-react'
import { Category } from '@/store/quickSearch'

import './CategoryEditor.scss'

interface CategoryEditorProps {
  category?: Category | null
  onSave: (id: string | null, data: { name: string; color: string }) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

const PRESET_COLORS = [
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#ef4444',
  '#14b8a6',
  '#f97316',
  '#84cc16',
  '#06b6d4',
  '#0ea5e9'
]

export default function CategoryEditor({
  category,
  onSave,
  onDelete,
  onClose
}: CategoryEditorProps) {
  const isEdit = !!category
  const [name, setName] = useState(category?.name || '')
  const [color, setColor] = useState(category?.color || PRESET_COLORS[0])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(category?.id || null, { name: name.trim(), color })
  }

  return (
    <Dialog
      visible
      attach="body"
      placement="center"
      header={isEdit ? '编辑分类' : '新建分类'}
      width={450}
      onClose={onClose}
      footer={
        <div className="category-editor__footer">
          {isEdit && onDelete ? (
            <Button
              theme="danger"
              variant="outline"
              onClick={() => onDelete(category!.id)}
              style={{ width: '80px' }}
            >
              删除
            </Button>
          ) : (
            <span />
          )}
          <div className="category-editor__footer-right">
            <Button theme="primary" variant="outline" onClick={onClose} style={{ width: '80px' }}>
              取消
            </Button>
            <Button theme="primary" onClick={handleSave} style={{ width: '80px' }}>
              {isEdit ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="category-editor__body"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
        }}
      >
        <div className="category-editor__field">
          <label>名称</label>
          <Input value={name} onChange={(v) => setName(v as string)} placeholder="分类名称" />
        </div>

        <div className="category-editor__field">
          <label>颜色</label>
          <div className="category-editor__colors">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`category-editor__color-item ${color === c ? 'category-editor__color-item--active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
            {/* <ColorPicker style={{ display: 'inline-flex' }} format="HEX" colorModes={['monochrome']} onChange={setColor} value={color} swatchColors={PRESET_COLORS} /> */}
          </div>
        </div>
        <div className="category-editor__field">
          <label>样式预览</label>
          <div className="category-editor__preview">
            <span
              style={{
                background: color,
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '13px'
              }}
            >
              {name || '分类名称'}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
