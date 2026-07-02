const VARIANT_HTML = [
  `<div class="layout-wrap">
  <nav class="site-nav">
    <div class="nav-brand">◈ SECTOR ZERO</div>
    <div class="nav-links">
      <a class="nav-link" href="#">Docs</a>
      <a class="nav-link" href="#">Status</a>
      <a class="nav-link" href="#">API</a>
    </div>
    <a class="nav-cta" href="#">Launch →</a>
  </nav>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Sector Zero</h1>
      <p class="hero-sub">Deploy. Monitor. Own your sector.</p>
      <button class="hero-btn">Get Started</button>
    </div>
  </section>
  <div class="card-row">
    <div class="card"><div class="card-icon">⬡</div><div class="card-title">Data Vault</div><div class="card-body">Encrypted storage layer. Zero exposure risk.</div></div>
    <div class="card"><div class="card-icon">◈</div><div class="card-title">Signal Tower</div><div class="card-body">Real-time broadcast to the full district network.</div></div>
    <div class="card"><div class="card-icon">⟐</div><div class="card-title">Cipher Node</div><div class="card-body">Auth layer. All access verified and logged.</div></div>
  </div>
  <div class="two-col">
    <div class="col-main"><h2 class="col-title">District Intelligence</h2><p class="col-body">Full operational overview. All 12 sectors reporting nominal status.</p></div>
    <div class="col-aside"><div class="stat-label">NODES ONLINE</div><div class="stat-value">847</div></div>
  </div>
</div>`,
  `<div class="layout-wrap">
  <nav class="site-nav">
    <div class="nav-brand">⟐ COMMAND CENTRE</div>
    <div class="nav-links">
      <a class="nav-link" href="#">Ops</a>
      <a class="nav-link" href="#">Intel</a>
      <a class="nav-link" href="#">Deploy</a>
    </div>
    <a class="nav-cta" href="#">Secure →</a>
  </nav>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Command Centre</h1>
      <p class="hero-sub">Mission control for the entire district grid.</p>
      <button class="hero-btn">Open HQ</button>
    </div>
  </section>
  <div class="card-row">
    <div class="card"><div class="card-icon">▶</div><div class="card-title">Op Phoenix</div><div class="card-body">Active mission. Team Alpha deployed. 94% strength.</div></div>
    <div class="card"><div class="card-icon">◎</div><div class="card-title">Op Nightfall</div><div class="card-body">Awaiting intel clearance. Standby protocol active.</div></div>
    <div class="card"><div class="card-icon">✓</div><div class="card-title">Op Gridlock</div><div class="card-body">Objectives cleared. District secured.</div></div>
  </div>
  <div class="two-col">
    <div class="col-main"><h2 class="col-title">Mission Overview</h2><p class="col-body">Three active operations. One complete. Zero casualties recorded.</p></div>
    <div class="col-aside"><div class="stat-label">ACTIVE OPS</div><div class="stat-value">3</div></div>
  </div>
</div>`,
  `<div class="layout-wrap">
  <nav class="site-nav">
    <div class="nav-brand">※ REACTOR GRID</div>
    <div class="nav-links">
      <a class="nav-link" href="#">Cores</a>
      <a class="nav-link" href="#">Cooling</a>
      <a class="nav-link" href="#">Alerts</a>
    </div>
    <a class="nav-cta" href="#">Monitor →</a>
  </nav>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Reactor Grid</h1>
      <p class="hero-sub">Core systems nominal. Containment holding.</p>
      <button class="hero-btn">View Cores</button>
    </div>
  </section>
  <div class="card-row">
    <div class="card"><div class="card-icon">⚡</div><div class="card-title">Primary Core</div><div class="card-body">100% output. All systems stable and nominal.</div></div>
    <div class="card"><div class="card-icon">〰</div><div class="card-title">Coolant Loop</div><div class="card-body">18°C nominal. Flow rate optimal across all channels.</div></div>
    <div class="card"><div class="card-icon">⊕</div><div class="card-title">Containment</div><div class="card-body">Field at 98%. No breaches detected in last 72h.</div></div>
  </div>
  <div class="two-col">
    <div class="col-main"><h2 class="col-title">System Report</h2><p class="col-body">All three reactor cores operational. Last inspection 6 hours ago.</p></div>
    <div class="col-aside"><div class="stat-label">UPTIME</div><div class="stat-value">99.9%</div></div>
  </div>
</div>`,
]

export const START_CSS = `/* Gate 05 — The Gravity Anchor
   District layout collapsed when the absolute anchors failed.
   Restore flow using Flexbox only.

   The HTML is pre-built. Your job is the CSS.
   .nav-brand::after uses position: absolute — that one is legitimate, leave it.

   Checks now RUN your CSS and inspect the rendered layout (computed styles +
   real positions) — not just the text. The code has to actually work.

   Checks to pass:
   1. .site-nav uses display: flex
   2. .nav-links uses display: flex
   3. .nav-cta is pushed to the far right (margin-left: auto)
   4. .card-row uses display: flex
   5. .two-col uses display: flex
   6. .hero-section uses display: flex + justify-content: center + align-items: center */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  min-height: 100vh;
}

/* Layout wrapper */
.layout-wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

/* The one legitimate absolute element */
.nav-brand {
  position: relative;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
}
.nav-brand::after {
  content: '●';
  position: absolute;
  top: -3px;
  right: -10px;
  color: #22d3ee;
  font-size: 5px;
}

/* Nav — add Flexbox here */
.site-nav {
  padding: 16px 0;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  align-items: center;
}

.nav-links {
  gap: 24px;
}

.nav-link {
  font-size: 13px;
  color: #b8c0d9;
  text-decoration: none;
}

/* Push this item to the far right */
.nav-cta {
  font-size: 13px;
  font-weight: 600;
  color: #22d3ee;
  text-decoration: none;
  padding: 6px 14px;
  border: 1px solid #22d3ee;
  border-radius: 4px;
}

/* Hero — center content both axes */
.hero-section {
  min-height: 260px;
  padding: 60px 0;
}

.hero-content { text-align: center; }
.hero-title { font-size: 40px; font-weight: 700; margin-bottom: 12px; }
.hero-sub { font-size: 16px; color: #b8c0d9; margin-bottom: 24px; }
.hero-btn { padding: 10px 24px; background: #22d3ee; color: #0a0d18; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }

/* Cards — equal height row */
.card-row {
  padding: 40px 0;
  gap: 16px;
}

.card { flex: 1; padding: 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(180,200,255,0.1); border-radius: 8px; }
.card-icon { font-size: 24px; margin-bottom: 12px; }
.card-title { font-weight: 600; margin-bottom: 8px; }
.card-body { font-size: 13px; color: #7a8199; line-height: 1.5; }

/* Two-column layout */
.two-col {
  padding: 40px 0;
  gap: 40px;
  border-top: 1px solid rgba(180,200,255,0.08);
  align-items: center;
}

.col-main { flex: 1; }
.col-title { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
.col-body { font-size: 14px; color: #b8c0d9; line-height: 1.6; }

.col-aside { flex-shrink: 0; text-align: right; }
.stat-label { font-size: 10px; letter-spacing: 0.1em; color: #4a5070; margin-bottom: 4px; }
.stat-value { font-size: 48px; font-weight: 700; color: #22d3ee; }
`

const WARDS = [
  { id: 'nav_flex', label: 'Navigation anchored to flow', hint: 'Flexbox is activated on the parent container, not the children. To arrange .site-nav\'s children in a row, apply the flex display mode to .site-nav itself.', test: (doc, win) => { const el = doc.querySelector('.site-nav'); return !!el && win.getComputedStyle(el).display === 'flex' } },
  { id: 'nav_links_flex', label: 'Nav links in a row', hint: 'The .nav-links element is the parent of the individual links. To make those links sit side by side in a row, turn .nav-links itself into a flex container.', test: (doc, win) => { const el = doc.querySelector('.nav-links'); return !!el && win.getComputedStyle(el).display === 'flex' } },
  { id: 'nav_push', label: 'Nav item pushed to edge', hint: 'In flexbox, a margin set to auto on one side of an item consumes all remaining free space in that direction — effectively pushing the element to the opposite end.', test: (doc, win) => { const nav = doc.querySelector('.site-nav'); const links = doc.querySelector('.nav-links'); const cta = doc.querySelector('.nav-cta'); if (!nav || !links || !cta) return false; if (win.getComputedStyle(nav).display !== 'flex') return false; const gap = cta.getBoundingClientRect().left - links.getBoundingClientRect().right; return gap > 80 } },
  { id: 'card_flex', label: 'Card row established', hint: 'The .card-row element is the parent of all the cards. Making it a flex container will arrange its children side by side horizontally.', test: (doc, win) => { const el = doc.querySelector('.card-row'); if (!el || win.getComputedStyle(el).display !== 'flex') return false; const cards = el.querySelectorAll('.card'); if (cards.length >= 2) { return Math.abs(cards[0].getBoundingClientRect().top - cards[1].getBoundingClientRect().top) < 5 } return true } },
  { id: 'two_col_flex', label: 'Two columns using flex', hint: 'A two-column layout — main content beside a sidebar — is a classic flexbox pattern. Apply it to the wrapper that contains both columns.', test: (doc, win) => { const el = doc.querySelector('.two-col'); return !!el && win.getComputedStyle(el).display === 'flex' } },
  { id: 'hero_center', label: 'Hero centered both axes', hint: 'Centering content both horizontally and vertically in a flex container requires two separate alignment properties — one controls the main axis, the other controls the cross axis.', test: (doc, win) => { const el = doc.querySelector('.hero-section'); if (!el) return false; const cs = win.getComputedStyle(el); return cs.display === 'flex' && cs.justifyContent === 'center' && cs.alignItems === 'center' } },
]

const QUIZ = {
  question: 'Your nav has brand + links grouped on the left, and one item alone on the right. How did you achieve that without adding a wrapper or changing the HTML?',
  options: [
    'justify-content: space-between on the nav distributes all items, pushing the last one to the far right automatically',
    'margin-left: auto on .nav-cta consumes all available space before it, pushing it to the far right',
    'order: -1 on the brand reverses flex flow, naturally placing items on opposite ends',
    'flex-direction: row-reverse and reversed HTML order puts items on opposite sides',
  ],
  correct: 1,
}

function buildPreview(css, variantIndex) {
  const html = VARIANT_HTML[variantIndex] || VARIANT_HTML[0]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; } a { text-decoration: none; }</style>`
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style></head><body>${html}</body></html>`
}

export default {
  id: 'gate05',
  gateNum: 5,
  title: 'The Gravity Anchor',
  rank: 'C',
  region: 'THE FOUNDRY',
  questId: 'act1-ch05',
  nextGate: 'quest6',
  ability: 'GRAVITY LOCK',
  language: 'css',
  narrator: 'District in freefall. The Unaligned knocked everything off its axis — layout tumbling, UI adrift. Wire the Flexbox rules. Each Cast pulls a cluster of weak points into strike range. Alignment is the targeting mechanic.',
  enemy: { name: 'The Unaligned', tier: 'C', lore: 'A force that unmoors every layout anchor it touches. Flex containers collapse into column stacks. The only attack it cannot deflect is correct alignment — display:flex applied precisely.', svgVariant: 5 },
  variants: VARIANT_HTML,
  getStarterCode: () => START_CSS,
  buildPreview,
  buildCheckDoc: buildPreview,
  requiresBody: true,
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'FLOW DIAGNOSTIC',
  scannerUnit: 'FAILING',
  quiz: QUIZ,
  xpPerWard: 40,
  completionXp: 280,
  shardReward: 225,
  aiTitle: 'Gate 05 — The Gravity Anchor',
  aiRequirements: 'Use Flexbox to recreate a district layout: nav with display:flex, nav-links with display:flex, nav-cta with margin-left:auto to push right, card-row with display:flex, two-col with display:flex, hero-section centered with display:flex + justify-content:center + align-items:center.',
  completion: {
    entryLabel: 'Gravity Anchor — Deployed',
    icon: '⚓',
    chip: 'GRAVITY RESTORED',
    heading: 'Gravity Anchor Deployed.',
    body: 'Every element was drifting. Now they flow. The nav pushes its item right without touching the HTML. <strong>That\'s margin-left: auto at work.</strong>',
    rewards: [
      { label: '$SHARD EARNED', value: '+225' },
      { label: 'XP GAINED', value: '+280' },
      { label: 'ITEM', value: 'Gravity Anchor Fragment' },
      { label: 'ITEM', value: 'Flex License I' },
    ],
    nextLabel: 'GATE 06 UNLOCKED',
    nextTitle: 'Gate 06 — The Infinite Grid',
    nextSub: 'CSS Grid layouts · Rank D',
    nextIcon: '⬛',
  },
}
