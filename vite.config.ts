import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/** Files from public/ that the app needs offline. */
const PUBLIC_FILES = ['manifest.webmanifest', 'favicon.svg', 'icons/icon-192.png']

/**
 * Emits sw.js from pwa/service-worker.js with this build's file list, so the
 * service worker can cache the whole app on install. Font subsets for other
 * alphabets are left out; they are cached the first time a page uses them.
 */
function serviceWorker(): Plugin {
  return {
    name: 'fridge-scanner-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const built = Object.keys(bundle).filter(
        (name) =>
          !name.endsWith('.map') &&
          name !== 'index.html' &&
          !/(cyrillic|greek|vietnamese|latin-ext)/.test(name),
      )
      const files = ['./', ...PUBLIC_FILES, ...built]
      const version = createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 12)
      const source = readFileSync('pwa/service-worker.js', 'utf8')
        .replace("'__VERSION__'", JSON.stringify(version))
        .replace('self.__PRECACHE__', JSON.stringify(files))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/. The deploy workflow sets
  // VITE_BASE to the exact repository name; the default is used locally.
  base: process.env.VITE_BASE ?? '/fridge-scanner/',
  plugins: [react(), serviceWorker()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
