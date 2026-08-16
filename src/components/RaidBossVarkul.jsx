import { useMemo, useId } from 'react'
import './RaidBossVarkul.css'

// ═══════════════════════════════════════════════════════════════════════════════
// VARKUL, THE NULLHEART HYDRA — procedural boss (SVG/CSS only, no assets)
//
// Nine heads on tapered necks around a ribcage that holds the Nullheart.
// Geometry is computed, not hand-drawn: each neck is a real outline built by
// sampling a Bézier spine and offsetting it by a width profile, so the necks
// swell at the body and taper into the skull instead of reading as uniform
// stroked lines. Heads sit at staggered depths — the back rank is smaller,
// darker and hazier than the front — which is what actually sells scale.
//
// Everything animates off per-head CSS custom properties (--sway, --delay,
// --blink) so the nine heads never move in lockstep.
//
// Contract (unchanged): headStates {h1..h9} · targetId · phase 1-3 · dead ·
// attacking. `frame` additionally renders the Association threat readout.
// ═══════════════════════════════════════════════════════════════════════════════

const VB = { w: 400, h: 430 }
const BASE = { x: 200, y: 344 }        // centre of the shoulder mass

// Two ranks. The BACK rank is smaller, higher and hazier — smaller-and-higher
// is what the eye reads as "further away", so the fan gains real depth instead
// of splaying flat. The FRONT rank is bigger, lower and wider: those are the
// heads that feel like they could reach the camera.
// depth: 0 = far, 1 = near.
// Angles and radii are deliberately NOT mirrored — a perfectly symmetric fan
// reads as a logo. The small offsets below are what make it read as grown.
const HEAD_POS = [
  // back rank
  { id: 'h1', a: -43, r: 262, size: 0.74, depth: 0.18 },
  { id: 'h2', a: -15, r: 284, size: 0.80, depth: 0.26 },
  { id: 'h3', a: 12,  r: 276, size: 0.78, depth: 0.24 },
  { id: 'h9', a: 39,  r: 256, size: 0.76, depth: 0.16 },
  // front rank
  { id: 'h4', a: -55, r: 214, size: 1.14, depth: 0.82 },
  { id: 'h5', a: -28, r: 228, size: 1.30, depth: 1.00 },
  { id: 'h6', a: 2,   r: 240, size: 1.34, depth: 0.96 },
  { id: 'h7', a: 31,  r: 220, size: 1.26, depth: 0.92 },
  { id: 'h8', a: 58,  r: 206, size: 1.16, depth: 0.78 },
]
const PHASE_OF = { h1: 1, h2: 1, h3: 1, h4: 2, h5: 2, h6: 2, h7: 3, h8: 3, h9: 3 }

// Necks leave the shoulders from spread anchors, not one shared point —
// a single origin reads as a bouquet of wires.
function originOf(a) {
  return {
    x: BASE.x + Math.sin(RAD(a * 0.62)) * 62,
    y: BASE.y - 26 - Math.cos(RAD(a * 0.62)) * 12,
  }
}

const RAD = (d) => (d * Math.PI) / 180
const lerp = (a, b, t) => a + (b - a) * t
const fmt = (n) => n.toFixed(1)

// ── Neck geometry ────────────────────────────────────────────────────────────
// Sample a quadratic Bézier and walk one side out / the other side back to get
// a closed, variable-width outline. Width eases from thick at the shoulder to
// thin at the jaw, which is what makes it read as a limb and not a wire.
function neckShape({ a, r, size }) {
  const org = originOf(a)
  const tip = {
    x: BASE.x + Math.sin(RAD(a)) * r,
    y: BASE.y - Math.cos(RAD(a)) * r,
  }
  // Control point pushes the neck into an outward S — straight necks look fake.
  const ctrl = {
    x: org.x + Math.sin(RAD(a * 1.75)) * r * 0.50,
    y: org.y - Math.cos(RAD(a * 0.55)) * r * 0.62,
  }
  const at = (t) => ({
    x: (1 - t) ** 2 * org.x + 2 * (1 - t) * t * ctrl.x + t ** 2 * tip.x,
    y: (1 - t) ** 2 * org.y + 2 * (1 - t) * t * ctrl.y + t ** 2 * tip.y,
  })
  const tangent = (t) => {
    const dx = 2 * (1 - t) * (ctrl.x - org.x) + 2 * t * (tip.x - ctrl.x)
    const dy = 2 * (1 - t) * (ctrl.y - org.y) + 2 * t * (tip.y - ctrl.y)
    const len = Math.hypot(dx, dy) || 1
    return { x: dx / len, y: dy / len }
  }
  const wBase = 40 * size
  const wTip = 11 * size
  const widthAt = (t) => lerp(wBase, wTip, Math.pow(t, 0.58)) / 2

  const STEPS = 22
  const left = []
  const right = []
  const plates = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const p = at(t)
    const tg = tangent(t)
    const n = { x: -tg.y, y: tg.x }   // perpendicular
    const w = widthAt(t)
    left.push(`${(p.x + n.x * w).toFixed(1)} ${(p.y + n.y * w).toFixed(1)}`)
    right.push(`${(p.x - n.x * w).toFixed(1)} ${(p.y - n.y * w).toFixed(1)}`)
    // armour chevrons down the spine of the neck
    if (i > 3 && i % 3 === 0) {
      const pw = w * 0.92
      plates.push(
        `M ${(p.x + n.x * pw).toFixed(1)} ${(p.y + n.y * pw).toFixed(1)} ` +
        `Q ${(p.x + tg.x * pw * 0.9).toFixed(1)} ${(p.y + tg.y * pw * 0.9).toFixed(1)} ` +
        `${(p.x - n.x * pw).toFixed(1)} ${(p.y - n.y * pw).toFixed(1)}`
      )
    }
  }
  return {
    tip,
    outline: `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`,
    // a thin bright edge along one side = rim light
    rim: `M ${left.slice(2).join(' L ')}`,
    plates,
  }
}

// ── One head ─────────────────────────────────────────────────────────────────
function Head({ hp, state, isTarget, live, idx, dead }) {
  const severed = state === 'severed'
  const claimed = state === 'claimed'
  const geo = useMemo(() => neckShape(hp), [hp])
  const s = hp.size

  // Per-head timing so the fan never breathes in unison.
  const vars = {
    '--sway': `${(5.2 + (idx % 4) * 0.9).toFixed(2)}s`,
    '--delay': `${(idx * 0.37).toFixed(2)}s`,
    '--blink': `${(4.3 + (idx % 5) * 1.6).toFixed(2)}s`,
    '--depth': hp.depth,
    '--tilt': `${hp.a * 0.35}deg`,
  }

  return (
    <g
      className={
        `vk-unit${severed ? ' severed' : ''}${claimed ? ' claimed' : ''}` +
        `${live ? ' live' : ''}${dead ? ' dead' : ''}`
      }
      style={vars}
    >
      {/* neck */}
      <path className="vk-neck-fill" d={geo.outline} />
      <path className="vk-neck-rim" d={geo.rim} />
      {geo.plates.map((d, i) => (
        <path key={i} className="vk-neck-plate" d={d} />
      ))}

      {/* head — local space is ~26px tall, scaled + aimed outward */}
      <g
        className="vk-headwrap"
        transform={`translate(${geo.tip.x} ${geo.tip.y}) rotate(${hp.a}) scale(${s})`}
      >
        {isTarget && !severed && <circle className="vk-ring target" r="30" />}
        {claimed && !severed && !isTarget && <circle className="vk-ring claimed" r="26" />}

        <g className="vk-head">
          {/* crown horns */}
          <path className="vk-horn" d="M -7 -13 C -12 -22 -17 -28 -21 -34 C -14 -30 -9 -23 -6 -16 Z" />
          <path className="vk-horn" d="M 7 -13 C 12 -22 17 -28 21 -34 C 14 -30 9 -23 6 -16 Z" />
          <path className="vk-horn small" d="M -2 -16 C -3 -24 -4 -29 -5 -34 C -1 -28 0 -22 1 -17 Z" />
          <path className="vk-horn small" d="M 3 -16 C 4 -24 6 -29 8 -33 C 6 -27 5 -22 4 -17 Z" />

          {/* cranium */}
          <path
            className="vk-skull"
            d="M 0 -20 C -9 -19 -15 -13 -16 -5 C -17 3 -14 9 -9 13 L 0 17 L 9 13 C 14 9 17 3 16 -5 C 15 -13 9 -19 0 -20 Z"
          />
          {/* brow ridge — the single most 'predator' line on the face */}
          <path className="vk-brow" d="M -15 -6 C -11 -11 -5 -12 -1 -10 L 1 -10 C 5 -12 11 -11 15 -6" />
          {/* cheek plating */}
          <path className="vk-plate" d="M -15 -3 C -13 4 -10 8 -6 11 L -9 2 Z" />
          <path className="vk-plate" d="M 15 -3 C 13 4 10 8 6 11 L 9 2 Z" />

          {/* eye */}
          <g className="vk-eyewrap">
            <ellipse className="vk-eye-glow" cx="0" cy="-3" rx="11" ry="9" />
            <ellipse className="vk-socket" cx="0" cy="-3" rx="6.6" ry="5.4" />
            {severed ? (
              <g className="vk-eye-dead">
                <line x1="-4" y1="-7" x2="4" y2="1" />
                <line x1="4" y1="-7" x2="-4" y2="1" />
              </g>
            ) : (
              <>
                <ellipse className="vk-iris" cx="0" cy="-3" rx="5" ry="4.2" />
                <ellipse className="vk-pupil" cx="0" cy="-3" rx="1.5" ry="3.6" />
                <circle className="vk-glint" cx="-1.8" cy="-4.6" r="1" />
              </>
            )}
          </g>

          {/* jaw — hinges open on the roar */}
          <g className="vk-jaw">
            <path className="vk-jaw-plate" d="M -9 11 C -7 18 -4 22 0 23 C 4 22 7 18 9 11 Z" />
            {!severed && (
              <g className="vk-teeth-lower">
                <path d="M -6 13 L -5 18 L -3.6 13 Z" />
                <path d="M -2 14 L -1 19.5 L 0.4 14 Z" />
                <path d="M 2.4 14 L 3.4 19 L 4.8 13.5 Z" />
              </g>
            )}
          </g>
          {!severed && (
            <g className="vk-teeth-upper">
              <path d="M -8 10 L -6.8 15.5 L -5.4 10 Z" />
              <path d="M -4 11 L -2.8 17 L -1.4 11 Z" />
              <path d="M 0.4 11 L 1.6 17 L 3 11 Z" />
              <path d="M 4.4 10 L 5.6 15.5 L 7 10 Z" />
            </g>
          )}

          {severed && (
            <g className="vk-gore">
              <circle className="vk-drip" cx="-2" cy="24" r="1.8" />
              <circle className="vk-drip d2" cx="3" cy="26" r="1.2" />
            </g>
          )}
        </g>
      </g>
    </g>
  )
}

export default function RaidBossVarkul({
  headStates = {},
  targetId = null,
  phase = 1,
  dead = false,
  attacking = false,
  frame = false,
  hp = null,
  hpMax = null,
  name = 'VARKUL',
  subtitle = 'THE NULLHEART HYDRA',
}) {
  const uid = useId().replace(/:/g, '')
  const severedCount = Object.values(headStates).filter(s => s === 'severed').length
  const aliveCount = HEAD_POS.length - severedCount

  // Embers drifting up out of the breach. Deterministic per phase so they don't
  // reshuffle on every render.
  const embers = useMemo(() => {
    const n = dead ? 4 : 10 + phase * 6
    return Array.from({ length: n }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280 / 233280
      const seed2 = (i * 4177 + 12345) % 233280 / 233280
      return {
        id: i,
        x: 60 + seed * 340,
        r: 0.7 + seed2 * 2.1,
        dur: 7 + seed * 9,
        delay: -seed2 * 12,
        drift: (seed - 0.5) * 46,
      }
    })
  }, [phase, dead])

  const pct = hp != null && hpMax ? Math.max(0, (hp / hpMax) * 100) : null

  return (
    <div className={`vk-stage${dead ? ' vk-stage-dead' : ''}${attacking ? ' vk-stage-hit' : ''}`}>
      <svg
        className={
          `vk-boss phase-${phase}${dead ? ' vk-dead' : ''}` +
          `${attacking ? ' vk-attacking' : ''}${phase === 3 && !dead ? ' vk-enraged' : ''}`
        }
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMax meet"
        role="img"
        aria-label={`${name}, ${subtitle} — ${aliveCount} of ${HEAD_POS.length} heads alive`}
      >
        <defs>
          <radialGradient id={`${uid}-void`} cx="50%" cy="88%" r="72%">
            <stop offset="0%" stopColor="#2a0a1e" />
            <stop offset="45%" stopColor="#12081a" />
            <stop offset="100%" stopColor="#08080c" />
          </radialGradient>
          <linearGradient id={`${uid}-bone`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#31314a" />
            <stop offset="42%" stopColor="#1c1c2b" />
            <stop offset="100%" stopColor="#0d0d16" />
          </linearGradient>
          <linearGradient id={`${uid}-flesh`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0c0c14" />
            <stop offset="38%" stopColor="#20202f" />
            <stop offset="62%" stopColor="#171722" />
            <stop offset="100%" stopColor="#0a0a11" />
          </linearGradient>
          <radialGradient id={`${uid}-heart`} cx="50%" cy="46%" r="58%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="34%" stopColor="#ff8ab8" />
            <stop offset="68%" stopColor="#ff3d8b" />
            <stop offset="100%" stopColor="#c01050" />
          </radialGradient>
          <radialGradient id={`${uid}-fissure`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff3d8b" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#ff3d8b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          {/* organic edge for the mist — turbulence, not an image */}
          <filter id={`${uid}-gnarl`} x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="26" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* ── environment ── */}
        <rect className="vk-void" x="0" y="0" width={VB.w} height={VB.h} fill={`url(#${uid}-void)`} />
        <ellipse
          className="vk-fissure"
          cx={BASE.x} cy={BASE.y + 38} rx="215" ry="52"
          fill={`url(#${uid}-fissure)`}
        />
        {/* ground cracks radiating from under the body */}
        <g className="vk-cracks">
          <path d="M 120 366 L 168 344 L 150 336" />
          <path d="M 342 362 L 296 342 L 316 334" />
          <path d="M 214 380 L 226 350" />
          <path d="M 268 374 L 252 348" />
        </g>

        <g className="vk-embers">
          {embers.map(e => (
            <circle
              key={e.id}
              className="vk-ember"
              cx={e.x} cy={VB.h - 10} r={e.r}
              style={{
                '--dur': `${e.dur}s`,
                '--delay': `${e.delay}s`,
                '--drift': `${e.drift}px`,
              }}
            />
          ))}
        </g>

        {/* ── BACK RANK: heads behind the body, hazed for depth ── */}
        <g className="vk-rank back" filter={`url(#${uid}-soft)`}>
          {HEAD_POS.filter(h => h.depth < 0.5).map((h, i) => (
            <Head
              key={h.id} hp={h} idx={i} dead={dead}
              state={headStates[h.id] ?? 'open'}
              isTarget={targetId === h.id}
              live={PHASE_OF[h.id] === phase && headStates[h.id] !== 'severed' && !dead}
            />
          ))}
        </g>

        {/* ── BODY — hunched shoulders around an open ribcage ── */}
        <g className="vk-body">
          <ellipse className="vk-body-shadow" cx={BASE.x} cy={BASE.y + 54} rx="164" ry="26" />

          {/* shoulder mass — hunched, and lopsided on purpose */}
          <path
            className="vk-carapace"
            d={`M ${BASE.x - 150} ${BASE.y + 30}
                C ${BASE.x - 164} ${BASE.y - 34} ${BASE.x - 100} ${BASE.y - 84} ${BASE.x - 44} ${BASE.y - 90}
                C ${BASE.x - 16} ${BASE.y - 94} ${BASE.x + 18} ${BASE.y - 92} ${BASE.x + 44} ${BASE.y - 86}
                C ${BASE.x + 100} ${BASE.y - 74} ${BASE.x + 156} ${BASE.y - 22} ${BASE.x + 144} ${BASE.y + 36}
                C ${BASE.x + 96} ${BASE.y + 60} ${BASE.x + 24} ${BASE.y + 66} ${BASE.x - 26} ${BASE.y + 64}
                C ${BASE.x - 78} ${BASE.y + 62} ${BASE.x - 122} ${BASE.y + 52} ${BASE.x - 150} ${BASE.y + 30} Z`}
            fill={`url(#${uid}-flesh)`}
          />

          {/* shoulder spurs — curved bone breaking out through the hide */}
          <path className="vk-spur" d={`M ${BASE.x - 122} ${BASE.y - 4}
            C ${BASE.x - 142} ${BASE.y - 26} ${BASE.x - 156} ${BASE.y - 44} ${BASE.x - 172} ${BASE.y - 70}
            C ${BASE.x - 150} ${BASE.y - 50} ${BASE.x - 130} ${BASE.y - 34} ${BASE.x - 106} ${BASE.y - 24} Z`} />
          <path className="vk-spur" d={`M ${BASE.x + 118} ${BASE.y - 8}
            C ${BASE.x + 140} ${BASE.y - 28} ${BASE.x + 152} ${BASE.y - 48} ${BASE.x + 166} ${BASE.y - 76}
            C ${BASE.x + 146} ${BASE.y - 54} ${BASE.x + 128} ${BASE.y - 38} ${BASE.x + 104} ${BASE.y - 28} Z`} />
          <path className="vk-spur sm" d={`M ${BASE.x - 104} ${BASE.y + 16}
            C ${BASE.x - 122} ${BASE.y + 2} ${BASE.x - 134} ${BASE.y - 10} ${BASE.x - 146} ${BASE.y - 28}
            C ${BASE.x - 128} ${BASE.y - 14} ${BASE.x - 112} ${BASE.y - 4} ${BASE.x - 94} ${BASE.y + 2} Z`} />
          <path className="vk-spur sm" d={`M ${BASE.x + 108} ${BASE.y + 20}
            C ${BASE.x + 124} ${BASE.y + 6} ${BASE.x + 134} ${BASE.y - 6} ${BASE.x + 144} ${BASE.y - 22}
            C ${BASE.x + 128} ${BASE.y - 8} ${BASE.x + 114} ${BASE.y + 2} ${BASE.x + 96} ${BASE.y + 8} Z`} />

          {/* the cavity: a hole torn in the chest, lit from inside */}
          <ellipse className="vk-cavity" cx={BASE.x} cy={BASE.y - 6} rx="62" ry="48" />

          {/* the Nullheart, suspended in it */}
          <g className="vk-heartwrap">
            <circle
              className="vk-heart-bloom"
              cx={BASE.x} cy={BASE.y - 6}
              r={dead ? 16 : 54 - severedCount * 3}
              filter={`url(#${uid}-bloom)`}
            />
            <circle
              className="vk-heart"
              cx={BASE.x} cy={BASE.y - 6}
              r={dead ? 6 : 24 - severedCount * 1.3}
              fill={`url(#${uid}-heart)`}
            />
            <circle className="vk-heart-core" cx={BASE.x} cy={BASE.y - 6} r={dead ? 2 : 9} />
          </g>

          {/* ribs CAGE the heart — drawn over the cavity so it reads as trapped */}
          <g className="vk-ribs">
            <path d={`M ${BASE.x - 58} ${BASE.y - 40} C ${BASE.x - 30} ${BASE.y - 16} ${BASE.x - 30} ${BASE.y + 14} ${BASE.x - 50} ${BASE.y + 36}`} />
            <path d={`M ${BASE.x - 26} ${BASE.y - 50} C ${BASE.x - 10} ${BASE.y - 18} ${BASE.x - 10} ${BASE.y + 18} ${BASE.x - 20} ${BASE.y + 44}`} />
            <path d={`M ${BASE.x + 26} ${BASE.y - 50} C ${BASE.x + 10} ${BASE.y - 18} ${BASE.x + 10} ${BASE.y + 18} ${BASE.x + 20} ${BASE.y + 44}`} />
            <path d={`M ${BASE.x + 58} ${BASE.y - 40} C ${BASE.x + 30} ${BASE.y - 16} ${BASE.x + 30} ${BASE.y + 14} ${BASE.x + 50} ${BASE.y + 36}`} />
          </g>

          {/* collar plating across the top of the shoulders */}
          <path
            className="vk-collar"
            d={`M ${BASE.x - 112} ${BASE.y - 34} Q ${BASE.x} ${BASE.y - 96} ${BASE.x + 112} ${BASE.y - 34}`}
          />
          <path
            className="vk-collar thin"
            d={`M ${BASE.x - 92} ${BASE.y - 22} Q ${BASE.x} ${BASE.y - 78} ${BASE.x + 92} ${BASE.y - 22}`}
          />
        </g>

        {/* ── FRONT RANK ── */}
        <g className="vk-rank front">
          {HEAD_POS.filter(h => h.depth >= 0.5).map((h, i) => (
            <Head
              key={h.id} hp={h} idx={i + 4} dead={dead}
              state={headStates[h.id] ?? 'open'}
              isTarget={targetId === h.id}
              live={PHASE_OF[h.id] === phase && headStates[h.id] !== 'severed' && !dead}
            />
          ))}
        </g>

        {/* ── foreground mist, warped by turbulence ── */}
        <ellipse
          className="vk-mist"
          cx={BASE.x} cy={VB.h - 26} rx="250" ry="34"
          filter={`url(#${uid}-gnarl)`}
        />
        {attacking && <rect className="vk-lunge-flash" x="0" y="0" width={VB.w} height={VB.h} />}
      </svg>

      {/* ── Association threat readout ── */}
      {frame && (
        <div className="vk-frame">
          <div className="vk-frame-top">
            <span className="vk-frame-tier">HERALD-CLASS</span>
            <span className="vk-frame-name">{name}</span>
            <span className="vk-frame-sub">{subtitle}</span>
          </div>

          {pct !== null && (
            <div className="vk-frame-hp">
              <div className="vk-hp-track">
                <div className="vk-hp-fill" style={{ width: `${pct}%` }} />
                {/* five notches = five functions */}
                {[20, 40, 60, 80].map(x => (
                  <span key={x} className="vk-hp-notch" style={{ left: `${x}%` }} />
                ))}
              </div>
              <span className="vk-hp-num">{hp} / {hpMax}</span>
            </div>
          )}

          <div className="vk-frame-status">
            <span className="vk-stat">
              <b>{aliveCount}</b>/{HEAD_POS.length} HEADS
            </span>
            <span className="vk-pips">
              {[1, 2, 3].map(p => (
                <i key={p} className={`vk-pip${phase >= p ? ' lit' : ''}${phase === p ? ' now' : ''}`} />
              ))}
            </span>
            <span className={`vk-stat state${dead ? ' dead' : phase === 3 ? ' rage' : ''}`}>
              {dead ? 'SLAIN' : phase === 3 ? 'ENRAGED' : 'HOSTILE'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
