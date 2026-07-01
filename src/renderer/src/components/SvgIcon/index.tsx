// src/renderer/src/components/SvgIcon/index.tsx

import React, { useId } from 'react'

interface SvgIconProps {
  /**
   * 图标名称
   */
  name: string

  /**
   * 图标大小
   */
  size?: number | string

  /**
   * 单色
   */
  color?: string

  /**
   * 渐变色
   */
  gradient?: string[]

  /**
   * 渐变角度
   */
  gradientRotate?: number

  className?: string

  style?: React.CSSProperties

  onClick?: () => void
}

// 自动加载所有 svg（通过 ?react 后缀转为 React 组件）
const icons = import.meta.glob('@/assets/svg/*.svg', {
  eager: true,
  query: '?react',
  import: 'default'
})


export default function SvgIcon({
  name,
  size = 20,
  color = 'currentColor',
  gradient,
  gradientRotate = 0,
  className,
  style,
  onClick
}: SvgIconProps) {
  const gradientId = useId()

  const path = `/src/assets/svg/${name}.svg`

  const Icon = icons[path] as React.FC<React.SVGProps<SVGSVGElement>> | undefined

  if (!Icon) {
    console.warn(`[SvgIcon] 图标不存在: ${name}`)
    return null
  }

  // 普通颜色
  if (!gradient || gradient.length === 0) {
    return (
      <Icon
        width={size}
        height={size}
        className={className}
        onClick={onClick}
        style={{
          color,
          cursor: onClick ? 'pointer' : undefined,
          ...style
        }}
      />
    )
  }

  // 渐变色
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...style
      }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientTransform={`rotate(${gradientRotate})`}
        >
          {gradient.map((item, index) => (
            <stop
              key={item}
              offset={`${(index / (gradient.length - 1)) * 100}%`}
              stopColor={item}
            />
          ))}
        </linearGradient>
      </defs>

      <foreignObject width="100%" height="100%">
        <div
          style={{
            width: '100%',
            height: '100%',
            color: `url(#${gradientId})`
          }}
        >
          <Icon
            width={size}
            height={size}
            style={{
              color: `url(#${gradientId})`
            }}
          />
        </div>
      </foreignObject>
    </svg>
  )
}