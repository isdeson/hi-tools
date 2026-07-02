import dayjs from 'dayjs'
import './index.scss'
import { Swiper, Input, Button, Dialog, DialogPlugin, MessagePlugin } from 'tdesign-react'
import SwiperItem from 'tdesign-react/es/swiper/SwiperItem'
import { useEffect, useState, useMemo } from 'react'
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  BrowseIcon,
  SearchIcon,
  PinIcon,
  PinFilledIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from 'tdesign-icons-react'
import { useQuickNavStore, NavItem } from '@/store/quickNav'
import { useContextMenu, ContextMenuGroup } from '@/hooks/useContextMenu'
import ContextMenu from '@/components/ContextMenu'
import { matchPinyin } from '@/utils/pinyinSearch'
import SvgIcon from '@renderer/components/SvgIcon'
import { getNowFullDate } from '@renderer/utils/date'

function Home() {
  const { items, initialized, init, addItem, updateItem, deleteItem, togglePin, moveUp, moveDown } =
    useQuickNavStore()

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<NavItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')

  // 右键菜单
  const { menuState, showMenu, hideMenu } = useContextMenu()
  const [contextTarget, setContextTarget] = useState<NavItem | null>(null)

  // 菜单项分组定义（动态：根据当前项的 pinned 状态切换文案）
  const menuGroups: ContextMenuGroup[] = useMemo(() => {
    const isPinned = contextTarget?.pinned
    return [
      [
        { key: 'open', label: '打开链接', icon: <BrowseIcon size={16} /> },
        {
          key: 'pin',
          label: isPinned ? '取消置顶' : '置顶',
          icon: isPinned ? <PinIcon size={16} /> : <PinFilledIcon size={16} />
        }
      ],
      [
        { key: 'moveUp', label: '上移', icon: <ChevronUpIcon size={16} /> },
        { key: 'moveDown', label: '下移', icon: <ChevronDownIcon size={16} /> },
        { key: 'edit', label: '编辑', icon: <EditIcon size={16} /> }
      ],
      [
        { key: 'delete', label: '删除', icon: <DeleteIcon size={16} />, color: 'var(--td-error-color)' }
      ]
    ]
  }, [contextTarget])

  const getTimeText = () => {
    const hour = dayjs().get('hour')
    if (hour >= 6 && hour < 12) {
      return '早上好'
    } else if (hour >= 12 && hour < 18) {
      return '下午好'
    } else {
      return '晚上好'
    }
  }

  const [banners, setBanners] = useState<string[]>([])
  const loadAllBanners = () => {
    // 获取所有 banner
    const images = import.meta.glob('@/assets/image/banner/*.png', { eager: true })
    const modules = Object.values(images) as Array<{ default: string }>
    setBanners(modules.map((mod) => mod.default))
  }

  useEffect(() => {
    loadAllBanners()
    if (!initialized) {
      init()
    }
  }, [])

  // 搜索过滤：支持名称、链接、拼音
  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) return items
    return items.filter(
      (item) =>
        matchPinyin(item.name, searchKeyword) || matchPinyin(item.url, searchKeyword)
    )
  }, [items, searchKeyword])

  // 右键菜单触发
  const handleContextMenu = (e: React.MouseEvent, item: NavItem) => {
    setContextTarget(item)
    showMenu(e)
  }

  // 右键菜单点击
  const handleMenuClick = (key: string) => {
    hideMenu()
    if (!contextTarget) return
    switch (key) {
      case 'open':
        handleOpenUrl(contextTarget.url)
        break
      case 'pin':
        togglePin(contextTarget.id)
        MessagePlugin.success(contextTarget.pinned ? '已取消置顶' : '已置顶')
        break
      case 'moveUp':
        moveUp(contextTarget.id)
        break
      case 'moveDown':
        moveDown(contextTarget.id)
        break
      case 'edit':
        handleEdit(contextTarget)
        break
      case 'delete':
        handleDelete(contextTarget)
        break
    }
  }

  // 打开添加弹窗
  const handleAdd = () => {
    setEditingItem(null)
    setFormName('')
    setFormUrl('')
    setShowForm(true)
  }

  // 打开编辑弹窗
  const handleEdit = (item: NavItem) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormUrl(item.url)
    setShowForm(true)
  }

  // 删除导航项
  const handleDelete = (item: NavItem) => {
    const dialog = DialogPlugin.confirm({
      header: '删除导航',
      body: `确定要删除「${item.name}」吗？`,
      placement: 'center',
      onConfirm: () => {
        deleteItem(item.id)
        MessagePlugin.success('已删除')
        dialog.hide()
      },
      onCancel: () => dialog.hide(),
      onCloseBtnClick: () => dialog.hide()
    })
  }

  // 表单提交
  const handleFormSubmit = () => {
    if (!formName.trim()) {
      MessagePlugin.warning('请输入名称')
      return
    }
    if (!formUrl.trim()) {
      MessagePlugin.warning('请输入链接')
      return
    }

    if (editingItem) {
      updateItem(editingItem.id, {
        name: formName.trim(),
        url: formUrl.trim()
      })
      MessagePlugin.success('已更新')
    } else {
      addItem({
        name: formName.trim(),
        url: formUrl.trim()
      })
      MessagePlugin.success('已添加')
    }
    setShowForm(false)
    setEditingItem(null)
  }

  // 打开链接
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank')
  }

  // 获取展示图标：截取名称前四个字符
  // const getDisplayIcon = (item: NavItem) => {
  //   return item.name.slice(0, 4)
  // }

  const [currentDate, setCurrentDate] = useState(getNowFullDate())
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(getNowFullDate())
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="home-page">
      <div className="home-page-header">
        <h3 className="page__title">{getTimeText()}，欢迎回来 ~</h3>
      <h2>{currentDate}</h2>
      <Swiper
        animation="slide"
        autoplay
        direction="horizontal"
        duration={300}
        interval={10000}
        loop
        stopOnHover
        trigger="hover"
        type="default"
        className="home-welcome-banner"
      >
        {banners?.map((item, index) => (
          <SwiperItem className="home-welcome-banner-item" key={index}>
            <img src={item} alt="" />
          </SwiperItem>
        ))}
      </Swiper>
      </div>

      {/* 快捷导航区域 */}
      <div className="home-quick-nav">
        <div className="home-quick-nav__header">
          <h4 className="home-quick-nav__title">
            <div className="home-quick-nav__title-text">
              快捷导航
            </div>
          </h4>
          <div className="home-quick-nav__header-actions">
            <Input
              className="home-quick-nav__search"
              value={searchKeyword}
              onChange={(v) => setSearchKeyword(v as string)}
              placeholder="输入关键词搜索、支持拼音"
              clearable
              prefixIcon={<SearchIcon />}
            />
            <Button
              theme="primary"
              shape="round"
              variant="outline"
              icon={<AddIcon />}
              onClick={handleAdd}
            >
              添加
            </Button>
          </div>
        </div>
        <div className="home-quick-nav__grid">
          {filteredItems.length === 0 ? (
            <div className="home-quick-nav__empty">
              <SvgIcon name="empty" size={120} color="var(--hi-color-font-gray)" />
              <p>暂无数据</p>
              <Button
                icon={<AddIcon />}
                size="medium"
                shape="round"
                theme="primary"
                onClick={handleAdd}
              >
                添加导航
              </Button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`home-quick-nav__item ${item.pinned ? 'home-quick-nav__item--pinned' : ''}`}
                onClick={() => handleOpenUrl(item.url)}
                onContextMenu={(e) => handleContextMenu(e, item)}
              >
                <div className="home-quick-nav__item-icon"><SvgIcon  name="jump" size={12} /></div>
                <div className="home-quick-nav__item-name">{item.name}</div>
                {item.pinned && (
                  <span className="home-quick-nav__item-pin">
                    <PinFilledIcon size={13} />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 添加/编辑导航弹窗 */}
      <Dialog
        header={editingItem ? '编辑导航' : '添加导航'}
        visible={showForm}
        placement="center"
        width={450}
        className="home-quick-nav__dialog"
        onCancel={() => setShowForm(false)}
        footer={
          <div className="project-form__footer">
            <Button theme="primary" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            <Button theme="primary" onClick={handleFormSubmit}>{editingItem ? '保存' : '添加'}</Button>
          </div>
        }
      >
        <div
          className="home-quick-nav__dialog-form"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleFormSubmit()
          }}
        >
          <div className="home-quick-nav__dialog-field">
            <label>名称</label>
            <Input
              value={formName}
              onChange={(v) => setFormName(v as string)}
              placeholder="请输入导航名称"
              maxlength={20}
            />
          </div>
          <div className="home-quick-nav__dialog-field">
            <label>链接</label>
            <Input
              value={formUrl}
              onChange={(v) => setFormUrl(v as string)}
              placeholder="请输入链接地址"
            />
          </div>
        </div>
      </Dialog>

      {/* 通用右键菜单 */}
      <ContextMenu
        visible={menuState.visible}
        x={menuState.x}
        y={menuState.y}
        groups={menuGroups}
        onClick={handleMenuClick}
      />
    </div>
  )
}

export default Home
