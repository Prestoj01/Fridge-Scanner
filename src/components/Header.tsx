import { ThemeToggle } from './ThemeToggle'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

export function Header() {
  return (
    <header className="masthead">
      <div className="container">
        <div className="masthead__top kicker">
          <span>No. 01 · Healthy cooking</span>
          <span className="masthead__date">{dateFormat.format(new Date())}</span>
          <ThemeToggle />
        </div>
        <h1 className="masthead__title">
          Fridge <em>Scanner</em>
        </h1>
      </div>
    </header>
  )
}
