import { m } from 'motion/react'
import { useTheme } from '../hooks/useTheme'

/** Sun and moon in one drawing: the rays fold away and a shadow slides over to make a crescent. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  const spring = { type: 'spring', stiffness: 220, damping: 20 } as const

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        toggle({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
    >
      <m.svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        animate={{ rotate: dark ? 40 : 90 }}
        transition={spring}
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <m.circle
            r="9"
            fill="black"
            animate={{ cx: dark ? 16 : 30, cy: dark ? 7 : 0 }}
            transition={spring}
          />
        </mask>
        <m.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask="url(#moon-mask)"
          animate={{ r: dark ? 9 : 5 }}
          transition={spring}
        />
        <m.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.4 : 1 }}
          transition={spring}
          style={{ originX: '12px', originY: '12px' }}
        >
          <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </m.g>
      </m.svg>
    </button>
  )
}
