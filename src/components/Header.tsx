import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <h1 className="wordmark">
          <svg
            className="wordmark__mark"
            viewBox="0 0 32 32"
            width="28"
            height="28"
            aria-hidden="true"
          >
            <path
              d="M16 29 C16 20 16 15 16 11"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M16 17 C9 17 5 12 5 6 C12 6 16 10 16 17 Z" fill="var(--sage)" />
            <path d="M16 13 C21 13 26 10 27 4 C21 4 16 7 16 13 Z" fill="var(--peach)" />
          </svg>
          <span>
            fridge <em>scanner</em>
          </span>
        </h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
