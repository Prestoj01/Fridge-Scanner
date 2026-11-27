/** A short three-note kitchen-timer chime, made with Web Audio (no sound files). */
export function playChime(): void {
  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
  if (!('AudioContext' in window)) return
  try {
    const context = new AudioContext()
    const notes = [880, 1175, 1568]
    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * 0.22
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.4)
    })
    window.setTimeout(() => void context.close(), 1500)
  } catch {
    // Audio blocked or unavailable: the visual alert still shows.
  }
}
