import { useNavigate, useOutlet, useLocation } from 'react-router-dom'
import SvgIcon from '@/components/SvgIcon'
import AppHeader from '@/components/AppHeader'
import { routers } from '@renderer/router'

import './index.scss'

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()

  const handleToPage = (path: string) => {
    navigate(path ? `/${path}` : '/')
  }

  // 判断当前路由是否激活
  const isActive = (path: string) => {
    if (path === '') return location.pathname === '/'
    return location.pathname === `/${path}`
  }

  return (
    <div className="main-layout-wrapper">
      <AppHeader />
      <div className="main-layout">
        {/* 左侧导航 */}
        <div className="main-layout__sidebar">
          <div className="sidebar-nav">
            {routers?.map((item) => (
              <div
                key={item.path || 'home'}
                className={`sidebar-nav__item ${isActive(item.path) ? 'sidebar-nav__item--active' : ''}`}
                onClick={() => handleToPage(item.path)}
              >
                <div className='sidebar-nav__item-content'>
                  <SvgIcon className="sidebar-nav__item-icon" name={isActive(item.path) ? `${item.activeIcon}` : item.icon} size={38} />
                  <span className="sidebar-nav__item-label">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="main-layout__content">
          <div key={location.pathname} className="page-transition">
            {outlet}
          </div>
        </div>
      </div>
    </div>
  )
}
