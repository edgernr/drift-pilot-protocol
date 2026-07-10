// All enemy SVG components. Each renders at 120x120 viewBox.

function WraithSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg">
      {/* Outer broken hex — gap at top-right segment */}
      <path d="M60 14 L96 34" stroke="#ff3d8b" strokeWidth="1.5" strokeDasharray="7 4" opacity="0.5"/>
      <path d="M96 34 L96 86 L60 106 L24 86 L24 34 L60 14" stroke="#ff3d8b" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Inner fill — very faint */}
      <polygon points="60,14 96,34 96,86 60,106 24,86 24,34" fill="rgba(255,61,139,0.04)"/>
      {/* Internal grid fractures */}
      <line x1="24" y1="34" x2="96" y2="86" stroke="#ff3d8b" strokeWidth="0.5" opacity="0.2"/>
      <line x1="96" y1="34" x2="24" y2="86" stroke="#ff3d8b" strokeWidth="0.5" opacity="0.2"/>
      <line x1="60" y1="14" x2="60" y2="106" stroke="#ff3d8b" strokeWidth="0.5" opacity="0.15"/>
      {/* Error tag fragments */}
      <text x="36" y="54" fill="#ff3d8b" fontSize="9" fontFamily="JetBrains Mono, monospace" opacity="0.65">&lt;/div&gt;</text>
      <text x="46" y="66" fill="#ff3d8b" fontSize="7" fontFamily="JetBrains Mono, monospace" opacity="0.4">&lt;!--</text>
      {/* Eyes — malformed rects, not circles (wrong element type) */}
      <rect x="42" y="72" width="9" height="5" rx="1" fill="#ff3d8b" opacity="0.9"/>
      <rect x="69" y="72" width="9" height="5" rx="1" fill="#ff3d8b" opacity="0.9"/>
      {/* Scattered node fragments */}
      <circle cx="24" cy="34" r="3" fill="#ff3d8b" opacity="0.6"/>
      <circle cx="96" cy="34" r="3" fill="#ff3d8b" opacity="0.3"/>
      <circle cx="60" cy="14" r="3" fill="#ff3d8b" opacity="0.6"/>
    </svg>
  )
}

function FacelessSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg dtab-faceless">
      {/* Outer smooth oval */}
      <ellipse cx="60" cy="60" rx="38" ry="46" stroke="#eaf6f5" strokeWidth="1" opacity="0.35" fill="rgba(234,246,245,0.03)"/>
      {/* Inner oval */}
      <ellipse cx="60" cy="60" rx="26" ry="34" stroke="#eaf6f5" strokeWidth="0.5" opacity="0.15" fill="rgba(234,246,245,0.02)"/>
      {/* No features — intentionally blank center */}
      <text x="60" y="64" textAnchor="middle" fill="rgba(234,246,245,0.2)" fontSize="8" fontFamily="JetBrains Mono, monospace">[ UNDEFINED ]</text>
      {/* Faint div labels showing meaninglessness */}
      <text x="22" y="42" fill="rgba(234,246,245,0.12)" fontSize="7" fontFamily="JetBrains Mono, monospace">&lt;div&gt;</text>
      <text x="22" y="82" fill="rgba(234,246,245,0.12)" fontSize="7" fontFamily="JetBrains Mono, monospace">&lt;div&gt;</text>
      <text x="74" y="42" fill="rgba(234,246,245,0.12)" fontSize="7" fontFamily="JetBrains Mono, monospace">&lt;div&gt;</text>
      <text x="74" y="82" fill="rgba(234,246,245,0.12)" fontSize="7" fontFamily="JetBrains Mono, monospace">&lt;div&gt;</text>
    </svg>
  )
}

function LabelEaterSVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg dtab-boss">
      {/* Main body — angular diamond with aggressive points */}
      <polygon points="60,8 108,44 95,100 25,100 12,44" fill="rgba(245,196,83,0.05)" stroke="#f5c453" strokeWidth="1.5" opacity="0.8"/>
      {/* Boss crown */}
      <polyline points="44,8 52,20 60,8 68,20 76,8" stroke="#f5c453" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* The mouth — open wide, made of angle brackets */}
      <path d="M32 72 L18 82 L32 92" stroke="#f5c453" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M88 72 L102 82 L88 92" stroke="#f5c453" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M38 82 Q60 96 82 82" stroke="#f5c453" strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Eyes — predatory slits */}
      <ellipse cx="46" cy="56" rx="6" ry="3" fill="#f5c453" opacity="0.9"/>
      <ellipse cx="74" cy="56" rx="6" ry="3" fill="#f5c453" opacity="0.9"/>
      {/* Hunger marks — unlabeled inputs being consumed */}
      <text x="48" y="46" fill="#f5c453" fontSize="7" fontFamily="JetBrains Mono, monospace" opacity="0.5">&lt;input&gt;</text>
      {/* Inner glow */}
      <ellipse cx="60" cy="65" rx="20" ry="14" fill="rgba(245,196,83,0.06)"/>
    </svg>
  )
}

function ColorlessSVG() {
  // The Colorless — Gate 04 — a gray-scale consuming void
  // Palette: ONLY grays (#808080, #a0a0a0, #c0c0c0, #404040, white) — no color
  // Design: circular form with color-variables being drained into it
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg">
      {/* Outer drained ring */}
      <circle cx="60" cy="60" r="44" stroke="#606060" strokeWidth="1" fill="rgba(80,80,80,0.04)" strokeDasharray="5 3"/>
      <circle cx="60" cy="60" r="30" stroke="#808080" strokeWidth="0.5" fill="rgba(80,80,80,0.06)"/>
      {/* Consuming vortex center */}
      <circle cx="60" cy="60" r="14" fill="rgba(20,20,20,0.8)" stroke="#505050" strokeWidth="1"/>
      {/* Color tokens being absorbed */}
      <text x="18" y="36" fill="rgba(160,160,160,0.35)" fontSize="6" fontFamily="JetBrains Mono, monospace">--color:</text>
      <text x="18" y="46" fill="rgba(120,120,120,0.25)" fontSize="6" fontFamily="JetBrains Mono, monospace">▓ void</text>
      <text x="74" y="80" fill="rgba(140,140,140,0.3)" fontSize="6" fontFamily="JetBrains Mono, monospace">var(--?)</text>
      <text x="72" y="90" fill="rgba(100,100,100,0.2)" fontSize="6" fontFamily="JetBrains Mono, monospace">#000000</text>
      {/* Drain lines */}
      <line x1="30" y1="42" x2="50" y2="57" stroke="#606060" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 2"/>
      <line x1="88" y1="38" x2="68" y2="55" stroke="#606060" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2"/>
      <line x1="36" y1="82" x2="53" y2="65" stroke="#606060" strokeWidth="0.5" opacity="0.35" strokeDasharray="2 2"/>
      <line x1="86" y1="78" x2="68" y2="65" stroke="#606060" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 2"/>
      {/* Eyes — white pinpoints in void */}
      <circle cx="51" cy="57" r="3.5" fill="rgba(200,200,200,0.8)"/>
      <circle cx="69" cy="57" r="3.5" fill="rgba(200,200,200,0.8)"/>
      <circle cx="51" cy="57" r="1.2" fill="#101010"/>
      <circle cx="69" cy="57" r="1.2" fill="#101010"/>
      {/* Node points */}
      <circle cx="60" cy="16" r="2" fill="#606060" opacity="0.5"/>
      <circle cx="60" cy="104" r="2" fill="#606060" opacity="0.3"/>
    </svg>
  )
}

function UnalignedSVG() {
  // The Unaligned — Gate 05 — displaced layout entity
  // Palette: #3df0e8 cyan (flexbox), #ff3d8b magenta (errors), #eaf6f5 text
  // Design: layout boxes broken from their grid, floating at wrong angles
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg">
      {/* Displaced layout boxes — falling off grid */}
      <rect x="12" y="20" width="28" height="16" stroke="#3df0e8" strokeWidth="1" fill="rgba(61,240,232,0.04)" opacity="0.5" transform="rotate(-18 26 28)"/>
      <rect x="74" y="14" width="32" height="16" stroke="#3df0e8" strokeWidth="1" fill="rgba(61,240,232,0.04)" opacity="0.4" transform="rotate(22 90 22)"/>
      <rect x="18" y="80" width="28" height="14" stroke="#3df0e8" strokeWidth="0.5" fill="rgba(61,240,232,0.03)" opacity="0.35" transform="rotate(12 32 87)"/>
      <rect x="76" y="86" width="26" height="14" stroke="#3df0e8" strokeWidth="0.5" fill="rgba(61,240,232,0.03)" opacity="0.3" transform="rotate(-8 89 93)"/>
      {/* Main form — a corrupted flex container */}
      <rect x="30" y="40" width="60" height="40" stroke="#3df0e8" strokeWidth="1.5" fill="rgba(61,240,232,0.03)" opacity="0.7"/>
      {/* Wrong alignment arrows inside */}
      <path d="M42 56 L50 48" stroke="#ff3d8b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M50 48 L46 48 M50 48 L50 52" stroke="#ff3d8b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M72 64 L64 72" stroke="#ff3d8b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M64 72 L68 72 M64 72 L64 68" stroke="#ff3d8b" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eyes — misaligned rects at different angles */}
      <rect x="44" y="53" width="10" height="6" rx="1" fill="#3df0e8" opacity="0.85" transform="rotate(-10 49 56)"/>
      <rect x="66" y="53" width="10" height="6" rx="1" fill="#3df0e8" opacity="0.85" transform="rotate(10 71 56)"/>
      {/* flex: labels scattered wrong */}
      <text x="34" y="46" fill="rgba(61,240,232,0.2)" fontSize="5.5" fontFamily="JetBrains Mono, monospace">flex:</text>
      <text x="78" y="76" fill="rgba(61,240,232,0.2)" fontSize="5.5" fontFamily="JetBrains Mono, monospace">column</text>
      {/* scatter points */}
      <circle cx="22" cy="50" r="2" fill="#3df0e8" opacity="0.3"/>
      <circle cx="98" cy="70" r="2" fill="#3df0e8" opacity="0.25"/>
    </svg>
  )
}

function ExamDroneSVG() {
  // Exam Drone — prologue licensing exam target dummy
  // A harmless chrome/cyan sphere bearing the gold Hunter Association crest
  // Palette: #3df0e8 cyan + #f5c453 gold + #eaf6f5 chrome — NO magenta. Reads friendly/clinical.
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg">
      {/* Soft hover field beneath */}
      <ellipse cx="60" cy="104" rx="26" ry="4" fill="rgba(61,240,232,0.06)"/>
      <ellipse cx="60" cy="104" rx="16" ry="2.5" stroke="#3df0e8" strokeWidth="0.5" opacity="0.3" strokeDasharray="3 3"/>
      {/* Antenna */}
      <line x1="60" y1="14" x2="60" y2="24" stroke="#eaf6f5" strokeWidth="1" opacity="0.5"/>
      <circle cx="60" cy="12" r="2.5" fill="#f5c453" opacity="0.8"/>
      <circle cx="60" cy="12" r="5" stroke="#f5c453" strokeWidth="0.5" opacity="0.3"/>
      {/* Chrome sphere body — layered rings for polished metal read */}
      <circle cx="60" cy="56" r="32" fill="rgba(234,246,245,0.05)" stroke="#eaf6f5" strokeWidth="1.2" opacity="0.85"/>
      <circle cx="60" cy="56" r="32" stroke="#3df0e8" strokeWidth="0.5" opacity="0.35"/>
      <circle cx="60" cy="56" r="26" stroke="#eaf6f5" strokeWidth="0.5" opacity="0.2"/>
      {/* Chrome highlight arc — top-left sheen */}
      <path d="M38 40 Q46 28 60 26" stroke="#eaf6f5" strokeWidth="2" opacity="0.55" strokeLinecap="round"/>
      <path d="M34 48 Q36 38 44 32" stroke="#3df0e8" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
      {/* Equatorial seam line */}
      <path d="M28 60 Q60 70 92 60" stroke="#eaf6f5" strokeWidth="0.6" opacity="0.3"/>
      {/* Scanning eye — soft cyan lens, clinical not menacing */}
      <ellipse cx="60" cy="50" rx="14" ry="9" fill="rgba(61,240,232,0.08)" stroke="#3df0e8" strokeWidth="1" opacity="0.8"/>
      <ellipse cx="60" cy="50" rx="8" ry="5" fill="rgba(61,240,232,0.18)"/>
      <circle cx="60" cy="50" r="3" fill="#3df0e8" opacity="0.9"/>
      <circle cx="62" cy="48.5" r="1" fill="#eaf6f5" opacity="0.9"/>
      {/* Scan sweep line */}
      <line x1="44" y1="50" x2="76" y2="50" stroke="#3df0e8" strokeWidth="0.5" opacity="0.45" strokeDasharray="2 3"/>
      {/* Hunter Association crest — gold shield with tower spire, lower hemisphere */}
      <path d="M60 68 L67 71 L67 78 L60 84 L53 78 L53 71 Z" fill="rgba(245,196,83,0.1)" stroke="#f5c453" strokeWidth="1" opacity="0.9"/>
      <path d="M60 71 L60 80 M57 74 L63 74" stroke="#f5c453" strokeWidth="0.8" opacity="0.8"/>
      <circle cx="60" cy="70.5" r="0.8" fill="#f5c453" opacity="0.9"/>
      {/* Hover fins — small angled stabilizers, port & starboard */}
      <path d="M28 62 L14 70 L18 74 L30 68" fill="rgba(234,246,245,0.06)" stroke="#eaf6f5" strokeWidth="0.8" opacity="0.6"/>
      <path d="M92 62 L106 70 L102 74 L90 68" fill="rgba(234,246,245,0.06)" stroke="#eaf6f5" strokeWidth="0.8" opacity="0.6"/>
      <line x1="17" y1="71" x2="21" y2="69" stroke="#3df0e8" strokeWidth="0.6" opacity="0.5"/>
      <line x1="103" y1="71" x2="99" y2="69" stroke="#3df0e8" strokeWidth="0.6" opacity="0.5"/>
      {/* Ventral thruster ticks */}
      <line x1="54" y1="88" x2="52" y2="94" stroke="#3df0e8" strokeWidth="0.8" opacity="0.4"/>
      <line x1="60" y1="89" x2="60" y2="96" stroke="#3df0e8" strokeWidth="0.8" opacity="0.5"/>
      <line x1="66" y1="88" x2="68" y2="94" stroke="#3df0e8" strokeWidth="0.8" opacity="0.4"/>
      {/* Calibration label */}
      <text x="60" y="106" textAnchor="middle" fill="rgba(245,196,83,0.4)" fontSize="6" fontFamily="JetBrains Mono, monospace">HA-EXM.01</text>
    </svg>
  )
}

function GorgorothSVG() {
  // GORGOROTH BLACKBLOOD — the First Null — prologue forced-loss boss.
  // A hulking asymmetric titan filling the frame: shoulders bleed past the edges, a crown of
  // jagged horns, a lowered predator head with twin burning eyes (the right one larger, madder),
  // a black-hole chest core with a rotating accretion ring, a pulsing abyss-blood vein network,
  // falling blood drips, crackling shoulder arcs, floating torn debris, a heat-shimmer aura.
  // Self-animating: inline <style> (gorg- prefix, reduced-motion aware) + SMIL for drips/rotation.
  // Palette: #ff3d8b magenta + #cc0033 crimson on #050508 abyss-black.
  // The single cyan glint in his left eye = the player's Void-mark, reflected.
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="dtab-enemy-svg dtab-boss">
      <defs>
        <radialGradient id="gorg-eyeglow">
          <stop offset="0%" stopColor="#ff3d8b" stopOpacity="0.9"/>
          <stop offset="45%" stopColor="#ff3d8b" stopOpacity="0.32"/>
          <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="gorg-coreglow">
          <stop offset="0%" stopColor="#cc0033" stopOpacity="0.55"/>
          <stop offset="60%" stopColor="#ff3d8b" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="gorg-corevoid">
          <stop offset="0%" stopColor="#000000"/>
          <stop offset="62%" stopColor="#050508"/>
          <stop offset="88%" stopColor="#1a0010"/>
          <stop offset="100%" stopColor="#cc0033"/>
        </radialGradient>
        <filter id="gorg-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2"/>
        </filter>
        <filter id="gorg-haze" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.1"/>
        </filter>
      </defs>
      <style>{`
        @keyframes gorg-flow { to { stroke-dashoffset: -30; } }
        @keyframes gorg-pulse { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
        @keyframes gorg-flicker { 0%,6%,9%,41%,45%,100% { opacity: 1; } 7.5% { opacity: .3; } 43% { opacity: .55; } 70% { opacity: .85; } }
        @keyframes gorg-arcf { 0%,86%,100% { opacity: 0; } 88%,93% { opacity: .95; } 90% { opacity: .25; } }
        .gorg-vein { animation: gorg-flow 1.5s linear infinite, gorg-pulse 2.6s ease-in-out infinite; }
        .gorg-d2 { animation-delay: -.35s, -.5s; }
        .gorg-d3 { animation-delay: -.7s, -1.05s; }
        .gorg-d4 { animation-delay: -1.05s, -1.6s; }
        .gorg-d5 { animation-delay: -.5s, -2.1s; }
        .gorg-node { animation: gorg-pulse 1.9s ease-in-out infinite; }
        .gorg-n2 { animation-delay: -.5s; }
        .gorg-n3 { animation-delay: -.95s; }
        .gorg-n4 { animation-delay: -1.4s; }
        .gorg-eyeL { animation: gorg-flicker 3.7s linear infinite; }
        .gorg-eyeR { animation: gorg-flicker 2.9s linear infinite -1.2s; }
        .gorg-arc1 { animation: gorg-arcf 2.7s linear infinite; }
        .gorg-arc2 { animation: gorg-arcf 3.4s linear infinite -1.3s; }
        .gorg-arc3 { animation: gorg-arcf 2.2s linear infinite -.7s; }
        @media (prefers-reduced-motion: reduce) {
          .gorg-vein, .gorg-node, .gorg-eyeL, .gorg-eyeR, .gorg-arc1, .gorg-arc2, .gorg-arc3 { animation: none; }
        }
      `}</style>
      {/* Heat-shimmer aura — breathing pressure rings */}
      <ellipse cx="60" cy="84" rx="54" ry="42" stroke="#ff3d8b" strokeWidth="1.2" opacity="0.16" filter="url(#gorg-blur)">
        <animate attributeName="rx" values="54;57;54" dur="4.8s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="42;44.5;42" dur="4.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.12;0.28;0.12" dur="4.8s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="60" cy="86" rx="44" ry="34" stroke="#cc0033" strokeWidth="0.8" opacity="0.14" filter="url(#gorg-haze)" strokeDasharray="9 7">
        <animate attributeName="rx" values="44;46;44" dur="3.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.1;0.22;0.1" dur="3.7s" repeatCount="indefinite"/>
      </ellipse>
      {/* Floating torn debris — stone ripped loose by sheer rage-pressure */}
      <g transform="translate(13 74)" opacity="0.85">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="4.2s" repeatCount="indefinite" additive="sum"/>
        <animateTransform attributeName="transform" type="rotate" values="0; 14; 0" dur="4.2s" repeatCount="indefinite" additive="sum"/>
        <polygon points="0,0 5,1.5 3.5,6 -1.5,4" fill="#050508" stroke="#cc0033" strokeWidth="0.7"/>
      </g>
      <g transform="translate(104 70)" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur="5.1s" begin="-1.2s" repeatCount="indefinite" additive="sum"/>
        <animateTransform attributeName="transform" type="rotate" values="0; -18; 0" dur="5.1s" begin="-1.2s" repeatCount="indefinite" additive="sum"/>
        <polygon points="0,0 6,2 4,7 -1,5" fill="#050508" stroke="#cc0033" strokeWidth="0.7"/>
      </g>
      <g transform="translate(92 24)" opacity="0.7">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur="3.6s" begin="-2s" repeatCount="indefinite" additive="sum"/>
        <animateTransform attributeName="transform" type="rotate" values="0; 22; 0" dur="3.6s" begin="-2s" repeatCount="indefinite" additive="sum"/>
        <polygon points="0,0 4,1 2.5,4.5" fill="#050508" stroke="#ff3d8b" strokeWidth="0.6"/>
      </g>
      <g transform="translate(24 16)" opacity="0.7">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3.5; 0 0" dur="4.6s" begin="-0.8s" repeatCount="indefinite" additive="sum"/>
        <animateTransform attributeName="transform" type="rotate" values="0; -12; 0" dur="4.6s" begin="-0.8s" repeatCount="indefinite" additive="sum"/>
        <polygon points="0,0 3.5,1.5 1.5,4.5 -1.5,3" fill="#050508" stroke="#ff3d8b" strokeWidth="0.6"/>
      </g>
      {/* Breathing body — the whole titan heaves */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -1.7; 0 0" dur="3.6s" repeatCount="indefinite"/>
        {/* Massive asymmetric silhouette — shoulders bleed off both frame edges */}
        <path d="M-12 124 L-10 88 Q-8 64 6 50 Q18 37 32 41 L40 48 L45 56 L48 59 L72 59 L76 52 L84 43 Q98 35 110 44 Q122 55 126 84 L128 124 Z" fill="#050508" stroke="#cc0033" strokeWidth="1"/>
        {/* Fists planted at the arena floor */}
        <path d="M-6 124 Q-2 100 12 97 Q24 101 26 124 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.8"/>
        <path d="M94 124 Q98 100 110 98 Q122 102 124 124 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.8"/>
        {/* Knuckle spikes */}
        <path d="M2 100 L0 92 L7 98 M10 97 L10 88 L15 96 M19 99 L22 91 L24 99" stroke="#ff3d8b" strokeWidth="0.8" opacity="0.5"/>
        <path d="M99 101 L97 93 L104 100 M108 99 L108 90 L113 98 M116 102 L119 94 L121 102" stroke="#ff3d8b" strokeWidth="0.8" opacity="0.5"/>
        {/* Shoulder jags — severed-stone spikes */}
        <path d="M6 48 L0 28 L15 41 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.8"/>
        <path d="M18 42 L14 22 L28 37 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.8"/>
        <path d="M104 42 L114 26 L112 44 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.8"/>
        <path d="M92 40 L98 20 L104 38 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.8"/>
        {/* Muscle contours */}
        <path d="M8 56 Q20 50 32 54 M112 50 Q100 46 88 54" stroke="#cc0033" strokeWidth="0.6" opacity="0.4"/>
        <path d="M44 68 Q60 76 76 68 M50 79 Q60 83 70 79" stroke="#cc0033" strokeWidth="0.6" opacity="0.35"/>
        {/* Crown of horns — tallest tip bleeds past the top of the frame */}
        <path d="M50 40 L41 8 L55 32 Z" fill="#050508" stroke="#ff3d8b" strokeWidth="0.9"/>
        <path d="M58 38 L59 -2 L67 30 Z" fill="#050508" stroke="#ff3d8b" strokeWidth="0.9"/>
        <path d="M68 40 L82 10 L73 34 Z" fill="#050508" stroke="#ff3d8b" strokeWidth="0.9"/>
        <path d="M47 42 L31 20 L47 35 Z" fill="#050508" stroke="#ff3d8b" strokeWidth="0.8"/>
        <path d="M73 42 L91 22 L74 35 Z" fill="#050508" stroke="#ff3d8b" strokeWidth="0.8"/>
        <path d="M54 36 L52 24 L58 33 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.7" opacity="0.8"/>
        <path d="M64 35 L70 22 L67 34 Z" fill="#050508" stroke="#cc0033" strokeWidth="0.7" opacity="0.8"/>
        {/* Vein-cracks climbing the horns */}
        <path d="M45 14 L48 30 M61 4 L62 26 M78 15 L74 30" stroke="#ff3d8b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.7" className="gorg-vein gorg-d3"/>
        {/* Lowered predator head */}
        <path d="M45 38 L43 52 L49 64 L60 71 L71 64 L77 52 L75 38 L68 45 L60 42 L52 45 Z" fill="#050508" stroke="#ff3d8b" strokeWidth="1.1"/>
        {/* Heavy brow ridge — angled down in fury */}
        <path d="M46 49 L57 53 M74 48 L63 52" stroke="#cc0033" strokeWidth="2" opacity="0.9" strokeLinecap="round"/>
        {/* Left eye — burning slit, layered glow */}
        <circle cx="52" cy="54.5" r="6.5" fill="url(#gorg-eyeglow)"/>
        <circle cx="52" cy="54.5" r="3" fill="#ff3d8b" opacity="0.55" filter="url(#gorg-haze)"/>
        <path d="M47.5 55 L56 53.4 L55 56.6 Z" fill="#ff3d8b" className="gorg-eyeL"/>
        <circle cx="52.5" cy="54.6" r="0.8" fill="#ff8ab8" className="gorg-eyeL"/>
        {/* Right eye — larger, madder */}
        <circle cx="68.5" cy="53.5" r="8.5" fill="url(#gorg-eyeglow)"/>
        <circle cx="68.5" cy="53.5" r="4.2" fill="#ff3d8b" opacity="0.6" filter="url(#gorg-haze)"/>
        <path d="M74 54 L63.5 51.6 L64.8 56.4 Z" fill="#ff3d8b" className="gorg-eyeR"/>
        <circle cx="69" cy="53.6" r="1.1" fill="#ff8ab8" className="gorg-eyeR"/>
        {/* The Void-mark, reflected — the one cyan thing in his world */}
        <path d="M50.6 55.4 L52.4 54.9" stroke="#3df0e8" strokeWidth="0.6" opacity="0.55"/>
        {/* Snarl — bared jagged teeth */}
        <path d="M49 62 L52.5 65.5 L56 62.5 L60 66.5 L64 62.5 L67.5 65.5 L71 62" stroke="#cc0033" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M51 63.5 L69 63.5" stroke="#ff3d8b" strokeWidth="0.5" opacity="0.35" strokeDasharray="1.5 2" className="gorg-vein gorg-d4"/>
        {/* Chest core — a black hole under the sternum */}
        <circle cx="60" cy="90" r="17" fill="url(#gorg-coreglow)">
          <animate attributeName="r" values="17;19;17" dur="2.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="60" cy="90" r="8.5" fill="url(#gorg-corevoid)"/>
        <circle cx="60" cy="90" r="8.5" stroke="#cc0033" strokeWidth="0.6" opacity="0.8"/>
        {/* Accretion rings — counter-rotating */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 60 90" to="360 60 90" dur="9s" repeatCount="indefinite"/>
          <ellipse cx="60" cy="90" rx="14.5" ry="4.6" stroke="#ff3d8b" strokeWidth="1" strokeDasharray="11 5 3 5" opacity="0.85"/>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="360 60 90" to="0 60 90" dur="6s" repeatCount="indefinite"/>
          <ellipse cx="60" cy="90" rx="11" ry="3.2" stroke="#cc0033" strokeWidth="0.7" strokeDasharray="6 4" opacity="0.7"/>
        </g>
        {/* Matter falling in */}
        <path d="M74 82 Q66 84 63 88 M46 84 Q54 85 57 88 M60 76 Q59 82 60 84" stroke="#ff3d8b" strokeWidth="0.6" opacity="0.5" strokeDasharray="3 2" className="gorg-vein gorg-d5"/>
        {/* Abyss-blood vein network — staggered pulse phases, flowing dashes */}
        <path d="M58 82 Q54 74 49 70 Q42 66 41 57" stroke="#ff3d8b" strokeWidth="1.2" strokeDasharray="6 4" className="gorg-vein"/>
        <path d="M63 82 Q68 75 73 71 Q79 67 80 58" stroke="#ff3d8b" strokeWidth="1.2" strokeDasharray="6 4" className="gorg-vein gorg-d2"/>
        <path d="M52 90 Q40 88 31 81 Q21 73 17 60" stroke="#ff3d8b" strokeWidth="1" strokeDasharray="7 5" className="gorg-vein gorg-d3"/>
        <path d="M68 90 Q81 87 89 79 Q97 71 102 60" stroke="#ff3d8b" strokeWidth="1" strokeDasharray="7 5" className="gorg-vein gorg-d4"/>
        <path d="M55 99 Q46 106 42 118 M50 100 Q38 104 32 114" stroke="#cc0033" strokeWidth="0.9" strokeDasharray="5 4" className="gorg-vein gorg-d5"/>
        <path d="M65 99 Q74 106 78 118 M70 100 Q82 104 88 114" stroke="#cc0033" strokeWidth="0.9" strokeDasharray="5 4" className="gorg-vein gorg-d2"/>
        <path d="M31 81 Q26 92 18 98 M89 79 Q95 92 104 98" stroke="#ff3d8b" strokeWidth="0.7" strokeDasharray="4 4" className="gorg-vein gorg-d3"/>
        <path d="M12 52 Q26 60 42 58 M108 50 Q94 58 79 57" stroke="#cc0033" strokeWidth="0.8" strokeDasharray="5 3" className="gorg-vein gorg-d4"/>
        <path d="M50 45 Q52 39 50 33 M70 45 Q69 38 72 31" stroke="#ff3d8b" strokeWidth="0.6" strokeDasharray="3 3" className="gorg-vein gorg-d5"/>
        {/* Vein junction nodes */}
        <circle cx="49" cy="70" r="1.5" fill="#ff3d8b" className="gorg-node"/>
        <circle cx="73" cy="71" r="1.5" fill="#ff3d8b" className="gorg-node gorg-n2"/>
        <circle cx="31" cy="81" r="1.3" fill="#ff3d8b" className="gorg-node gorg-n3"/>
        <circle cx="89" cy="79" r="1.3" fill="#ff3d8b" className="gorg-node gorg-n4"/>
        <circle cx="42" cy="58" r="1.1" fill="#cc0033" className="gorg-node gorg-n2"/>
        <circle cx="79" cy="57" r="1.1" fill="#cc0033" className="gorg-node gorg-n3"/>
      </g>
      {/* Rage arcs — crackling off the shoulders and horns */}
      <polyline points="8,42 15,31 10,27 19,15" stroke="#ff3d8b" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" className="gorg-arc1"/>
      <polyline points="110,44 103,32 109,27 100,14" stroke="#ff3d8b" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" className="gorg-arc2"/>
      <polyline points="24,32 30,24 26,19 32,10" stroke="#cc0033" strokeWidth="0.9" opacity="0.6" strokeLinecap="round" className="gorg-arc3"/>
      <polyline points="94,30 90,22 95,18 91,9" stroke="#cc0033" strokeWidth="0.9" opacity="0.6" strokeLinecap="round" className="gorg-arc1"/>
      {/* Blood drips — falling and respawning on loop */}
      <circle cx="68.5" cy="68" r="1.2" fill="#cc0033">
        <animate attributeName="cy" values="68;70;121" keyTimes="0;0.3;1" dur="1.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.95;0.95;0.15" keyTimes="0;0.75;1" dur="1.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="12" cy="100" r="1.3" fill="#ff3d8b">
        <animate attributeName="cy" values="100;102;121" keyTimes="0;0.25;1" dur="1.5s" begin="-0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.9;0.1" keyTimes="0;0.7;1" dur="1.5s" begin="-0.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="109" cy="101" r="1.3" fill="#ff3d8b">
        <animate attributeName="cy" values="101;103;121" keyTimes="0;0.25;1" dur="1.7s" begin="-1.1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.9;0.1" keyTimes="0;0.7;1" dur="1.7s" begin="-1.1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="26" cy="90" r="1" fill="#cc0033">
        <animate attributeName="cy" values="90;92;121" keyTimes="0;0.3;1" dur="2.3s" begin="-0.3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.85;0.85;0.1" keyTimes="0;0.72;1" dur="2.3s" begin="-0.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="99" r="0.9" fill="#ff3d8b">
        <animate attributeName="cy" values="99;101;121" keyTimes="0;0.3;1" dur="2.6s" begin="-1.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.8;0.1" keyTimes="0;0.72;1" dur="2.6s" begin="-1.7s" repeatCount="indefinite"/>
      </circle>
      {/* Blood pooling at the arena floor */}
      <ellipse cx="12" cy="119.5" rx="4" ry="1" fill="#cc0033" opacity="0.5"/>
      <ellipse cx="109" cy="119.5" rx="4" ry="1" fill="#cc0033" opacity="0.5"/>
      <ellipse cx="68" cy="119.5" rx="3" ry="0.8" fill="#cc0033" opacity="0.4"/>
      {/* NULL classification stamp */}
      <text x="60" y="117" textAnchor="middle" fill="rgba(255,61,139,0.4)" fontSize="5.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">CLASS: NULL</text>
    </svg>
  )
}

export const ENEMY_SVGS = {
  1: WraithSVG,
  2: FacelessSVG,
  3: LabelEaterSVG,
  4: ColorlessSVG,
  5: UnalignedSVG,
  examDrone: ExamDroneSVG,
  gorgoroth: GorgorothSVG,
}

export { WraithSVG, FacelessSVG, LabelEaterSVG, ColorlessSVG, UnalignedSVG, ExamDroneSVG, GorgorothSVG }
