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

export const ENEMY_SVGS = {
  1: WraithSVG,
  2: FacelessSVG,
  3: LabelEaterSVG,
  4: ColorlessSVG,
  5: UnalignedSVG,
}

export { WraithSVG, FacelessSVG, LabelEaterSVG, ColorlessSVG, UnalignedSVG }
