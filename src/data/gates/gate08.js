// Gate 08 — THE COLLAPSE · Contract 008 · Elite hunt vs THE STACK.
// Ported VERBATIM from the legacy Quest8.jsx screen: all 3 HTML variants (each a
// full mobile page with the viewport meta included), the starter CSS scaffold,
// the quiz, and all 7 checks (6 regex + 1 execution) are byte-identical.
// Only the framing (contract voice, completion copy, ability tag) is new.

// ─── HTML templates (viewport meta already included) ──────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector Zero — Mobile Page
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sector Zero</title>
</head>
<body>
<div class="page-wrap">
  <nav class="site-nav">
    <div class="nav-brand">◈ SECTOR ZERO</div>
    <input class="nav-toggle" type="checkbox" id="nav-toggle" />
    <label class="nav-burger" for="nav-toggle">☰</label>
    <ul class="nav-menu">
      <li><a href="#">Overview</a></li>
      <li><a href="#">Districts</a></li>
      <li><a href="#">Signals</a></li>
      <li><a href="#">Vault</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1 class="hero-title">District Zero</h1>
    <p class="hero-sub">Deploy. Monitor. Own your sector.</p>
    <a class="hero-cta" href="#">Get Started</a>
  </section>

  <section class="features">
    <div class="feature-card"><div class="fc-icon">⬡</div><h3>Data Vault</h3><p>Encrypted storage. Zero exposure.</p></div>
    <div class="feature-card"><div class="fc-icon">◈</div><h3>Signal Tower</h3><p>Real-time broadcast. Full reach.</p></div>
    <div class="feature-card"><div class="fc-icon">⟐</div><h3>Cipher Node</h3><p>Auth layer. All access verified.</p></div>
    <div class="feature-card"><div class="fc-icon">▶</div><h3>Mission Board</h3><p>Active ops. Live status updates.</p></div>
  </section>

  <section class="testimonials">
    <div class="testimonial"><blockquote>"Sector Zero gave us the infrastructure to scale."</blockquote><cite>— Seeker Alpha</cite></div>
    <div class="testimonial"><blockquote>"The signal system is unmatched in the district."</blockquote><cite>— Unit 7</cite></div>
  </section>

  <footer class="footer">◈ Void Shards — Sector Zero v4.1 · All rights reserved</footer>
</div>
</body>
</html>`,

  // Variant 1: Command Centre — Mobile Page
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Command Centre</title>
</head>
<body>
<div class="page-wrap">
  <nav class="site-nav">
    <div class="nav-brand">⟐ COMMAND HQ</div>
    <input class="nav-toggle" type="checkbox" id="nav-toggle" />
    <label class="nav-burger" for="nav-toggle">☰</label>
    <ul class="nav-menu">
      <li><a href="#">Operations</a></li>
      <li><a href="#">Intel</a></li>
      <li><a href="#">Deploy</a></li>
      <li><a href="#">Archive</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1 class="hero-title">Command Centre</h1>
    <p class="hero-sub">Full mission control. Real-time across all ops.</p>
    <a class="hero-cta" href="#">Open HQ</a>
  </section>

  <section class="features">
    <div class="feature-card"><div class="fc-icon">▶</div><h3>Op Control</h3><p>Manage active operations from HQ.</p></div>
    <div class="feature-card"><div class="fc-icon">◎</div><h3>Intel Feed</h3><p>Live intel. Updated every 60 seconds.</p></div>
    <div class="feature-card"><div class="fc-icon">✓</div><h3>Results</h3><p>Mission outcomes logged in real time.</p></div>
    <div class="feature-card"><div class="fc-icon">⊕</div><h3>Deploy</h3><p>One-click team deployment protocols.</p></div>
  </section>

  <section class="testimonials">
    <div class="testimonial"><blockquote>"Command Centre cut our response time by 40%."</blockquote><cite>— Strike Lead Alpha</cite></div>
    <div class="testimonial"><blockquote>"Intel feed is the backbone of all our operations."</blockquote><cite>— Unit 12</cite></div>
  </section>

  <footer class="footer">⟐ Command Centre — Secure Operations Platform v2.8</footer>
</div>
</body>
</html>`,

  // Variant 2: Reactor Grid — Mobile Page
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reactor Grid</title>
</head>
<body>
<div class="page-wrap">
  <nav class="site-nav">
    <div class="nav-brand">※ REACTOR GRID</div>
    <input class="nav-toggle" type="checkbox" id="nav-toggle" />
    <label class="nav-burger" for="nav-toggle">☰</label>
    <ul class="nav-menu">
      <li><a href="#">Cores</a></li>
      <li><a href="#">Cooling</a></li>
      <li><a href="#">Power</a></li>
      <li><a href="#">Safety</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1 class="hero-title">Reactor Grid</h1>
    <p class="hero-sub">Core systems stable. Containment holding.</p>
    <a class="hero-cta" href="#">Monitor Cores</a>
  </section>

  <section class="features">
    <div class="feature-card"><div class="fc-icon">⚡</div><h3>Primary Core</h3><p>100% output. All systems nominal.</p></div>
    <div class="feature-card"><div class="fc-icon">〰</div><h3>Coolant Loop</h3><p>18°C across all channels.</p></div>
    <div class="feature-card"><div class="fc-icon">⊕</div><h3>Containment</h3><p>Field at 98%. No breaches detected.</p></div>
    <div class="feature-card"><div class="fc-icon">◎</div><h3>Safety Systems</h3><p>All failsafes armed and verified.</p></div>
  </section>

  <section class="testimonials">
    <div class="testimonial"><blockquote>"Reactor Grid monitoring gave us confidence at scale."</blockquote><cite>— Core Engineer Gamma</cite></div>
    <div class="testimonial"><blockquote>"The safety system has zero false positives."</blockquote><cite>— Containment Unit 3</cite></div>
  </section>

  <footer class="footer">※ Reactor Grid — Core Monitoring System v3.0</footer>
</div>
</body>
</html>`,
]

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

const START_CSS = `/* Gate 08 — The Collapse
   Build the sector page mobile-first.
   The HTML is pre-built with a viewport meta tag already included.
   Write CSS that starts mobile and scales up — not the other way around.

   Checks to pass:
   1. @media (min-width: ...) used — NOT max-width (mobile-first direction)
   2. Base grid is 1 column; @media expands to 4 columns
   3. Navigation collapses: .nav-menu hidden by default, shown via :checked sibling
   4. clamp() used at least once for fluid sizing
   5. No element with a fixed width wider than viewport (no overflow risk)
   6. Desktop layout uses min-width media query at 768px or higher
   7. Hero section scales with clamp() or relative units (not fixed px heights) */

* { box-sizing: border-box; margin: 0; padding: 0; }

/* Mobile base styles first */
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
}

.page-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

/* Navigation — mobile collapsed by default */
.site-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px 20px;
  background: #111524;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  position: relative;
}

.nav-brand {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
  flex: 1;
}

/* Checkbox toggle — hidden */
.nav-toggle {
  display: none;
}

/* Burger icon — visible on mobile */
.nav-burger {
  font-size: 20px;
  cursor: pointer;
  color: #b8c0d9;
  padding: 4px;
}

/* Nav menu hidden on mobile */
.nav-menu {
  width: 100%;
  list-style: none;
  display: none;
  flex-direction: column;
  padding: 8px 0;
  gap: 4px;
}

.nav-menu a {
  display: block;
  padding: 8px 12px;
  color: #b8c0d9;
  text-decoration: none;
  font-size: 14px;
}

/* Hero section */
.hero {
  padding: 48px 20px;
  text-align: center;
}

.hero-title {
  margin-bottom: 12px;
}

.hero-sub {
  color: #b8c0d9;
  margin-bottom: 24px;
}

.hero-cta {
  display: inline-block;
  padding: 12px 28px;
  background: #22d3ee;
  color: #0a0d18;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
}

/* Features — single column base */
.features {
  padding: 40px 20px;
  display: grid;
  gap: 16px;
}

.feature-card {
  padding: 24px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.1);
  border-radius: 8px;
}

.fc-icon { font-size: 28px; margin-bottom: 12px; }
.feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: #7a8199; line-height: 1.5; }

/* Testimonials */
.testimonials {
  padding: 40px 20px;
  display: grid;
  gap: 16px;
}

.testimonial {
  padding: 20px 24px;
  background: rgba(255,255,255,0.03);
  border-left: 2px solid rgba(180,200,255,0.2);
  border-radius: 0 6px 6px 0;
}

.testimonial blockquote { font-size: 14px; color: #b8c0d9; margin-bottom: 8px; font-style: italic; }
.testimonial cite { font-size: 12px; color: #4a5070; }

/* Footer */
.footer {
  padding: 20px;
  font-size: 11px;
  color: #4a5070;
  letter-spacing: 0.06em;
  text-align: center;
  border-top: 1px solid rgba(180,200,255,0.06);
}
`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You built mobile styles first and added desktop overrides in min-width media queries. Why is that order significant?',
  options: [
    'It reduces CSS file size because mobile styles are simpler, and browsers download less code on mobile connections',
    'It ensures mobile devices only receive and apply styles relevant to them — desktop overrides are skipped if the min-width condition is never met',
    'It prevents desktop browsers from rendering mobile styles, which would cause layout errors on large screens',
    'It is required by the CSS specification — browsers ignore max-width queries on mobile devices',
  ],
  correct: 1,
}

// ─── Wards (legacy CSS_CHECKS, ported VERBATIM) ───────────────────────────────
// Gate 08 is mobile-first responsive — the HARDEST to execution-check, because most
// requirements (min-width direction, clamp() usage, breakpoint thresholds) are
// authoring-intent that the browser flattens away once rendered (clamp() resolves to
// px, media-query direction can't be told apart at a single viewport). Verifying those
// by execution while built BLIND risks an UNCOMPLETABLE gate, so per the gate rules we
// KEEP their original regex tests. The one requirement that IS a genuine rendered
// result — "nothing overflows the viewport" — is converted to a real execution check
// against the offscreen iframe (sized 390×1400 via checkViewport, matching legacy).
//
// Each test receives (doc, win, css). Regex checks ignore doc/win and read `css`.

const WARDS = [
  {
    id: 'min_width',
    label: 'min-width queries used',
    hint: 'Mobile-first means base styles are for small screens, and overrides kick in as screens get wider — not narrower. Which direction should your media condition check?',
    mode: 'regex',
    test: (doc, win, css) => /@media[^{]*min-width/.test(css) && !/@media[^{]*max-width/.test(css),
  },
  {
    id: 'grid_one_col',
    label: 'Grid starts single column',
    hint: 'CSS Grid defaults to a single column when no column template is set. Define the base as one track, then use a media query to expand the number of columns for larger screens.',
    mode: 'regex',
    test: (doc, win, css) => {
      const base = css.match(/\.features\s*\{([^}]+)\}/)
      if (!base) return false
      const baseHas1col = /grid-template-columns\s*:\s*1fr/.test(base[1]) ||
        !/grid-template-columns/.test(base[1])
      // Detect a multi-column .features rule inside ANY min-width @media block,
      // regardless of other rules present in that block (idiomatic mobile-first).
      const mediaHasMulti = /@media[^{]*min-width[\s\S]*?\.features\s*\{[^}]*grid-template-columns[^}]*(?:repeat|[2-9])[^}]*\}/.test(css)
      return baseHas1col && mediaHasMulti
    },
  },
  {
    id: 'nav_collapse',
    label: 'Navigation collapses on mobile',
    hint: 'The HTML already has a hidden checkbox and a burger label wired up. In CSS, there\'s a combinator that selects a sibling element that follows a :checked element. How do you combine :checked with a sibling selector?',
    mode: 'regex',
    test: (doc, win, css) => /nav-toggle\s*:\s*checked[^{]*~[^{]*nav-menu/.test(css) ||
      /#nav-toggle\s*:\s*checked[^{]*~[^{]*\.nav-menu/.test(css) ||
      /\.nav-toggle\s*:\s*checked[^{]*~[^{]*\.nav-menu/.test(css),
  },
  {
    id: 'clamp_used',
    label: 'clamp() used for fluid sizing',
    hint: 'There\'s a CSS function that locks a value between a minimum and maximum while allowing a preferred middle value — often viewport-based — to scale between them.',
    mode: 'regex',
    test: (doc, win, css) => /clamp\s*\(/.test(css),
  },
  {
    id: 'no_overflow',
    label: 'No fixed widths wider than viewport',
    hint: 'Fixed pixel widths that exceed the viewport width force horizontal scrolling on small screens. Fluid elements should use relative units or a max-width so they adapt to the available space.',
    mode: 'exec',
    // EXECUTION: render the page in the narrow offscreen iframe and confirm the
    // document doesn't scroll horizontally. A genuine rendered-result test —
    // any over-wide fixed element would push scrollWidth past the viewport.
    test: (doc, win) => {
      const de = doc.documentElement
      const body = doc.body
      if (!de || !body) return false
      const viewport = de.clientWidth
      if (!viewport) return false
      const overflow = Math.max(de.scrollWidth, body.scrollWidth) - viewport
      return overflow <= 2 // 2px tolerance for sub-pixel rounding
    },
  },
  {
    id: 'desktop_breakpoint',
    label: 'Desktop breakpoint at 768px+',
    hint: 'Your expanded desktop layout needs a threshold — a specific viewport width where it kicks in. Write a min-width media query at 768px or higher to contain those overrides.',
    mode: 'regex',
    test: (doc, win, css) => /@media[^{]*min-width\s*:\s*(?:768|800|900|960|1024|1100|1200)px/.test(css),
  },
  {
    id: 'fluid_hero',
    label: 'Hero title uses fluid sizing',
    hint: 'A truly responsive title shouldn\'t be locked to a fixed pixel size. Use a relative unit or a function that lets the size scale fluidly between a minimum and maximum.',
    mode: 'regex',
    test: (doc, win, css) => {
      const m = css.match(/\.hero-title\s*\{([^}]+)\}/)
      if (!m) return false
      return /font-size\s*:[^;]*(?:clamp|rem|em|vw)/.test(m[1])
    },
  },
]

// ─── Preview / check-doc builder (legacy assembly, exact) ─────────────────────
// The variants are full HTML documents; the student's CSS is injected before
// </head>, exactly as the legacy screen did. Used for BOTH the visible preview
// and the offscreen check document.

function buildPreview(css, variantIndex) {
  const fullHtml = VARIANT_HTML[variantIndex]
  // Inject CSS before closing </head>
  return fullHtml.replace('</head>', `<style>${css}</style></head>`)
}

// ─── Solution (bible rule #6) ─────────────────────────────────────────────────
// The exact CSS that clears all 7 wards for every variant (selectors are
// identical across all three pages) at the 390×1400 check viewport:
// base styles are one fluid column (no fixed widths — nothing pushes
// scrollWidth past 390px, ward 5), the checkbox :checked sibling reveals the
// nav menu (ward 3), clamp() drives the fluid hero title (wards 4/7), and a
// single min-width breakpoint at 768px — no max-width anywhere — grows the
// features grid to four columns (wards 1/2/6).

const SOLUTION_CSS = `/* Gate 08 — The Collapse — cleared.
   Mobile-first: base styles serve small screens; one min-width breakpoint
   at 768px grows the layout. No fixed widths — nothing for THE STACK to crush. */

* { box-sizing: border-box; margin: 0; padding: 0; }

/* Mobile base styles first */
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
}

.page-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

/* Navigation — mobile collapsed by default */
.site-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px 20px;
  background: #111524;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  position: relative;
}

.nav-brand {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
  flex: 1;
}

/* Checkbox toggle — hidden */
.nav-toggle {
  display: none;
}

/* Burger icon — visible on mobile */
.nav-burger {
  font-size: 20px;
  cursor: pointer;
  color: #b8c0d9;
  padding: 4px;
}

/* Nav menu hidden on mobile — revealed by the checkbox */
.nav-menu {
  width: 100%;
  list-style: none;
  display: none;
  flex-direction: column;
  padding: 8px 0;
  gap: 4px;
}

.nav-toggle:checked ~ .nav-menu {
  display: flex;
}

.nav-menu a {
  display: block;
  padding: 8px 12px;
  color: #b8c0d9;
  text-decoration: none;
  font-size: 14px;
}

/* Hero — fluid, no fixed heights */
.hero {
  padding: clamp(40px, 10vw, 72px) 20px;
  text-align: center;
}

.hero-title {
  font-size: clamp(2rem, 6vw, 3.25rem);
  margin-bottom: 12px;
}

.hero-sub {
  color: #b8c0d9;
  margin-bottom: 24px;
}

.hero-cta {
  display: inline-block;
  padding: 12px 28px;
  background: #22d3ee;
  color: #0a0d18;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
}

/* Features — single column base */
.features {
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.feature-card {
  padding: 24px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.1);
  border-radius: 8px;
}

.fc-icon { font-size: 28px; margin-bottom: 12px; }
.feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: #7a8199; line-height: 1.5; }

/* Testimonials */
.testimonials {
  padding: 40px 20px;
  display: grid;
  gap: 16px;
}

.testimonial {
  padding: 20px 24px;
  background: rgba(255,255,255,0.03);
  border-left: 2px solid rgba(180,200,255,0.2);
  border-radius: 0 6px 6px 0;
}

.testimonial blockquote { font-size: 14px; color: #b8c0d9; margin-bottom: 8px; font-style: italic; }
.testimonial cite { font-size: 12px; color: #4a5070; }

/* Footer */
.footer {
  padding: 20px;
  font-size: 11px;
  color: #4a5070;
  letter-spacing: 0.06em;
  text-align: center;
  border-top: 1px solid rgba(180,200,255,0.06);
}

/* Desktop growth — one min-width breakpoint, mobile-first direction */
@media (min-width: 768px) {
  .nav-burger { display: none; }
  .nav-menu {
    display: flex;
    flex-direction: row;
    width: auto;
    padding: 0;
    gap: 24px;
  }
  .features { grid-template-columns: repeat(4, 1fr); }
  .testimonials { grid-template-columns: repeat(2, 1fr); }
}
`

// ─── Config ───────────────────────────────────────────────────────────────────

export default {
  id: 'gate08',
  gateNum: 8,
  title: 'The Collapse',
  rank: 'C',
  region: 'THE FOUNDRY · ELITE HUNT',
  questId: 'act1-ch08',
  nextGate: 'quest9',
  ability: 'STACK BREAK',
  language: 'css',
  narrator: 'CONTRACT 008 — ELITE HUNT, posted by the Association, countersigned by VERA. THE STACK crushes whole districts down to a single suffocating column — everything that wasn\'t built for mobile first gets fed to the collapse. This arena tests every width: write the base styles for small screens, then scale up with min-width queries. Build it right and THE STACK has nothing to crush.',
  enemy: {
    name: 'The Stack',
    tier: 'ELITE',
    lore: 'It crushes the whole district down to a single suffocating column. The arena itself resizes as you fight — you have to hold the world together at every width.',
    svgVariant: 8,
  },
  variants: VARIANT_HTML,
  getStarterCode: () => START_CSS,
  buildPreview,
  buildCheckDoc: buildPreview,
  // Legacy Quest8 ran its checks in a 390×1400 offscreen iframe — the
  // no_overflow execution check only means something at a NARROW viewport.
  checkViewport: { width: 390, height: 1400 },
  // The no_overflow ward reads rendered layout (scrollWidth/clientWidth) from
  // contentDocument, which requires a same-origin-readable frame. The legacy
  // check iframe had no sandbox attribute ("same-origin readable, no scripts
  // run here"); allow-same-origin WITHOUT allow-scripts reproduces that exactly.
  checkSandbox: 'allow-same-origin',
  requiresBody: true,
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'MOBILE AUDIT',
  scannerUnit: 'FAILING',
  quiz: QUIZ,
  xpPerWard: 71, // legacy split: 500 XP / 7 checks
  completionXp: 500,
  shardReward: 400,
  solution: SOLUTION_CSS,
  aiTitle: 'Gate 08 — The Collapse',
  aiRequirements: 'Build mobile-first responsive CSS: use min-width media queries only, features grid starts at 1 column then expands with min-width, nav collapses using checkbox:checked ~ .nav-menu, clamp() used for fluid sizing, hero-title uses fluid font-size, no fixed widths causing overflow.',
  completion: {
    entryLabel: 'Contract 008 — Closed',
    icon: '📱',
    chip: 'CONTRACT 008 CLOSED',
    heading: 'The District Renders on Every Screen.',
    body: 'Elite kill confirmed at every width. Mobile base. Desktop upgrade. No max-width overrides. THE STACK had nothing to crush because you built it right the first time — <strong>that\'s mobile-first by design.</strong> VERA logs the payout; the district breathes at any size.',
    rewards: [
      { label: '$SHARD PAYOUT', value: '+400' },
      { label: 'XP LOGGED', value: '+500' },
      { label: 'PROOF OF KILL', value: 'Stack Fragment' },
      { label: 'ITEM', value: 'Responsive License I' },
    ],
    nextLabel: 'NEXT CONTRACT AVAILABLE',
    nextTitle: 'The Control Room',
    nextSub: 'JavaScript DOM · Rank B',
    nextIcon: '⬡',
  },
}
