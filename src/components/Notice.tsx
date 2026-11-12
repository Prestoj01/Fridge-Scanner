import type { ReactNode } from 'react'

interface NoticeProps {
  tone?: 'info' | 'error'
  children: ReactNode
}

/** Inline message. Errors are announced to screen readers immediately. */
export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
