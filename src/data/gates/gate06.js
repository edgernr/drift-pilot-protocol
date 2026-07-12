// ─── HTML templates (verbatim from legacy Quest6) ──────────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector Dashboard
  `<div class="dashboard">
  <div class="top-bar"><span class="tb-logo">◈ EVA CITY</span><span class="tb-status">● SYSTEMS NOMINAL</span></div>
  <nav class="sidebar">
    <a class="side-link active" href="#">Overview</a>
    <a class="side-link" href="#">Districts</a>
    <a class="side-link" href="#">Signals</a>
    <a class="side-link" href="#">Vault</a>
    <a class="side-link" href="#">Settings</a>
  </nav>
  <main class="content-area">
    <h1 class="content-title">District Overview</h1>
    <p class="content-sub">All sectors reporting. Last sync: 06:44 UTC</p>
    <div class="card-grid">
      <div class="card"><div class="card-label">NODE ALPHA</div><div class="card-val">ONLINE</div><div class="card-desc">847 connections active</div></div>
      <div class="card"><div class="card-label">NODE BETA</div><div class="card-val">DEGRADED</div><div class="card-desc">3 channels offline</div></div>
      <div class="card"><div class="card-label">NODE GAMMA</div><div class="card-val">ONLINE</div><div class="card-desc">Full capacity reached</div></div>
      <div class="card"><div class="card-label">NODE DELTA</div><div class="card-val">STANDBY</div><div class="card-desc">Awaiting handshake</div></div>
      <div class="card"><div class="card-label">NODE EPSILON</div><div class="card-val">ONLINE</div><div class="card-desc">Routing optimised</div></div>
      <div class="card"><div class="card-label">NODE ZETA</div><div class="card-val">ONLINE</div><div class="card-desc">All checks cleared</div></div>
    </div>
  </main>
  <footer class="footer">◈ Void Shards — District Control System v4.1</footer>
</div>`,

  // Variant 1: Command Dashboard
  `<div class="dashboard">
  <div class="top-bar"><span class="tb-logo">⟐ COMMAND HQ</span><span class="tb-status">● OPS ACTIVE</span></div>
  <nav class="sidebar">
    <a class="side-link active" href="#">Operations</a>
    <a class="side-link" href="#">Intel</a>
    <a class="side-link" href="#">Deploy</a>
    <a class="side-link" href="#">Archive</a>
    <a class="side-link" href="#">Config</a>
  </nav>
  <main class="content-area">
    <h1 class="content-title">Mission Control</h1>
    <p class="content-sub">3 active operations. Zero casualties. Last update: 14:20 UTC</p>
    <div class="card-grid">
      <div class="card"><div class="card-label">OP PHOENIX</div><div class="card-val">ACTIVE</div><div class="card-desc">Team Alpha — 94% strength</div></div>
      <div class="card"><div class="card-label">OP NIGHTFALL</div><div class="card-val">STANDBY</div><div class="card-desc">Awaiting intel clearance</div></div>
      <div class="card"><div class="card-label">OP GRIDLOCK</div><div class="card-val">COMPLETE</div><div class="card-desc">All objectives cleared</div></div>
      <div class="card"><div class="card-label">OP VOIDGATE</div><div class="card-val">PENDING</div><div class="card-desc">Clearance required</div></div>
      <div class="card"><div class="card-label">OP CIPHER</div><div class="card-val">ACTIVE</div><div class="card-desc">Encryption in progress</div></div>
      <div class="card"><div class="card-label">OP SIGNAL</div><div class="card-val">ONLINE</div><div class="card-desc">Broadcast confirmed</div></div>
    </div>
  </main>
  <footer class="footer">⟐ Command Centre — Secure Operations Platform v2.8</footer>
</div>`,

  // Variant 2: Reactor Dashboard
  `<div class="dashboard">
  <div class="top-bar"><span class="tb-logo">※ REACTOR GRID</span><span class="tb-status">● CORES STABLE</span></div>
  <nav class="sidebar">
    <a class="side-link active" href="#">Cores</a>
    <a class="side-link" href="#">Cooling</a>
    <a class="side-link" href="#">Power</a>
    <a class="side-link" href="#">Safety</a>
    <a class="side-link" href="#">Logs</a>
  </nav>
  <main class="content-area">
    <h1 class="content-title">Reactor Status</h1>
    <p class="content-sub">6 monitoring stations. All readings within tolerance. 09:15 UTC</p>
    <div class="card-grid">
      <div class="card"><div class="card-label">PRIMARY CORE</div><div class="card-val">STABLE</div><div class="card-desc">100% output — nominal</div></div>
      <div class="card"><div class="card-label">SECONDARY CORE</div><div class="card-val">FLUCTUATING</div><div class="card-desc">±12% variance detected</div></div>
      <div class="card"><div class="card-label">COOLANT LOOP</div><div class="card-val">OPTIMAL</div><div class="card-desc">18°C across all channels</div></div>
      <div class="card"><div class="card-label">CONTAINMENT</div><div class="card-val">STRONG</div><div class="card-desc">Field at 98% capacity</div></div>
      <div class="card"><div class="card-label">POWER OUTPUT</div><div class="card-val">ONLINE</div><div class="card-desc">Grid load at 108%</div></div>
      <div class="card"><div class="card-label">SAFETY SYSTEM</div><div class="card-val">ACTIVE</div><div class="card-desc">All failsafes armed</div></div>
    </div>
  </main>
  <footer class="footer">※ Reactor Grid — Core Monitoring System v3.0</footer>
</div>`,
]

// ─── Starting CSS scaffold (verbatim from legacy Quest6) ────────────────────────

export const START_CSS = `/* Gate 06 — The Infinite Grid
   Build EVA City's district dashboard using CSS Grid only.
   The HTML is pre-built. Your CSS defines the layout.

   Checks to pass:
   1. .dashboard uses display: grid (outer container)
   2. Grid defines a 240px sidebar column (grid-template-columns: 240px ...)
   3. .top-bar spans full width (grid-column: 1 / -1)
   4. .card-grid uses auto-fit (responsive columns without media queries)
   5. .card-grid uses minmax() for fluid column sizing
   6. .footer spans full width (grid-column: 1 / -1)
   7. No @media that changes grid-template-columns */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  min-height: 100vh;
}

/* Outer dashboard layout — build with CSS Grid */
.dashboard {
  min-height: 100vh;
}

/* Top bar — must span full grid width */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #111524;
  border-bottom: 1px solid rgba(180,200,255,0.08);
}

.tb-logo { font-weight: 700; font-size: 14px; letter-spacing: 0.06em; }
.tb-status { font-size: 11px; color: #22d3ee; letter-spacing: 0.08em; }

/* Sidebar navigation */
.sidebar {
  padding: 24px 16px;
  background: #0d1020;
  border-right: 1px solid rgba(180,200,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-link {
  display: block;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #7a8199;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.side-link.active { color: #e8ecff; background: rgba(255,255,255,0.05); }
.side-link:hover { color: #b8c0d9; }

/* Main content area */
.content-area {
  padding: 32px;
  overflow: auto;
}

.content-title { font-size: 24px; font-weight: 600; margin-bottom: 6px; }
.content-sub { font-size: 13px; color: #7a8199; margin-bottom: 28px; }

/* Card grid — responsive without media queries */
.card-grid {
  gap: 16px;
}

.card {
  padding: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.08);
  border-radius: 8px;
}

.card-label { font-size: 10px; letter-spacing: 0.1em; color: #4a5070; margin-bottom: 6px; }
.card-val { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 12px; color: #7a8199; }

/* Footer — must span full grid width */
.footer {
  padding: 16px 24px;
  font-size: 11px;
  color: #4a5070;
  letter-spacing: 0.06em;
  border-top: 1px solid rgba(180,200,255,0.06);
  background: #0d1020;
}
`

// ─── Quiz (verbatim from legacy Quest6) ─────────────────────────────────────────

const QUIZ = {
  question: 'Your card grid stays responsive across all viewport sizes without any media queries. What makes that possible?',
  options: [
    'CSS Grid automatically detects screen size and adjusts column count using built-in breakpoint logic',
    'auto-fit combined with minmax lets the browser fit as many columns as possible at the minimum size, and stretches them to fill remaining space',
    'The fr unit makes columns fluid — they automatically collapse to one column when the screen is too narrow',
    'repeat(3, 1fr) creates three columns that shrink proportionally on smaller screens',
  ],
  correct: 1,
}

// ─── Wards (EXECUTION-BASED — verbatim from legacy Quest6 CSS_CHECKS) ───────────
// Each test runs against the RENDERED iframe (doc + its window) — it inspects the
// actual computed styles / real element geometry, so the CSS has to genuinely work.
// Two checks stay source-based (regex on `css`) by their nature: minmax() resolves to
// raw px tracks in computed values (undetectable post-render), and "no @media on grid
// columns" is purely a source-shape rule. Those keep the original regex tests.

const WARDS = [
  {
    id: 'grid_container',
    label: 'Grid container established',
    hint: 'CSS Grid is activated on the parent — not the children. To create the dashboard grid, set the display mode on the outermost wrapper element.',
    // EXECUTION: the rendered .dashboard must actually be a grid container.
    test: (doc, win) => {
      const el = doc.querySelector('.dashboard')
      return !!el && win.getComputedStyle(el).display === 'grid'
    },
  },
  {
    id: 'sidebar_width',
    label: 'Sidebar fixed width defined',
    hint: 'Use grid-template-columns on .dashboard to define the column widths. The sidebar needs a fixed pixel value; the content area should fill the remaining space.',
    // EXECUTION: the resolved column track list must include a 240px track. The browser
    // reports grid-template-columns as resolved pixel widths, so a 240px sidebar column
    // shows up literally as "240px" in the computed track string.
    test: (doc, win) => {
      const el = doc.querySelector('.dashboard')
      if (!el) return false
      const cs = win.getComputedStyle(el)
      if (cs.display !== 'grid') return false
      return /(^|\s)240px(\s|$)/.test(cs.gridTemplateColumns)
    },
  },
  {
    id: 'topbar_span',
    label: 'Top bar spans full width',
    hint: 'To make a grid item stretch across every column, use grid-column with a starting line of 1 and a special end value that always means "the last line" regardless of column count.',
    // EXECUTION: a full-width (1 / -1) top bar renders as wide as the whole dashboard
    // grid, not just the sidebar/first column. Compare real rendered widths.
    test: (doc, win) => {
      const dash = doc.querySelector('.dashboard')
      const bar = doc.querySelector('.top-bar')
      if (!dash || !bar) return false
      if (win.getComputedStyle(dash).display !== 'grid') return false
      const dashW = dash.getBoundingClientRect().width
      const barW = bar.getBoundingClientRect().width
      return dashW > 0 && barW >= dashW - 2
    },
  },
  {
    id: 'auto_fit',
    label: 'Card grid uses auto-fit',
    hint: 'Instead of a fixed number of columns, CSS Grid can calculate how many will fit automatically. There\'s a keyword used inside repeat() that means "as many columns as will fit." Look it up.',
    // EXECUTION: auto-fit produces multiple resolved column tracks in a wide container,
    // and the cards actually sit side-by-side (multiple cards share a row top). A single
    // fixed/one-column grid would fail this.
    test: (doc, win) => {
      const grid = doc.querySelector('.card-grid')
      if (!grid) return false
      const cs = win.getComputedStyle(grid)
      if (cs.display !== 'grid') return false
      const tracks = cs.gridTemplateColumns.trim().split(/\s+/).filter(Boolean)
      if (tracks.length < 2) return false
      const cards = grid.querySelectorAll('.card')
      if (cards.length >= 2) {
        return Math.abs(cards[0].getBoundingClientRect().top - cards[1].getBoundingClientRect().top) < 5
      }
      return true
    },
  },
  {
    id: 'minmax',
    label: 'Card columns use minmax()',
    hint: 'When using auto-fit, each column needs a size range — a floor it won\'t shrink below, and a ceiling it can grow to. One CSS function defines both bounds in a single expression.',
    // REGEX FALLBACK: minmax() resolves to plain px tracks in computed styles, so it
    // can't be reliably detected post-render. Keep the original source-based test.
    test: (doc, win, css) => /minmax\s*\(/.test(css),
  },
  {
    id: 'footer_span',
    label: 'Footer spans full width',
    hint: 'The footer should span edge to edge, just like the top bar. The same grid-column technique that stretches items across all columns applies here too.',
    // EXECUTION: a full-width (1 / -1) footer renders as wide as the whole dashboard grid.
    test: (doc, win) => {
      const dash = doc.querySelector('.dashboard')
      const foot = doc.querySelector('.footer')
      if (!dash || !foot) return false
      if (win.getComputedStyle(dash).display !== 'grid') return false
      const dashW = dash.getBoundingClientRect().width
      const footW = foot.getBoundingClientRect().width
      return dashW > 0 && footW >= dashW - 2
    },
  },
  {
    id: 'no_grid_media',
    label: 'No media queries on grid columns',
    hint: 'If auto-fit and minmax are set up correctly, the columns reflow automatically at any screen width — adding a media query to override grid-template-columns means something else isn\'t quite right.',
    // REGEX FALLBACK: this is a pure source-shape rule (don't override grid columns inside
    // an @media). Nothing in the rendered output reveals it — keep the source-based test.
    test: (doc, win, css) => {
      const mediaBlocks = css.match(/@media[^{]*\{[^}]+\}/g) ?? []
      return !mediaBlocks.some(b => /grid-template-columns/.test(b))
    },
  },
]

// ─── Preview builder (verbatim from legacy Quest6) ──────────────────────────────

function buildPreview(css, variantIndex) {
  const html = VARIANT_HTML[variantIndex]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; } a { text-decoration: none; }</style>`
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style></head><body>${html}</body></html>`
}

// ─── Solution (bible rule #6) ───────────────────────────────────────────────────
// The exact CSS that clears all 7 wards. Selectors (.dashboard, .top-bar,
// .card-grid, .footer, .card) are identical across all three variants, so a
// single variant-independent string suffices. At the 1100×800 check viewport:
// grid-template-columns resolves to "240px 860px" (ward 2), 1/-1 spans render
// full-width (wards 3/6), and auto-fit/minmax(220px,1fr) resolves to 3 tracks
// with cards sharing a row top (ward 4).

const SOLUTION_CSS = `/* Gate 06 — The Infinite Grid — cleared */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  min-height: 100vh;
}

/* Outer dashboard layout — CSS Grid */
.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Top bar — spans full grid width */
.top-bar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #111524;
  border-bottom: 1px solid rgba(180,200,255,0.08);
}

.tb-logo { font-weight: 700; font-size: 14px; letter-spacing: 0.06em; }
.tb-status { font-size: 11px; color: #22d3ee; letter-spacing: 0.08em; }

/* Sidebar navigation */
.sidebar {
  padding: 24px 16px;
  background: #0d1020;
  border-right: 1px solid rgba(180,200,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-link {
  display: block;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #7a8199;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.side-link.active { color: #e8ecff; background: rgba(255,255,255,0.05); }
.side-link:hover { color: #b8c0d9; }

/* Main content area */
.content-area {
  padding: 32px;
  overflow: auto;
}

.content-title { font-size: 24px; font-weight: 600; margin-bottom: 6px; }
.content-sub { font-size: 13px; color: #7a8199; margin-bottom: 28px; }

/* Card grid — responsive without media queries */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  padding: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.08);
  border-radius: 8px;
}

.card-label { font-size: 10px; letter-spacing: 0.1em; color: #4a5070; margin-bottom: 6px; }
.card-val { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 12px; color: #7a8199; }

/* Footer — spans full grid width */
.footer {
  grid-column: 1 / -1;
  padding: 16px 24px;
  font-size: 11px;
  color: #4a5070;
  letter-spacing: 0.06em;
  border-top: 1px solid rgba(180,200,255,0.06);
  background: #0d1020;
}
`

export default {
  id: 'gate06',
  gateNum: 6,
  title: 'The Infinite Grid',
  rank: 'C',
  region: 'THE FOUNDRY · ELITE HUNT',
  questId: 'act1-ch06',
  nextGate: 'quest7',
  ability: 'GRID LATTICE',
  language: 'css',
  narrator: 'CONTRACT 006 — ELITE HUNT, posted by the Association, countersigned by VERA. The edge of the mapped Foundry: past this hall, the survey lines just stop. The White Void doesn\'t attack — it erases. Layout, ground, meaning, all bleaching to white wherever structure is absent. Carved into the last solid tile, pressed harder than the others: "hold the grid. don\'t let it take the floor. — M" Build the district lattice — fixed sidebar, full-width bar and footer, cards that reflow on their own. Seal every gap. Give it nowhere to grow.',
  enemy: {
    name: 'The White Void',
    tier: 'ELITE',
    lore: 'A boss that doesn\'t attack so much as erase — layout, ground, meaning, all bleaching to white. It expands wherever structure is absent. Hardcoded breakpoints tear like paper; only a lattice that reflows on its own — no gaps, no seams — can hold the floor against it.',
    svgVariant: 6,
  },
  variants: VARIANT_HTML,
  getStarterCode: () => START_CSS,
  buildPreview,
  buildCheckDoc: buildPreview,
  checkViewport: { width: 1100, height: 800 },
  requiresBody: true,
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'GRID INTEGRITY',
  scannerUnit: 'FAILING',
  quiz: QUIZ,
  xpPerWard: 50,
  completionXp: 500,
  shardReward: 400,
  solution: SOLUTION_CSS,
  aiTitle: 'Gate 06 — The Infinite Grid',
  aiRequirements: 'Build a CSS Grid dashboard layout: outer .dashboard uses display:grid with a 240px sidebar column, .top-bar spans full width (grid-column: 1 / -1), .card-grid uses repeat(auto-fit, minmax()) for responsive columns without media queries, .footer spans full width.',
  completion: {
    entryLabel: 'Contract 006 — Closed',
    icon: '⬛',
    chip: 'CONTRACT 006 CLOSED',
    heading: 'Elite kill confirmed.',
    body: 'The Void met a lattice with no gaps and stopped being infinite. Every viewport holds — no media queries, just auto-fit and minmax doing exactly what they were built for. <strong>The floor didn\'t move. Neither did you.</strong> VERA logs the payout; the survey line moves one hall deeper. Whoever M is, she held this floor once too.',
    rewards: [
      { label: '$SHARD PAYOUT', value: '+400' },
      { label: 'XP LOGGED', value: '+500' },
      { label: 'PROOF OF KILL', value: 'Void Fragment' },
      { label: 'ITEM', value: 'Grid Seal I' },
    ],
    nextLabel: 'NEXT CONTRACT AVAILABLE',
    nextTitle: 'Ghost Feedback',
    nextSub: 'CSS transitions + transforms · Rank C',
    nextIcon: '👻',
  },
}
