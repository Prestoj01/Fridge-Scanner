import { Refrigerator } from 'lucide-react'
import { Icon } from './Icon'

export function Header() {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <span className="app-header__mark">
          <Icon icon={Refrigerator} size={16} />
        </span>
        <span className="app-header__title">Fridge Scanner</span>
      </div>
    </header>
  )
}
