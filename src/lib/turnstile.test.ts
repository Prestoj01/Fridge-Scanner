import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  delete window.turnstile
})

describe('turnstileToken', () => {
  it('returns null when no site key is set', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
    const { turnstileToken } = await import('./turnstile')
    expect(await turnstileToken()).toBeNull()
  })

  it('renders one widget and gets a fresh token for each request', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key')
    let callback: ((token: string) => void) | undefined
    let issued = 0
    const render = vi.fn((_: HTMLElement, options: { callback: (token: string) => void }) => {
      callback = options.callback
      return 'widget-1'
    })
    const reset = vi.fn()
    window.turnstile = {
      render,
      reset,
      execute: () => {
        issued += 1
        callback?.(`token-${String(issued)}`)
      },
    }
    const { turnstileToken } = await import('./turnstile')
    expect(await turnstileToken()).toBe('token-1')
    expect(await turnstileToken()).toBe('token-2')
    expect(render).toHaveBeenCalledTimes(1)
    expect(reset).toHaveBeenCalledWith('widget-1')
  })

  it('rejects when the check fails', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key')
    let onError: (() => void) | undefined
    window.turnstile = {
      render: (_: HTMLElement, options: { 'error-callback': () => void }) => {
        onError = options['error-callback']
        return 'widget-1'
      },
      reset: vi.fn(),
      execute: () => onError?.(),
    }
    const { turnstileToken } = await import('./turnstile')
    await expect(turnstileToken()).rejects.toThrow('bot check failed')
  })
})
