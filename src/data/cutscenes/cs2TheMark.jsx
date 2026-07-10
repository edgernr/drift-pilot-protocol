import './cs2TheMark.css'

/*
 * CS-2 — "THE MARK" (after the forced loss · 5 cards · slow, heavy)
 * Script source: docs/void-shards-mmo-world-levels-1-3.md §7, CS-2 table.
 * Procedural art only: inline SVG + CSS (cs2TheMark.css, .cs2- prefix).
 * Consumed by <CutscenePlayer scene={cs2TheMark} />.
 */

/* ============================================================
 * Card 1 — Null-black. A single crack of magenta light.
 * ============================================================ */
const CRACK_D =
  'M594 -12 L612 96 L586 178 L618 262 L596 344 L622 430 L590 516 L616 606 L598 700 L612 812'

function CrackArt() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cs2CrackHaze" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3d8b" stopOpacity="0.13" />
          <stop offset="55%" stopColor="#ff3d8b" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0" />
        </radialGradient>
        <filter id="cs2CrackBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <rect width="1200" height="800" fill="#08080c" />
      <ellipse className="cs2-haze" cx="600" cy="400" rx="270" ry="430" fill="url(#cs2CrackHaze)" />

      {/* the fissure: blurred glow → magenta body → white-hot core */}
      <path className="cs2-crack cs2-crack-glow" d={CRACK_D} pathLength="1" filter="url(#cs2CrackBlur)" />
      <path className="cs2-crack cs2-crack-mid" d={CRACK_D} pathLength="1" />
      <path className="cs2-crack cs2-crack-core" d={CRACK_D} pathLength="1" />

      {/* offshoot fractures */}
      <path className="cs2-crack cs2-crack-branch" d="M598 300 L556 336 L540 384" pathLength="1" />
      <path className="cs2-crack cs2-crack-branch cs2-crack-branch2" d="M606 520 L648 556 L664 612" pathLength="1" />
    </svg>
  )
}

/* ============================================================
 * Card 2 — His fist frozen mid-strike; forearm veins pulse — then STALL.
 * (.cs2-vein pulses exactly 3 times, then holds dim: the blood stops.)
 * ============================================================ */
function FistArt() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cs2FistAmbient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26091b" />
          <stop offset="45%" stopColor="#0c070e" />
          <stop offset="100%" stopColor="#08080c" />
        </linearGradient>
        <filter id="cs2VeinGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="800" fill="url(#cs2FistAmbient)" />

      {/* shattered exam floor */}
      <rect y="700" width="1200" height="100" fill="#050409" />
      <path d="M0 700 H1200" stroke="#1c0b16" strokeWidth="2" />
      <path d="M540 700 l26 -18 l30 18 Z" fill="#0d0912" stroke="#21101c" strokeWidth="1" />
      <path d="M980 700 l20 -14 l26 14 Z" fill="#0d0912" stroke="#21101c" strokeWidth="1" />
      <path d="M120 700 l16 -10 l22 10 Z" fill="#0d0912" stroke="#21101c" strokeWidth="1" />

      {/* the fallen player, prone */}
      <g>
        <path
          d="M262 688 Q300 660 352 672 L436 662 Q470 668 472 686 L458 698 L286 700 Z"
          fill="#0a0d12"
          stroke="rgba(61,240,232,0.3)"
          strokeWidth="1.5"
        />
        <circle cx="252" cy="682" r="13" fill="#0a0d12" stroke="rgba(61,240,232,0.3)" strokeWidth="1.5" />
        {/* the faintest ember at the wrist — foreshadowing card 3 */}
        <circle className="cs2-wrist-ember" cx="448" cy="678" r="3.5" fill="#3df0e8" />
      </g>

      {/* the fist, frozen mid-strike */}
      <g className="cs2-fist-group">
        {/* forearm descending from off-frame */}
        <path d="M760 -60 L1080 -60 L980 260 L800 300 Z" fill="#0e0810" stroke="#310e22" strokeWidth="2" />
        <path d="M1080 -60 L980 260" fill="none" stroke="#ff3d8b" strokeWidth="2" opacity="0.3" />

        {/* fist mass */}
        <path
          d="M690 330 L950 285 L1010 370 L985 480 L890 545 L745 525 L665 430 Z"
          fill="#100a13"
          stroke="#310e22"
          strokeWidth="2"
        />
        {/* knuckle separations */}
        <path d="M770 528 L780 470" stroke="#22091a" strokeWidth="3" fill="none" />
        <path d="M840 542 L848 480" stroke="#22091a" strokeWidth="3" fill="none" />
        <path d="M905 522 L905 462" stroke="#22091a" strokeWidth="3" fill="none" />
        {/* rim light on the striking edge */}
        <path d="M690 330 L665 430 L745 525" fill="none" stroke="#ff3d8b" strokeWidth="2.5" opacity="0.55" />

        {/* the black-blood veins — pulse ×3, then stall */}
        <g filter="url(#cs2VeinGlow)">
          <path className="cs2-vein" d="M905 -40 C 890 70, 935 140, 880 235 S 850 330, 835 395" />
          <path className="cs2-vein" d="M985 -50 C 955 60, 900 120, 915 215 C 922 258, 890 290, 872 330" />
          <path className="cs2-vein" d="M845 250 C 812 300, 838 350, 795 400 C 775 424, 790 460, 772 492" />
          <path className="cs2-vein" d="M930 330 C 950 375, 930 420, 945 460" />
        </g>
      </g>
    </svg>
  )
}

/* ============================================================
 * Card 3 — The Void-mark igniting on the wrist; his eyes narrowing above.
 * ============================================================ */
function MarkArt() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cs2Bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3df0e8" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#3df0e8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#3df0e8" stopOpacity="0" />
        </radialGradient>
        <filter id="cs2MarkGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="cs2EyeBlur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <rect width="1200" height="800" fill="#08080c" />

      {/* his eyes, narrowing, in the dark above */}
      <g className="cs2-eyes">
        <path d="M300 120 Q580 60 900 110" fill="none" stroke="#160812" strokeWidth="34" opacity="0.85" />
        <path
          className="cs2-eye"
          d="M330 168 Q430 128 530 158 Q430 196 330 168 Z"
          fill="#ff3d8b"
          filter="url(#cs2EyeBlur)"
          opacity="0.5"
        />
        <path
          className="cs2-eye"
          d="M660 148 Q760 112 856 146 Q758 180 660 148 Z"
          fill="#ff3d8b"
          filter="url(#cs2EyeBlur)"
          opacity="0.5"
        />
        <path className="cs2-eye" d="M330 168 Q430 128 530 158 Q430 196 330 168 Z" fill="#ff3d8b" />
        <path className="cs2-eye" d="M660 148 Q760 112 856 146 Q758 180 660 148 Z" fill="#ff3d8b" />
        <ellipse className="cs2-eye" cx="438" cy="161" rx="9" ry="17" fill="#14030b" />
        <ellipse className="cs2-eye" cx="764" cy="145" rx="9" ry="17" fill="#14030b" />
      </g>

      {/* the player's forearm, raised from the rubble */}
      <path
        d="M-60 830 L180 640 Q260 570 370 545 L520 520 Q600 508 660 528 L740 570 Q760 592 742 622 L700 668 Q600 640 500 655 L330 700 L140 810 Z"
        fill="#0b0d12"
        stroke="rgba(61,240,232,0.22)"
        strokeWidth="1.5"
      />
      {/* the closed hand beyond the wrist */}
      <path d="M742 560 L850 545 L880 585 L860 640 L760 640 Z" fill="#0b0d12" stroke="rgba(61,240,232,0.22)" strokeWidth="1.5" />

      {/* the Void-mark: circuitry drawing itself in, then blooming */}
      <circle className="cs2-bloom" cx="600" cy="565" r="170" fill="url(#cs2Bloom)" />
      <g filter="url(#cs2MarkGlow)">
        <circle className="cs2-trace cs2-trace-5" cx="600" cy="565" r="24" pathLength="1" />
        <path className="cs2-trace cs2-trace-1" d="M600 565 h70 v-34 h40" pathLength="1" />
        <path className="cs2-trace cs2-trace-2" d="M600 565 h-62 v28 h-46" pathLength="1" />
        <path className="cs2-trace cs2-trace-3" d="M600 565 v-44 h36 v-22" pathLength="1" />
        <path className="cs2-trace cs2-trace-4" d="M600 565 v38 h52 v24" pathLength="1" />
        <circle className="cs2-node cs2-node-1" cx="710" cy="531" r="4.5" />
        <circle className="cs2-node cs2-node-2" cx="492" cy="593" r="4.5" />
        <circle className="cs2-node cs2-node-3" cx="636" cy="499" r="4.5" />
        <circle className="cs2-node cs2-node-4" cx="652" cy="627" r="4.5" />
        <circle className="cs2-node cs2-node-5" cx="600" cy="565" r="5.5" />
      </g>
    </svg>
  )
}

/* ============================================================
 * Card 4 — Extreme close-up of his face, half in darkness.
 * ============================================================ */
function FaceArt() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cs2FaceShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a0a14" />
          <stop offset="70%" stopColor="#0e070d" />
          <stop offset="100%" stopColor="#08080c" />
        </linearGradient>
        <linearGradient id="cs2DarkSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#08080c" stopOpacity="0" />
          <stop offset="45%" stopColor="#08080c" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#08080c" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="cs2EyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3d8b" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ff3d8b" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ff3d8b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="800" fill="#08080c" />

      <g className="cs2-face">
        {/* the face mass — a wall of him */}
        <path
          d="M-80 -60 L560 -60 Q620 40 585 170 Q640 240 590 330 Q660 420 585 505 Q625 600 545 700 Q520 780 460 860 L-80 860 Z"
          fill="url(#cs2FaceShade)"
        />

        {/* brow ridge */}
        <path d="M150 268 Q320 222 500 262" fill="none" stroke="#1d0b16" strokeWidth="26" opacity="0.9" />
        <path d="M160 286 Q320 244 492 278" fill="none" stroke="#ff3d8b" strokeWidth="2" opacity="0.35" />

        {/* the eye */}
        <ellipse className="cs2-eyeglow" cx="330" cy="338" rx="110" ry="60" fill="url(#cs2EyeGlow)" />
        <path d="M228 338 Q330 300 444 334 Q330 376 228 338 Z" fill="#ff3d8b" />
        <ellipse cx="340" cy="337" rx="11" ry="24" fill="#12030c" transform="rotate(8 340 337)" />
        <path d="M240 352 Q330 382 436 348" fill="none" stroke="#ff3d8b" strokeWidth="1.5" opacity="0.4" />

        {/* nose ridge · cheek · jaw · a grim mouth */}
        <path d="M505 260 Q545 380 500 470" fill="none" stroke="#200c18" strokeWidth="10" opacity="0.9" />
        <path d="M513 300 Q542 380 508 452" fill="none" stroke="#ff3d8b" strokeWidth="1.5" opacity="0.22" />
        <path d="M180 520 Q330 560 470 520" fill="none" stroke="#1a0a14" strokeWidth="16" opacity="0.8" />
        <path d="M250 610 Q360 632 470 606" fill="none" stroke="#240d1a" strokeWidth="6" opacity="0.9" />

        {/* black-blood veins, crawling from the eye */}
        <path className="cs2-face-vein" d="M420 320 C 480 300, 520 250, 560 240" strokeWidth="2.2" />
        <path className="cs2-face-vein" d="M430 356 C 500 380, 540 430, 590 450" strokeWidth="2.2" />
        <path className="cs2-face-vein" d="M250 310 C 200 280, 170 240, 120 220" strokeWidth="2" />
        <path className="cs2-face-vein" d="M260 366 C 210 400, 190 450, 150 500" strokeWidth="2" />

        {/* half in darkness */}
        <rect x="540" y="-60" width="720" height="920" fill="url(#cs2DarkSide)" />
      </g>
    </svg>
  )
}

/* ============================================================
 * Card 5 — His hand opening; the glass wall shattering outward.
 * ============================================================ */
const SHARDS = [
  { pts: '790,370 852,318 872,384', dx: 250, dy: -110, rot: 45, delay: 0 },
  { pts: '795,372 866,398 828,452', dx: 280, dy: 80, rot: -38, delay: 0.05 },
  { pts: '782,378 800,452 740,440', dx: -60, dy: 260, rot: 30, delay: 0.1 },
  { pts: '778,366 748,300 812,292', dx: 40, dy: -280, rot: -50, delay: 0.08 },
  { pts: '772,372 704,340 720,414', dx: -260, dy: -40, rot: 55, delay: 0.12 },
  { pts: '770,380 706,428 762,456', dx: -240, dy: 160, rot: -42, delay: 0.18 },
  { pts: '806,350 872,300 900,352', dx: 300, dy: -160, rot: 60, delay: 0.15 },
  { pts: '820,392 900,420 860,470', dx: 320, dy: 140, rot: -28, delay: 0.2 },
  { pts: '750,340 690,282 760,272', dx: -200, dy: -230, rot: 35, delay: 0.22 },
  { pts: '760,300 800,240 830,296', dx: 90, dy: -320, rot: -60, delay: 0.26 },
  { pts: '830,430 880,490 806,500', dx: 220, dy: 260, rot: 48, delay: 0.3 },
  { pts: '736,404 668,470 730,492', dx: -280, dy: 240, rot: -52, delay: 0.28 },
  { pts: '860,360 930,340 926,398', dx: 360, dy: -30, rot: 25, delay: 0.33 },
  { pts: '716,362 650,352 668,398', dx: -330, dy: 20, rot: -30, delay: 0.35 },
  { pts: '788,300 810,236 762,244', dx: -30, dy: -340, rot: 40, delay: 0.4 },
  { pts: '798,440 818,510 762,506', dx: 20, dy: 320, rot: -45, delay: 0.42 },
  { pts: '846,320 902,268 918,318', dx: 330, dy: -220, rot: 66, delay: 0.45 },
  { pts: '724,320 664,286 700,336', dx: -300, dy: -170, rot: -58, delay: 0.48 },
]

function ShatterArt() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cs2GoldLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c453" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#f5c453" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#f5c453" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="800" fill="#08080c" />
      <rect y="760" width="1200" height="40" fill="#060509" />

      {/* golden-hour sky, bleeding through the breach */}
      <circle className="cs2-breach-light" cx="790" cy="370" r="340" fill="url(#cs2GoldLight)" />

      {/* what's left of the glass wall */}
      <g stroke="rgba(61,240,232,0.16)" strokeWidth="2" fill="none">
        <path d="M500 60 V740" />
        <path d="M1080 60 V740" />
        <path d="M440 190 H1140" />
        <path d="M440 560 H1140" />
      </g>
      {/* fracture lines radiating through the remaining panes */}
      <g stroke="rgba(234,246,245,0.22)" strokeWidth="1" fill="none">
        <path d="M790 370 L560 180" />
        <path d="M790 370 L1060 210" />
        <path d="M790 370 L1090 520" />
        <path d="M790 370 L555 585" />
        <path d="M790 370 L790 120" />
        <path d="M790 370 L820 660" />
      </g>

      {/* the shatter — staggered shard fly-out */}
      <g>
        {SHARDS.map((s, i) => (
          <polygon
            key={i}
            className="cs2-shard"
            points={s.pts}
            style={{
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
              '--rot': `${s.rot}deg`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </g>

      {/* the player, thrown through the breach */}
      <g className="cs2-flung">
        <path d="M700 372 L740 356 L756 380 L724 400 Z" fill="#0a0d12" stroke="rgba(61,240,232,0.4)" strokeWidth="1.5" />
        <path d="M704 370 L680 350 M748 396 L764 420 M738 360 L752 338" stroke="rgba(61,240,232,0.35)" strokeWidth="2.5" fill="none" />
        <circle className="cs2-wrist-ember" cx="686" cy="352" r="3" fill="#3df0e8" />
      </g>

      {/* his hand, opening — not to spare. to throw. */}
      <g className="cs2-hand">
        <path d="M60 830 L120 640 L230 585 L360 600 L420 680 L380 810 Z" fill="#0d0812" stroke="#310e22" strokeWidth="2" />
        <path d="M150 630 L120 480 L158 470 L196 615 Z" fill="#0d0812" stroke="#310e22" strokeWidth="2" />
        <path d="M215 600 L215 440 L255 438 L262 596 Z" fill="#0d0812" stroke="#310e22" strokeWidth="2" />
        <path d="M285 598 L310 442 L350 452 L330 606 Z" fill="#0d0812" stroke="#310e22" strokeWidth="2" />
        <path d="M350 615 L405 490 L440 508 L392 640 Z" fill="#0d0812" stroke="#310e22" strokeWidth="2" />
        <path d="M400 690 L500 630 L520 664 L425 730 Z" fill="#0d0812" stroke="#310e22" strokeWidth="2" />
        <path className="cs2-hand-rim" d="M120 640 L230 585 L360 600 L420 680" fill="none" stroke="#ff3d8b" strokeWidth="2.5" opacity="0.45" />
      </g>
    </svg>
  )
}

/* ============================================================
 * The scene
 * ============================================================ */
const cs2TheMark = {
  id: 'cs2',
  title: 'THE MARK',
  cards: [
    {
      id: 'c1',
      art: <CrackArt />,
      holdMs: 800,
      lines: [
        'You are not dead.',
        'That is not mercy.',
        'He is simply not finished looking at you.',
      ],
    },
    {
      id: 'c2',
      art: <FistArt />,
      lines: [
        <>Mid-slaughter, mid-frenzy — his blood <strong>stops</strong>.</>,
        'For the first time in centuries, something makes it hesitate.',
      ],
    },
    {
      id: 'c3',
      art: <MarkArt />,
      lines: [
        <>Something in you answers something in him. <em>A Void-mark.</em></>,
        'Prey that can make his blood pause… is worth returning to kill properly.',
      ],
    },
    {
      id: 'c4',
      art: <FaceArt />,
      speaker: 'GORGOROTH BLACKBLOOD',
      tone: 'gorgoroth',
      holdMs: 800,
      lines: [<strong>“Grow, little glitch.”</strong>],
    },
    {
      id: 'c5',
      art: <ShatterArt />,
      speaker: 'GORGOROTH BLACKBLOOD',
      tone: 'gorgoroth',
      lines: [<strong>“Then come find me at the top.”</strong>],
    },
  ],
}

export default cs2TheMark
