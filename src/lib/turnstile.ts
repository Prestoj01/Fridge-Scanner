/**
 * Optional Cloudflare Turnstile bot check. When VITE_TURNSTILE_SITE_KEY is
 * set, the app loads Turnstile only when it first needs to call the AI, and
 * gets a fresh one-time token for each request. Most visitors never see a
 * challenge; if one is needed it appears at the bottom of the screen.
 */

export const TURNSTILE_SITE_KEY: string = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim()

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TOKEN_TIMEOUT_MS = 30_000

interface TurnstileOptions {
  sitekey: string
  execution: 'execute'
  appearance: 'interaction-only'
  callback: (token: string) => void
  'error-callback': () => void
  'expired-callback': () => void
}

interface Turnstile {
  render(container: HTMLElement, options: TurnstileOptions): string
  execute(widgetId: string): void
  reset(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let scriptLoad: Promise<Turnstile> | null = null

function loadScript(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  scriptLoad ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile did not load.'))
    }
    script.onerror = () => {
      scriptLoad = null
      reject(new Error('Turnstile did not load.'))
    }
    document.head.append(script)
  })
  return scriptLoad
}

interface Widget {
  id: string
  waiting: { resolve: (token: string) => void; reject: (error: Error) => void } | null
}

let widget: Widget | null = null

async function getWidget(): Promise<{ turnstile: Turnstile; widget: Widget }> {
  const turnstile = await loadScript()
  if (widget) return { turnstile, widget }
  const container = document.createElement('div')
  container.className = 'turnstile-slot'
  document.body.append(container)
  const created: Widget = { id: '', waiting: null }
  const settle = (outcome: string | Error) => {
    const waiting = created.waiting
    created.waiting = null
    if (!waiting) return
    if (typeof outcome === 'string') waiting.resolve(outcome)
    else waiting.reject(outcome)
  }
  created.id = turnstile.render(container, {
    sitekey: TURNSTILE_SITE_KEY,
    execution: 'execute',
    appearance: 'interaction-only',
    callback: (token) => {
      settle(token)
    },
    'error-callback': () => {
      settle(new Error('The bot check failed.'))
    },
    'expired-callback': () => {
      settle(new Error('The bot check expired.'))
    },
  })
  widget = created
  return { turnstile, widget }
}

/**
 * A fresh token for one API request, or null when the bot check is off.
 * Throws if Turnstile cannot load or the check fails.
 */
export async function turnstileToken(): Promise<string | null> {
  if (TURNSTILE_SITE_KEY === '') return null
  const { turnstile, widget: current } = await getWidget()
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      current.waiting = null
      reject(new Error('The bot check took too long.'))
    }, TOKEN_TIMEOUT_MS)
    current.waiting = {
      resolve: (token) => {
        clearTimeout(timer)
        resolve(token)
      },
      reject: (error) => {
        clearTimeout(timer)
        reject(error)
      },
    }
    // Tokens are single use, so start from a clean widget each time.
    turnstile.reset(current.id)
    turnstile.execute(current.id)
  })
}
