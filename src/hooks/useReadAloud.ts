import { useEffect, useState } from 'react'
import { readStored, writeStored } from '../lib/storage'

const KEY = 'read-aloud'

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function speak(text: string): void {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = document.documentElement.lang || 'en'
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

/**
 * Reads the given text aloud whenever it changes, while switched on. Uses the
 * browser's built-in speech, so nothing leaves the device and it works offline
 * where the system has voices. The on/off choice is remembered.
 */
export function useReadAloud(text: string) {
  const supported = speechSupported()
  const [on, setOn] = useState(
    () => supported && readStored(KEY, (v) => (v === true ? v : null)) === true,
  )

  useEffect(() => {
    if (!supported || !on) return
    speak(text)
  }, [supported, on, text])

  // Stop talking when cooking mode closes.
  useEffect(
    () => () => {
      if (speechSupported()) window.speechSynthesis.cancel()
    },
    [],
  )

  const toggle = () => {
    const next = !on
    setOn(next)
    writeStored(KEY, next)
    if (!next && supported) window.speechSynthesis.cancel()
  }

  return { supported, on, toggle }
}
