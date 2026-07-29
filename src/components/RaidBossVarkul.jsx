import './RaidBossVarkul.css'

// ── VARKUL, THE NULLHEART HYDRA ──────────────────────────────────────────────
// Procedural SVG boss for RAID 01. Nine heads on three necks, fanned around a
// static-heart body. Per-head states drive the visual: open (sways, cyan eye),
// claimed (gold target ring), severed (limp, dark, X eye). All-severed = the
// crown falls: heart gutters out, body slumps.
//   headStates: { h1: 'open'|'claimed'|'severed', ... }
//   targetId:   head currently selected by THIS hunter (magenta ring)
//   phase:      1|2|3 — the live neck glows; enrage tint at phase 3

// Fan layout: angle in degrees from vertical, radius from the body anchor.
const BASE = { x: 200, y: 262 }
const HEAD_POS = [
  { id: 'h1', a: -78, r: 132 }, { id: 'h2', a: -58, r: 152 }, { id: 'h3', a: -39, r: 164 },
  { id: 'h4', a: -20, r: 172 }, { id: 'h5', a: 0,   r: 176 }, { id: 'h6', a: 20,  r: 172 },
  { id: 'h7', a: 39,  r: 164 }, { id: 'h8', a: 58,  r: 152 }, { id: 'h9', a: 78,  r: 132 },
]
const RAD = (d) => (d * Math.PI) / 180
const posOf = ({ a, r }) => ({
  x: BASE.x + Math.sin(RAD(a)) * r,
  y: BASE.y - Math.cos(RAD(a)) * r,
})
// Neck control point — pulls each neck into a slight outward coil.
const ctrlOf = ({ a, r }) => ({
  x: BASE.x + Math.sin(RAD(a * 1.25)) * r * 0.55,
  y: BASE.y - Math.cos(RAD(a * 0.8)) * r * 0.55,
})

const PHASE_OF = { h1: 1, h2: 1, h3: 1, h4: 2, h5: 2, h6: 2, h7: 3, h8: 3, h9: 3 }

export default function RaidBossVarkul({ headStates = {}, targetId = null, phase = 1, dead = false }) {
  const severedCount = Object.values(headStates).filter(s => s === 'severed').length

  return (
    <svg
      className={`vk-boss${dead ? ' vk-dead' : ''}${phase === 3 && !dead ? ' vk-enraged' : ''}`}
      viewBox="0 0 400 300"
      role="img"
      aria-label="Varkul, the Nullheart Hydra"
    >
      {/* Breach glow behind the body */}
      <ellipse className="vk-breach" cx="200" cy="266" rx="150" ry="34" />

      {/* Necks + heads */}
      {HEAD_POS.map((hp) => {
        const p = posOf(hp)
        const c = ctrlOf(hp)
        const state = headStates[hp.id] ?? 'open'
        const severed = state === 'severed'
        const claimed = state === 'claimed'
        const isTarget = targetId === hp.id
        const headPhase = PHASE_OF[hp.id]
        const live = headPhase === phase && !severed && !dead
        return (
          <g key={hp.id} className={`vk-unit${severed ? ' severed' : ''}${live ? ' live' : ''}`}>
            <path
              className="vk-neck"
              d={`M ${BASE.x} ${BASE.y} Q ${c.x} ${c.y} ${p.x} ${p.y}`}
            />
            <g
              className={`vk-head${severed ? ' severed' : claimed ? ' claimed' : ' alive'}`}
              transform={`translate(${p.x} ${p.y}) rotate(${hp.a})`}
            >
              {/* target / claim rings */}
              {isTarget && !severed && <circle className="vk-ring target" r="16" />}
              {claimed && !severed && !isTarget && <circle className="vk-ring claimed" r="14" />}
              {/* serpent skull, pointing outward (up pre-rotation) */}
              <path className="vk-skull" d="M 0 6 L -8 0 L -5 -9 L 0 -14 L 5 -9 L 8 0 Z" />
              <path className="vk-jaw" d="M -5 6 L 0 11 L 5 6 Z" />
              {/* eye */}
              {severed ? (
                <g className="vk-eye-x">
                  <line x1="-3" y1="-6" x2="3" y2="0" />
                  <line x1="3" y1="-6" x2="-3" y2="0" />
                </g>
              ) : (
                <circle className="vk-eye" cx="0" cy="-3" r="2.4" />
              )}
            </g>
          </g>
        )
      })}

      {/* Body */}
      <g className="vk-body">
        <ellipse className="vk-mass" cx="200" cy="266" rx="72" ry="26" />
        <ellipse className="vk-mass-hi" cx="200" cy="258" rx="52" ry="14" />
        {/* the Nullheart — dims as heads fall, gutters out on death */}
        <circle className="vk-heart" cx="200" cy="262" r={dead ? 3 : Math.max(4, 11 - severedCount)} />
        <circle className="vk-heart-glow" cx="200" cy="262" r={dead ? 6 : 20 - severedCount} />
      </g>
    </svg>
  )
}
