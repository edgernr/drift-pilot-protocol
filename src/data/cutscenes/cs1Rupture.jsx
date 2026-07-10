import './cs1Rupture.css'

/*
 * CS-1 — "RUPTURE" (mid-Level-1 · 4 cards, fast cuts)
 * Doc: void-shards-mmo-world-levels-1-3.md §7. Copy is verbatim.
 * Procedural art only: inline SVG + CSS (cs1Rupture.css, .cs1- prefix).
 */

/* ---------------------------------------------------------------
 * Card 1 — the exam floor: gold panel-lines, drones idling.
 * Everything tilts one degree (CSS transform on the whole scene).
 * --------------------------------------------------------------- */
function ArtExamFloorTilts() {
  return (
    <div className="cs1-fill">
      <div className="cs1-tilt">
        <div className="cs1-shudder">
          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <linearGradient id="cs1-glass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#08080c" />
                <stop offset="0.55" stopColor="#241a0c" />
                <stop offset="1" stopColor="#f5c453" stopOpacity="0.32" />
              </linearGradient>
              <radialGradient id="cs1-sun" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#f5c453" stopOpacity="0.55" />
                <stop offset="1" stopColor="#f5c453" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="cs1-chrome" cx="0.35" cy="0.3" r="0.95">
                <stop offset="0" stopColor="#eaf6f5" />
                <stop offset="0.45" stopColor="#8f939c" />
                <stop offset="1" stopColor="#15151d" />
              </radialGradient>
            </defs>

            <rect width="1600" height="900" fill="#08080c" />

            {/* back wall — floor-to-ceiling glass, golden hour */}
            <rect x="500" y="280" width="600" height="280" fill="url(#cs1-glass)" opacity="0.9" />
            <circle className="cs1-glasslight" cx="930" cy="545" r="110" fill="url(#cs1-sun)" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <line key={`m${i}`} x1={560 + i * 60} y1="282" x2={560 + i * 60} y2="558"
                stroke="#f5c453" strokeOpacity="0.26" strokeWidth="2" />
            ))}
            <rect x="500" y="280" width="600" height="280" fill="none" stroke="#f5c453" strokeOpacity="0.55" strokeWidth="3" />

            {/* wall corner edges */}
            <line x1="500" y1="280" x2="0" y2="30" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="2" />
            <line x1="1100" y1="280" x2="1600" y2="30" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="2" />
            <line x1="500" y1="560" x2="0" y2="777" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="2" />
            <line x1="1100" y1="560" x2="1600" y2="777" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="2" />

            {/* ceiling panel rays + light strips (gold panel-lines) */}
            <line x1="500" y1="280" x2="-60" y2="0" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="650" y1="280" x2="370" y2="0" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="800" y1="280" x2="800" y2="0" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="950" y1="280" x2="1230" y2="0" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="1100" y1="280" x2="1660" y2="0" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="340" y1="200" x2="1260" y2="200" stroke="#f5c453" strokeOpacity="0.5" strokeWidth="4" />
            <line x1="160" y1="110" x2="1440" y2="110" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="4" />
            <line x1="20" y1="40" x2="1580" y2="40" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="4" />

            {/* side wall panel lines + seams */}
            <line x1="500" y1="330" x2="0" y2="163" stroke="#f5c453" strokeOpacity="0.22" strokeWidth="1.5" />
            <line x1="500" y1="480" x2="0" y2="563" stroke="#f5c453" strokeOpacity="0.22" strokeWidth="1.5" />
            <line x1="1100" y1="330" x2="1600" y2="163" stroke="#f5c453" strokeOpacity="0.22" strokeWidth="1.5" />
            <line x1="1100" y1="480" x2="1600" y2="563" stroke="#f5c453" strokeOpacity="0.22" strokeWidth="1.5" />
            <line x1="250" y1="155" x2="250" y2="668" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="380" y1="220" x2="380" y2="612" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="1350" y1="155" x2="1350" y2="668" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />
            <line x1="1220" y1="220" x2="1220" y2="612" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="1.5" />

            {/* floor panel rays + transverse lines */}
            <line x1="500" y1="560" x2="-284" y2="900" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="2" />
            <line x1="650" y1="560" x2="258" y2="900" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="2" />
            <line x1="800" y1="560" x2="800" y2="900" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="2" />
            <line x1="950" y1="560" x2="1342" y2="900" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="2" />
            <line x1="1100" y1="560" x2="1884" y2="900" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="2" />
            <line x1="362" y1="620" x2="1238" y2="620" stroke="#f5c453" strokeOpacity="0.28" strokeWidth="2" />
            <line x1="177" y1="700" x2="1423" y2="700" stroke="#f5c453" strokeOpacity="0.24" strokeWidth="2" />
            <line x1="-54" y1="800" x2="1654" y2="800" stroke="#f5c453" strokeOpacity="0.2" strokeWidth="2" />

            {/* exam terminal desks (gold outline) */}
            <path d="M 380 660 L 520 660 L 545 705 L 355 705 Z" fill="#0b0b12" stroke="#f5c453" strokeOpacity="0.45" strokeWidth="2" />
            <path d="M 1060 640 L 1180 640 L 1200 680 L 1040 680 Z" fill="#0b0b12" stroke="#f5c453" strokeOpacity="0.45" strokeWidth="2" />

            {/* Association crest hologram */}
            <g className="cs1-glasslight" stroke="#f5c453" fill="none" strokeWidth="2.5" opacity="0.8">
              <path d="M 800 306 L 826 321 L 826 351 L 800 366 L 774 351 L 774 321 Z" />
              <circle cx="800" cy="336" r="12" />
              <path d="M 800 326 L 807 336 L 800 346 L 793 336 Z" fill="#f5c453" fillOpacity="0.5" />
            </g>

            {/* idle exam drones — chrome spheres, crest ring, status light */}
            <g className="cs1-drone">
              <ellipse cx="400" cy="622" rx="46" ry="9" fill="#000" opacity="0.5" />
              <circle cx="400" cy="520" r="40" fill="url(#cs1-chrome)" />
              <ellipse cx="400" cy="522" rx="40" ry="10" fill="none" stroke="#f5c453" strokeOpacity="0.75" strokeWidth="2.5" />
              <circle className="cs1-dot" cx="400" cy="508" r="4" fill="#3df0e8" />
            </g>
            <g className="cs1-drone cs1-d2">
              <ellipse cx="1120" cy="560" rx="34" ry="7" fill="#000" opacity="0.5" />
              <circle cx="1120" cy="470" r="30" fill="url(#cs1-chrome)" />
              <ellipse cx="1120" cy="472" rx="30" ry="8" fill="none" stroke="#f5c453" strokeOpacity="0.75" strokeWidth="2" />
              <circle className="cs1-dot" cx="1120" cy="461" r="3" fill="#3df0e8" />
            </g>
            <g className="cs1-drone cs1-d3">
              <circle cx="865" cy="432" r="18" fill="url(#cs1-chrome)" />
              <ellipse cx="865" cy="433" rx="18" ry="5" fill="none" stroke="#f5c453" strokeOpacity="0.7" strokeWidth="1.5" />
              <circle className="cs1-dot" cx="865" cy="426" r="2.5" fill="#3df0e8" />
            </g>

            {/* faint vignette to seat the copy */}
            <rect width="1600" height="900" fill="#08080c" opacity="0.18" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------
 * Card 2 — every HUD element flashing crimson; klaxon bars sweeping;
 * GATE FORMATION INTERIOR + the classifier printing NULL, big, mono.
 * --------------------------------------------------------------- */
function KlaxonStripes() {
  return (
    <g transform="skewX(-24)">
      {Array.from({ length: 34 }, (_, i) => (
        <rect key={i} x={-140 + i * 66} y="0" width="33" height="70" fill="#ff3d8b" />
      ))}
    </g>
  )
}

function ArtAlertHud() {
  return (
    <div className="cs1-fill">
      <svg className="cs1-layer" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1600" height="900" fill="#08080c" />
        <rect className="cs1-strobe2" width="1600" height="900" fill="#ff3d8b" opacity="0.06" />

        {/* klaxon bars — sweeping stripes, top and bottom */}
        <g transform="translate(0,26)" opacity="0.85">
          <g className="cs1-sweep"><KlaxonStripes /></g>
        </g>
        <g transform="translate(0,804)" opacity="0.85">
          <g className="cs1-sweep-r"><KlaxonStripes /></g>
        </g>
        <line x1="0" y1="112" x2="1600" y2="112" stroke="#ff3d8b" strokeOpacity="0.5" strokeWidth="2" />
        <line x1="0" y1="788" x2="1600" y2="788" stroke="#ff3d8b" strokeOpacity="0.5" strokeWidth="2" />

        {/* HUD corner brackets, flashing out of phase */}
        <g className="cs1-strobe" stroke="#ff3d8b" strokeWidth="4" fill="none">
          <path d="M 60 160 v -14 h 90" />
          <path d="M 1540 160 v -14 h -90" />
          <path d="M 60 740 v 14 h 90" />
          <path d="M 1540 740 v 14 h -90" />
        </g>

        {/* side readouts */}
        <g className="cs1-mono cs1-strobe2" fill="#ff3d8b" fontSize="17" letterSpacing="3">
          <text x="60" y="220">SYS//LOCKDOWN</text>
          <text x="60" y="250">EVAC ROUTE: NONE</text>
          <text x="60" y="280">FLOOR 152</text>
          <text x="1540" y="220" textAnchor="end">WARD GRID: FAIL</text>
          <text x="1540" y="250" textAnchor="end">PROCTOR NET: FAIL</text>
          <text x="1540" y="280" textAnchor="end">0xF41A // BREACH</text>
        </g>

        {/* the alert itself — big mono, part of the art */}
        <text className="cs1-mono cs1-strobe" x="800" y="255" textAnchor="middle"
          fill="#ff3d8b" fontSize="30" letterSpacing="16">▲ ASSOCIATION ALERT ▲</text>
        <text className="cs1-mono cs1-strobe" x="800" y="360" textAnchor="middle"
          fill="#ff3d8b" fontSize="76" fontWeight="700" letterSpacing="6">GATE FORMATION — INTERIOR</text>
        <text className="cs1-mono" x="800" y="445" textAnchor="middle"
          fill="#eaf6f5" opacity="0.55" fontSize="34" letterSpacing="10">CLASS:</text>

        {/* the classifier gives up */}
        <text className="cs1-mono cs1-null-ghost" x="794" y="672" textAnchor="middle"
          fill="#3df0e8" fontSize="230" fontWeight="700" letterSpacing="20">NULL</text>
        <text className="cs1-mono cs1-null" x="800" y="672" textAnchor="middle"
          fill="#ff3d8b" fontSize="230" fontWeight="700" letterSpacing="20">NULL</text>
        <rect className="cs1-cursor" x="1120" y="580" width="34" height="88" fill="#ff3d8b" />
      </svg>

      <div className="cs1-vign" />
      <div className="cs1-scan" />
    </div>
  )
}

/* ---------------------------------------------------------------
 * Card 3 — the far wall peels into a magenta tear; proctor
 * silhouettes turn toward it.
 * --------------------------------------------------------------- */
function ProctorSilhouette() {
  return (
    <g>
      <circle cx="0" cy="-96" r="16" fill="#04040a" />
      <path d="M -36 0 Q -34 -62 -16 -76 Q -8 -70 0 -70 Q 8 -70 16 -76 Q 34 -62 36 0 Z" fill="#04040a" />
      {/* rim light on the tear side */}
      <path d="M 16 -76 Q 32 -60 34 -4" fill="none" stroke="#ff3d8b" strokeOpacity="0.4" strokeWidth="2.5" />
      <path d="M 6 -110 A 16 16 0 0 1 15 -87" fill="none" stroke="#ff3d8b" strokeOpacity="0.4" strokeWidth="2.5" />
    </g>
  )
}

const CS1_TEAR_PATH =
  'M 975 195 L 1008 258 L 982 330 L 1030 408 L 990 478 L 1018 556 L 972 612 ' +
  'L 938 558 L 962 470 L 922 402 L 952 330 L 928 256 Z'

function ArtWallTear() {
  return (
    <div className="cs1-fill">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="cs1-tear3" cx="0.5" cy="0.5" r="0.65">
            <stop offset="0" stopColor="#ff3d8b" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="#ff3d8b" stopOpacity="0.45" />
            <stop offset="1" stopColor="#08080c" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="cs1-tearglow3" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff3d8b" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ff3d8b" stopOpacity="0" />
          </radialGradient>
          <filter id="cs1-blur3" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <rect width="1600" height="900" fill="#08080c" />

        {/* dim gold interior — the same floor, light dying */}
        <rect x="350" y="180" width="900" height="440" fill="none" stroke="#f5c453" strokeOpacity="0.3" strokeWidth="2.5" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`w${i}`} x1={430 + i * 150} y1="182" x2={430 + i * 150} y2="618"
            stroke="#f5c453" strokeOpacity="0.14" strokeWidth="1.5" />
        ))}
        <line x1="350" y1="620" x2="-160" y2="900" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="2" />
        <line x1="1250" y1="620" x2="1760" y2="900" stroke="#f5c453" strokeOpacity="0.18" strokeWidth="2" />
        <line x1="120" y1="760" x2="1480" y2="760" stroke="#f5c453" strokeOpacity="0.14" strokeWidth="2" />
        <line x1="350" y1="180" x2="80" y2="20" stroke="#f5c453" strokeOpacity="0.16" strokeWidth="1.5" />
        <line x1="1250" y1="180" x2="1520" y2="20" stroke="#f5c453" strokeOpacity="0.16" strokeWidth="1.5" />

        {/* the tear — glow, aperture, inner static */}
        <ellipse cx="975" cy="405" rx="240" ry="290" fill="url(#cs1-tearglow3)" className="cs1-tear-pulse" />
        <g className="cs1-tear-open">
          <path d={CS1_TEAR_PATH} fill="#ff3d8b" opacity="0.7" filter="url(#cs1-blur3)" />
          <g className="cs1-tear-pulse">
            <path d={CS1_TEAR_PATH} fill="url(#cs1-tear3)" stroke="#ff3d8b" strokeWidth="3" />
            <g strokeWidth="2.5" fill="none">
              <path className="cs1-static" d="M 950 280 L 990 320 L 958 380" stroke="#eaf6f5" strokeOpacity="0.7" />
              <path className="cs1-static cs1-s2" d="M 995 420 L 955 470 L 992 520" stroke="#ff3d8b" strokeOpacity="0.9" />
              <path className="cs1-static cs1-s3" d="M 965 540 L 998 570" stroke="#eaf6f5" strokeOpacity="0.5" />
            </g>
          </g>
        </g>

        {/* the wall peeling — curled strips + drifting fragments */}
        <path d="M 928 256 Q 880 240 872 196" fill="none" stroke="#f5c453" strokeOpacity="0.5" strokeWidth="3" />
        <path d="M 938 558 Q 886 578 878 630" fill="none" stroke="#f5c453" strokeOpacity="0.5" strokeWidth="3" />
        <path d="M 1030 408 Q 1082 398 1096 356" fill="none" stroke="#f5c453" strokeOpacity="0.4" strokeWidth="3" />
        <g fill="#ff3d8b">
          <rect className="cs1-frag" x="1044" y="300" width="14" height="10" opacity="0.8" />
          <rect className="cs1-frag cs1-f2" x="1060" y="470" width="10" height="14" opacity="0.8" />
          <rect className="cs1-frag cs1-f3" x="900" y="230" width="12" height="9" opacity="0.8" />
          <rect className="cs1-frag cs1-f4" x="880" y="520" width="9" height="12" opacity="0.8" />
        </g>

        {/* proctors turning toward it */}
        <g className="cs1-proctor" transform="translate(330 785) scale(1.25)"><ProctorSilhouette /></g>
        <g className="cs1-proctor cs1-p2" transform="translate(590 740) scale(0.95)"><ProctorSilhouette /></g>
        <g className="cs1-proctor cs1-p3" transform="translate(1210 750) scale(1.05)"><ProctorSilhouette /></g>
        <g className="cs1-proctor cs1-p4" transform="translate(1420 800) scale(1.4)"><ProctorSilhouette /></g>

        <rect width="1600" height="900" fill="#08080c" opacity="0.15" />
      </svg>
    </div>
  )
}

/* ---------------------------------------------------------------
 * Card 4 — filling the tear: a titan silhouette, veins of glowing
 * magenta-black, breath fogging the code of the air. GORGOROTH.
 * --------------------------------------------------------------- */
const CS1_APERTURE_PATH =
  'M 800 70 L 940 110 L 1050 190 L 1130 300 L 1185 430 L 1160 560 L 1210 650 ' +
  'L 1100 760 L 950 830 L 800 870 L 640 835 L 500 770 L 420 660 L 455 560 ' +
  'L 405 440 L 470 310 L 560 190 L 680 115 Z'

function ArtGorgoroth() {
  return (
    <div className="cs1-fill">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="cs1-abyss4" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#3d0a20" />
            <stop offset="0.55" stopColor="#1b0511" />
            <stop offset="1" stopColor="#08080c" />
          </radialGradient>
          <filter id="cs1-blur4" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="cs1-veinGlow4" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <rect width="1600" height="900" fill="#08080c" />

        {/* the tear, now a doorway */}
        <path className="cs1-aura" d={CS1_APERTURE_PATH} fill="none" stroke="#ff3d8b" strokeWidth="26" opacity="0.5" filter="url(#cs1-blur4)" />
        <path d={CS1_APERTURE_PATH} fill="url(#cs1-abyss4)" stroke="#ff3d8b" strokeWidth="4" />
        <g stroke="#ff3d8b" strokeWidth="2" fill="none" opacity="0.5">
          <path className="cs1-static" d="M 560 240 L 590 300 L 566 360" />
          <path className="cs1-static cs1-s2" d="M 1080 300 L 1052 370 L 1088 440" />
          <path className="cs1-static cs1-s3" d="M 520 540 L 556 600" />
        </g>

        {/* GORGOROTH — titan silhouette filling the tear */}
        <g>
          {/* torso + shoulders */}
          <path d="M 480 900 L 500 720 L 540 620 L 620 560 L 720 540 L 880 540 L 980 560 L 1060 620 L 1100 720 L 1120 900 Z" fill="#060309" />
          {/* forearms */}
          <path d="M 430 900 L 425 760 Q 430 660 500 630 L 540 700 Q 505 760 510 900 Z" fill="#060309" />
          <path d="M 1170 900 L 1175 760 Q 1170 660 1100 630 L 1060 700 Q 1095 760 1090 900 Z" fill="#060309" />
          {/* head — jagged crown */}
          <path d="M 690 470 L 700 380 L 725 330 L 745 360 L 765 300 L 790 345 L 815 290 L 840 340 L 862 310 L 880 370 L 895 430 L 890 520 L 860 565 L 740 565 L 705 520 Z" fill="#060309" />

          {/* eyes */}
          <g className="cs1-eye" fill="#ff3d8b" filter="url(#cs1-veinGlow4)">
            <path d="M 748 452 L 782 443 L 780 459 L 752 463 Z" />
            <path d="M 818 443 L 852 452 L 848 463 L 820 459 Z" />
          </g>

          {/* black-blood veins, pulsing + flowing */}
          <g fill="none" stroke="#ff3d8b" strokeLinecap="round" filter="url(#cs1-veinGlow4)">
            <path className="cs1-vein" strokeWidth="5" d="M 795 565 C 790 610 812 650 796 700" />
            <path className="cs1-vein cs1-v2" strokeWidth="4" d="M 795 640 C 752 676 722 680 690 716" />
            <path className="cs1-vein cs1-v3" strokeWidth="4" d="M 802 668 C 848 704 880 712 906 750" />
            <path className="cs1-vein cs1-v4" strokeWidth="4" d="M 505 668 C 522 726 496 786 516 862" />
            <path className="cs1-vein cs1-v5" strokeWidth="4" d="M 1095 668 C 1078 726 1104 786 1084 862" />
            <path className="cs1-vein cs1-v6" strokeWidth="3.5" d="M 780 380 C 786 420 774 452 782 505" />
            <path className="cs1-vein cs1-v2" strokeWidth="3.5" d="M 645 592 C 664 642 642 700 668 762" />
            <path className="cs1-vein cs1-v4" strokeWidth="3.5" d="M 952 592 C 936 646 960 702 940 762" />
          </g>

          {/* breath fogging the code of the air itself */}
          <g fill="#eaf6f5">
            <ellipse className="cs1-breath" cx="768" cy="540" rx="36" ry="16" />
            <ellipse className="cs1-breath cs1-bR cs1-b2" cx="832" cy="544" rx="32" ry="14" />
            <ellipse className="cs1-breath cs1-b3" cx="796" cy="556" rx="42" ry="17" />
          </g>
          <g className="cs1-mono" fill="#3df0e8" fontSize="19">
            <text className="cs1-glyph" x="688" y="600">{'{ }'}</text>
            <text className="cs1-glyph cs1-g2" x="902" y="586">{'</>'}</text>
            <text className="cs1-glyph cs1-g3" x="742" y="646">0x1F</text>
          </g>
        </g>

        {/* floor + spilled light */}
        <rect x="0" y="828" width="1600" height="72" fill="#050508" />
        <ellipse cx="800" cy="852" rx="480" ry="34" fill="#ff3d8b" opacity="0.08" className="cs1-aura" />
        <rect width="1600" height="900" fill="#08080c" opacity="0.12" />
      </svg>
    </div>
  )
}

/* ---------------------------------------------------------------
 * The scene — copy verbatim from doc §7, CS-1.
 * --------------------------------------------------------------- */
const cs1Rupture = {
  id: 'cs1',
  title: 'RUPTURE',
  cards: [
    {
      id: 'c1',
      art: <ArtExamFloorTilts />,
      lines: [
        <>The tower <em>moves</em>. Towers this size do not move.</>,
      ],
    },
    {
      id: 'c2',
      art: <ArtAlertHud />,
      lines: [
        <>ASSOCIATION ALERT — GATE FORMATION <strong>INTERIOR</strong>. CLASS: —</>,
        <>the classifier gives up. It just prints <strong>NULL</strong>.</>,
      ],
    },
    {
      id: 'c3',
      art: <ArtWallTear />,
      lines: [
        'Gates open over cities. Over oceans. Over ruins.',
        <>They do not open <em>inside the Association&rsquo;s own house.</em></>,
      ],
    },
    {
      id: 'c4',
      art: <ArtGorgoroth />,
      tone: 'gorgoroth',
      holdMs: 800,
      lines: [
        'The first thing through is a wall of black blood and rage.',
        <>Someone whispers the name every Hunter learns on day one and prays never to need: <strong>GORGOROTH BLACKBLOOD.</strong></>,
      ],
    },
  ],
}

export default cs1Rupture
