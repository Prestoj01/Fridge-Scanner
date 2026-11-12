import type { ApiImage } from '../types/api'

const MAX_SIDE = 1024
const JPEG_QUALITY = 0.8

/**
 * Downscales a photo and re-encodes it as JPEG so uploads stay small. A phone
 * photo of several megabytes becomes a few hundred kilobytes. Re-encoding
 * also strips metadata such as GPS location.
 */
export async function prepareImage(file: File): Promise<ApiImage> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error(`Could not read "${file.name}". Try a JPEG or PNG photo.`)
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('This browser cannot process images.')
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  return { mimeType: 'image/jpeg', data: dataUrl.slice(dataUrl.indexOf(',') + 1) }
}
