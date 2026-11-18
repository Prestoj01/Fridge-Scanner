import type { ReactNode } from 'react'
import { MagnetWord } from './MagnetWord'

interface HeaderProps {
  /** The mascot, shown on the right. */
  children?: ReactNode
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <h1 className="logo">
          <MagnetWord text="FRIDGE" />
          <MagnetWord text="SCANNER" offset={3} />
        </h1>
        {children}
      </div>
    </header>
  )
}
