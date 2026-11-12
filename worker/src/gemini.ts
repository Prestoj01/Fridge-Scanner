/**
 * Minimal client for the Gemini Interactions API. Uses plain fetch so the
 * Worker has no runtime dependencies.
 */
import { isRecord } from '../../src/lib/validate'
import type { ApiImage } from '../../src/types/api'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const API_REVISION = '2026-05-20'
const TIMEOUT_MS = 45_000

export class UpstreamError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'UpstreamError'
    this.status = status
  }
}

export interface GeminiRequest {
  apiKey: string
  model: string
  system: string
  prompt: string
  images?: readonly ApiImage[]
  /** JSON Schema the response must follow. */
  schema: Record<string, unknown>
}

/** Sends one request and returns the model's reply parsed as JSON. */
export async function generateJson(request: GeminiRequest): Promise<unknown> {
  const input = [
    { type: 'text', text: request.prompt },
    ...(request.images ?? []).map((image) => ({
      type: 'image',
      data: image.data,
      mime_type: image.mimeType,
    })),
  ]

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'x-goog-api-key': request.apiKey,
        'Content-Type': 'application/json',
        'Api-Revision': API_REVISION,
      },
      body: JSON.stringify({
        model: request.model,
        system_instruction: request.system,
        input,
        response_format: { type: 'text', mime_type: 'application/json', schema: request.schema },
        store: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new UpstreamError('Could not reach the AI service.', 502)
  }

  if (!response.ok) {
    // Log the provider's reason for the Worker logs; never forward it to clients.
    console.error('Gemini error', response.status, (await response.text()).slice(0, 500))
    throw new UpstreamError(
      response.status === 429
        ? 'The free AI quota is used up for now. Try again later.'
        : 'The AI service returned an error.',
      response.status === 429 ? 429 : 502,
    )
  }

  const text = extractText(await response.json())
  if (text === null) throw new UpstreamError('The AI service returned an empty reply.', 502)

  const parsed = parseJsonLoosely(text)
  if (parsed === undefined) {
    throw new UpstreamError('The AI service returned an unreadable reply.', 502)
  }
  return parsed
}

/**
 * Finds the model's text in an Interactions response. Prefers the top-level
 * `output_text`, then text parts inside `model_output` steps, then any text
 * part at all, so small changes in the response layout do not break parsing.
 */
export function extractText(body: unknown): string | null {
  if (!isRecord(body)) return null
  if (typeof body.output_text === 'string' && body.output_text !== '') return body.output_text

  const fromModelOutput = collectText(body, true)
  if (fromModelOutput !== '') return fromModelOutput
  const fromAnywhere = collectText(body, false)
  return fromAnywhere === '' ? null : fromAnywhere
}

function collectText(node: unknown, modelOutputOnly: boolean, insideModelOutput = false): string {
  if (Array.isArray(node)) {
    return node.map((item) => collectText(item, modelOutputOnly, insideModelOutput)).join('')
  }
  if (!isRecord(node)) return ''

  const inside = insideModelOutput || node.type === 'model_output'
  if (node.type === 'text' && typeof node.text === 'string') {
    return !modelOutputOnly || inside ? node.text : ''
  }
  if (node.type === 'thought') return ''
  return Object.values(node)
    .map((value) => collectText(value, modelOutputOnly, inside))
    .join('')
}

/** Parses JSON, tolerating code fences or stray text around the object. */
export function parseJsonLoosely(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end <= start) return undefined
    try {
      return JSON.parse(text.slice(start, end + 1)) as unknown
    } catch {
      return undefined
    }
  }
}
