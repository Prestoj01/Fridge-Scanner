import { useEffect } from 'react'

/** Keeps the screen awake while mounted, where the browser allows it. */
export function useWakeLock(): void {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    let active = true

    const request = async () => {
      if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return
      try {
        const next = await navigator.wakeLock.request('screen')
        if (active) lock = next
        else void next.release()
      } catch {
        // Denied (battery saver, unsupported): the screen may sleep. Nothing else to do.
      }
    }

    // The lock is dropped whenever the tab is hidden, so ask again on return.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisibility)
      void lock?.release()
    }
  }, [])
}
