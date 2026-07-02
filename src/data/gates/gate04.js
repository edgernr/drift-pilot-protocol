const VARIANT_HTML = [
  `<div class="city-wrap">
  <header class="city-header">
    <div class="city-logo">◈ SECTOR ZERO</div>
    <nav class="city-nav">
      <a class="nav-link" href="#">Status</a>
      <a class="nav-link" href="#">Systems</a>
      <a class="nav-link" href="#">Alerts</a>
    </nav>
  </header>
  <main class="city-main">
    <h1 class="page-title">District Status Report</h1>
    <p class="page-sub">Last synchronised: 06:44 UTC</p>
    <div class="card-grid">
      <div class="status-card status-card--ok"><div class="card-label">POWER GRID</div><div class="card-value">STABLE</div><div class="card-sub">108% capacity</div></div>
      <div class="status-card status-card--alert"><div class="card-label">SIGNAL TOWER</div><div class="card-value">DEGRADED</div><div class="card-sub">3 nodes offline</div></div>
      <div class="status-card status-card--ok"><div class="card-label">VAULT ACCESS</div><div class="card-value">SECURE</div><div class="card-sub">All checkpoints clear</div></div>
      <div class="status-card status-card--warning"><div class="card-label">DATA FLOW</div><div class="card-value">THROTTLED</div><div class="card-sub">42% throughput</div></div>
    </div>
    <table class="data-table"><thead><tr><th>System</th><th>Uptime</th><th>Status</th></tr></thead><tbody><tr><td>Auth Gateway</td><td>99.2%</td><td class="td-ok">ONLINE</td></tr><tr><td>District Router</td><td>97.1%</td><td class="td-warn">SLOW</td></tr><tr><td>Cipher Node</td><td>100%</td><td class="td-ok">ONLINE</td></tr></tbody></table>
  </main>
</div>`,
  `<div class="city-wrap">
  <header class="city-header">
    <div class="city-logo">⟐ COMMAND CENTRE</div>
    <nav class="city-nav">
      <a class="nav-link" href="#">Operations</a>
      <a class="nav-link" href="#">Intel</a>
      <a class="nav-link" href="#">Deploy</a>
    </nav>
  </header>
  <main class="city-main">
    <h1 class="page-title">Active Mission Board</h1>
    <p class="page-sub">Cycle updated: 14:20 UTC</p>
    <div class="card-grid">
      <div class="status-card status-card--ok"><div class="card-label">OP PHOENIX</div><div class="card-value">ACTIVE</div><div class="card-sub">Team Alpha deployed</div></div>
      <div class="status-card status-card--alert"><div class="card-label">OP NIGHTFALL</div><div class="card-value">DELAYED</div><div class="card-sub">Awaiting intel</div></div>
      <div class="status-card status-card--ok"><div class="card-label">OP GRIDLOCK</div><div class="card-value">COMPLETE</div><div class="card-sub">Objectives cleared</div></div>
      <div class="status-card status-card--warning"><div class="card-label">OP VOIDGATE</div><div class="card-value">PENDING</div><div class="card-sub">Clearance required</div></div>
    </div>
    <table class="data-table"><thead><tr><th>Unit</th><th>Strength</th><th>Status</th></tr></thead><tbody><tr><td>Strike Team Alpha</td><td>94%</td><td class="td-ok">DEPLOYED</td></tr><tr><td>Intel Unit 7</td><td>71%</td><td class="td-warn">STANDBY</td></tr><tr><td>Support Grid</td><td>100%</td><td class="td-ok">READY</td></tr></tbody></table>
  </main>
</div>`,
  `<div class="city-wrap">
  <header class="city-header">
    <div class="city-logo">※ REACTOR GRID</div>
    <nav class="city-nav">
      <a class="nav-link" href="#">Cores</a>
      <a class="nav-link" href="#">Cooling</a>
      <a class="nav-link" href="#">Alerts</a>
    </nav>
  </header>
  <main class="city-main">
    <h1 class="page-title">Core Systems Monitor</h1>
    <p class="page-sub">Last scan: 09:15 UTC</p>
    <div class="card-grid">
      <div class="status-card status-card--ok"><div class="card-label">PRIMARY CORE</div><div class="card-value">STABLE</div><div class="card-sub">100% output</div></div>
      <div class="status-card status-card--warning"><div class="card-label">SECONDARY CORE</div><div class="card-value">FLUCTUATING</div><div class="card-sub">±12% variance</div></div>
      <div class="status-card status-card--ok"><div class="card-label">COOLANT LOOP</div><div class="card-value">OPTIMAL</div><div class="card-sub">18°C nominal</div></div>
      <div class="status-card status-card--alert"><div class="card-label">CONTAINMENT</div><div class="card-value">WEAK</div><div class="card-sub">Field at 67%</div></div>
    </div>
    <table class="data-table"><thead><tr><th>Component</th><th>Load</th><th>Status</th></tr></thead><tbody><tr><td>Core Processor</td><td>88%</td><td class="td-ok">NOMINAL</td></tr><tr><td>Energy Distributor</td><td>64%</td><td class="td-warn">REDUCED</td></tr><tr><td>Thermal Regulator</td><td>100%</td><td class="td-ok">NOMINAL</td></tr></tbody></table>
  </main>
</div>`,
]

export const START_CSS = `/* EVA City — Color Protocol
   Establish the design system. Style the city. Never hardcode again.

   Phase 01: Define custom properties in :root
   Phase 02: Style every component using var(--your-variable)

   Checks to pass:
   1. :root block with custom properties
   2. 3+ color variables (any color values)
   3. 2+ spacing/size variables (px, rem, em, %, vh/vw)
   4. var(--...) used in rules outside :root
   5. Zero #hex colors outside :root
   6. .city-header styled with at least one var()
   7. .status-card styled with at least one var()
   8. @media responsive breakpoint */

:root {
  /* Colors */

  /* Spacing */

  /* Typography */
}

/* City wrapper */
.city-wrap {

}

/* Header */
.city-header {

}

.city-logo {

}

.city-nav {

}

.nav-link {

}

/* Page content */
.city-main {

}

.page-title {

}

.page-sub {

}

/* Card grid */
.card-grid {

}

/* Status cards */
.status-card {

}

.status-card--ok {

}

.status-card--alert {

}

.status-card--warning {

}

.card-label {

}

.card-value {

}

.card-sub {

}

/* Table */
.data-table {

}

.data-table th,
.data-table td {

}

.td-ok {

}

.td-warn {

}

/* Responsive */
@media (max-width: 768px) {

}
`

function isMeaningful(prop, value) {
  if (!value) return false
  const v = value.trim().toLowerCase()
  switch (prop) {
    case 'background-color': return v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent'
    case 'color': return v !== 'rgb(0, 0, 0)' && v !== ''
    case 'padding': return v !== '0px' && v !== ''
    case 'border-top-width':
    case 'border-bottom-width': return v !== '0px' && v !== ''
    case 'border-radius': return v !== '0px' && v !== ''
    default: return false
  }
}

function styledWithVar(doc, win, css, selector) {
  const ruleHasVar = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*var\\s*\\(\\s*--[^)]+\\)[^}]*\\}'
  ).test(css)
  if (!ruleHasVar) return false
  const el = doc.querySelector(selector)
  if (!el) return false
  const cs = win.getComputedStyle(el)
  return (
    isMeaningful('background-color', cs.backgroundColor) ||
    isMeaningful('color', cs.color) ||
    isMeaningful('padding', cs.padding) ||
    isMeaningful('border-top-width', cs.borderTopWidth) ||
    isMeaningful('border-bottom-width', cs.borderBottomWidth) ||
    isMeaningful('border-radius', cs.borderTopLeftRadius)
  )
}

const WARDS = [
  { id: 'root_vars', label: ':root custom properties declared', hint: 'Custom properties must be declared inside a special selector that targets the document root — making them available to every rule on the page. That selector is a CSS pseudo-class.', test: (doc, win, css) => /:root\s*\{[^}]*--[a-z]/.test(css) },
  { id: 'color_tokens', label: 'Color system: 3+ color variables', hint: 'Color variables need actual color values. Any valid CSS color format works. Make sure you have at least three separate color properties defined in your root block.', test: (doc, win, css) => { const rootBlock = css.match(/:root\s*\{([^}]+)\}/); if (!rootBlock) return false; const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':')); return lines.filter(l => { const v = l.slice(l.indexOf(':') + 1); return /#[0-9a-fA-F]{3,8}/.test(v) || /oklch\s*\(|rgba?\s*\(|hsla?\s*\(/.test(v) || /\b(?:white|black|red|blue|green|gray|grey|cyan|pink|purple|orange|yellow|transparent)\b/i.test(v) }).length >= 3 } },
  { id: 'spacing_tokens', label: 'Spacing system: 2+ size variables', hint: 'Spacing variables hold size values in a CSS length unit. Think about padding, gap, or margin values you\'ll reuse — define at least two of them.', test: (doc, win, css) => { const rootBlock = css.match(/:root\s*\{([^}]+)\}/); if (!rootBlock) return false; const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':')); return lines.filter(l => /[\d.]+(?:px|rem|em|%|vh|vw)/.test(l.slice(l.indexOf(':') + 1))).length >= 2 } },
  { id: 'var_used', label: 'Variables applied with var()', hint: 'To reference a custom property in a CSS rule, there\'s a function that takes the variable name as its argument. That function name is three letters long.', test: (doc, win, css) => { if (styledWithVar(doc, win, css, '.city-header')) return true; if (styledWithVar(doc, win, css, '.status-card')) return true; if (styledWithVar(doc, win, css, '.city-wrap')) return true; if (styledWithVar(doc, win, css, '.nav-link')) return true; return /var\s*\(\s*--/.test(css.replace(/:root\s*\{[^}]+\}/, '')) } },
  { id: 'no_hex_rules', label: 'Zero hardcoded #hex in rules', hint: 'Hardcoded color values directly in class rules defeat the purpose of a design system — you\'d need to change them in every rule. Every color used in a rule should come from a variable.', test: (doc, win, css) => !/#[0-9a-fA-F]{3,8}/.test(css.replace(/:root\s*\{[^}]+\}/, '')) },
  { id: 'header_styled', label: '.city-header styled with variables', hint: 'Find the .city-header element in the HTML, then write a CSS rule targeting it. Apply at least one of your defined variables to a visual property like background or color.', test: (doc, win, css) => styledWithVar(doc, win, css, '.city-header') },
  { id: 'card_styled', label: '.status-card styled with variables', hint: 'Find the .status-card element in the HTML and write a CSS rule for it. Apply at least one of your defined variables — the card should look styled, not bare.', test: (doc, win, css) => styledWithVar(doc, win, css, '.status-card') },
  { id: 'responsive', label: 'Responsive @media breakpoint added', hint: 'A media query wraps rules that only apply when a condition is met — like the viewport being a certain width. Write one that makes the layout adapt for different screen sizes.', test: (doc, win, css) => /@media\s*\([^)]*(?:max|min)-width[^)]*\)/.test(css) },
]

const QUIZ = {
  question: 'You change --primary-color in :root from teal to magenta. What happens to every element using var(--primary-color)?',
  options: [
    'Every element using var(--primary-color) instantly inherits the new value',
    'Nothing — you need to re-declare the variable in each rule that uses it',
    'Only elements inside the :root block are affected',
    'The browser throws a syntax error — custom properties cannot be reassigned',
  ],
  correct: 0,
}

function buildPreview(css, variantIndex, override) {
  const html = VARIANT_HTML[variantIndex] || VARIANT_HTML[0]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, -apple-system, sans-serif; } a { text-decoration: none; } table { border-collapse: collapse; width: 100%; }</style>`
  const overrideBlock = override ? `<style>${override}</style>` : ''
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style>${overrideBlock}</head><body>${html}</body></html>`
}

export function generateOverride(css) {
  const rootBlock = css.match(/:root\s*\{([^}]+)\}/)
  if (!rootBlock) return ''
  const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':'))
  const colorLines = lines.filter(l => {
    const v = l.slice(l.indexOf(':') + 1)
    return /#[0-9a-fA-F]{3,8}/.test(v) || /oklch\s*\(|rgba?\s*\(|hsla?\s*\(/.test(v) || /\b(?:white|black|red|blue|green|gray|grey|cyan|pink|purple|orange|yellow)\b/i.test(v)
  })
  if (colorLines.length === 0) return ''
  const OVERRIDE_PALETTE = ['oklch(0.72 0.28 340)', 'oklch(0.12 0.04 340)', 'oklch(0.92 0.04 340)', 'oklch(0.50 0.22 310)', 'oklch(0.35 0.14 330)']
  const overrides = colorLines.slice(0, 5).map((line, i) => {
    const prop = line.match(/(--[a-z][a-z0-9-]*)/)?.[1]
    return prop ? `  ${prop}: ${OVERRIDE_PALETTE[i % OVERRIDE_PALETTE.length]};` : ''
  }).filter(Boolean)
  return `:root {\n${overrides.join('\n')}\n}`
}

export default {
  id: 'gate04',
  gateNum: 4,
  title: 'Paint the City',
  rank: 'D',
  region: 'THE FOUNDRY',
  questId: 'act1-ch04',
  nextGate: 'quest5',
  ability: 'PALETTE CAST',
  language: 'css',
  narrator: 'You break out of the archive. The whole district is grayscale — The Colorless has eaten the city\'s palette. Define the Color Protocol: every color a variable, every rule a var(). Then activate the override. Watch the world come back online.',
  enemy: { name: 'The Colorless', tier: 'D', lore: 'A wraith that drains pigment from every surface it touches. It cannot be harmed by hardcoded values — only a true design system, where one variable change cascades everywhere, can pierce its null-field.', svgVariant: 4 },
  variants: VARIANT_HTML,
  getStarterCode: () => START_CSS,
  buildPreview,
  buildCheckDoc: (code, variantIndex) => buildPreview(code, variantIndex, ''),
  generateOverride,
  requiresBody: true,
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'COLOR AUDIT',
  scannerUnit: 'FAILING',
  quiz: QUIZ,
  xpPerWard: 30,
  completionXp: 240,
  shardReward: 195,
  aiTitle: 'Gate 04 — Paint the City',
  aiRequirements: 'Write a CSS design system using custom properties: define color and spacing variables in :root, use var() throughout all rules, no hardcoded hex values outside :root, include a @media breakpoint.',
  completion: {
    entryLabel: 'Color Protocol — Established',
    icon: '🎨',
    chip: 'PROTOCOL ESTABLISHED',
    heading: 'Color Protocol Established.',
    body: '847 hardcoded values collapsed into a single source of truth. You changed five variables and the entire city shifted. <strong>That\'s the cascade working the way it was designed.</strong>',
    rewards: [
      { label: '$SHARD EARNED', value: '+195' },
      { label: 'XP GAINED', value: '+240' },
      { label: 'ITEM', value: 'Color Protocol' },
      { label: 'RANK', value: 'CSS Architect I' },
    ],
    nextLabel: 'GATE 05 UNLOCKED',
    nextTitle: 'Gate 05 — The Gravity Anchor',
    nextSub: 'Flexbox layouts · Rank D',
    nextIcon: '⚓',
  },
}
