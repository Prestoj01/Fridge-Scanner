/**
 * Base URL of the Worker in `worker/` that handles ingredient detection and
 * recipe generation. When empty, the app runs in offline mode: ingredients
 * are typed by hand and recipes come from the built-in library.
 */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
