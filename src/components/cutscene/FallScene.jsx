import { useCallback, useEffect, useRef, useState } from 'react'
import './FallScene.css'

/*
 * FallScene — CS-3 "THE FALL" (the signature cutscene).
 *
 * NOT a CutscenePlayer scene: a standalone full-screen component.
 *   <FallScene onComplete={fn} />
 *
 * One continuous vertical parallax fall with 9 stops. Three layers move at
 * different rates (far strata 0.35× · world 1× · near debris 1.4×), plus
 * constant upward speed lines that intensify with depth. Advance on
 * click / Space / Enter / ArrowRight. Stop 8 is the IMPACT white flash
 * (uninterruptible beat). Advancing past stop 9 fires onComplete().
 * Copy is verbatim from void-shards-mmo-world-levels-1-3.md §7, CS-3.
 */

const FAR_RATE = 0.35
const NEAR_RATE = 1.4
const IMPACT_STOP = 7 // 0-based index of stop 8

/* ---- the 9 stops: copy (verbatim) + depth readout ---- */
const STOPS = [
  {
    id: 'f1', depth: '1,000 m',
    lines: ["One full kilometer of tower. That's the number they tell tourists."],
  },
  {
    id: 'f2', depth: '0 m — surface',
    lines: ["The tourists don't know what the first Gate did to the ground underneath."],
  },
  {
    id: 'f3', depth: 'stratum 09',
    lines: [
      'The world has a bottom. You are going to meet it.',
      "— THE DEEP RENDER, they'll tell you later. Stratum nine.",
    ],
  },
  {
    id: 'f4', depth: 'strata 08–07',
    lines: [
      'Vaults that guard themselves. Signals with nowhere to go.',
      "Every stratum has a name. Every name is something you can't survive yet.",
    ],
  },
  {
    id: 'f5', depth: 'strata 05–04',
    lines: ['Falling past all of it. The whole climb, in reverse, at terminal velocity.'],
  },
  {
    id: 'f6', depth: 'stratum 03',
    lines: ['Something in the wreckage watches you pass.'],
  },
  {
    id: 'f7', depth: 'strata 02–01',
    lines: ['Below the last named stratum there is a place hunters use as a curse word.'],
  },
  {
    id: 'f8', depth: '— — —',
    lines: [
      <><strong>THE FLOOR.</strong></>, // eslint-disable-line react/jsx-key
      'The bottom of the lands. HP: 1.',
    ],
  },
  {
    id: 'f9', depth: 'the floor',
    lines: [
      'Marked. Alive. At the bottom of everything.',
      "And somewhere in the dark — a signal, looking for survivors that shouldn't exist.",
    ],
  },
]

/* ---- deterministic pseudo-random (seeded) for streaks + debris ---- */
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/* upward speed lines — 16, varied position / phase / length */
const STREAKS = (() => {
  const rng = makeRng(97)
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: 3 + rng() * 94,
    delay: -(rng() * 1.2),
    h: 14 + rng() * 16,
    gold: rng() < 0.3,
  }))
})()

/* near-layer debris — glass shards up top, embers at the seam, rock below */
const DEBRIS = (() => {
  const rng = makeRng(1234)
  const shapes = [
    '12,0 24,16 6,22',
    '0,4 22,0 16,24',
    '4,0 24,8 12,24 0,14',
    '10,0 24,10 14,24 0,18',
  ]
  return Array.from({ length: 30 }, (_, i) => {
    const top = (i / 30) * 1140 + rng() * 30
    const kind = top < 160 ? 'glass' : top < 300 ? 'ember' : 'rock'
    return {
      id: i,
      top,
      left: 4 + rng() * 92,
      size: 10 + rng() * 24,
      pts: shapes[Math.floor(rng() * shapes.length)],
      rot: Math.floor(rng() * 360),
      dur: 4.5 + rng() * 4,
      delay: -(rng() * 4),
      fill: kind === 'glass' ? 'rgba(234,246,245,0.06)' : kind === 'ember' ? 'rgba(255,61,139,0.10)' : '#0d0d14',
      stroke: kind === 'glass' ? '#f5c453' : kind === 'ember' ? '#ff3d8b' : 'rgba(122,173,176,0.5)',
    }
  })
})()

/* =====================================================================
 * FAR LAYER — giant strata silhouettes, one tall stretched SVG.
 * (preserveAspectRatio="none" on purpose: it must map 1:1 onto the
 * 380vh column so the strata line up with the stops.)
 * ===================================================================== */
function FarStrata() {
  return (
    <svg className="fall-far-svg" viewBox="0 0 1000 3800" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="fallFarG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5c453" stopOpacity="0.22" />
          <stop offset="0.06" stopColor="#c98a3a" stopOpacity="0.10" />
          <stop offset="0.12" stopColor="#08080c" />
          <stop offset="0.155" stopColor="#ff3d8b" stopOpacity="0.14" />
          <stop offset="0.20" stopColor="#08080c" />
          <stop offset="0.30" stopColor="#141018" />
          <stop offset="0.46" stopColor="#0a0e14" />
          <stop offset="0.62" stopColor="#0c1216" />
          <stop offset="0.78" stopColor="#090a10" />
          <stop offset="0.92" stopColor="#050508" />
          <stop offset="1" stopColor="#030304" />
        </linearGradient>
      </defs>
      <rect width="1000" height="3800" fill="url(#fallFarG)" />
      {/* surface seam — the wound going down */}
      <polygon points="380,560 500,610 470,700 560,820 520,980 600,1180" fill="none" stroke="#ff3d8b" strokeOpacity="0.18" strokeWidth="10" />
      {/* deep render — huge dormant slab silhouettes */}
      <rect x="80" y="900" width="260" height="420" fill="#f5c453" opacity="0.04" />
      <rect x="640" y="1020" width="320" height="360" fill="#f5c453" opacity="0.03" />
      {/* vault ring, far off */}
      <circle cx="820" cy="1560" r="230" fill="none" stroke="#f5c453" strokeOpacity="0.07" strokeWidth="14" />
      {/* citadel / spire masses */}
      <polygon points="60,1900 260,1830 320,2120 100,2180" fill="#eaf6f5" opacity="0.03" />
      <polygon points="700,1880 940,1880 820,2260" fill="#3df0e8" opacity="0.035" />
      {/* wastes — heaps */}
      <ellipse cx="300" cy="2560" rx="340" ry="90" fill="#7badb0" opacity="0.04" />
      <ellipse cx="760" cy="2640" rx="260" ry="70" fill="#7badb0" opacity="0.03" />
      {/* the thinning — almost nothing */}
      <line x1="0" y1="3020" x2="1000" y2="3040" stroke="#7badb0" strokeOpacity="0.05" strokeWidth="3" />
      <line x1="0" y1="3160" x2="1000" y2="3150" stroke="#7badb0" strokeOpacity="0.03" strokeWidth="2" />
    </svg>
  )
}

/* =====================================================================
 * STOP ART — one component per stop, viewBox 1000×1000, slice-fit.
 * ===================================================================== */

/* Stop 1 — out through shattered glass, golden sky, tower face streaking up */
function StopGlass() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fallSky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5c453" stopOpacity="0.34" />
          <stop offset="0.5" stopColor="#c98a3a" stopOpacity="0.15" />
          <stop offset="1" stopColor="#08080c" />
        </linearGradient>
        <pattern id="fallWin1" width="46" height="64" patternUnits="userSpaceOnUse">
          <rect x="8" y="10" width="26" height="40" fill="none" stroke="#f5c453" strokeOpacity="0.5" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1000" height="1000" fill="#08080c" />
      <rect width="1000" height="1000" fill="url(#fallSky1)" />
      {/* golden-hour sun glare */}
      <circle cx="230" cy="220" r="88" fill="#f5c453" opacity="0.3" />
      <circle cx="230" cy="220" r="190" fill="#f5c453" opacity="0.08" />
      {/* tower face streaking upward past camera */}
      <g className="fall-a-rise">
        <rect x="700" y="-400" width="300" height="1800" fill="#0d0d14" />
        <rect x="700" y="-400" width="300" height="1800" fill="url(#fallWin1)" />
        <line x1="700" y1="-400" x2="700" y2="1400" stroke="#f5c453" strokeOpacity="0.65" strokeWidth="3" />
        <line x1="760" y1="-400" x2="760" y2="1400" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
      </g>
      {/* shattered glass, tumbling with you */}
      <g>
        <polygon className="fall-a-drift" style={{ '--r': '8deg' }} points="180,600 238,562 258,646 192,668" fill="rgba(234,246,245,0.07)" stroke="#f5c453" strokeOpacity="0.75" strokeWidth="2" />
        <polygon className="fall-a-drift" style={{ '--r': '-14deg', animationDelay: '-1.6s' }} points="420,470 470,450 486,520 428,540" fill="rgba(234,246,245,0.05)" stroke="#eaf6f5" strokeOpacity="0.5" strokeWidth="1.5" />
        <polygon className="fall-a-drift" style={{ '--r': '22deg', animationDelay: '-2.8s' }} points="330,760 392,742 376,820" fill="rgba(234,246,245,0.06)" stroke="#f5c453" strokeOpacity="0.55" strokeWidth="1.5" />
        <polygon className="fall-a-drift" style={{ '--r': '-5deg', animationDelay: '-0.7s' }} points="560,660 600,640 618,704 566,716" fill="rgba(234,246,245,0.04)" stroke="#eaf6f5" strokeOpacity="0.4" strokeWidth="1.2" />
        <polygon className="fall-a-drift" style={{ '--r': '30deg', animationDelay: '-3.9s' }} points="120,380 158,364 170,420 126,432" fill="rgba(234,246,245,0.05)" stroke="#f5c453" strokeOpacity="0.5" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

/* Stop 2 — the city rushing up; the ground beneath the tower cracked open, magenta */
function StopCity() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fallSky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a3a" stopOpacity="0.12" />
          <stop offset="0.6" stopColor="#08080c" />
          <stop offset="1" stopColor="#08080c" />
        </linearGradient>
        <radialGradient id="fallCrack2" cx="0.5" cy="0.9" r="0.6">
          <stop offset="0" stopColor="#ff3d8b" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#ff3d8b" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ff3d8b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="1000" fill="#08080c" />
      <rect width="1000" height="1000" fill="url(#fallSky2)" />
      {/* skyline linework, rushing up */}
      <g className="fall-a-up" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="2" fill="none">
        <rect x="40" y="640" width="90" height="360" />
        <rect x="150" y="560" width="70" height="440" />
        <rect x="240" y="690" width="110" height="310" />
        <polygon points="380,1000 380,540 420,470 460,540 460,1000" />
        <rect x="560" y="620" width="80" height="380" />
        <rect x="660" y="700" width="120" height="300" />
        <rect x="800" y="580" width="70" height="420" />
        <rect x="890" y="660" width="90" height="340" />
        <line x1="175" y1="560" x2="175" y2="520" strokeOpacity="0.6" />
        <line x1="835" y1="580" x2="835" y2="545" strokeOpacity="0.6" />
      </g>
      {/* the ground is wrong — cracked open, a wound going down */}
      <rect width="1000" height="1000" fill="url(#fallCrack2)" className="fall-a-pulse" />
      <g className="fall-a-pulse" style={{ animationDelay: '-0.9s' }}>
        <polygon points="410,1000 445,880 480,910 520,830 560,900 600,860 630,1000" fill="#ff3d8b" opacity="0.4" />
        <path d="M470 1000 L495 900 L516 940 L545 870" fill="none" stroke="#ff3d8b" strokeOpacity="0.9" strokeWidth="3" />
        <path d="M430 1000 L452 930 M585 1000 L570 920" fill="none" stroke="#ff3d8b" strokeOpacity="0.6" strokeWidth="2" />
      </g>
    </svg>
  )
}

/* Stop 3 — through the surface: the Deep Render, dormant gold circuitry */
function StopDeepRender() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="1000" fill="#08080c" />
      <rect width="1000" height="1000" fill="#141018" opacity="0.5" />
      {/* vast dormant render-structures */}
      <g fill="none" stroke="#f5c453" strokeOpacity="0.16" strokeWidth="3">
        <rect x="60" y="120" width="340" height="520" />
        <rect x="120" y="200" width="220" height="360" />
        <rect x="620" y="300" width="330" height="560" />
        <rect x="680" y="380" width="210" height="400" />
      </g>
      {/* gold circuitry — half-lit traces */}
      <g fill="none" stroke="#f5c453" strokeWidth="2.5">
        <path d="M0 460 H180 V300 H400 V520 H540" strokeOpacity="0.45" />
        <path d="M1000 620 H820 V760 H600 V560" strokeOpacity="0.35" />
        <path d="M230 1000 V820 H460 V700" strokeOpacity="0.25" />
        <path d="M760 0 V160 H560 V300" strokeOpacity="0.3" />
      </g>
      {/* nodes — a few still alive */}
      <circle cx="180" cy="300" r="7" fill="#f5c453" opacity="0.5" className="fall-a-flicker" />
      <circle cx="540" cy="520" r="6" fill="#f5c453" opacity="0.35" />
      <circle cx="600" cy="560" r="7" fill="#f5c453" opacity="0.45" className="fall-a-flicker" style={{ animationDelay: '-1.4s' }} />
      <circle cx="460" cy="700" r="5" fill="#f5c453" opacity="0.3" />
      <circle cx="560" cy="300" r="6" fill="#f5c453" opacity="0.4" className="fall-a-flicker" style={{ animationDelay: '-2.6s' }} />
    </svg>
  )
}

/* Stop 4 — the Gatekeeper's Vault (colossal sealed door) + the Signal Reach (light threads in fog) */
function StopVaultReach() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="fallFog4" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      <rect width="1000" height="1000" fill="#08080c" />
      <rect width="1000" height="1000" fill="#0a0e14" opacity="0.7" />
      {/* the colossal sealed door */}
      <g fill="none" stroke="#f5c453">
        <circle cx="300" cy="480" r="310" strokeOpacity="0.22" strokeWidth="10" />
        <circle cx="300" cy="480" r="245" strokeOpacity="0.3" strokeWidth="5" />
        <circle cx="300" cy="480" r="170" strokeOpacity="0.4" strokeWidth="3" />
        <line x1="300" y1="170" x2="300" y2="790" strokeOpacity="0.35" strokeWidth="4" />
        {[0, 30, 60, 90, 120, 150].map(a => (
          <line
            key={a}
            x1={300 + 170 * Math.cos((a * Math.PI) / 180)}
            y1={480 + 170 * Math.sin((a * Math.PI) / 180)}
            x2={300 + 245 * Math.cos((a * Math.PI) / 180)}
            y2={480 + 245 * Math.sin((a * Math.PI) / 180)}
            strokeOpacity="0.28"
            strokeWidth="4"
          />
        ))}
        <circle cx="300" cy="480" r="26" strokeOpacity="0.6" strokeWidth="4" />
      </g>
      {/* fog banks */}
      <ellipse cx="720" cy="300" rx="260" ry="90" fill="#3df0e8" opacity="0.05" filter="url(#fallFog4)" />
      <ellipse cx="640" cy="680" rx="300" ry="110" fill="#3df0e8" opacity="0.04" filter="url(#fallFog4)" />
      {/* signal threads lancing through the fog */}
      <g fill="none" stroke="#3df0e8" strokeWidth="2" strokeDasharray="14 90">
        <line x1="520" y1="80" x2="1000" y2="420" strokeOpacity="0.65" className="fall-a-thread" />
        <line x1="480" y1="360" x2="1000" y2="640" strokeOpacity="0.5" className="fall-a-thread" style={{ animationDelay: '-0.8s' }} />
        <line x1="560" y1="700" x2="1000" y2="880" strokeOpacity="0.4" className="fall-a-thread" style={{ animationDelay: '-1.5s' }} />
        <line x1="620" y1="1000" x2="980" y2="620" strokeOpacity="0.35" className="fall-a-thread" style={{ animationDelay: '-0.4s' }} />
      </g>
    </svg>
  )
}

/* Stop 5 — the Type Citadel (rigid crystal) + the Framework Spire (inverted nested tower) */
function StopCitadelSpire() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="1000" fill="#08080c" />
      <rect width="1000" height="1000" fill="#0c1216" opacity="0.6" />
      {/* the Type Citadel — rigid crystalline geometry */}
      <g fill="none" stroke="#eaf6f5" strokeOpacity="0.3" strokeWidth="2">
        <polygon points="120,760 210,340 300,760" />
        <polygon points="210,340 258,540 300,760" strokeOpacity="0.18" />
        <polygon points="20,860 90,560 170,860" />
        <polygon points="280,880 350,480 440,880" />
        <polygon points="350,480 392,660 440,880" strokeOpacity="0.16" />
      </g>
      <polygon points="120,760 210,340 258,540" fill="#3df0e8" opacity="0.05" />
      <polygon points="280,880 350,480 392,660" fill="#3df0e8" opacity="0.04" />
      {/* the Framework Spire — an inverted tower of nested components */}
      <g className="fall-a-flicker" style={{ animationDuration: '5.2s' }}>
        <polygon points="580,60 960,60 900,320 640,320" fill="none" stroke="#3df0e8" strokeOpacity="0.4" strokeWidth="2.5" />
        <polygon points="640,320 900,320 856,540 684,540" fill="none" stroke="#3df0e8" strokeOpacity="0.32" strokeWidth="2" />
        <polygon points="684,540 856,540 824,720 716,720" fill="none" stroke="#3df0e8" strokeOpacity="0.26" strokeWidth="2" />
        <polygon points="716,720 824,720 796,860 744,860" fill="none" stroke="#3df0e8" strokeOpacity="0.2" strokeWidth="1.5" />
        <polygon points="744,860 796,860 770,950" fill="none" stroke="#3df0e8" strokeOpacity="0.16" strokeWidth="1.5" />
        <line x1="770" y1="60" x2="770" y2="950" stroke="#3df0e8" strokeOpacity="0.1" strokeWidth="1.5" />
      </g>
      <circle cx="770" cy="950" r="5" fill="#3df0e8" opacity="0.5" className="fall-a-pulse" />
    </svg>
  )
}

/* Stop 6 — the Workflow Wastes: a graveyard of broken constructs;
   one dormant Daemon eye tracking you (subtle — foreshadow: Mara's Daemon) */
function StopWastes() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="1000" fill="#08080c" />
      <rect width="1000" height="1000" fill="#090a10" opacity="0.7" />
      {/* wreckage heaps */}
      <ellipse cx="260" cy="900" rx="380" ry="120" fill="#7badb0" opacity="0.05" />
      <ellipse cx="760" cy="940" rx="320" ry="100" fill="#7badb0" opacity="0.04" />
      {/* broken construct wireframes, tilted where they fell */}
      <g fill="none" stroke="#7badb0" strokeOpacity="0.32" strokeWidth="2">
        <g transform="rotate(-24 200 700)">
          <rect x="140" y="640" width="120" height="150" />
          <line x1="140" y1="700" x2="60" y2="760" />
          <line x1="260" y1="680" x2="330" y2="640" />
          <circle cx="200" cy="600" r="34" />
        </g>
        <g transform="rotate(14 620 760)">
          <rect x="560" y="700" width="130" height="120" />
          <line x1="560" y1="760" x2="490" y2="830" />
          <circle cx="625" cy="660" r="30" strokeOpacity="0.22" />
        </g>
        <g transform="rotate(-8 880 640)">
          <rect x="840" y="580" width="90" height="110" strokeOpacity="0.2" />
          <line x1="840" y1="620" x2="780" y2="600" strokeOpacity="0.2" />
        </g>
        <path d="M60 520 L120 500 L110 560" strokeOpacity="0.18" />
        <path d="M420 880 L470 850 L500 900" strokeOpacity="0.2" />
      </g>
      {/* the dormant Daemon's eye — it tracks you as you pass */}
      <g>
        <ellipse cx="625" cy="655" rx="44" ry="24" fill="none" stroke="#3df0e8" strokeOpacity="0.35" strokeWidth="2" />
        <circle cx="625" cy="655" r="9" fill="#3df0e8" opacity="0.65" className="fall-a-eye" />
        <circle cx="625" cy="655" r="20" fill="#3df0e8" opacity="0.06" className="fall-a-pulse" style={{ animationDuration: '4.5s' }} />
      </g>
    </svg>
  )
}

/* Stop 7 — the Foundry shallows: the strata thin out; light gives up */
function StopShallows() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fallDim7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1216" />
          <stop offset="0.55" stopColor="#08080c" />
          <stop offset="1" stopColor="#030304" />
        </linearGradient>
      </defs>
      <rect width="1000" height="1000" fill="url(#fallDim7)" />
      {/* the last strata, thinning */}
      <line x1="0" y1="180" x2="1000" y2="200" stroke="#7badb0" strokeOpacity="0.14" strokeWidth="3" />
      <line x1="0" y1="380" x2="1000" y2="370" stroke="#7badb0" strokeOpacity="0.09" strokeWidth="2" />
      <line x1="0" y1="580" x2="1000" y2="590" stroke="#7badb0" strokeOpacity="0.05" strokeWidth="2" />
      <line x1="0" y1="790" x2="1000" y2="784" stroke="#7badb0" strokeOpacity="0.025" strokeWidth="1.5" />
      {/* the last motes of light, giving up */}
      <circle cx="220" cy="260" r="3" fill="#f5c453" opacity="0.2" className="fall-a-flicker" />
      <circle cx="700" cy="330" r="2.5" fill="#7badb0" opacity="0.18" className="fall-a-flicker" style={{ animationDelay: '-1.8s' }} />
      <circle cx="480" cy="520" r="2" fill="#7badb0" opacity="0.1" className="fall-a-flicker" style={{ animationDelay: '-2.7s' }} />
      <circle cx="820" cy="700" r="1.6" fill="#7badb0" opacity="0.06" />
    </svg>
  )
}

/* Stop 8 — IMPACT: black stone, a crater in cyan cross-section, dust settling */
function StopFloor() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="1000" fill="#08080c" />
      {/* stone mass below the crater line */}
      <path d="M0 660 L240 650 L340 680 L420 780 L500 820 L580 780 L660 680 L780 655 L1000 665 L1000 1000 L0 1000 Z" fill="#050508" />
      {/* the crater profile — cyan cross-section */}
      <path d="M0 660 L240 650 L340 680 L420 780 L500 820 L580 780 L660 680 L780 655 L1000 665" fill="none" stroke="#3df0e8" strokeOpacity="0.8" strokeWidth="3" />
      {/* cross-section hatching */}
      <g stroke="#3df0e8" strokeOpacity="0.16" strokeWidth="1.5">
        <line x1="80" y1="700" x2="120" y2="760" />
        <line x1="200" y1="695" x2="240" y2="755" />
        <line x1="320" y1="730" x2="360" y2="790" />
        <line x1="440" y1="830" x2="480" y2="890" />
        <line x1="540" y1="840" x2="580" y2="900" />
        <line x1="660" y1="730" x2="700" y2="790" />
        <line x1="780" y1="700" x2="820" y2="760" />
        <line x1="900" y1="705" x2="940" y2="765" />
      </g>
      <line x1="0" y1="940" x2="1000" y2="940" stroke="#3df0e8" strokeOpacity="0.08" strokeWidth="2" />
      {/* impact fracture lines */}
      <g stroke="#3df0e8" strokeOpacity="0.3" strokeWidth="1.5" fill="none">
        <path d="M500 820 L430 900 M500 820 L560 910 M500 820 L500 960" />
      </g>
      {/* dust settling */}
      <g fill="#eaf6f5">
        <circle cx="430" cy="760" r="3" className="fall-a-dust" />
        <circle cx="520" cy="790" r="2.5" className="fall-a-dust" style={{ animationDelay: '-1.3s' }} />
        <circle cx="580" cy="740" r="2" className="fall-a-dust" style={{ animationDelay: '-2.2s' }} />
        <circle cx="470" cy="720" r="2" className="fall-a-dust" style={{ animationDelay: '-3.1s' }} />
        <circle cx="620" cy="700" r="1.6" className="fall-a-dust" style={{ animationDelay: '-0.6s' }} />
        <circle cx="380" cy="710" r="1.6" className="fall-a-dust" style={{ animationDelay: '-1.9s' }} />
        <circle cx="545" cy="750" r="1.4" className="fall-a-dust" style={{ animationDelay: '-2.8s' }} />
        <circle cx="410" cy="800" r="1.4" className="fall-a-dust" style={{ animationDelay: '-3.6s' }} />
      </g>
    </svg>
  )
}

/* Stop 9 — the body in the crater; the wrist-mark, the only light;
   then a faint second light: an approaching signal waveform */
function StopBody() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="fallMark9" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3df0e8" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#3df0e8" stopOpacity="0.14" />
          <stop offset="1" stopColor="#3df0e8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="1000" fill="#030304" />
      {/* the crater, barely visible */}
      <path d="M0 700 L260 690 L360 720 L440 800 L520 830 L600 795 L700 715 L820 695 L1000 705 L1000 1000 L0 1000 Z" fill="#08080c" />
      <path d="M0 700 L260 690 L360 720 L440 800 L520 830 L600 795 L700 715 L820 695 L1000 705" fill="none" stroke="#3df0e8" strokeOpacity="0.14" strokeWidth="2" />
      {/* the body, prone in the crater bowl */}
      <g>
        <path d="M400 806 Q420 786 452 790 L560 796 Q590 798 606 810 L604 822 L402 818 Z" fill="#101018" stroke="rgba(234,246,245,0.12)" strokeWidth="1.5" />
        <circle cx="392" cy="804" r="14" fill="#101018" stroke="rgba(234,246,245,0.12)" strokeWidth="1.5" />
        {/* outflung arm */}
        <path d="M560 800 Q610 792 648 800" fill="none" stroke="#101018" strokeWidth="10" strokeLinecap="round" />
      </g>
      {/* the wrist-mark — the only light in the world */}
      <circle cx="650" cy="800" r="60" fill="url(#fallMark9)" className="fall-a-mark" />
      <g className="fall-a-mark" style={{ animationDelay: '-0.8s' }}>
        <circle cx="650" cy="800" r="5" fill="#3df0e8" />
        <path d="M650 800 h12 v-8 M650 800 h-10 v7 M650 800 v-12 h7" fill="none" stroke="#3df0e8" strokeOpacity="0.9" strokeWidth="1.8" />
      </g>
      {/* a faint second light: a signal waveform, approaching */}
      <g className="fall-a-wave">
        <polyline points="850,300 866,300 872,282 882,318 892,270 902,326 912,292 920,306 936,300 1000,300" fill="none" stroke="#3df0e8" strokeWidth="2" />
        <circle cx="892" cy="300" r="26" fill="#3df0e8" opacity="0.05" />
      </g>
    </svg>
  )
}

const STOP_ART = [
  StopGlass,
  StopCity,
  StopDeepRender,
  StopVaultReach,
  StopCitadelSpire,
  StopWastes,
  StopShallows,
  StopFloor,
  StopBody,
]

/* =====================================================================
 * FallScene
 * ===================================================================== */
export default function FallScene({ onComplete }) {
  const [stop, setStop] = useState(0)
  const [lineCount, setLineCount] = useState(1)
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState(false)
  const doneRef = useRef(false)
  const lockTimerRef = useRef(null)

  const card = STOPS[stop]
  const totalLines = card.lines.length
  const last = stop === STOPS.length - 1

  /* travel lock per stop; IMPACT stop adds the uninterruptible white flash */
  useEffect(() => {
    clearTimeout(lockTimerRef.current)
    setLocked(true)
    const impact = stop === IMPACT_STOP
    if (impact) setFlash(true)
    lockTimerRef.current = setTimeout(() => setLocked(false), impact ? 1300 : 700)
    return () => clearTimeout(lockTimerRef.current)
  }, [stop])

  const advance = useCallback(() => {
    if (locked || doneRef.current) return
    if (lineCount < totalLines) {
      setLineCount(c => c + 1)
      return
    }
    if (stop < STOPS.length - 1) {
      setStop(s => s + 1)
      setLineCount(1)
    } else {
      doneRef.current = true
      onComplete?.()
    }
  }, [locked, lineCount, totalLines, stop, onComplete])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  /* parallax: each layer translated by its own rate from the stop index */
  const shift = (rate) => ({ transform: `translateY(${-(stop * rate * 100)}vh)` })

  /* speed lines intensify with depth, then die at the Floor */
  const falling = stop < IMPACT_STOP
  const streakStyle = {
    '--fall-streak-o': falling ? Math.min(0.7, 0.18 + stop * 0.08).toFixed(2) : 0,
    '--fall-streak-t': `${Math.max(0.35, 1.1 - stop * 0.1).toFixed(2)}s`,
  }

  return (
    <div className="fall-wrap" style={streakStyle} onClick={advance}>
      {/* far strata silhouettes — slowest */}
      <div className="fall-layer fall-layer-far" style={shift(FAR_RATE)} aria-hidden="true">
        <FarStrata />
      </div>

      {/* the world column — 9 stops */}
      <div className="fall-layer fall-layer-world" style={shift(1)}>
        {STOP_ART.map((Art, i) => (
          <section className="fall-stop" key={STOPS[i].id}>
            <Art />
          </section>
        ))}
      </div>

      {/* near debris — fastest */}
      <div className="fall-layer fall-layer-near" style={shift(NEAR_RATE)} aria-hidden="true">
        {DEBRIS.map(d => (
          <div
            key={d.id}
            className="fall-debris"
            style={{
              top: `${d.top}vh`,
              left: `${d.left}%`,
              width: d.size,
              height: d.size,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
            }}
          >
            <svg viewBox="0 0 24 24" style={{ transform: `rotate(${d.rot}deg)` }}>
              <polygon points={d.pts} fill={d.fill} stroke={d.stroke} strokeWidth="1.5" strokeOpacity="0.8" />
            </svg>
          </div>
        ))}
      </div>

      {/* upward speed lines */}
      <div className="fall-streaks" aria-hidden="true">
        {STREAKS.map(s => (
          <span
            key={s.id}
            className={`fall-streak ${s.gold ? 'g' : ''}`}
            style={{ left: `${s.left}%`, height: `${s.h}vh`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>

      {/* reduced-motion crossfade veil (animates only under prefers-reduced-motion) */}
      <div className="fall-stopfade" key={`fade-${stop}`} aria-hidden="true" />

      {/* IMPACT white flash */}
      {flash && <div className="fall-flash" onAnimationEnd={() => setFlash(false)} aria-hidden="true" />}

      <div className="fall-top">
        <span className="fall-kicker">THE FALL</span>
        <span className="fall-dots">
          {STOPS.map((s, i) => (
            <span key={s.id} className={`fall-dot ${i === stop ? 'on' : ''} ${i < stop ? 'done' : ''}`} />
          ))}
        </span>
        <span className="fall-depth">{card.depth}</span>
      </div>

      <div className="fall-copy" key={`copy-${stop}`}>
        {card.lines.slice(0, lineCount).map((line, i) => (
          <p className="fall-line" key={i}>{line}</p>
        ))}
      </div>

      <div className={`fall-continue ${locked ? 'locked' : ''}`}>
        {locked ? '· · ·' : lineCount < totalLines ? '▸' : !last ? '▸ CONTINUE' : '▸ PROCEED'}
      </div>
    </div>
  )
}
