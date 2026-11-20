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
  pepper: {
    defs: (id) => (
      <>
        {ball(id, 'body', ['#ff8f7a', '#ef2f1f', '#b3160a', '#6e0c04'])}
        {band(id, 'stem', ['#7fd77a', '#1f7a3a'])}
      </>
    ),
    body: (id) => (
      <g>
        <path
          d="M60 30 C78 22 100 30 100 58 C100 86 88 106 74 106 C67 106 65 101 60 101 C55 101 53 106 46 106 C32 106 20 86 20 58 C20 30 42 22 60 30 Z"
          fill={url(id, 'body')}
        />
        <path
          d="M60 32 C58 50 58 80 60 100"
          stroke="#8a1006"
          strokeOpacity="0.25"
          strokeWidth={3}
          fill="none"
        />
        <path d="M54 32 C54 22 60 16 70 14 L72 20 C66 22 64 26 64 32 Z" fill={url(id, 'stem')} />
        {shine({ id, cx: 40, cy: 52, rx: 8, ry: 15, rotate: 15 })}
      </g>
    ),
  },
  mushroom: {
    defs: (id) => (
      <>
        {ball(id, 'cap', ['#f0c29a', '#c47a45', '#8a4a22', '#5a2c12'])}
        {band(id, 'stem', ['#e8dcc6', '#fffaf0', '#d8c7a8'])}
      </>
    ),
    body: (id) => (
      <g>
        <path
          d="M44 60 C42 76 40 96 46 104 C52 110 68 110 74 104 C80 96 78 76 76 60 Z"
          fill={url(id, 'stem')}
        />
        <ellipse cx={60} cy={62} rx={40} ry={8} fill="#7a4a2a" />
        <path d="M16 62 C16 28 104 28 104 62 C104 68 16 68 16 62 Z" fill={url(id, 'cap')} />
        {shine({ id, cx: 42, cy: 40, rx: 14, ry: 6, rotate: -20 })}
      </g>
    ),
  },
  cheese: {
    defs: (id) => band(id, 'front', ['#ffe680', '#ffcf2e', '#e8a800'], '0', '1'),
    body: (id) => (
      <g>
        <path d="M18 58 L94 34 L104 52 L30 76 Z" fill="#fff0a8" />
        <path d="M30 76 L104 52 L104 86 L30 106 Z" fill={url(id, 'front')} />
        <path d="M18 58 L30 76 L30 106 L18 90 Z" fill="#d99700" />
        <ellipse cx={58} cy={84} rx={7} ry={5} fill="#d99700" />
        <ellipse cx={84} cy={74} rx={5} ry={4} fill="#d99700" />
        <ellipse cx={46} cy={64} rx={6} ry={2.5} fill="#f2cf45" />
        <ellipse cx={74} cy={52} rx={5} ry={2} fill="#f2cf45" />
      </g>
    ),
  },
  bread: {
    defs: (id) => ball(id, 'body', ['#ffd99a', '#e8a04e', '#b8681f', '#7a3e0c'], '40%', '25%'),
    body: (id) => (
      <g>
        <path
          d="M14 70 C14 40 34 28 60 28 C86 28 106 40 106 70 L102 98 C101 102 98 104 94 104 L26 104 C22 104 19 102 18 98 Z"
          fill={url(id, 'body')}
        />
        <path
          d="M36 44 L48 58 M54 40 L66 56 M72 40 L84 54"
          stroke="#fff1d2"
          strokeOpacity="0.8"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {shine({ id, cx: 40, cy: 40, rx: 14, ry: 5, rotate: -15 })}
      </g>
    ),
  },
  milk: {
    defs: (id) => (
      <>
        {band(id, 'front', ['#ffffff', '#eef2f6'])}
        {band(id, 'label', ['#5a73ff', '#2f4bff'])}
      </>
    ),
    body: (id) => (
      <g>
        <path d="M34 40 L60 26 L86 40 Z" fill="#dfe6ee" />
        <path d="M86 40 L94 34 L94 96 L86 104 Z" fill="#c6d1dc" />
        <path d="M60 26 L68 20 L94 34 L86 40 Z" fill="#eef2f6" />
        <rect x={34} y={40} width={52} height={64} fill={url(id, 'front')} />
        <rect x={34} y={58} width={52} height={28} fill={url(id, 'label')} />
        <circle cx={60} cy={72} r={8} fill="#fffaf3" />
        <rect x={78} y={44} width={4} height={56} rx={2} fill="#fff" opacity={0.35} />
      </g>
    ),
  },
  meat: {
    defs: (id) => (
      <>
        {ball(id, 'meat', ['#f6c07a', '#d07a2a', '#9a4a12', '#5e2a08'])}
        {band(id, 'bone', ['#fffaf0', '#e8dcc6'], '0', '1')}
      </>
    ),
    body: (id) => (
      <g>
        <rect
          x={64}
          y={70}
          width={30}
          height={12}
          rx={6}
          fill={url(id, 'bone')}
          transform="rotate(35 79 76)"
        />
        <circle cx={98} cy={92} r={8} fill={url(id, 'bone')} />
        <circle cx={90} cy={100} r={8} fill={url(id, 'bone')} />
        <path
          d="M22 50 C22 28 48 16 66 26 C84 36 84 60 74 74 C62 90 36 92 26 78 C20 70 22 60 22 50 Z"
          fill={url(id, 'meat')}
        />
        {shine({ id, cx: 40, cy: 36, rx: 12, ry: 6, rotate: -25 })}
      </g>
    ),
  },
  onion: {
    defs: (id) => ball(id, 'body', ['#f7c3e0', '#c25a98', '#86285e', '#4e1236']),
    body: (id) => (
      <g>
        <path
          d="M60 14 C62 30 70 38 82 46 C100 58 100 92 80 102 C70 108 50 108 40 102 C20 92 20 58 38 46 C50 38 58 30 60 14 Z"
          fill={url(id, 'body')}
        />
        <path
          d="M60 30 C48 50 46 86 56 104 M60 30 C72 50 74 86 64 104"
          stroke="#fde3f1"
          strokeOpacity="0.45"
          strokeWidth={2.5}
          fill="none"
        />
        <path
          d="M60 14 L56 6 M60 14 L64 6"
          stroke="#2f9a4a"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {shine({ id, cx: 42, cy: 58, rx: 7, ry: 14, rotate: 15 })}
      </g>
    ),
  },
  grain: {
    defs: (id) => (
      <>
        {band(id, 'bowl', ['#6a82ff', '#2f4bff', '#1a2fb8'], '0', '1')}
        {ball(id, 'rice', ['#ffffff', '#f6efe2', '#d9ccb5'], '40%', '20%')}
      </>
    ),
    body: (id) => (
      <g>
        <path d="M20 58 C30 34 90 34 100 58 Z" fill={url(id, 'rice')} />
        <g fill="#e6dccb">
          <ellipse cx={46} cy={48} rx={3} ry={1.6} transform="rotate(-20 46 48)" />
          <ellipse cx={62} cy={42} rx={3} ry={1.6} transform="rotate(15 62 42)" />
          <ellipse cx={76} cy={50} rx={3} ry={1.6} transform="rotate(-30 76 50)" />
          <ellipse cx={56} cy={54} rx={3} ry={1.6} transform="rotate(40 56 54)" />
        </g>
        <path
          d="M14 58 L106 58 C104 86 84 104 60 104 C36 104 16 86 14 58 Z"
          fill={url(id, 'bowl')}
        />
        <ellipse cx={60} cy={58} rx={46} ry={4} fill="#8fa0ff" />
        {shine({ id, cx: 36, cy: 74, rx: 6, ry: 12, rotate: 25 })}
      </g>
    ),
  },
  fish: {
    defs: (id) => ball(id, 'body', ['#ffd0c0', '#ff8a66', '#e2583a', '#a8361e'], '35%', '30%'),
    body: (id) => (
      <g>
        <path
          d="M14 72 C18 44 70 34 106 50 C110 64 100 86 70 94 C44 100 16 92 14 72 Z"
          fill={url(id, 'body')}
        />
        <path
          d="M34 54 C40 66 40 80 34 90 M52 48 C58 62 58 80 52 94 M70 46 C76 60 76 78 70 92 M88 48 C93 60 92 74 86 86"
          stroke="#fff3ec"
          strokeOpacity="0.75"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {shine({ id, cx: 46, cy: 52, rx: 16, ry: 5, rotate: -10 })}
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
