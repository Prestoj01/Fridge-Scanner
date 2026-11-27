/**
 * Optional bot check with Cloudflare Turnstile (free). When TURNSTILE_SECRET
 * is set, every request that would reach the model must carry a fresh
 * Turnstile token in the X-Turnstile-Token header.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
export const TOKEN_HEADER = 'X-Turnstile-Token'

export async function verifyTurnstile(
  secret: string,
  token: string | null,
  remoteIp: string | null,
): Promise<boolean> {
  if (token === null || token === '' || token.length > 2048) return false
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (remoteIp !== null) form.append('remoteip', remoteIp)
  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(10_000),
    })
    const result = (await response.json()) as { success?: unknown }
    return result.success === true
  } catch {
    return false
  }
}
