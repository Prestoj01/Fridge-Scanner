/*
 * Fridge Scanner service worker. The build fills in VERSION and PRECACHE
 * (see the serviceWorker plugin in vite.config.ts).
 *
 * - The app shell, scripts, styles, fonts, and icons are cached on install,
 *   so the app opens and works offline after the first visit.
 * - Pages load network-first, so a new deploy shows up on the next visit.
 * - Hashed files under assets/ never change, so they load cache-first.
 * - Requests to other origins (the AI API) are left alone.
 */
const VERSION = '__VERSION__'
const PRECACHE = self.__PRECACHE__
const CACHE = `fridge-scanner-${VERSION}`
const SHELL = './'
const NAVIGATION_TIMEOUT_MS = 4000

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('fridge-scanner-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function navigate(request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS)
    if (response.ok) await cache.put(SHELL, response.clone())
    return response
  } catch {
    return (await cache.match(SHELL)) ?? Response.error()
  }
}

async function asset(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok && new URL(request.url).pathname.includes('/assets/')) {
    await cache.put(request, response.clone())
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return
  event.respondWith(request.mode === 'navigate' ? navigate(request) : asset(request))
})
