import './cs5FirstKill.css'

/*
 * CS-5 — "FIRST KILL" (after Level 2 · the hunting-loop explainer · 4 cards)
 * Doc: void-shards-mmo-world-levels-1-3.md §7, CS-5 table.
 * Procedural art only — inline SVG + CSS (cs5FirstKill.css, .cs5- prefix).
 */

const CYAN = '#3df0e8'
const GOLD = '#f5c453'
const MAGENTA = '#ff3d8b'
const INK = '#eaf6f5'
const BG = '#08080c'
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const DISPLAY = "'Saira Condensed', 'Arial Narrow', sans-serif"

/* ---------- Card 1 — the Wraith dissolving into shards; the license glows up ---------- */

const SHARD_SEEDS = [
  [530, 392, 9, 0.0], [578, 448, 7, 0.5], [612, 380, 11, 1.1], [658, 470, 6, 1.7],
  [702, 415, 9, 0.3], [748, 455, 7, 2.2], [800, 398, 10, 0.9], [856, 445, 6, 1.4],
  [906, 420, 8, 2.6], [952, 436, 7, 1.9], [622, 432, 5, 3.0], [762, 384, 5, 2.4],
]

function ArtDissolve() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs5-lic-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,240,232,0.16)" />
          <stop offset="100%" stopColor="rgba(61,240,232,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />
      <line x1="240" y1="620" x2="1360" y2="620" stroke="rgba(61,240,232,0.10)" strokeWidth="1" />

      {/* the Broken-Markup Wraith — coming apart */}
      <g className="cs5-wraith">
        {/* hooded head */}
        <polygon points="420,300 452,332 420,354 388,332" fill="#0a0a11" stroke="rgba(61,240,232,0.5)" strokeWidth="1.3" />
        <circle className="cs5-wr-eye" cx="409" cy="331" r="3.2" fill={MAGENTA} />
        <circle cx="431" cy="331" r="2.4" fill="none" stroke="rgba(255,61,139,0.3)" strokeWidth="0.8" />
        {/* cloak — left edge holds, right edge already breaking to dashes */}
        <polyline points="400,356 362,420 352,500 342,562" fill="none" stroke="rgba(61,240,232,0.45)" strokeWidth="1.6" strokeLinejoin="round" />
        <polyline className="cs5-wr-tatter" points="440,356 484,424 492,498 506,556" fill="none" stroke="rgba(61,240,232,0.4)" strokeWidth="1.6" strokeDasharray="10 8" />
        {/* torn hem */}
        <polyline className="cs5-wr-tatter" points="342,562 366,538 382,566 402,540 420,568 442,544 462,566 484,542 506,556" fill="none" stroke="rgba(61,240,232,0.3)" strokeWidth="1.2" strokeDasharray="7 6" />
        {/* inner ribs */}
        <polyline points="404,372 386,436 380,506" fill="none" stroke="rgba(61,240,232,0.16)" strokeWidth="1" strokeDasharray="5 5" />
        <polyline className="cs5-wr-tatter" points="436,372 458,440 464,504" fill="none" stroke="rgba(61,240,232,0.16)" strokeWidth="1" strokeDasharray="4 7" />
        {/* the broken markup it was made of, falling out of it */}
        <text className="cs5-wr-glyph" x="386" y="428" fontFamily={MONO} fontSize="30" fill="rgba(61,240,232,0.4)">{'</'}</text>
        <text className="cs5-wr-glyph" style={{ animationDelay: '0.9s' }} x="428" y="472" fontFamily={MONO} fontSize="24" fill="rgba(61,240,232,0.32)">{'<h1'}</text>
        <text className="cs5-wr-glyph" style={{ animationDelay: '1.7s' }} x="396" y="516" fontFamily={MONO} fontSize="26" fill="rgba(61,240,232,0.28)">{'/>'}</text>
      </g>

      {/* shard stream — corruption stabilizing, drifting to the license */}
      {SHARD_SEEDS.map(([cx, cy, s, d], i) => (
        <polygon
          key={i}
          className="cs5-shard"
          style={{
            animationDelay: `${d}s`,
            '--dx': `${118 + (i % 3) * 26}px`,
            '--dy': `${((425 - cy) * 0.45).toFixed(0)}px`,
            '--rot': `${(i % 2 ? -1 : 1) * 55}deg`,
          }}
          points={`${cx},${cy - s} ${cx + s * 0.9},${cy + s * 0.5} ${cx - s * 0.8},${cy + s * 0.7}`}
          fill="rgba(61,240,232,0.16)"
          stroke={CYAN}
          strokeWidth="1.1"
        />
      ))}

      {/* the hunter license, glowing up as the shards arrive */}
      <circle className="cs5-lic-glowup" cx="1150" cy="425" r="250" fill="url(#cs5-lic-glow)" />
      <g transform="translate(980 320)">
        <rect width="340" height="210" fill="rgba(12,12,18,0.94)" stroke="rgba(245,196,83,0.45)" strokeWidth="1" />
        <rect className="cs5-lic-bright" width="340" height="210" fill="none" stroke={GOLD} strokeWidth="1.6" />
        <g stroke={GOLD} strokeWidth="2.5" fill="none">
          <path d="M0 22 V0 H22" />
          <path d="M318 0 H340 V22" />
          <path d="M340 188 V210 H318" />
          <path d="M22 210 H0 V188" />
        </g>
        <polygon points="44,32 62,54 44,76 26,54" fill="none" stroke={GOLD} strokeWidth="1.4" />
        <circle cx="44" cy="54" r="5" fill="none" stroke="rgba(245,196,83,0.6)" strokeWidth="1" />
        <text x="86" y="46" fontFamily={MONO} fontSize="11" letterSpacing="4" fill="rgba(245,196,83,0.6)">HUNTER ASSOCIATION</text>
        <text x="86" y="76" fontFamily={DISPLAY} fontWeight="600" fontSize="28" letterSpacing="3" fill={INK}>HUNTER LICENSE</text>
        <line x1="24" y1="96" x2="316" y2="96" stroke="rgba(245,196,83,0.3)" strokeWidth="1" />
        <text x="30" y="128" fontFamily={MONO} fontSize="10" letterSpacing="4" fill="rgba(122,173,176,0.6)">RANK</text>
        <text x="30" y="184" fontFamily={DISPLAY} fontWeight="700" fontSize="62" fill={GOLD}>E</text>
        <g fill="rgba(234,246,245,0.12)">
          <rect x="110" y="120" width="170" height="6" />
          <rect x="110" y="136" width="130" height="6" />
          <rect x="110" y="152" width="150" height="6" />
        </g>
        <text x="110" y="190" fontFamily={MONO} fontSize="10" letterSpacing="2" fill="rgba(122,173,176,0.55)">STATUS: PROVISIONAL — 1 KILL LOGGED</text>
      </g>
      {/* intake sparks at the card's edge */}
      <g fill={CYAN}>
        <circle className="cs5-intake" cx="972" cy="400" r="2.4" />
        <circle className="cs5-intake" style={{ animationDelay: '0.7s' }} cx="968" cy="438" r="2" />
        <circle className="cs5-intake" style={{ animationDelay: '1.3s' }} cx="974" cy="470" r="1.6" />
      </g>

      <text className="cs5-fade-late" x="240" y="668" fontFamily={MONO} fontSize="14" letterSpacing="3" fill="rgba(61,240,232,0.45)">KILL CONFIRMED — BROKEN-MARKUP WRAITH // CONTRACT 001 CLOSED</text>
    </svg>
  )
}

/* ---------- Card 2 — payout breakdown; RANK E — VALIDATED stamps in gold ---------- */

function PayMeter({ x, y, lit }) {
  return (
    <g>
      {[...Array(6)].map((_, i) => (
        <rect
          key={i}
          x={x + i * 34}
          y={y}
          width="26"
          height="14"
          fill={i < lit ? 'rgba(245,196,83,0.75)' : 'rgba(245,196,83,0.12)'}
          stroke="rgba(245,196,83,0.4)"
          strokeWidth="1"
        />
      ))}
    </g>
  )
}

function ArtPayout() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1600" height="900" fill={BG} />

      {/* rising gold motes */}
      <g fill="rgba(245,196,83,0.3)">
        <circle className="cs5-mote" cx="440" cy="720" r="2" />
        <circle className="cs5-mote" style={{ animationDelay: '1.3s' }} cx="1180" cy="780" r="1.5" />
        <circle className="cs5-mote" style={{ animationDelay: '2.6s' }} cx="1250" cy="500" r="2" />
        <circle className="cs5-mote" style={{ animationDelay: '3.9s' }} cx="380" cy="410" r="1.5" />
        <circle className="cs5-mote" style={{ animationDelay: '0.7s' }} cx="530" cy="840" r="1.6" />
      </g>

      <g className="cs5-payout">
        {/* card body + gold trim */}
        <rect x="550" y="200" width="500" height="500" fill="rgba(15,13,8,0.92)" stroke={GOLD} strokeWidth="1.6" />
        <rect x="562" y="212" width="476" height="476" fill="none" stroke="rgba(245,196,83,0.28)" strokeWidth="1" />
        <g stroke={GOLD} strokeWidth="3" fill="none">
          <path d="M542 224 V192 H574" />
          <path d="M1026 192 H1058 V224" />
          <path d="M1058 676 V708 H1026" />
          <path d="M574 708 H542 V676" />
        </g>

        {/* crest + header */}
        <polygon points="800,232 820,254 800,276 780,254" fill="none" stroke={GOLD} strokeWidth="1.4" />
        <circle cx="800" cy="254" r="5.5" fill="none" stroke={GOLD} strokeWidth="1.1" />
        <text x="800" y="306" textAnchor="middle" fontFamily={MONO} fontSize="14" letterSpacing="8" fill={GOLD}>CONTRACT PAYOUT</text>
        <text x="800" y="330" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="3" fill="rgba(122,173,176,0.6)">CONTRACT 001 — THE DOCUMENT TOMB</text>
        <line x1="610" y1="350" x2="990" y2="350" stroke="rgba(245,196,83,0.3)" strokeWidth="1" />

        {/* breakdown rows */}
        <g className="cs5-row" style={{ animationDelay: '0.4s' }}>
          <text x="618" y="406" fontFamily={DISPLAY} fontWeight="600" fontSize="28" letterSpacing="2" fill={GOLD}>$SHARD</text>
          <PayMeter x="780" y="390" lit={4} />
        </g>
        <g className="cs5-row" style={{ animationDelay: '0.7s' }}>
          <text x="618" y="466" fontFamily={DISPLAY} fontWeight="600" fontSize="28" letterSpacing="2" fill={INK}>XP</text>
          <PayMeter x="780" y="450" lit={5} />
        </g>
        <g className="cs5-row" style={{ animationDelay: '1.0s' }}>
          <text x="618" y="522" fontFamily={MONO} fontSize="13" letterSpacing="2" fill="rgba(122,173,176,0.7)">CLEAN-KILL BONUS</text>
          <PayMeter x="780" y="508" lit={2} />
        </g>
        <line x1="610" y1="552" x2="990" y2="552" stroke="rgba(245,196,83,0.3)" strokeWidth="1" />

        {/* the stamp */}
        <g className="cs5-stamp">
          <rect x="592" y="568" width="416" height="104" fill="none" stroke={GOLD} strokeWidth="3" />
          <rect x="600" y="576" width="400" height="88" fill="rgba(245,196,83,0.06)" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
          <text x="800" y="636" textAnchor="middle" fontFamily={DISPLAY} fontWeight="700" fontSize="40" letterSpacing="6" fill={GOLD}>RANK E — VALIDATED</text>
        </g>
        <circle className="cs5-stamp-ring" cx="800" cy="620" r="30" fill="none" stroke={GOLD} strokeWidth="2" />

        <text x="800" y="692" textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="3" fill="rgba(122,173,176,0.55)">AUTH: VERA // ASSOCIATION OPS</text>
      </g>
    </svg>
  )
}

/* ---------- Card 3 — presence dots far above; the player alone at the bottom ---------- */

const PRESENCE_DOTS = [
  [742, 288, 0.0], [864, 288, 1.1], [806, 296, 2.3],
  [758, 352, 0.6], [852, 352, 1.8],
  [780, 416, 2.9],
  [742, 480, 1.4], [856, 480, 0.2],
  [812, 544, 2.0],
]

function ArtPresence() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs5-floor-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,240,232,0.14)" />
          <stop offset="100%" stopColor="rgba(61,240,232,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />
      <circle className="cs5-you-glow" cx="800" cy="800" r="190" fill="url(#cs5-floor-glow)" />

      {/* converging guide edges */}
      <g className="cs5-guides" stroke="rgba(61,240,232,0.08)" strokeWidth="1">
        <line x1="360" y1="800" x2="790" y2="220" />
        <line x1="1240" y1="800" x2="810" y2="220" />
      </g>

      {/* the strata — wireframe floors of a bottomless building */}
      {[...Array(9)].map((_, i) => {
        const y = 800 - i * 64
        const w = 440 - i * 34
        return (
          <g key={i} className="cs5-stratum" style={{ animationDelay: `${(0.15 + i * 0.1).toFixed(2)}s` }}>
            <polygon
              points={`${800 - w},${y} 800,${y - 15} ${800 + w},${y} 800,${y + 15}`}
              fill="rgba(61,240,232,0.025)"
              stroke="rgba(61,240,232,0.32)"
              strokeWidth="1.1"
            />
            <polygon
              points={`${800 - w * 0.55},${y} 800,${y - 8} ${800 + w * 0.55},${y} 800,${y + 8}`}
              fill="none"
              stroke="rgba(61,240,232,0.12)"
              strokeWidth="1"
            />
          </g>
        )
      })}

      {/* other hunters — faint presence dots, all far above */}
      {PRESENCE_DOTS.map(([x, y, d], i) => (
        <circle key={i} className="cs5-dot" style={{ animationDelay: `${d}s` }} cx={x} cy={y} r="2.6" fill="rgba(61,240,232,0.5)" />
      ))}
      <text className="cs5-fade-late" x="920" y="330" fontFamily={MONO} fontSize="12" letterSpacing="3" fill="rgba(122,173,176,0.5)">HUNTERS — LIVE</text>

      {/* the surface, impossibly far up */}
      <g className="cs5-surface">
        <circle cx="800" cy="188" r="3" fill={GOLD} />
        <text x="800" y="164" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="5" fill="rgba(245,196,83,0.5)">SURFACE</text>
      </g>

      {/* the player — alone at the very bottom, brightest light on the map */}
      <circle className="cs5-you-ring" cx="800" cy="800" r="10" fill="none" stroke={CYAN} strokeWidth="1.5" />
      <circle cx="800" cy="800" r="14" fill="rgba(61,240,232,0.18)" />
      <circle cx="800" cy="800" r="5.5" fill={CYAN} />
      <text x="800" y="842" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="3" fill="rgba(61,240,232,0.8)">YOU — THE FLOOR</text>
    </svg>
  )
}

/* ---------- Card 4 — Mara's carving catching the light ---------- */

const CARVE_STYLE = { fontFamily: MONO, letterSpacing: '2px' }

function CarveText({ className, style, dim }) {
  const stroke = dim ? 'rgba(245,196,83,0.3)' : GOLD
  const sw = dim ? 5 : 1.1
  return (
    <g
      className={className}
      style={style}
      fontFamily={MONO}
      stroke={stroke}
      strokeWidth={sw}
      fill={GOLD}
      fillOpacity="0"
      strokeDasharray="420"
      strokeDashoffset="420"
    >
      <text x="960" y="430" textAnchor="middle" fontSize="44" style={CARVE_STYLE}>the corruption's just bad code.</text>
      <text x="960" y="502" textAnchor="middle" fontSize="44" style={CARVE_STYLE}>don't panic.</text>
      <text x="1240" y="572" textAnchor="end" fontSize="38" style={CARVE_STYLE}>— M</text>
    </g>
  )
}

function ArtCarving() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cs5-shaft-grad" x1="1" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="rgba(245,196,83,0.13)" />
          <stop offset="100%" stopColor="rgba(245,196,83,0)" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />

      {/* stone coursework */}
      <g stroke="rgba(122,173,176,0.10)" strokeWidth="1">
        {[...Array(7)].map((_, i) => (
          <line key={`c${i}`} x1="0" y1={140 + i * 120} x2="1600" y2={140 + i * 120} />
        ))}
        {/* offset joints */}
        <line x1="620" y1="140" x2="620" y2="260" />
        <line x1="980" y1="140" x2="980" y2="260" />
        <line x1="760" y1="260" x2="760" y2="380" />
        <line x1="1180" y1="260" x2="1180" y2="380" />
        <line x1="560" y1="380" x2="560" y2="500" />
        <line x1="1340" y1="380" x2="1340" y2="500" />
        <line x1="700" y1="500" x2="700" y2="620" />
        <line x1="1080" y1="500" x2="1080" y2="620" />
        <line x1="880" y1="620" x2="880" y2="740" />
        <line x1="1260" y1="620" x2="1260" y2="740" />
        <line x1="640" y1="740" x2="640" y2="860" />
      </g>

      {/* the Tomb entrance — a dark doorway, cracked lintel */}
      <polygon points="160,900 160,300 200,258 380,258 420,300 420,900" fill="#050508" stroke="rgba(122,173,176,0.28)" strokeWidth="1.4" />
      <line x1="200" y1="258" x2="200" y2="900" stroke="rgba(122,173,176,0.12)" strokeWidth="1" />
      <line x1="380" y1="258" x2="380" y2="900" stroke="rgba(122,173,176,0.12)" strokeWidth="1" />
      <polyline points="238,258 262,236 306,236 330,258" fill="none" stroke="rgba(122,173,176,0.25)" strokeWidth="1.2" />
      <polyline points="284,236 278,208 290,182" fill="none" stroke="rgba(122,173,176,0.16)" strokeWidth="1" />
      <text x="290" y="884" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="3" fill="rgba(122,173,176,0.4)">GATE 01 — THE DOCUMENT TOMB</text>

      {/* the light, catching it */}
      <polygon className="cs5-shaft" points="1180,0 1600,0 1600,190 1210,600 660,600 660,556" fill="url(#cs5-shaft-grad)" />
      <g fill="rgba(245,196,83,0.35)">
        <circle className="cs5-dust" cx="880" cy="330" r="1.8" />
        <circle className="cs5-dust" style={{ animationDelay: '1.1s' }} cx="1080" cy="270" r="1.4" />
        <circle className="cs5-dust" style={{ animationDelay: '2.2s' }} cx="1240" cy="200" r="1.8" />
        <circle className="cs5-dust" style={{ animationDelay: '3.0s' }} cx="990" cy="420" r="1.3" />
      </g>

      {/* the carving — warm glow layer under, etched strokes over */}
      <CarveText className="cs5-carve-glow" dim style={{ animationDelay: '1s, 1s, 4s' }} />
      <CarveText className="cs5-carve" style={{ animationDelay: '0.4s, 1.6s' }} />

      {/* stray scratch marks around the words */}
      <g className="cs5-fade-late" stroke="rgba(245,196,83,0.22)" strokeWidth="1">
        <line x1="640" y1="392" x2="666" y2="400" />
        <line x1="1288" y1="452" x2="1310" y2="446" />
        <line x1="700" y1="540" x2="718" y2="548" />
        <line x1="1258" y1="588" x2="1276" y2="596" />
      </g>
    </svg>
  )
}

/* ---------- the scene ---------- */

const cs5FirstKill = {
  id: 'cs5',
  title: 'FIRST KILL',
  cards: [
    {
      id: 'c1',
      art: <ArtDissolve />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      lines: [
        '«Confirmed kill. First contract closed.',
        'See the shards? Stabilized code.',
        'The world pays you for putting it back in order.»',
      ],
    },
    {
      id: 'c2',
      art: <ArtPayout />,
      speaker: 'VERA // HANDLER',
      tone: 'assoc',
      lines: [
        '«$SHARD spends everywhere the Association reaches. Rank opens deeper contracts.',
        'Clean kills — no damage taken — pay multipliers.',
        'Sloppy hunters stay poor.»',
      ],
    },
    {
      id: 'c3',
      art: <ArtPresence />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      lines: [
        "«You're not the only one climbing tonight. Every light on that map is a real hunter in a real Gate.",
        'Someday you raid with them.',
        "Tonight you're the deepest light on Earth.»",
      ],
    },
    {
      id: 'c4',
      art: <ArtCarving />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      holdMs: 800,
      lines: [
        "«…That carving. Hold on. That's not possible — nobody's ever hunted this deep.»",
        'A long pause on the comms.',
        "«Hunter. Who is 'M'?»",
      ],
    },
  ],
}

export default cs5FirstKill
