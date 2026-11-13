import { CircleAlert, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface NoticeProps {
  tone?: 'info' | 'error'
  children: ReactNode
}

/** Inline message. Errors are announced to screen readers immediately. */
export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon icon={tone === 'error' ? CircleAlert : Info} size={16} />
      <div>{children}</div>
    </div>
  )
}
