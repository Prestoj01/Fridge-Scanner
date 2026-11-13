import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  /** Optional call to action, e.g. a button. */
  children?: ReactNode
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon icon={icon} size={32} />
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {children}
    </div>
  )
}
