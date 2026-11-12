import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/. The deploy workflow sets
  // VITE_BASE to the exact repository name; the default is used locally.
  base: process.env.VITE_BASE ?? '/fridge-scanner/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
