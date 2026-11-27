import { useSaved } from '../lib/savedContext'
import { useShopping } from '../lib/shoppingContext'
import { ThemeToggle } from './ThemeToggle'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

export function Header() {
  const { saved } = useSaved()
  const { items } = useShopping()
  const toBuy = items.filter((item) => !item.checked).length
  return (
    <header className="masthead">
      <div className="container">
        <div className="masthead__top kicker">
          <span>No. 01 · Healthy cooking</span>
          <span className="masthead__date">{dateFormat.format(new Date())}</span>
          <a href="#saved" className="masthead__link">
            Saved
            {saved.length > 0 && <span className="masthead__count tabular">{saved.length}</span>}
          </a>
          <a href="#list" className="masthead__link">
            List
            {toBuy > 0 && <span className="masthead__count tabular">{toBuy}</span>}
          </a>
          <ThemeToggle />
        </div>
        <h1 className="masthead__title">
          Fridge <em>Scanner</em>
        </h1>
      </div>
    </header>
  )
}
