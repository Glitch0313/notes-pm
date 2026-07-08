'use client'

import { useInView } from '@/hooks/useInView'
import type { ReactNode, CSSProperties } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  style?: CSSProperties
}

export default function FadeIn({ children, delay = 0, direction = 'up', className = '', style }: FadeInProps) {
  const { ref, inView } = useInView()

  const translate = {
    up:    'translateY(32px)',
    down:  'translateY(-32px)',
    left:  'translateX(32px)',
    right: 'translateX(-32px)',
    none:  'none',
  }[direction]

  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : translate,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
