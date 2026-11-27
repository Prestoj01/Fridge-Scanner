import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Food } from '../components/food/Food'
import type { Recipe } from '../types'
import type { FoodKind } from './foodKind'
import { recipeFoods } from './recipeFoods'

const WIDTH = 1080
const HEIGHT = 1350
const ART_HEIGHT = 700
const PAD = 72
const PAPER = '#fffaf3'
const INK = '#151312'
const SPREADS = ['#ff4f1f', '#ffd23f', '#2f4bff', '#1f8a4c', '#ffb3c7'] as const
const DISPLAY = '"Playfair Display Variable", "Playfair Display", Georgia, serif'
const SANS = '"Archivo Variable", "Archivo", system-ui, sans-serif'

/** Renders a food illustration to an image by drawing its SVG markup. */
async function foodImage(kind: FoodKind, size: number): Promise<HTMLImageElement> {
  const host = document.createElement('div')
  const root = createRoot(host)
  flushSync(() => {
    root.render(<Food kind={kind} size={size} />)
  })
  const markup = host.innerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  root.unmount()
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  await image.decode()
  return image
}

/** Splits text into lines that fit a width, ending with an ellipsis past maxLines. */
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  maxLines: number,
): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line === '' ? word : `${line} ${word}`
    if (context.measureText(next).width <= width || line === '') {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line !== '') lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1] ?? ''}…`
    return kept
  }
  return lines
}

/** A 1080×1350 magazine-style recipe card, as a PNG. */
export async function renderRecipeImage(recipe: Recipe, index: number): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`italic 900 200px ${DISPLAY}`),
    document.fonts.load(`800 80px ${DISPLAY}`),
    document.fonts.load(`700 28px ${SANS}`),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot draw images.')

  // Color block with a soft highlight, like the recipe spread.
  const spread = SPREADS[index % SPREADS.length] ?? SPREADS[0]
  context.fillStyle = spread
  context.fillRect(0, 0, WIDTH, ART_HEIGHT)
  const glow = context.createRadialGradient(
    WIDTH * 0.55,
    ART_HEIGHT * 0.55,
    0,
    WIDTH * 0.55,
    ART_HEIGHT * 0.55,
    600,
  )
  glow.addColorStop(0, 'rgba(255,255,255,0.3)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = glow
  context.fillRect(0, 0, WIDTH, ART_HEIGHT)

  const light = spread === SPREADS[2] || spread === SPREADS[3]
  context.fillStyle = light ? PAPER : INK
  context.font = `italic 900 220px ${DISPLAY}`
  context.textBaseline = 'top'
  context.fillText(String(index + 1).padStart(2, '0'), PAD - 8, PAD - 20)

  const foods = recipeFoods(recipe)
  const spots = [
    { x: 0.56, y: 0.6, size: 380 },
    { x: 0.84, y: 0.3, size: 250 },
    { x: 0.84, y: 0.8, size: 220 },
  ]
  const images = await Promise.all(foods.map((kind, i) => foodImage(kind, spots[i]?.size ?? 220)))
  images.forEach((image, i) => {
    const spot = spots[i]
    if (!spot) return
    context.drawImage(
      image,
      spot.x * WIDTH - spot.size / 2,
      spot.y * ART_HEIGHT - spot.size / 2,
      spot.size,
      spot.size,
    )
  })

  // Paper panel with the recipe.
  context.fillStyle = PAPER
  context.fillRect(0, ART_HEIGHT, WIDTH, HEIGHT - ART_HEIGHT)
  let y = ART_HEIGHT + 56

  context.fillStyle = '#d93a10'
  context.font = `700 28px ${SANS}`
  const meta = [`${String(recipe.timeMinutes)} min`, `Serves ${String(recipe.servings)}`]
  if (recipe.nutrition) meta.push(`${String(recipe.nutrition.calories)} kcal`)
  context.fillText(meta.join('  ·  ').toUpperCase(), PAD, y)
  y += 56

  context.fillStyle = INK
  context.font = `800 84px ${DISPLAY}`
  for (const line of wrap(context, recipe.title, WIDTH - PAD * 2, 2)) {
    context.fillText(line, PAD, y)
    y += 88
  }
  y += 12

  context.font = `400 32px ${SANS}`
  context.fillStyle = '#5b5550'
  // List as many ingredients as fit above the footer, keeping a line for "+ N more".
  const LINE = 46
  const bottom = HEIGHT - 150
  let shown = 0
  for (const line of recipe.ingredients) {
    const remaining = recipe.ingredients.length - shown
    const needsMoreLine = remaining > 1
    if (y + LINE * (needsMoreLine ? 2 : 1) > bottom) break
    const [first = ''] = wrap(context, line, WIDTH - PAD * 2 - 40, 1)
    context.fillStyle = '#ff4f1f'
    context.fillText('•', PAD, y)
    context.fillStyle = '#5b5550'
    context.fillText(first, PAD + 36, y)
    y += LINE
    shown += 1
  }
  if (shown < recipe.ingredients.length) {
    context.fillText(`+ ${String(recipe.ingredients.length - shown)} more`, PAD + 36, y)
  }

  // Footer wordmark.
  context.fillStyle = INK
  context.fillRect(PAD, HEIGHT - 120, WIDTH - PAD * 2, 3)
  context.font = `800 44px ${DISPLAY}`
  context.textBaseline = 'alphabetic'
  context.fillText('Fridge', PAD, HEIGHT - 52)
  const fridge = context.measureText('Fridge ').width
  context.fillStyle = '#d93a10'
  context.font = `italic 800 44px ${DISPLAY}`
  context.fillText('Scanner', PAD + fridge, HEIGHT - 52)
  context.fillStyle = '#5b5550'
  context.font = `700 24px ${SANS}`
  const tag = 'COOK WHAT YOU HAVE'
  context.fillText(tag, WIDTH - PAD - context.measureText(tag).width, HEIGHT - 58)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not create the image.'))
    }, 'image/png')
  })
}

/** A filesystem-friendly name like "chicken-and-broccoli-stir-fry.png". */
export function imageFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .slice(0, 60)
  return `${slug || 'recipe'}.png`
}
