/** A pot on the stove: bubbles, steam, a rattling lid, and flickering flames. */
export function BubblingPot() {
  return (
    <div className="pot" aria-hidden="true">
      <svg viewBox="0 0 160 140" width="160" height="140">
        <g
          className="pot__steam"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
        >
          <path d="M58 30 C50 22 66 16 58 6" />
          <path d="M80 26 C72 18 88 12 80 2" />
          <path d="M102 30 C94 22 110 16 102 6" />
        </g>

        <g className="pot__lid">
          <rect x={70} y={34} width={20} height={8} rx={4} fill="#2b1d16" />
          <path
            d="M34 50 Q80 30 126 50 Z"
            fill="#62b8f2"
            stroke="#2b1d16"
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </g>

        <g className="pot__bubbles" fill="#fff6d8" stroke="#2b1d16" strokeWidth={2}>
          <circle cx={56} cy={58} r={5} />
          <circle cx={80} cy={56} r={6} />
          <circle cx={104} cy={58} r={4.5} />
        </g>

        <path d="M22 58 H138" stroke="#2b1d16" strokeWidth={5} strokeLinecap="round" />
        <path
          d="M30 58 H130 V92 C130 106 118 112 104 112 H56 C42 112 30 106 30 92 Z"
          fill="#d23a26"
          stroke="#2b1d16"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d="M30 70 H18 M130 70 H142" stroke="#2b1d16" strokeWidth={6} strokeLinecap="round" />
        <rect x={42} y={66} width={8} height={30} rx={4} fill="rgb(255 255 255 / 30%)" />

        <g className="pot__flames" stroke="#2b1d16" strokeWidth={2.5} strokeLinejoin="round">
          <path d="M56 136 C48 128 54 120 58 116 C60 124 66 126 62 136 Z" fill="#ff8a3d" />
          <path d="M80 136 C70 126 78 116 82 110 C84 120 92 124 86 136 Z" fill="#ffcf4a" />
          <path d="M104 136 C96 128 102 120 106 116 C108 124 114 126 110 136 Z" fill="#ff8a3d" />
        </g>
      </svg>
    </div>
  )
}
