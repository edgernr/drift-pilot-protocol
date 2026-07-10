import './cs0PatchDay.css'

/*
 * CS-0 — "PATCH DAY" (cold open · the world concept · 6 cards)
 * Script source: docs/void-shards-mmo-world-levels-1-3.md §7, CS-0 table.
 * All art is procedural SVG/CSS. Class prefix: .cs0-
 */

/* ============================================================ */
/* Shared geometry                                              */
/* ============================================================ */

// Thin-linework Seoul skyline (ground at y=610, viewBox 1200x675)
const BUILDINGS = [
  'M60 610 V480 H120 V610',
  'M140 610 V520 H185 V505 H210 V610',
  'M240 610 V430 H300 V610',
  'M330 610 V545 H395 V610',
  'M420 610 V470 H455 V450 H480 V610',
  'M555 610 L580 330 L588 255 L596 330 L621 610', // the Tower of Hunters, in linework
  'M660 610 V500 H700 V480 H730 V610',
  'M760 610 V440 H830 V610',
  'M860 610 V530 H920 V610',
  'M950 610 V465 H985 V490 H1020 V610',
  'M1050 610 V510 H1110 V610',
]
const ANTENNAS = ['M270 430 V398', 'M795 440 V406']
const WINDOW_TICKS = [
  [78, 500], [78, 522], [98, 511], [258, 455], [258, 477], [276, 466],
  [352, 560], [778, 470], [778, 492], [800, 481], [968, 505], [1072, 528],
]

// The Gate tear — a jagged magenta sliver in the sky
const TEAR_D =
  'M340 175 L405 142 L460 168 L520 118 L585 155 L645 108 L705 152 ' +
  'L770 128 L840 172 L775 168 L715 196 L650 170 L585 205 L515 178 ' +
  'L450 202 L395 178 Z'
const TEAR_CORE_D =
  'M430 170 L520 135 L585 166 L645 122 L705 158 L646 156 L585 190 L518 166 Z'

// Lone hunter silhouette — feet at local (0,0), ~130 units tall
function FigureSilhouette({ transform, className = '' }) {
  return (
    <g transform={transform} className={className}>
      <ellipse cx="0" cy="-114" rx="11" ry="12" className="cs0-fig" />
      <path
        d="M-18 -88 Q0 -103 18 -88 L24 -34 L16 -32 L13 0 L3 0 L1 -32 L-1 -32 L-3 0 L-13 0 L-16 -32 L-24 -34 Z"
        className="cs0-fig"
      />
    </g>
  )
}

/* ============================================================ */
/* Card 1 — black card, single blinking cyan cursor             */
/* ============================================================ */
function CursorArt() {
  return (
    <div className="cs0-fill cs0-black">
      <span className="cs0-cursor" aria-hidden="true" />
    </div>
  )
}

/* ============================================================ */
/* Card 2 — skyline linework, magenta tear opening in the sky   */
/* ============================================================ */
function SkylineTearArt() {
  return (
    <div className="cs0-fill">
      <svg className="cs0-svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="cs0-tearcast" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ff3d8b" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0" />
          </radialGradient>
          <filter id="cs0-blur12" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <rect width="1200" height="675" fill="#08080c" />

        {/* magenta light cast onto the sky under the tear */}
        <ellipse cx="590" cy="200" rx="420" ry="180" fill="url(#cs0-tearcast)" />

        {/* skyline — thin linework */}
        <g className="cs0-lines">
          <line x1="0" y1="610" x2="1200" y2="610" />
          {BUILDINGS.map((d, i) => <path key={i} d={d} />)}
          {ANTENNAS.map((d, i) => <path key={`a${i}`} d={d} />)}
        </g>
        <g className="cs0-ticks">
          {WINDOW_TICKS.map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={x + 14} y2={y} />
          ))}
        </g>

        {/* the tear — grows open, then flickers like bad signal */}
        <g className="cs0-tear-wrap">
          <path d={TEAR_D} className="cs0-tear-glow" filter="url(#cs0-blur12)" />
          <path d={TEAR_D} className="cs0-tear-main" />
          <path d={TEAR_CORE_D} className="cs0-tear-core" />
        </g>
      </svg>
      <div className="cs0-vig" />
    </div>
  )
}

/* ============================================================ */
/* Card 3 — the tear leaks downward; buildings glitch to static */
/* ============================================================ */
function GlitchCityArt() {
  const glitched = new Set([2, 7]) // tall towers that jitter into echoes
  const corrupted = new Set([4, 9]) // towers dissolving into crawling dashes
  return (
    <div className="cs0-fill">
      <svg className="cs0-svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="cs0-blur10" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <rect width="1200" height="675" fill="#08080c" />

        {/* skyline */}
        <g className="cs0-lines">
          <line x1="0" y1="610" x2="1200" y2="610" />
          {BUILDINGS.map((d, i) => {
            if (glitched.has(i)) {
              return (
                <g key={i} className="cs0-glitch">
                  <path d={d} className="cs0-echo-m" />
                  <path d={d} className="cs0-echo-c" />
                  <path d={d} />
                </g>
              )
            }
            if (corrupted.has(i)) {
              return (
                <g key={i}>
                  <path d={d} opacity="0.35" />
                  <path d={d} className="cs0-corrupt-ov" />
                </g>
              )
            }
            return <path key={i} d={d} />
          })}
          {ANTENNAS.map((d, i) => <path key={`a${i}`} d={d} />)}
        </g>

        {/* the tear, torn wider now */}
        <g className="cs0-tear-open">
          <path d={TEAR_D} className="cs0-tear-glow" filter="url(#cs0-blur10)" />
          <path d={TEAR_D} className="cs0-tear-main" />
          <path d={TEAR_CORE_D} className="cs0-tear-core" />
        </g>

        {/* corruption leaking downward out of the tear */}
        <g className="cs0-drips">
          <path d="M520 190 L512 260 L528 320 L515 400 L524 470" className="cs0-drip-glow" />
          <path d="M520 190 L512 260 L528 320 L515 400 L524 470" className="cs0-drip" />
          <path d="M585 205 L578 280 L596 350 L582 440 L590 520" className="cs0-drip-glow" />
          <path d="M585 205 L578 280 L596 350 L582 440 L590 520" className="cs0-drip" style={{ animationDelay: '-0.5s' }} />
          <path d="M700 190 L708 255 L694 330 L706 420" className="cs0-drip-glow" />
          <path d="M700 190 L708 255 L694 330 L706 420" className="cs0-drip" style={{ animationDelay: '-0.9s' }} />
        </g>
      </svg>
      {/* scan-line static over everything */}
      <div className="cs0-scan" />
      <div className="cs0-band" />
      <div className="cs0-vig" />
    </div>
  )
}

/* ============================================================ */
/* Card 4 — lone silhouette + wireframe Daemon assembling       */
/* (hex geometry echoes src/components/Daemon.jsx)              */
/* ============================================================ */
function DaemonAssemblyArt() {
  // element order = assembly order; each draws in with stroke-dashoffset
  const wire = (delay) => ({ className: 'cs0-dw', pathLength: 1, style: { animationDelay: `${delay}s` }, vectorEffect: 'non-scaling-stroke' })
  return (
    <div className="cs0-fill">
      <svg className="cs0-svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="cs0-tearcast4" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ff3d8b" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0" />
          </radialGradient>
          <filter id="cs0-blur8" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <rect width="1200" height="675" fill="#08080c" />

        {/* the tear, distant, high */}
        <ellipse cx="600" cy="150" rx="300" ry="120" fill="url(#cs0-tearcast4)" />
        <g transform="translate(300 65) scale(0.5)" className="cs0-tear-dim">
          <path d={TEAR_D} className="cs0-tear-glow" filter="url(#cs0-blur8)" />
          <path d={TEAR_D} className="cs0-tear-main" />
        </g>

        {/* ground */}
        <line x1="0" y1="560" x2="1200" y2="560" className="cs0-ground" />
        <ellipse cx="560" cy="562" rx="180" ry="7" fill="#04040a" opacity="0.8" />

        {/* the hunter, facing the tear */}
        <FigureSilhouette transform="translate(520 560) scale(1.15)" />

        {/* the Daemon — wireframe, assembling line by line */}
        <g transform="translate(650 348) scale(2.25)">
          <polygon points="68,50 54,74 26,74 12,50 26,26 54,26" {...wire(0.2)} />
          <polygon points="60,50 50,67 30,67 20,50 30,33 50,33" {...wire(0.55)} />
          <polygon points="55,50 48,63 32,63 25,50 32,37 48,37" {...wire(0.9)} />
          <polygon points="40,16 51,28 40,34 29,28" {...wire(1.25)} />
          <line x1="40" y1="16" x2="40" y2="10" {...wire(1.55)} />
          <circle cx="40" cy="8" r="3" {...wire(1.7)} />
          <polygon points="20,44 4,39 4,57 20,56" {...wire(1.9)} />
          <polygon points="60,44 76,39 76,57 60,56" {...wire(2.05)} />
          <line x1="33" y1="67" x2="28" y2="84" {...wire(2.25)} />
          <line x1="47" y1="67" x2="52" y2="84" {...wire(2.35)} />
          <circle cx="28" cy="86" r="3" {...wire(2.5)} />
          <circle cx="52" cy="86" r="3" {...wire(2.6)} />
          {/* eyes come online last */}
          <circle cx="34" cy="46" r="4" className="cs0-deye cs0-deye-glow" />
          <circle cx="34" cy="46" r="2.5" className="cs0-deye" />
          <circle cx="46" cy="46" r="4" className="cs0-deye cs0-deye-glow" style={{ animationDelay: '2.95s' }} />
          <circle cx="46" cy="46" r="2.5" className="cs0-deye" style={{ animationDelay: '2.95s' }} />
        </g>

        {/* compile motes rising off the build */}
        <g className="cs0-motes">
          <line x1="700" y1="540" x2="700" y2="528" className="cs0-rise" />
          <line x1="760" y1="548" x2="760" y2="538" className="cs0-rise" style={{ animationDelay: '0.9s' }} />
          <line x1="820" y1="544" x2="820" y2="532" className="cs0-rise" style={{ animationDelay: '1.7s' }} />
        </g>
      </svg>
      <div className="cs0-vig" />
    </div>
  )
}

/* ============================================================ */
/* Card 5 — the Tower of Hunters in gold, crest, licenses E→S   */
/* ============================================================ */
const TOWER_D =
  'M522 640 L522 585 L534 585 L534 528 L544 528 L544 472 L553 472 L553 420 ' +
  'L561 420 L561 372 L568 372 L568 327 L574 327 L574 286 L579 286 L579 249 ' +
  'L583.5 249 L583.5 215 L587 215 L587 185 L590 185 L590 158 L592.5 158 ' +
  'L592.5 134 L594.5 134 L594.5 113 L596 113 L596 95 L599 55 L600 42 ' +
  'L601 55 L604 95 L604 113 L605.5 113 L605.5 134 L607.5 134 L607.5 158 ' +
  'L610 158 L610 185 L613 185 L613 215 L616.5 215 L616.5 249 L621 249 ' +
  'L621 286 L626 286 L626 327 L632 327 L632 372 L639 372 L639 420 L647 420 ' +
  'L647 472 L656 472 L656 528 L666 528 L666 585 L678 585 L678 640 Z'

const RANKS = [
  { r: 'E', rot: -35, d: 0.1 },
  { r: 'D', rot: -21, d: 0.22 },
  { r: 'C', rot: -7, d: 0.34 },
  { r: 'B', rot: 7, d: 0.46 },
  { r: 'A', rot: 21, d: 0.58 },
  { r: 'S', rot: 35, d: 0.7 },
]

function TowerArt() {
  return (
    <div className="cs0-fill">
      <svg className="cs0-svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cs0-towerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5c453" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#8a6a24" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#3a2d10" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="cs0-goldHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#f5c453" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f5c453" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="675" fill="#08080c" />
        <ellipse cx="600" cy="280" rx="420" ry="300" fill="url(#cs0-goldHalo)" />

        {/* low gold city at the tower's feet */}
        <g className="cs0-goldlines">
          <line x1="0" y1="640" x2="1200" y2="640" />
          <path d="M80 640 V572 H150 V640" />
          <path d="M190 640 V596 H250 V640" />
          <path d="M300 640 V554 H344 V576 H380 V640" />
          <path d="M820 640 V568 H878 V640" />
          <path d="M920 640 V590 H1000 V640" />
          <path d="M1040 640 V548 H1090 V572 H1130 V640" />
        </g>

        {/* the Tower of Hunters — Y-plan wings + tapering setback spire */}
        <path d="M468 640 V604 H484 V566 H500 V534 H516 V640 Z" className="cs0-tower" />
        <path d="M732 640 V604 H716 V566 H700 V534 H684 V640 Z" className="cs0-tower" />
        <path d={TOWER_D} className="cs0-tower" />

        {/* the Association crest at the peak */}
        <g transform="translate(600 30)" className="cs0-crest">
          <circle r="24" className="cs0-crest-halo" />
          <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" className="cs0-crest-hex" />
          <polygon points="0,-7 6,0 0,7 -6,0" className="cs0-crest-core" />
        </g>

        {/* ranked license cards, E → S, fanning out */}
        <g transform="translate(950 480)">
          {RANKS.map(({ r, rot, d }) => (
            <g
              key={r}
              className={`cs0-lic ${r === 'S' ? 'cs0-lic-s' : ''}`}
              style={{ '--rot': `${rot}deg`, animationDelay: `${d}s` }}
            >
              <rect x="-44" y="-158" width="88" height="128" rx="7" className="cs0-lic-bg" />
              <rect x="-44" y="-158" width="88" height="22" rx="7" className="cs0-lic-band" />
              <text x="0" y="-72" className="cs0-lic-rank">{r}</text>
              <text x="0" y="-42" className="cs0-lic-micro">HUNTER LICENSE</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="cs0-vig" />
    </div>
  )
}

/* ============================================================ */
/* Card 6 — elevator interior, climbing floor counter,          */
/* the player's dark reflection in the glass                    */
/* ============================================================ */
function ElevatorArt() {
  return (
    <div className="cs0-fill">
      <svg className="cs0-svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cs0-glassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1016" />
            <stop offset="100%" stopColor="#08080c" />
          </linearGradient>
          <linearGradient id="cs0-floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12100c" />
            <stop offset="100%" stopColor="#08080c" />
          </linearGradient>
          <clipPath id="cs0-glassClip">
            <rect x="250" y="60" width="700" height="520" />
          </clipPath>
        </defs>
        <rect width="1200" height="675" fill="#08080c" />

        {/* cab geometry — gold-trimmed perspective walls */}
        <polygon points="0,0 250,60 950,60 1200,0" fill="#0c0a08" />
        <polygon points="0,675 250,580 950,580 1200,675" fill="url(#cs0-floorGrad)" />
        <polygon points="0,0 250,60 250,580 0,675" fill="#0a0910" />
        <polygon points="1200,0 950,60 950,580 1200,675" fill="#0a0910" />
        <g className="cs0-trim">
          <line x1="0" y1="169" x2="250" y2="190" />
          <line x1="0" y1="337" x2="250" y2="320" />
          <line x1="0" y1="506" x2="250" y2="450" />
          <line x1="1200" y1="169" x2="950" y2="190" />
          <line x1="1200" y1="337" x2="950" y2="320" />
          <line x1="1200" y1="506" x2="950" y2="450" />
          <line x1="250" y1="60" x2="950" y2="60" />
          <line x1="250" y1="580" x2="950" y2="580" />
        </g>

        {/* back glass wall */}
        <rect x="250" y="60" width="700" height="520" fill="url(#cs0-glassGrad)" />
        <g clipPath="url(#cs0-glassClip)">
          {/* floors streaking past — the cab is climbing */}
          <rect x="250" y="-40" width="700" height="5" className="cs0-lift-l" />
          <rect x="250" y="-40" width="700" height="3" className="cs0-lift-l" style={{ animationDelay: '-0.9s' }} />
          <rect x="250" y="-40" width="700" height="6" className="cs0-lift-l" style={{ animationDelay: '-1.7s' }} />
          <rect x="250" y="-40" width="700" height="3" className="cs0-lift-l" style={{ animationDelay: '-2.3s' }} />
          {/* the player's dark reflection */}
          <FigureSilhouette transform="translate(742 540) scale(1.3)" className="cs0-refl" />
        </g>
        {/* glass mullions + handrail */}
        <g className="cs0-trim">
          <line x1="483" y1="60" x2="483" y2="580" />
          <line x1="716" y1="60" x2="716" y2="580" />
          <line x1="250" y1="400" x2="950" y2="400" />
        </g>

        {/* ceiling light bar */}
        <rect x="450" y="26" width="300" height="9" rx="4" className="cs0-lightbar" />

        {/* floor counter — 100… 124… 148… */}
        <g>
          <rect x="536" y="88" width="128" height="56" rx="6" className="cs0-counter" />
          <text x="556" y="126" className="cs0-fl-up">▲</text>
          <text x="646" y="128" className="cs0-fl cs0-fl-1">100</text>
          <text x="646" y="128" className="cs0-fl cs0-fl-2">124</text>
          <text x="646" y="128" className="cs0-fl cs0-fl-3">148</text>
        </g>
      </svg>
      <div className="cs0-vig" />
    </div>
  )
}

/* ============================================================ */
/* The scene                                                    */
/* ============================================================ */
const cs0PatchDay = {
  id: 'cs0',
  title: 'PATCH DAY',
  cards: [
    {
      id: 'c1',
      art: <CursorArt />,
      holdMs: 600,
      lines: [<strong key="l">Seven years ago, reality started crashing.</strong>],
    },
    {
      id: 'c2',
      art: <SkylineTearArt />,
      lines: [
        'The first Gate opened over Seoul.',
        <>Through it, we saw the truth: underneath everything — the ground, the light, <em>you</em> — the world is written in code.</>,
      ],
    },
    {
      id: 'c3',
      art: <GlitchCityArt />,
      lines: [
        'Where the code corrupts, a Gate forms.',
        'What lives in the corruption comes out.',
      ],
    },
    {
      id: 'c4',
      art: <DaemonAssemblyArt />,
      lines: [
        <>The only people who can fight back are the ones who can <em>rewrite</em> it. Hunters.</>,
        <>They don&rsquo;t carry swords — they compile <strong>Daemons</strong>.</>,
      ],
    },
    {
      id: 'c5',
      art: <TowerArt />,
      tone: 'assoc',
      lines: [
        'The Hunter Association licenses them, ranks them, pays them in $SHARD.',
        <>It built the tallest tower on Earth directly over the first wound: <strong>the Tower of Hunters</strong>. A statement: <em>we hold the top of the world.</em></>,
      ],
    },
    {
      id: 'c6',
      art: <ElevatorArt />,
      lines: [
        'Today is your licensing exam.',
        <strong key="l2">Floor 152, the Tower of Hunters. Top of the world.</strong>,
        <em key="l3">(Remember that feeling.)</em>,
      ],
    },
  ],
}

export default cs0PatchDay
