// HunterSigil — seeded procedural avatar/emblem generator (SVG, no assets).
// One generator, two skins: variant="sigil" (hexagon, hunter avatars) and
// variant="emblem" (shield/banner, guild crests). Deterministic from
// { seed, palette } so the same config always draws the same mark.
//
// Empty/absent config => renders initials text, so pre-pick users look exactly
// as they did before (their container supplies the circle + gradient).
//
// Palette + fonts follow the Void Hunter scheme (see CLAUDE.md). Pure SVG/CSS.

function initials(name) {
  return (name ?? 'PL').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'PL'
}

// ── deterministic PRNG (mulberry32 over a hashed seed) ──────────────────────
function hashSeed(seed) {
  let h = 2166136261 >>> 0
  const s = String(seed)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── fixed accent palettes (index 0–4) ──────────────────────────────────────
export const SIGIL_PALETTES = [
  { key: 'cyan',    accent: '#3df0e8', second: '#7af0d6' },
  { key: 'gold',    accent: '#f5c453', second: '#ffe08a' },
  { key: 'magenta', accent: '#ff3d8b', second: '#ff8ac0' },
  { key: 'lime',    accent: '#39e8ab', second: '#a6f5c9' },
  { key: 'violet',  accent: '#a78bfa', second: '#d7c6ff' },
]
export const SIGIL_PATTERN_COUNT = 6

// ── frame paths (100×100 viewBox, centered) ────────────────────────────────
function hexPath() {
  // pointy-top hexagon spanning the full box — matches the .dash-avatar /
  // .set-avatar / .av clip-path so the sigil fills those hexagon frames exactly.
  return 'M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z'
}
function shieldPath() {
  // crest / shield outline for guild emblems
  return 'M50 6 L88 20 L88 52 C88 76 70 90 50 96 C30 90 12 76 12 52 L12 20 Z'
}

// ── inner geometry families (return an array of SVG elements) ───────────────
function circuitTraces(rng, accent, second) {
  const els = []
  const lanes = 3 + Math.floor(rng() * 3)
  for (let i = 0; i < lanes; i++) {
    const y = 26 + rng() * 48
    const midx = 34 + rng() * 32
    const d = `M20 ${y.toFixed(1)} H${midx.toFixed(1)} V${(y + (rng() < 0.5 ? -14 : 14)).toFixed(1)} H80`
    els.push(<path key={`c${i}`} d={d} fill="none" stroke={i % 2 ? second : accent} strokeWidth="2" strokeLinecap="round" opacity={0.85} />)
    els.push(<circle key={`cn${i}`} cx={80} cy={y} r={2.6} fill={accent} />)
  }
  return els
}
function shardCluster(rng, accent, second) {
  const els = []
  const n = 4 + Math.floor(rng() * 3)
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + rng() * 0.4
    const len = 22 + rng() * 16
    const x = 50 + Math.cos(a) * len, y = 50 + Math.sin(a) * len
    const w = 6 + rng() * 6
    const nx = -Math.sin(a) * w, ny = Math.cos(a) * w
    els.push(
      <path key={`s${i}`}
        d={`M50 50 L${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} Z`}
        fill={i % 2 ? accent : second} opacity={0.8} />
    )
  }
  els.push(<circle key="sc" cx={50} cy={50} r={5} fill={accent} />)
  return els
}
function eyeMotif(rng, accent, second) {
  const els = []
  els.push(<path key="e0" d="M18 50 Q50 26 82 50 Q50 74 18 50 Z" fill="none" stroke={accent} strokeWidth="2.5" />)
  els.push(<circle key="e1" cx={50} cy={50} r={12 + rng() * 4} fill="none" stroke={second} strokeWidth="2" />)
  els.push(<circle key="e2" cx={50} cy={50} r={5 + rng() * 2} fill={accent} />)
  const rays = 6 + Math.floor(rng() * 4)
  for (let i = 0; i < rays; i++) {
    const a = (Math.PI * 2 * i) / rays
    els.push(<line key={`er${i}`} x1={50 + Math.cos(a) * 20} y1={50 + Math.sin(a) * 20}
      x2={50 + Math.cos(a) * 27} y2={50 + Math.sin(a) * 27} stroke={second} strokeWidth="1.6" opacity={0.7} />)
  }
  return els
}
function runeTicks(rng, accent, second) {
  const els = []
  els.push(<circle key="r0" cx={50} cy={50} r={26} fill="none" stroke={second} strokeWidth="1.6" opacity={0.6} />)
  const ticks = 10 + Math.floor(rng() * 8)
  for (let i = 0; i < ticks; i++) {
    const a = (Math.PI * 2 * i) / ticks
    const long = rng() < 0.4
    els.push(<line key={`rt${i}`} x1={50 + Math.cos(a) * 26} y1={50 + Math.sin(a) * 26}
      x2={50 + Math.cos(a) * (long ? 34 : 30)} y2={50 + Math.sin(a) * (long ? 34 : 30)}
      stroke={accent} strokeWidth={long ? 2.4 : 1.4} />)
  }
  // central glyph
  const g = Math.floor(rng() * 3)
  if (g === 0) els.push(<path key="rg" d="M42 42 L58 58 M58 42 L42 58" stroke={accent} strokeWidth="3" strokeLinecap="round" />)
  else if (g === 1) els.push(<path key="rg" d="M50 38 L60 62 L40 62 Z" fill="none" stroke={accent} strokeWidth="3" />)
  else els.push(<path key="rg" d="M50 40 V60 M40 50 H60" stroke={accent} strokeWidth="3" strokeLinecap="round" />)
  return els
}
function orbitRings(rng, accent, second) {
  const els = []
  const rings = 2 + Math.floor(rng() * 2)
  for (let i = 0; i < rings; i++) {
    const rr = 12 + i * 9 + rng() * 4
    els.push(<circle key={`o${i}`} cx={50} cy={50} r={rr} fill="none" stroke={i % 2 ? accent : second} strokeWidth="1.8" opacity={0.8} />)
    const dots = 2 + Math.floor(rng() * 3)
    for (let j = 0; j < dots; j++) {
      const a = rng() * Math.PI * 2
      els.push(<circle key={`od${i}_${j}`} cx={50 + Math.cos(a) * rr} cy={50 + Math.sin(a) * rr} r={2.4} fill={accent} />)
    }
  }
  els.push(<circle key="oc" cx={50} cy={50} r={4} fill={second} />)
  return els
}
function latticeWeave(rng, accent, second) {
  const els = []
  const n = 3 + Math.floor(rng() * 3)
  for (let i = 0; i <= n; i++) {
    const t = 24 + (i * 52) / n
    els.push(<line key={`lx${i}`} x1={t} y1={22} x2={t} y2={78} stroke={i % 2 ? second : accent} strokeWidth="1.4" opacity={0.6} />)
    els.push(<line key={`ly${i}`} x1={22} y1={t} x2={78} y2={t} stroke={i % 2 ? accent : second} strokeWidth="1.4" opacity={0.6} />)
  }
  els.push(<path key="ld" d="M32 50 L50 32 L68 50 L50 68 Z" fill="none" stroke={accent} strokeWidth="2.4" />)
  return els
}
const PATTERNS = [circuitTraces, shardCluster, eyeMotif, runeTicks, orbitRings, latticeWeave]

export default function HunterSigil({ config, name, size = 40, variant = 'sigil', className, title }) {
  const seed = config?.seed
  const hasConfig = seed !== undefined && seed !== null
  const isEmblemV = variant === 'emblem'

  // Fallback: a self-contained initials badge (gradient hex/shield). Renders fine
  // in ANY container — dashboard avatars, guild roster, bare panels — and keeps
  // pre-pick users looking like their old initials avatar.
  if (!hasConfig) {
    const framePath = isEmblemV ? shieldPath() : hexPath()
    const gid = `hsf_${String(name ?? 'pl').replace(/[^a-z0-9]/gi, '').slice(0, 6) || 'pl'}`
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}
        role="img" aria-label={title ?? `${name ?? 'Hunter'} avatar`}>
        <defs>
          <linearGradient id={`${gid}_g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3df0e8" />
            <stop offset="100%" stopColor="#f5c453" />
          </linearGradient>
        </defs>
        <path d={framePath} fill={`url(#${gid}_g)`} />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central"
          fontFamily="'Saira Condensed', 'Arial Narrow', sans-serif" fontWeight="700"
          fontSize="40" fill="#08080c">{initials(name)}</text>
      </svg>
    )
  }

  const paletteIdx = ((config?.palette ?? 0) % SIGIL_PALETTES.length + SIGIL_PALETTES.length) % SIGIL_PALETTES.length
  const { accent, second } = SIGIL_PALETTES[paletteIdx]
  const rng = mulberry32(hashSeed(seed) ^ (paletteIdx * 0x9e3779b1))
  const patternIdx = Math.floor(rng() * PATTERNS.length)
  const rotation = Math.floor(rng() * 6) * 60      // hex-friendly rotation
  const uid = `sig_${String(seed).replace(/[^a-z0-9]/gi, '')}_${paletteIdx}`
  const framePath = isEmblemV ? shieldPath() : hexPath()

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}
      role="img" aria-label={title ?? `${name ?? 'Hunter'} sigil`}>
      <defs>
        <radialGradient id={`${uid}_bg`} cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="60%" stopColor="#0b0c12" stopOpacity="1" />
          <stop offset="100%" stopColor="#070709" stopOpacity="1" />
        </radialGradient>
        <clipPath id={`${uid}_clip`}><path d={framePath} /></clipPath>
      </defs>

      {/* backing + frame */}
      <path d={framePath} fill={`url(#${uid}_bg)`} />
      <g clipPath={`url(#${uid}_clip)`}>
        <g transform={`rotate(${rotation} 50 50)`}>
          {PATTERNS[patternIdx](rng, accent, second)}
        </g>
      </g>
      <path d={framePath} fill="none" stroke={accent} strokeWidth="3.4" strokeOpacity="0.9"
        transform="translate(4 4) scale(0.92)" />
      <path d={framePath} fill="none" stroke={second} strokeWidth="1.2" strokeOpacity="0.5"
        transform="translate(9 9) scale(0.82)" />
    </svg>
  )
}
