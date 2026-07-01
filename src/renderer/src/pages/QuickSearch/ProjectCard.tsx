import { Project, Category } from '@/store/quickSearch'
import SvgIcon from '@/components/SvgIcon'

import './ProjectCard.scss'
import { Button } from 'tdesign-react'

interface ProjectCardProps {
  project: Project
  category?: Category
  selectMode: boolean
  selected: boolean
  onSelect: () => void
  onOpen: (url: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function ProjectCard({
  project,
  category,
  selected,
  onOpen,
  onContextMenu
}: ProjectCardProps) {
  const themeColor = category?.color || '#00becc'

  return (
    <div
      className={`project-card ${selected ? 'project-card--selected' : ''}`}
      onClick={() => project.url && onOpen(project.url)}
      onContextMenu={onContextMenu}
    >
      {/* 左下角分类色球 */}
      <span className="project-card__dot" style={{ background: themeColor }} />

      <div className="project-card__body">
        <div className="project-card__name">{project.name}</div>
        <div className="project-card__desc">
          {project.description || '暂无简介'}
        </div>

        {project.links.length > 0 && (
          <div className="project-card__links">
            {project.links
              .sort((a, b) => a.sort - b.sort)
              .map((link) => (
                <Button
                  key={link.id}
                  className="project-card__link"
                  onClick={(e) => { e.stopPropagation(); onOpen(link.url) }}
                  title={link.url}
                  suffix={<SvgIcon  name="jump" size={10} />}
                  theme="primary"
                  variant="text"
                >
                  <span className="project-card__link-text">{link.name}</span>
                </Button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
