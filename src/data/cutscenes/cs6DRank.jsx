import './cs6DRank.css'

/*
 * CS-6 — "D-RANK" (after Level 3 · promotion + the hook · 4 cards)
 * Doc: void-shards-mmo-world-levels-1-3.md §7, CS-6 table. Copy verbatim.
 * Procedural art only — inline SVG + CSS (cs6DRank.css, .cs6- prefix).
 */

const CYAN = '#3df0e8'
const GOLD = '#f5c453'
const MAGENTA = '#ff3d8b'
const INK = '#eaf6f5'
const BG = '#08080c'
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const DISPLAY = "'Saira Condensed', 'Arial Narrow', sans-serif"

/* ---------- Card 1 — the Label Eater implodes; the registry is restored ---------- */
/* Boss geometry echoes LabelEaterSVG (src/components/EnemySVGs.jsx), rendered dying. */

const SLIPS = [
  { x: 590, y: 660, w: 30, h: 10, fill: 'rgba(234,246,245,0.6)', d: '2.3s' },
  { x: 700, y: 700, w: 26, h: 9, fill: 'rgba(61,240,232,0.55)', d: '2.7s' },
  { x: 820, y: 680, w: 32, h: 10, fill: 'rgba(234,246,245,0.5)', d: '3.1s' },
  { x: 930, y: 710, w: 24, h: 8, fill: 'rgba(61,240,232,0.45)', d: '2.5s' },
  { x: 1020, y: 650, w: 28, h: 9, fill: 'rgba(234,246,245,0.55)', d: '3.5s' },
  { x: 650, y: 560, w: 24, h: 8, fill: 'rgba(61,240,232,0.5)', d: '3.9s' },
  { x: 880, y: 590, w: 28, h: 9, fill: 'rgba(234,246,245,0.45)', d: '4.3s' },
  { x: 760, y: 630, w: 26, h: 9, fill: 'rgba(61,240,232,0.6)', d: '3.3s' },
]

const SHARDS = [
  { pts: '420,230 444,222 436,248', sx: '360px', sy: '190px' },
  { pts: '1180,250 1204,244 1194,270', sx: '-380px', sy: '170px' },
  { pts: '380,620 404,614 396,640', sx: '400px', sy: '-180px' },
  { pts: '1230,600 1252,594 1244,620', sx: '-430px', sy: '-160px' },
  { pts: '780,140 800,134 792,158', sx: '10px', sy: '280px' },
  { pts: '790,780 812,774 804,798', sx: '-4px', sy: '-330px' },
]

function ShelfColumn({ x0 }) {
  return (
    <g fill="rgba(61,240,232,0.02)" stroke="rgba(61,240,232,0.14)" strokeWidth="1">
      {[...Array(8)].map((_, r) => (
        <g key={r}>
          {[0, 1, 2].map((c) => (
            <rect key={c} x={x0 + c * 76} y={166 + r * 72} width="58" height="36" />
          ))}
        </g>
      ))}
    </g>
  )
}

function ArtImplosion() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1600" height="900" fill={BG} />

      {/* registry hall — shelf walls of record slots */}
      <ShelfColumn x0={96} />
      <ShelfColumn x0={1296} />
      {/* restored slots lighting back up */}
      <g fill="rgba(61,240,232,0.10)" stroke="rgba(61,240,232,0.55)" strokeWidth="1">
        <rect className="cs6-slot-lit" x={172} y={238} width="58" height="36" />
        <rect className="cs6-slot-lit" x={96} y={454} width="58" height="36" />
        <rect className="cs6-slot-lit" x={248} y={598} width="58" height="36" />
        <rect className="cs6-slot-lit" x={1372} y={310} width="58" height="36" />
        <rect className="cs6-slot-lit" x={1296} y={526} width="58" height="36" />
        <rect className="cs6-slot-lit" x={1448} y={670} width="58" height="36" />
      </g>
      <line x1="0" y1="756" x2="1600" y2="756" stroke="rgba(61,240,232,0.10)" strokeWidth="1" />

      {/* the Label Eater — collapsing inward */}
      <g className="cs6-eater">
        <g transform="translate(524 170) scale(4.6)">
          <polygon points="60,8 108,44 95,100 25,100 12,44" fill="rgba(245,196,83,0.06)" stroke={GOLD} strokeWidth="1.5" opacity="0.85" />
          <polyline points="44,8 52,20 60,8 68,20 76,8" stroke={GOLD} strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M32 72 L18 82 L32 92" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M88 72 L102 82 L88 92" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M38 82 Q60 96 82 82" stroke={GOLD} strokeWidth="1.5" fill="none" opacity="0.5" />
          <ellipse cx="46" cy="56" rx="6" ry="3" fill={GOLD} opacity="0.9" />
          <ellipse cx="74" cy="56" rx="6" ry="3" fill={GOLD} opacity="0.9" />
          <ellipse cx="60" cy="65" rx="20" ry="14" fill="rgba(245,196,83,0.06)" />
        </g>
      </g>

      {/* debris sucked into the collapse point */}
      <g fill="none" stroke="rgba(245,196,83,0.6)" strokeWidth="1.2">
        {SHARDS.map((s, i) => (
          <polygon key={i} className="cs6-shard" style={{ '--sx': s.sx, '--sy': s.sy }} points={s.pts} />
        ))}
      </g>

      {/* implosion flash + what remains */}
      <circle className="cs6-flash" cx="800" cy="430" r="30" fill="none" stroke={CYAN} strokeWidth="3" />
      <circle className="cs6-core" cx="800" cy="430" r="5" fill={CYAN} />

      {/* restored records fluttering up as light slips */}
      <g>
        {SLIPS.map((s, i) => (
          <rect key={i} className="cs6-slip" style={{ animationDelay: s.d }} x={s.x} y={s.y} width={s.w} height={s.h} rx="1" fill={s.fill} />
        ))}
      </g>

      <text className="cs6-late" x="60" y="120" fontFamily={MONO} fontSize="14" letterSpacing="3" fill="rgba(61,240,232,0.45)">GATE 03 — REGISTRY RESTORED · BOSS SIGNATURE TERMINATED</text>
    </svg>
  )
}

/* ---------- Card 2 — the license burns E → D; the Hunter Board ticker ---------- */

const TICKER_ENTRIES = [
  '#48,370 T.IBRA — D',
  '#48,371 R.VOSS — D',
  '#48,372 M.KADE — D',
  '#48,373 J.HAAS — D',
  '#48,374 S.OKAFOR — D',
  '#48,375 L.MERAZ — D',
  '#48,376 K.SOL — D',
]

function TickerRow() {
  return (
    <>
      {TICKER_ENTRIES.map((t, i) => (
        <text key={t} x={16 + i * 200} y="813" fontFamily={MONO} fontSize="15" letterSpacing="1" fill="rgba(245,196,83,0.4)">{t}</text>
      ))}
      <text className="cs6-you" x={16 + 7 * 200} y="813" fontFamily={MONO} fontSize="15" letterSpacing="1" fill={CYAN}>▲ #48,377 YOU — NEW</text>
    </>
  )
}

function ArtLicenseBurn() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id="cs6-ticker-clip">
          <rect x="0" y="770" width="1600" height="70" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill={BG} />

      <text className="cs6-late" x="60" y="120" fontFamily={MONO} fontSize="14" letterSpacing="4" fill="rgba(245,196,83,0.45)">RANK ASSESSMENT — REVISED</text>

      {/* the license card */}
      <g>
        <rect x="550" y="110" width="500" height="560" fill="rgba(15,13,8,0.92)" stroke={GOLD} strokeWidth="1.6" />
        <rect x="562" y="122" width="476" height="536" fill="none" stroke="rgba(245,196,83,0.28)" strokeWidth="1" />
        <g stroke={GOLD} strokeWidth="3" fill="none">
          <path d="M542 134 V102 H574" />
          <path d="M1026 102 H1058 V134" />
          <path d="M1058 646 V678 H1026" />
          <path d="M574 678 H542 V646" />
        </g>

        {/* Association crest */}
        <polygon points="800,146 820,168 800,190 780,168" fill="none" stroke={GOLD} strokeWidth="1.4" />
        <circle cx="800" cy="168" r="5.5" fill="none" stroke={GOLD} strokeWidth="1.2" />
        <line x1="772" y1="168" x2="756" y2="168" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <line x1="828" y1="168" x2="844" y2="168" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <text x="800" y="216" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="6" fill="rgba(245,196,83,0.55)">HUNTER ASSOCIATION</text>
        <line x1="610" y1="232" x2="990" y2="232" stroke="rgba(245,196,83,0.3)" strokeWidth="1" />
        <text x="800" y="284" textAnchor="middle" fontFamily={DISPLAY} fontWeight="600" fontSize="40" letterSpacing="8" fill={INK}>FIELD LICENSE</text>

        {/* rank seal — E burns away, D ignites */}
        <polygon points="800,338 862,374 862,446 800,482 738,446 738,374" fill="none" stroke={GOLD} strokeWidth="2" />
        <circle cx="800" cy="410" r="96" fill="none" stroke="rgba(245,196,83,0.3)" strokeWidth="1" strokeDasharray="4 6" />
        <circle className="cs6-dglow" cx="800" cy="410" r="58" fill="rgba(245,196,83,0.10)" />
        <text className="cs6-rank-e" x="800" y="436" textAnchor="middle" fontFamily={DISPLAY} fontWeight="700" fontSize="76" fill={INK}>E</text>
        <text className="cs6-rank-d" x="800" y="436" textAnchor="middle" fontFamily={DISPLAY} fontWeight="700" fontSize="76" fill={GOLD}>D</text>

        {/* burn licks + embers, magenta-to-gold */}
        <polygon className="cs6-flame" points="790,354 800,324 810,354" fill={MAGENTA} />
        <polygon className="cs6-flame" style={{ animationDelay: '1.3s' }} points="796,350 803,330 811,350" fill={GOLD} />
        <g>
          <circle className="cs6-ember" style={{ animationDelay: '0.9s' }} cx="782" cy="392" r="2.5" fill={MAGENTA} />
          <circle className="cs6-ember" style={{ animationDelay: '1.1s' }} cx="816" cy="380" r="2" fill={MAGENTA} />
          <circle className="cs6-ember" style={{ animationDelay: '1.4s' }} cx="796" cy="372" r="2.2" fill={GOLD} />
          <circle className="cs6-ember" style={{ animationDelay: '1.7s' }} cx="826" cy="402" r="1.8" fill={GOLD} />
          <circle className="cs6-ember" style={{ animationDelay: '2s' }} cx="772" cy="410" r="2" fill={GOLD} />
        </g>

        <text className="cs6-cap-e" x="800" y="520" textAnchor="middle" fontFamily={MONO} fontSize="14" letterSpacing="8" fill="rgba(245,196,83,0.75)">· RANK E ·</text>
        <text className="cs6-cap-d" x="800" y="520" textAnchor="middle" fontFamily={MONO} fontSize="14" letterSpacing="8" fill={GOLD}>· RANK D ·</text>

        <g fill="rgba(234,246,245,0.10)">
          <rect x="640" y="556" width="320" height="5" />
          <rect x="668" y="568" width="264" height="5" />
          <rect x="652" y="580" width="296" height="5" />
        </g>
        <text x="800" y="640" textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="3" fill="rgba(122,173,176,0.55)">AUTH: VERA // ASSOCIATION OPS — STRATUM 1 WITNESSED</text>
      </g>

      {/* the Hunter Board ticker — entering from the absolute bottom */}
      <text x="60" y="758" fontFamily={MONO} fontSize="11" letterSpacing="4" fill="rgba(245,196,83,0.5)">HUNTER BOARD — LIVE RANKINGS</text>
      <rect x="0" y="770" width="1600" height="70" fill="rgba(10,10,16,0.9)" />
      <line x1="0" y1="770" x2="1600" y2="770" stroke="rgba(245,196,83,0.25)" strokeWidth="1" />
      <line x1="0" y1="840" x2="1600" y2="840" stroke="rgba(245,196,83,0.25)" strokeWidth="1" />
      <g clipPath="url(#cs6-ticker-clip)">
        <g className="cs6-ticker">
          <g><TickerRow /></g>
          <g transform="translate(1600 0)"><TickerRow /></g>
        </g>
      </g>
    </svg>
  )
}

/* ---------- Card 3 — the surface at night; the titan on the Tower of Hunters; the tapping stops ---------- */

const STARS = [
  [120, 90, 1.4, '0s'], [340, 150, 1, '0.7s'], [520, 60, 1.6, '1.3s'], [660, 190, 1, '0.4s'],
  [1010, 80, 1.3, '1.8s'], [1180, 170, 1, '0.9s'], [1330, 60, 1.5, '0.2s'], [1490, 140, 1, '1.5s'],
  [230, 300, 1, '2.1s'], [1400, 320, 1.2, '0.6s'], [480, 380, 1, '1.1s'], [1120, 400, 1, '1.9s'],
]

function ArtTitanStill() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs6-titan-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,61,139,0.22)" />
          <stop offset="100%" stopColor="rgba(255,61,139,0)" />
        </radialGradient>
        <radialGradient id="cs6-tower-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(245,196,83,0.10)" />
          <stop offset="100%" stopColor="rgba(245,196,83,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />

      {/* night sky */}
      <g fill="rgba(234,246,245,0.5)">
        {STARS.map(([x, y, r, d], i) => (
          <circle key={i} className="cs6-star" style={{ animationDelay: d }} cx={x} cy={y} r={r} />
        ))}
      </g>

      <ellipse cx="800" cy="500" rx="420" ry="360" fill="url(#cs6-tower-glow)" />

      {/* city skyline linework */}
      <g stroke="rgba(245,196,83,0.22)" strokeWidth="1.2" fill="none">
        <polyline points="0,810 60,810 60,758 112,758 112,790 172,790 172,728 232,728 232,798 302,798 302,810 420,810 420,772 470,772 470,810" />
        <polyline points="1180,810 1180,780 1236,780 1236,810 1298,810 1298,768 1358,768 1358,742 1420,742 1420,796 1482,796 1482,810 1540,810 1540,760 1600,760" />
      </g>
      <g fill="rgba(245,196,83,0.3)">
        <rect x="84" y="770" width="2" height="2" /><rect x="140" y="796" width="2" height="2" />
        <rect x="200" y="744" width="2" height="2" /><rect x="440" y="782" width="2" height="2" />
        <rect x="1320" y="780" width="2" height="2" /><rect x="1388" y="754" width="2" height="2" />
        <rect x="1450" y="802" width="2" height="2" /><rect x="1566" y="774" width="2" height="2" />
      </g>
      <line x1="0" y1="810" x2="1600" y2="810" stroke="rgba(245,196,83,0.18)" strokeWidth="1" />

      {/* the Tower of Hunters, gold silhouette */}
      <g fill="rgba(245,196,83,0.07)" stroke={GOLD} strokeWidth="1.3">
        <line x1="800" y1="70" x2="800" y2="170" fill="none" strokeWidth="1.5" />
        <polygon points="790,170 810,170 822,430 778,430" />
        <polygon points="770,430 830,430 842,620 758,620" />
        <polygon points="742,620 858,620 872,810 728,810" />
        <polygon points="700,810 700,700 728,690 728,810" />
        <polygon points="672,810 672,760 700,752 700,810" />
        <polygon points="872,810 872,690 900,700 900,810" />
        <polygon points="900,810 900,752 928,760 928,810" />
      </g>
      <g stroke="rgba(245,196,83,0.35)" strokeWidth="0.7">
        <line x1="778" y1="430" x2="822" y2="430" />
        <line x1="758" y1="620" x2="842" y2="620" />
        <line x1="800" y1="190" x2="800" y2="410" strokeDasharray="2 8" />
        <line x1="786" y1="450" x2="786" y2="600" strokeDasharray="2 10" />
        <line x1="814" y1="450" x2="814" y2="600" strokeDasharray="2 10" />
        <line x1="770" y1="640" x2="770" y2="790" strokeDasharray="2 12" />
        <line x1="830" y1="640" x2="830" y2="790" strokeDasharray="2 12" />
      </g>

      {/* on the peak — the titan, perfectly still */}
      <circle className="cs6-aura" cx="808" cy="46" r="90" fill="url(#cs6-titan-aura)" />
      <circle className="cs6-still" cx="808" cy="46" r="90" fill="url(#cs6-titan-aura)" />
      <g transform="translate(784 -36) scale(1.6)">
        <g fill="#07050c" stroke="rgba(255,61,139,0.5)" strokeWidth="1" strokeLinejoin="round">
          <polygon points="2,0 12,4 13,14 4,18 -4,12 -3,4" />
          <polygon points="-8,16 16,16 22,30 -14,32" />
          <polygon points="-12,30 20,30 16,52 -16,50" />
          <polygon points="-16,50 16,52 14,62 -14,62" />
          <polygon points="8,36 20,40 16,56 6,52" />
          <polygon points="16,54 22,52 24,66 16,66" />
          <polygon points="-14,60 6,62 4,66 -16,66" />
          <polygon points="16,26 26,30 24,42 14,38" />
          <polygon points="22,40 40,46 39,52 20,46" />
        </g>
        {/* one finger, tapping — then it STOPS (finite iteration) */}
        <g className="cs6-finger">
          <line x1="38" y1="48" x2="50" y2="53" stroke="rgba(255,61,139,0.6)" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        {/* the eye lights when the tapping stops */}
        <circle className="cs6-still" cx="8" cy="9" r="1.6" fill={MAGENTA} />
      </g>

      <text className="cs6-late" x="60" y="120" fontFamily={MONO} fontSize="14" letterSpacing="3" fill="rgba(245,196,83,0.4)">THE SURFACE — EXAM SITE: UNRECLAIMED</text>
    </svg>
  )
}

/* ---------- Card 4 — the black-blooded forearm, one pulse; the season tag ---------- */

const VEINS = [
  'M -20 760 C 340 640, 720 560, 1180 505 C 1350 486, 1500 474, 1640 466',
  'M 560 646 C 700 640, 820 668, 930 716',
  'M 820 556 C 960 520, 1120 512, 1260 514',
  'M 1040 528 C 1120 552, 1180 580, 1240 616',
  'M 300 700 C 380 706, 450 730, 510 764',
]

function ArtBloodPulse() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1600" height="900" fill={BG} />

      {/* the season tag — small display type in the art */}
      <g className="cs6-season">
        <line x1="560" y1="112" x2="668" y2="112" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <text x="800" y="118" textAnchor="middle" fontFamily={MONO} fontSize="14" letterSpacing="10" fill={GOLD}>SEASON 01 CONTINUES</text>
        <line x1="932" y1="112" x2="1040" y2="112" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <text x="800" y="164" textAnchor="middle" fontFamily={DISPLAY} fontWeight="600" fontSize="30" letterSpacing="8" fill={INK}>NEXT: THE SEMANTIC CRYPT</text>
        <text x="800" y="192" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="6" fill="rgba(122,173,176,0.7)">DEEPER INTO THE FOUNDRY</text>
      </g>

      {/* something very deep and very far below */}
      <circle className="cs6-below" cx="760" cy="862" r="10" fill="none" stroke={CYAN} strokeWidth="1.5" />
      <circle className="cs6-below-dot" cx="760" cy="862" r="3" fill={CYAN} />
      <g stroke="rgba(61,240,232,0.25)" strokeWidth="1">
        <line x1="748" y1="880" x2="772" y2="880" />
        <line x1="753" y1="888" x2="767" y2="888" />
      </g>

      {/* the forearm — extreme close-up, diagonal across the frame */}
      <path d="M -60 656 C 320 540, 760 430, 1660 352 L 1660 700 C 900 740, 400 810, -60 900 Z" fill="#0f0b13" />
      <path d="M -60 656 C 320 540, 760 430, 1660 352" fill="none" stroke="rgba(255,61,139,0.3)" strokeWidth="2" />
      <path d="M -60 900 C 400 810, 900 740, 1660 700" fill="none" stroke="rgba(255,61,139,0.12)" strokeWidth="1.5" />
      {/* skin creases */}
      <g stroke="rgba(255,61,139,0.08)" strokeWidth="1.5" fill="none">
        <path d="M 180 700 C 420 620, 700 560, 980 528" />
        <path d="M 900 640 C 1120 604, 1340 580, 1560 566" />
      </g>

      {/* black-blooded veins — glow under, black blood over, one pulse */}
      {VEINS.map((d, i) => (
        <g key={i}>
          <path className="cs6-vein-glow" d={d} stroke={MAGENTA} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d={d} stroke="#040109" strokeWidth="6.5" fill="none" strokeLinecap="round" />
          <path className="cs6-vein-core" d={d} stroke={MAGENTA} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

/* ---------- the scene ---------- */

const cs6DRank = {
  id: 'cs6',
  title: 'D-RANK',
  cards: [
    {
      id: 'c1',
      art: <ArtImplosion />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      lines: [
        '«Boss kill confirmed. An E-rank soloing a D-rank boss on their third dive.',
        "The Board is going to think I'm falsifying logs.»",
      ],
    },
    {
      id: 'c2',
      art: <ArtLicenseBurn />,
      speaker: 'VERA // HANDLER',
      tone: 'assoc',
      lines: [
        <><strong className="cs6-gold">RANK D — LICENSED.</strong></>,
        '«One stratum witnessed. Nine to go.',
        "At this rate… no. I'm not saying it out loud. I'll jinx it.»",
      ],
    },
    {
      id: 'c3',
      art: <ArtTitanStill />,
      tone: 'gorgoroth',
      holdMs: 800,
      lines: [
        <>Far above the lands, on the throne he made of your exam floor — the tapping <strong>stops</strong>.</>,
      ],
    },
    {
      id: 'c4',
      art: <ArtBloodPulse />,
      speaker: 'GORGOROTH BLACKBLOOD',
      tone: 'gorgoroth',
      lines: [
        'His blood felt that kill.',
        <><strong>"Faster, little glitch."</strong></>,
      ],
    },
  ],
}

export default cs6DRank
