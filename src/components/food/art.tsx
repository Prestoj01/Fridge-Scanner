import type { ReactNode } from 'react'
import type { FoodKind } from '../../lib/foodKind'

interface Art {
  defs: (id: string) => ReactNode
  body: (id: string) => ReactNode
}

/** Radial gradient lit from the upper left, for rounded volumes. */
function ball(id: string, name: string, stops: readonly string[], cx = '34%', cy = '28%') {
  return (
    <radialGradient id={`${id}-${name}`} cx={cx} cy={cy} r="80%">
      {stops.map((color, index) => (
        <stop
          key={index}
          offset={`${String(Math.round((index / (stops.length - 1)) * 100))}%`}
          stopColor={color}
        />
      ))}
    </radialGradient>
  )
}

/** Linear gradient across a shape, for cylinders and faces. */
function band(id: string, name: string, stops: readonly string[], x2 = '1', y2 = '0') {
  return (
    <linearGradient id={`${id}-${name}`} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map((color, index) => (
        <stop
          key={index}
          offset={`${String(Math.round((index / (stops.length - 1)) * 100))}%`}
          stopColor={color}
        />
      ))}
    </linearGradient>
  )
}

function shine({
  id,
  cx,
  cy,
  rx,
  ry,
  rotate = -30,
}: {
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
  rotate?: number
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={`url(#${id}-shine)`}
      transform={`rotate(${String(rotate)} ${String(cx)} ${String(cy)})`}
    />
  )
}

const url = (id: string, name: string) => `url(#${id}-${name})`

export const FOOD_ART: Record<FoodKind, Art> = {
  tomato: {
    defs: (id) => (
      <>
        {ball(id, 'body', ['#ff9a7a', '#ff4f1f', '#d12a0a', '#8a1405'])}
        {ball(id, 'leaf', ['#8fe08a', '#2f9a4a', '#145a2a'], '40%', '30%')}
      </>
    ),
    body: (id) => (
      <g>
        <ellipse cx={60} cy={66} rx={42} ry={38} fill={url(id, 'body')} />
        <path
          d="M44 34 C40 50 40 84 46 100 M76 34 C80 50 80 84 74 100"
          stroke="#7a1204"
          strokeOpacity="0.18"
          strokeWidth={3}
          fill="none"
        />
        <path
          d="M60 36 L50 26 L56 34 L42 32 L54 40 L46 48 L60 42 L74 48 L66 40 L78 32 L64 34 L70 26 Z"
          fill={url(id, 'leaf')}
        />
        <path
          d="M60 36 C60 30 62 24 66 20"
          stroke="#1f6b34"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        {shine({ id: id, cx: 40, cy: 52, rx: 12, ry: 7 })}
      </g>
    ),
  },
  egg: {
    defs: (id) => ball(id, 'body', ['#ffffff', '#fbf0de', '#e9d1ad', '#b8946a']),
    body: (id) => (
      <g>
        <path
          d="M60 14 C84 14 98 50 98 72 C98 94 81 106 60 106 C39 106 22 94 22 72 C22 50 36 14 60 14 Z"
          fill={url(id, 'body')}
        />
        {shine({ id: id, cx: 45, cy: 42, rx: 9, ry: 14, rotate: 20 })}
      </g>
    ),
  },
  avocado: {
    defs: (id) => (
      <>
        {ball(id, 'skin', ['#6b9a3a', '#3f6e22', '#1f3d12'])}
        {ball(id, 'flesh', ['#fbffd0', '#e3ef8f', '#a9cf4f', '#7aa83a'], '50%', '62%')}
        {ball(id, 'pit', ['#e0a476', '#a8653a', '#5e3017'])}
      </>
    ),
    body: (id) => (
      <g>
        <path
          d="M60 8 C80 8 86 32 92 50 C100 76 94 108 60 108 C26 108 20 76 28 50 C34 32 40 8 60 8 Z"
          fill={url(id, 'skin')}
        />
        <path
          d="M60 20 C75 20 80 40 85 54 C91 74 86 98 60 98 C34 98 29 74 35 54 C40 40 45 20 60 20 Z"
          fill={url(id, 'flesh')}
        />
        <circle cx={60} cy={70} r={16} fill={url(id, 'pit')} />
        {shine({ id: id, cx: 54, cy: 63, rx: 5, ry: 3.5 })}
        {shine({ id: id, cx: 46, cy: 36, rx: 5, ry: 10, rotate: 20 })}
      </g>
    ),
  },
  lemon: {
    defs: (id) => ball(id, 'body', ['#fff7b8', '#ffd23f', '#e5a900', '#9a6e00']),
    body: (id) => (
      <g transform="rotate(-18 60 62)">
        <ellipse cx={60} cy={62} rx={44} ry={32} fill={url(id, 'body')} />
        <ellipse cx={14} cy={62} rx={6} ry={5} fill="#e5a900" />
        <ellipse cx={106} cy={62} rx={6} ry={5} fill="#c79200" />
        {shine({ id: id, cx: 44, cy: 46, rx: 16, ry: 6, rotate: -5 })}
      </g>
    ),
  },
  broccoli: {
    defs: (id) => (
      <>
        {band(id, 'stalk', ['#e2f7b4', '#a6d86a', '#6aa83c'])}
        {ball(id, 'floret', ['#8fe58a', '#35a24e', '#1a6a32', '#0f4a22'])}
      </>
    ),
    body: (id) => (
      <g>
        <path d="M48 66 L44 104 C52 110 68 110 76 104 L72 66 Z" fill={url(id, 'stalk')} />
        {[
          [40, 52, 19],
          [80, 52, 19],
          [60, 40, 22],
          [48, 68, 16],
          [72, 68, 16],
        ].map(([cx = 0, cy = 0, r = 0]) => (
          <circle
            key={`${String(cx)}-${String(cy)}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={url(id, 'floret')}
          />
        ))}
        {shine({ id: id, cx: 52, cy: 30, rx: 8, ry: 5 })}
        {shine({ id: id, cx: 34, cy: 44, rx: 6, ry: 4 })}
      </g>
    ),
  },
  carrot: {
    defs: (id) => (
      <>
        {band(id, 'body', ['#ffc183', '#ff8a2a', '#d65a0a'], '0.6', '1')}
        {band(id, 'top', ['#9be58c', '#2f9a4a'], '0', '1')}
      </>
    ),
    body: (id) => (
      <g>
        <path
          d="M34 34 C44 24 62 30 66 40 L102 100 C104 106 98 108 94 104 L38 62 C28 54 26 42 34 34 Z"
          fill={url(id, 'body')}
        />
        <path
          d="M52 52 L60 48 M64 66 L72 62 M76 80 L83 76"
          stroke="#b94c06"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path d="M34 36 C24 20 22 12 26 6 C34 12 38 22 40 32 Z" fill={url(id, 'top')} />
        <path d="M38 34 C38 18 44 10 50 8 C52 18 48 28 44 36 Z" fill={url(id, 'top')} />
        <path d="M32 40 C18 34 10 30 6 24 C16 22 26 28 34 36 Z" fill={url(id, 'top')} />
        {shine({ id: id, cx: 46, cy: 40, rx: 10, ry: 4, rotate: 35 })}
      </g>
    ),
  },
  leaf: {
    defs: (id) => ball(id, 'body', ['#a6f0a0', '#3fb35a', '#1d7a38', '#0e4a22'], '30%', '30%'),
    body: (id) => (
      <g>
        <path
          d="M58 108 C26 94 14 62 26 26 C52 22 96 36 100 70 C102 92 82 106 58 108 Z"
          fill={url(id, 'body')}
        />
        <path
          d="M58 106 C52 80 40 52 28 30 M46 70 L66 60 M40 54 L58 44 M54 88 L76 80"
          stroke="#c8f5b8"
          strokeOpacity="0.6"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
        {shine({ id: id, cx: 44, cy: 40, rx: 12, ry: 6, rotate: -40 })}
      </g>
    ),
  },
  jar: {
    defs: (id) => (
      <>
        {band(id, 'glass', ['#f3f6f8', '#ffffff', '#cfd8de'])}
        {band(id, 'fill', ['#ffd23f', '#ffb000', '#e08a00'])}
        {band(id, 'lid', ['#ff7a52', '#ff4f1f', '#b83010'], '0', '1')}
      </>
    ),
    body: (id) => (
      <g>
        <rect x={28} y={34} width={64} height={70} rx={14} fill={url(id, 'glass')} />
        <rect x={32} y={56} width={56} height={44} rx={10} fill={url(id, 'fill')} />
        <rect x={34} y={18} width={52} height={18} rx={5} fill={url(id, 'lid')} />
        <rect x={38} y={64} width={44} height={16} rx={3} fill="#fffaf3" opacity={0.9} />
        <rect x={34} y={40} width={6} height={52} rx={3} fill="#fff" opacity={0.75} />
      </g>
    ),
  },
}
