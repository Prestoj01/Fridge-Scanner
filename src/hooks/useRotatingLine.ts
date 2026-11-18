import { useEffect, useState } from 'react'

/**
 * Cycles through lines every few seconds. Restarts when the text of the list
 * changes, so callers can pass a fresh array on every render.
 */
export function useRotatingLine(lines: readonly [string, ...string[]], intervalMs = 2400): string {
  const key = lines.join('\n')
  const count = lines.length
  const [state, setState] = useState({ key, index: 0 })

  // Reset during render when the list changes, without an extra effect pass.
  let index = state.index
  if (state.key !== key) {
    index = 0
    setState({ key, index: 0 })
  }

  useEffect(() => {
    if (count < 2) return
    const id = window.setInterval(() => {
      setState((current) => ({ key, index: (current.index + 1) % count }))
    }, intervalMs)
    return () => {
      window.clearInterval(id)
    }
  }, [key, count, intervalMs])

  return lines[index % count] ?? lines[0]
}
