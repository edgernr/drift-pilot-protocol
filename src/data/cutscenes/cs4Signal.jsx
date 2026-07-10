import './cs4Signal.css'

/*
 * CS-4 — "SIGNAL" (waking at the Floor · VERA recruitment · 6 cards)
 * Doc: void-shards-mmo-world-levels-1-3.md §7, CS-4 table.
 * Procedural art only — inline SVG + CSS (cs4Signal.css, .cs4- prefix).
 */

const CYAN = '#3df0e8'
const GOLD = '#f5c453'
const MAGENTA = '#ff3d8b'
const INK = '#eaf6f5'
const BG = '#08080c'
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const DISPLAY = "'Saira Condensed', 'Arial Narrow', sans-serif"

/* ---------- Card 1 — black; cyan comms waveform crackling to life ---------- */

const WAVE_PATH =
  'M -60 450 H 150 L 178 432 L 206 468 L 232 450 H 340 L 366 384 L 394 518 L 420 450 ' +
  'H 560 L 584 440 L 608 460 L 630 450 H 730 L 756 300 L 788 594 L 818 450 H 960 ' +
  'L 984 436 L 1008 462 L 1030 450 H 1140 L 1166 396 L 1194 510 L 1220 450 H 1360 ' +
  'L 1382 442 L 1404 458 L 1424 450 H 1660'

function ArtWaveform() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1600" height="900" fill={BG} />
      {/* faint scope grid */}
      <g stroke="rgba(61,240,232,0.05)" strokeWidth="1">
        {[...Array(9)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={90 + i * 90} x2="1600" y2={90 + i * 90} />
        ))}
        {[...Array(15)].map((_, i) => (
          <line key={`v${i}`} x1={100 + i * 100} y1="0" x2={100 + i * 100} y2="900" />
        ))}
      </g>
      <line x1="0" y1="450" x2="1600" y2="450" stroke="rgba(61,240,232,0.10)" strokeWidth="1" />
      {/* waveform: glow pass + core pass, drawn in + crackling */}
      <path className="cs4-wave-glow" d={WAVE_PATH} fill="none" stroke={CYAN} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
      <path className="cs4-wave-core" d={WAVE_PATH} fill="none" stroke={CYAN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* static crackle ticks */}
      <g className="cs4-wave-static" stroke="rgba(61,240,232,0.55)" strokeWidth="1.4">
        <line x1="330" y1="446" x2="337" y2="454" />
        <line x1="742" y1="443" x2="751" y2="457" />
        <line x1="1122" y1="445" x2="1131" y2="455" />
        <line x1="512" y1="448" x2="518" y2="452" />
      </g>
      <g className="cs4-fade-late">
        <text x="60" y="120" fontFamily={MONO} fontSize="15" letterSpacing="6" fill="rgba(61,240,232,0.4)">INCOMING TRANSMISSION</text>
        <text x="60" y="146" fontFamily={MONO} fontSize="12" letterSpacing="4" fill="rgba(122,173,176,0.4)">CH 07 — ASSOCIATION OPS BAND</text>
      </g>
    </svg>
  )
}

/* ---------- Card 2 — sitting up in the crater; VERA's holo-panel resolving ---------- */

function ArtCrater() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs4-crater-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,240,232,0.13)" />
          <stop offset="100%" stopColor="rgba(61,240,232,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />
      <circle cx="800" cy="640" r="280" fill="url(#cs4-crater-glow)" />

      {/* crater cross-section */}
      <path d="M0 648 H540 L580 664 L622 700 Q800 756 978 700 L1020 664 L1060 648 H1600" fill="none" stroke="rgba(61,240,232,0.4)" strokeWidth="2" />
      <ellipse cx="800" cy="712" rx="210" ry="34" fill="none" stroke="rgba(61,240,232,0.14)" />
      <g stroke="rgba(61,240,232,0.10)" strokeWidth="1.5">
        <line x1="640" y1="706" x2="626" y2="722" />
        <line x1="700" y1="730" x2="688" y2="748" />
        <line x1="760" y1="742" x2="750" y2="760" />
        <line x1="840" y1="742" x2="852" y2="760" />
        <line x1="900" y1="728" x2="912" y2="746" />
        <line x1="960" y1="706" x2="974" y2="722" />
      </g>
      <g stroke="rgba(61,240,232,0.28)" strokeWidth="1.2" fill="none">
        <polyline points="560,652 500,668 470,662" />
        <polyline points="1044,652 1104,670 1140,664" />
      </g>
      {/* rim debris */}
      <g fill="#0c0c14" stroke="rgba(61,240,232,0.25)" strokeWidth="1">
        <polygon points="600,690 618,684 624,698 604,702" />
        <polygon points="986,684 1004,680 1010,694 990,698" />
        <polygon points="702,722 714,718 718,728 704,730" />
      </g>

      {/* player silhouette — angular, sitting up */}
      <g className="cs4-figure" fill="#0a0a11" stroke="rgba(61,240,232,0.5)" strokeWidth="1.3" strokeLinejoin="round">
        <polygon points="800,566 815,576 813,596 799,603 785,595 787,575" />
        <polygon points="789,606 819,610 830,652 823,670 779,670 775,634" />
        <polygon points="821,622 860,662 852,671 815,640" />
        <polygon points="850,664 868,670 864,679 848,675" />
        <polygon points="787,628 758,654 765,662 793,638" />
        <polygon points="779,662 742,682 749,695 797,680" />
        <polygon points="743,684 764,702 776,695 757,678" />
      </g>
      {/* the Void-mark on the wrist */}
      <circle className="cs4-mark" cx="762" cy="656" r="9" fill="rgba(61,240,232,0.25)" />
      <circle className="cs4-mark" cx="762" cy="656" r="4" fill={CYAN} />

      {/* dust motes */}
      <g fill="rgba(61,240,232,0.35)">
        <circle className="cs4-dust" cx="640" cy="600" r="2" />
        <circle className="cs4-dust" style={{ animationDelay: '0.8s' }} cx="720" cy="560" r="1.5" />
        <circle className="cs4-dust" style={{ animationDelay: '1.6s' }} cx="880" cy="585" r="2" />
        <circle className="cs4-dust" style={{ animationDelay: '2.4s' }} cx="940" cy="630" r="1.5" />
        <circle className="cs4-dust" style={{ animationDelay: '3.1s' }} cx="770" cy="540" r="1.2" />
      </g>

      {/* comms tether */}
      <line x1="952" y1="540" x2="872" y2="608" stroke="rgba(61,240,232,0.3)" strokeDasharray="2 6" />

      {/* holographic comms panel */}
      <g className="cs4-panel">
        <g transform="translate(950 430)">
          <rect width="340" height="210" fill="rgba(61,240,232,0.06)" stroke="rgba(61,240,232,0.55)" strokeWidth="1" />
          <g stroke={CYAN} strokeWidth="2.5" fill="none">
            <path d="M0 26 V0 H26" />
            <path d="M314 0 H340 V26" />
            <path d="M340 184 V210 H314" />
            <path d="M26 210 H0 V184" />
          </g>
          <rect className="cs4-panel-scan" x="2" y="6" width="336" height="5" fill="rgba(61,240,232,0.12)" />
          <text x="20" y="38" fontFamily={MONO} fontSize="16" letterSpacing="2" fill={CYAN}>HANDLER // VERA</text>
          <text x="20" y="60" fontFamily={MONO} fontSize="11" letterSpacing="4" fill="rgba(245,196,83,0.8)">— ASSOCIATION OPS</text>
          <line x1="20" y1="74" x2="320" y2="74" stroke="rgba(61,240,232,0.25)" />
          <polyline className="cs4-panel-wave" points="20,110 50,110 62,96 74,124 86,110 130,110 142,102 154,118 166,110 210,110 224,88 238,132 252,110 300,110 320,110" fill="none" stroke={CYAN} strokeWidth="1.5" />
          <g fill="rgba(234,246,245,0.14)">
            <rect x="20" y="146" width="180" height="5" />
            <rect x="20" y="158" width="220" height="5" />
            <rect x="20" y="170" width="140" height="5" />
          </g>
          <text x="20" y="196" fontFamily={MONO} fontSize="10" letterSpacing="2" fill="rgba(122,173,176,0.6)">LINK: UNSTABLE — DEPTH: NEGATIVE</text>
        </g>
      </g>
    </svg>
  )
}

/* ---------- Card 3 — the wireframe strata map blooming overhead ---------- */

const STRATA = [
  'THE FOUNDRY',
  'THE LIVING SIGNAL',
  'THE WORKFLOW WASTES',
  'THE FRAMEWORK SPIRE',
  'THE TYPE CITADEL',
  'THE PROVING GROUNDS',
  'THE SIGNAL REACH',
  "THE GATEKEEPER'S VAULT",
  'THE DEEP RENDER',
]

function ArtStrataMap() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs4-map-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,240,232,0.12)" />
          <stop offset="100%" stopColor="rgba(61,240,232,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />
      <circle cx="800" cy="830" r="200" fill="url(#cs4-map-glow)" />

      {/* converging guide edges */}
      <g className="cs4-guides" stroke="rgba(61,240,232,0.08)" strokeWidth="1">
        <line x1="370" y1="758" x2="788" y2="192" />
        <line x1="1230" y1="758" x2="812" y2="192" />
      </g>

      {/* the strata — floors of a bottomless building */}
      {STRATA.map((name, i) => {
        const y = 762 - i * 64
        const w = 430 - i * 36
        const right = i % 2 === 0
        return (
          <g key={name} className="cs4-stratum" style={{ animationDelay: `${(0.2 + i * 0.13).toFixed(2)}s` }}>
            <polygon
              points={`${800 - w},${y} 800,${y - 16} ${800 + w},${y} 800,${y + 16}`}
              fill="rgba(61,240,232,0.03)"
              stroke="rgba(61,240,232,0.45)"
              strokeWidth="1.2"
            />
            <polygon
              points={`${800 - w * 0.55},${y} 800,${y - 9} ${800 + w * 0.55},${y} 800,${y + 9}`}
              fill="none"
              stroke="rgba(61,240,232,0.16)"
              strokeWidth="1"
            />
            <text
              x={right ? 800 + w + 24 : 800 - w - 24}
              y={y + 4}
              textAnchor={right ? 'start' : 'end'}
              fontFamily={MONO}
              fontSize="13"
              letterSpacing="2"
              fill="rgba(61,240,232,0.35)"
            >
              {name}
            </text>
          </g>
        )
      })}

      {/* the surface — a single gold point, impossibly far up */}
      <g className="cs4-surface">
        <circle className="cs4-pulse" cx="800" cy="180" r="10" fill="rgba(245,196,83,0.2)" />
        <circle cx="800" cy="180" r="3.2" fill={GOLD} />
        <text x="800" y="156" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="5" fill="rgba(245,196,83,0.5)">SURFACE</text>
      </g>

      {/* the player's position */}
      <g>
        <circle className="cs4-ring" cx="800" cy="830" r="10" fill="none" stroke={CYAN} strokeWidth="1.5" />
        <circle cx="800" cy="830" r="5" fill={CYAN} />
        <text x="800" y="864" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="3" fill="rgba(61,240,232,0.7)">YOU — THE FLOOR</text>
      </g>
    </svg>
  )
}

/* ---------- Card 4 — the cracked Daemon, barely holding a form ---------- */
/* Hexagon geometry mirrors src/components/Daemon.jsx, rendered damaged. */

const DAEMON_MAIN_HEX = '60,50 50,67 30,67 20,50 30,33 50,33'

function ArtCrackedDaemon() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs4-daemon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,240,232,0.12)" />
          <stop offset="100%" stopColor="rgba(61,240,232,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />
      <circle cx="800" cy="460" r="320" fill="url(#cs4-daemon-glow)" />
      <ellipse cx="800" cy="700" rx="150" ry="18" fill="rgba(61,240,232,0.05)" />
      <line x1="500" y1="700" x2="1100" y2="700" stroke="rgba(61,240,232,0.12)" strokeWidth="1" />

      <g className="cs4-daemon" transform="translate(620 240) scale(4.5)">
        {/* chromatic glitch ghosts of the main body hex */}
        <g className="cs4-d-glitch-m">
          <polygon points={DAEMON_MAIN_HEX} fill="none" stroke={MAGENTA} strokeWidth="0.8" />
        </g>
        <g className="cs4-d-glitch-c">
          <polygon points={DAEMON_MAIN_HEX} fill="none" stroke={CYAN} strokeWidth="0.8" />
        </g>

        {/* outer aura hex — fractured to dashes */}
        <polygon className="cs4-d-aura" points="68,50 54,74 26,74 12,50 26,26 54,26" fill="none" stroke="rgba(61,240,232,0.25)" strokeWidth="0.8" strokeDasharray="10 7" />

        {/* main body hex — broken outline with a missing segment */}
        <polyline points="50,67 30,67 20,50 30,33" fill="none" stroke={CYAN} strokeWidth="1.6" strokeLinejoin="round" />
        <polyline points="50,33 60,50 55,58" fill="none" stroke={CYAN} strokeWidth="1.6" strokeLinejoin="round" />
        <line className="cs4-d-frag" x1="53" y1="62" x2="50" y2="67" stroke="rgba(61,240,232,0.6)" strokeWidth="1.2" />

        {/* inner body hex — faint */}
        <polygon points="55,50 48,63 32,63 25,50 32,37 48,37" fill="rgba(61,240,232,0.05)" stroke="rgba(61,240,232,0.3)" strokeWidth="0.8" strokeDasharray="6 4" />

        {/* the crack — a dark fissure with a corrupted magenta hairline */}
        <polyline points="36,35 40,46 37,54 43,63" fill="none" stroke={BG} strokeWidth="2" />
        <polyline className="cs4-d-crack" points="37,35 41,46 38,54 44,63" fill="none" stroke="rgba(255,61,139,0.45)" strokeWidth="0.6" />

        {/* head diamond */}
        <polygon className="cs4-d-head" points="40,16 51,28 40,34 29,28" fill="rgba(61,240,232,0.08)" stroke={CYAN} strokeWidth="0.9" />

        {/* top beam + dead energy node */}
        <line x1="40" y1="16" x2="40" y2="10" stroke="rgba(61,240,232,0.3)" strokeWidth="0.8" />
        <circle className="cs4-d-node-dead" cx="40" cy="8" r="3" fill="none" stroke="rgba(61,240,232,0.35)" strokeWidth="0.8" />

        {/* eyes — one flickering, one dead */}
        <circle cx="34" cy="46" r="4" fill="rgba(61,240,232,0.2)" />
        <circle className="cs4-d-eye" cx="34" cy="46" r="2.5" fill={CYAN} />
        <circle cx="46" cy="46" r="2.5" fill="none" stroke="rgba(61,240,232,0.35)" strokeWidth="0.6" />

        {/* arms — one holding, one a phantom outline */}
        <polygon points="20,44 4,39 4,57 20,56" fill="rgba(61,240,232,0.10)" stroke="rgba(61,240,232,0.6)" strokeWidth="0.8" />
        <polygon points="60,44 76,39 76,57 60,56" fill="none" stroke="rgba(61,240,232,0.35)" strokeWidth="0.8" strokeDasharray="4 4" />

        {/* trailing energy traces + lower nodes */}
        <line x1="33" y1="67" x2="28" y2="84" stroke="rgba(61,240,232,0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="47" y1="67" x2="52" y2="84" stroke="rgba(61,240,232,0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="28" cy="86" r="3" fill="rgba(61,240,232,0.25)" />
        <circle cx="52" cy="86" r="3" fill="none" stroke="rgba(61,240,232,0.3)" strokeWidth="0.8" />
      </g>

      {/* drifting hull fragments */}
      <g fill="none" stroke="rgba(61,240,232,0.4)" strokeWidth="1.2">
        <polygon className="cs4-float" points="1010,380 1030,372 1024,394" />
        <polygon className="cs4-float" style={{ animationDelay: '1.4s' }} points="580,470 596,462 600,482 584,486" />
        <polygon className="cs4-float" style={{ animationDelay: '2.6s' }} points="990,560 1004,556 1000,572" />
      </g>

      <text className="cs4-fade-late" x="630" y="746" fontFamily={MONO} fontSize="14" letterSpacing="3" fill="rgba(61,240,232,0.45)">DAEMON // INTEGRITY: 07% — REBUILD REQUIRED</text>
    </svg>
  )
}

/* ---------- Card 5 — the contract card, gold trim, materializing ---------- */

function ArtContract() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cs4-shine-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(245,196,83,0)" />
          <stop offset="50%" stopColor="rgba(245,196,83,0.22)" />
          <stop offset="100%" stopColor="rgba(245,196,83,0)" />
        </linearGradient>
        <clipPath id="cs4-card-clip">
          <rect x="560" y="210" width="480" height="480" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill={BG} />

      {/* rising gold motes */}
      <g fill="rgba(245,196,83,0.3)">
        <circle className="cs4-part" cx="480" cy="700" r="2" />
        <circle className="cs4-part" style={{ animationDelay: '1.2s' }} cx="1130" cy="760" r="1.5" />
        <circle className="cs4-part" style={{ animationDelay: '2.4s' }} cx="1210" cy="520" r="2" />
        <circle className="cs4-part" style={{ animationDelay: '3.6s' }} cx="420" cy="420" r="1.5" />
        <circle className="cs4-part" style={{ animationDelay: '4.8s' }} cx="1060" cy="300" r="1.2" />
        <circle className="cs4-part" style={{ animationDelay: '0.6s' }} cx="560" cy="820" r="1.6" />
      </g>

      <g className="cs4-contract">
        {/* card body + gold trim */}
        <rect x="560" y="210" width="480" height="480" fill="rgba(15,13,8,0.92)" stroke={GOLD} strokeWidth="1.6" />
        <rect x="572" y="222" width="456" height="456" fill="none" stroke="rgba(245,196,83,0.28)" strokeWidth="1" />
        <g stroke={GOLD} strokeWidth="3" fill="none">
          <path d="M552 234 V202 H584" />
          <path d="M1016 202 H1048 V234" />
          <path d="M1048 666 V698 H1016" />
          <path d="M584 698 H552 V666" />
        </g>

        {/* Association crest */}
        <polygon points="800,244 822,268 800,292 778,268" fill="none" stroke={GOLD} strokeWidth="1.4" />
        <circle cx="800" cy="268" r="6" fill="none" stroke={GOLD} strokeWidth="1.2" />
        <line x1="770" y1="268" x2="754" y2="268" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <line x1="830" y1="268" x2="846" y2="268" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <text x="800" y="318" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="6" fill="rgba(245,196,83,0.55)">HUNTER ASSOCIATION</text>
        <line x1="620" y1="336" x2="980" y2="336" stroke="rgba(245,196,83,0.3)" strokeWidth="1" />

        {/* the contract */}
        <text x="800" y="392" textAnchor="middle" fontFamily={DISPLAY} fontWeight="600" fontSize="44" letterSpacing="10" fill={GOLD}>CONTRACT 001</text>
        <text x="800" y="452" textAnchor="middle" fontFamily={DISPLAY} fontWeight="600" fontSize="52" letterSpacing="4" fill={INK}>THE DOCUMENT TOMB</text>

        {/* rank seal */}
        <polygon points="800,498 834,518 834,558 800,578 766,558 766,518" fill="none" stroke={GOLD} strokeWidth="2" />
        <circle cx="800" cy="538" r="44" fill="none" stroke="rgba(245,196,83,0.3)" strokeWidth="1" strokeDasharray="4 6" />
        <text x="800" y="554" textAnchor="middle" fontFamily={DISPLAY} fontWeight="700" fontSize="44" fill={GOLD}>E</text>
        <text x="800" y="608" textAnchor="middle" fontFamily={MONO} fontSize="15" letterSpacing="8" fill="rgba(245,196,83,0.75)">· RANK E ·</text>

        {/* dossier lines */}
        <g fill="rgba(234,246,245,0.10)">
          <rect x="640" y="628" width="320" height="5" />
          <rect x="670" y="640" width="260" height="5" />
          <rect x="655" y="652" width="290" height="5" />
        </g>
        <text x="800" y="676" textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="3" fill="rgba(122,173,176,0.55)">AUTH: VERA // ASSOCIATION OPS</text>

        {/* materialization scanline + shimmer sweep */}
        <rect className="cs4-scanline" x="560" y="212" width="480" height="3" fill="rgba(245,196,83,0.8)" />
        <g clipPath="url(#cs4-card-clip)">
          <g className="cs4-shine">
            <rect x="430" y="180" width="110" height="540" fill="url(#cs4-shine-grad)" />
          </g>
        </g>
      </g>
    </svg>
  )
}

/* ---------- Card 6 — the magenta heartbeat at the top; THE CLIMB begins ---------- */

function ArtClimbBegins() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cs4-peak-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,61,139,0.25)" />
          <stop offset="100%" stopColor="rgba(255,61,139,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={BG} />

      {/* faint strata far below the tower */}
      <g stroke="rgba(61,240,232,0.12)" strokeWidth="1">
        {[...Array(9)].map((_, i) => {
          const w = 120 + i * 14
          const y = 372 + i * 38
          return <line key={i} x1={800 - w} y1={y} x2={800 + w} y2={y} />
        })}
      </g>

      {/* the climb path — dots crawling upward */}
      <line className="cs4-climbpath" x1="800" y1="800" x2="800" y2="340" stroke="rgba(61,240,232,0.35)" strokeWidth="2" strokeDasharray="3 9" />

      {/* the player, at the very bottom */}
      <circle className="cs4-ring" cx="800" cy="812" r="10" fill="none" stroke={CYAN} strokeWidth="1.5" />
      <circle cx="800" cy="812" r="5" fill={CYAN} />

      {/* the gold tower, far above */}
      <g>
        <line x1="690" y1="322" x2="910" y2="322" stroke="rgba(245,196,83,0.35)" strokeWidth="1" />
        <polygon points="800,118 806,168 814,224 822,280 830,322 770,322 778,280 786,224 794,168" fill="rgba(245,196,83,0.08)" stroke={GOLD} strokeWidth="1.4" />
        <polygon points="758,322 758,282 772,282 772,322" fill="rgba(245,196,83,0.05)" stroke="rgba(245,196,83,0.6)" strokeWidth="1" />
        <polygon points="832,322 832,282 846,282 846,322" fill="rgba(245,196,83,0.05)" stroke="rgba(245,196,83,0.6)" strokeWidth="1" />
        <line x1="800" y1="118" x2="800" y2="98" stroke={GOLD} strokeWidth="1" />
      </g>

      {/* the thing at the top — a magenta heartbeat */}
      <circle cx="800" cy="92" r="60" fill="url(#cs4-peak-glow)" />
      <circle className="cs4-heart-ring" cx="800" cy="92" r="6" fill="none" stroke={MAGENTA} strokeWidth="1.5" />
      <circle className="cs4-heart" cx="800" cy="92" r="4" fill={MAGENTA} />

      {/* SEASON 01 — THE CLIMB — BEGINS (display type) */}
      <rect className="cs4-title-band" x="0" y="470" width="1600" height="220" fill="rgba(8,8,12,0.55)" />
      <g className="cs4-title-a">
        <line x1="640" y1="522" x2="694" y2="522" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
        <text x="800" y="528" textAnchor="middle" fontFamily={MONO} fontSize="18" letterSpacing="12" fill={GOLD}>SEASON 01</text>
        <line x1="906" y1="522" x2="960" y2="522" stroke="rgba(245,196,83,0.5)" strokeWidth="1" />
      </g>
      <text className="cs4-title-b" x="800" y="612" textAnchor="middle" fontFamily={DISPLAY} fontWeight="700" fontSize="92" letterSpacing="18" fill={INK}>THE CLIMB</text>
      <text className="cs4-title-c" x="800" y="656" textAnchor="middle" fontFamily={MONO} fontSize="16" letterSpacing="16" fill="rgba(122,173,176,0.9)">BEGINS</text>
    </svg>
  )
}

/* ---------- the scene ---------- */

const cs4Signal = {
  id: 'cs4',
  title: 'SIGNAL',
  cards: [
    {
      id: 'c1',
      art: <ArtWaveform />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      holdMs: 600,
      lines: [
        <>«…signal. Repeat — I have a live license ping at <strong>negative</strong> depth.</>,
        "That's not a typo. Somebody answer me.»",
      ],
    },
    {
      id: 'c2',
      art: <ArtCrater />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      lines: [
        '«Provisional Rank E. Licensed at 15:02. Presumed dead at 15:07.',
        "It's 15:31 and you're pinging me from the bottom of the world.",
        <>Hunter — what <strong>are</strong> you?»</>,
      ],
    },
    {
      id: 'c3',
      art: <ArtStrataMap />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      lines: [
        "«Here's your situation. Every stratum above you is a graveyard of hunters better than you.",
        'There is no extraction from the Floor. There is no elevator.',
        'There is only through.»',
      ],
    },
    {
      id: 'c4',
      art: <ArtCrackedDaemon />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      lines: [
        '«Your Daemon survived. Barely.',
        'It rebuilds the way it was built — one line at a time. Every skill you master, it gains.',
        "That's not a metaphor. That's the physics down here.»",
      ],
    },
    {
      id: 'c5',
      art: <ArtContract />,
      speaker: 'VERA // HANDLER',
      tone: 'assoc',
      lines: [
        '«So we do this the hunter way. Contracts. Dungeons. Kills. Rank.',
        'I log your climb with the Association — E to S, stratum by stratum.',
        "You just… don't die again.»",
      ],
    },
    {
      id: 'c6',
      art: <ArtClimbBegins />,
      speaker: 'VERA // HANDLER',
      tone: 'vera',
      holdMs: 2400,
      lines: [
        '«And the thing at the top that threw you here?»',
        '— the mark on your wrist flares —',
        '«Climb.»',
      ],
    },
  ],
}

export default cs4Signal
