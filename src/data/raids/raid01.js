// ═══════════════════════════════════════════════════════════════════════════════
// RAID 01 — THE BROODGATE
// Boss: VARKUL, THE NULLHEART HYDRA — first herald of Gorgoroth Blackblood.
//
// Nine heads on three necks. Each head is a real code task: STRUCTURE (HTML) ×3,
// SKIN (CSS) ×3, NERVES (JS) ×3. Severing a head = all of its wards passing on a
// STRIKE — the sever is written to raid_heads (shared, realtime) and boss HP is
// DERIVED: 999 − severed × 111. No shared health counter, no write races.
//
// Rule #6: every head ships a machine-verified `solution` — proven end-to-end by
// scripts/solve-raid01.mjs through the real combat shell (dev route /__raidsolver).
// ═══════════════════════════════════════════════════════════════════════════════

export const BOSS_HP_MAX = 999
export const HEAD_DAMAGE = 111
export const PLAYER_HP_MAX = 100
export const STRIKE_FAIL_DMG = 15   // a STRIKE that severs nothing new = deflected
export const IDLE_BLEED_AFTER = 90  // seconds; then −1/s (brood feeds on stillness)
export const PARTY_MIN = 2
export const PARTY_MAX = 5
export const ENTRY_COST = 1000      // $SHARD, via existing burnRaidEntry

// Payout tiers — the EXISTING raid economy (raid:* rows, fixed XP → $SHARD):
// phase 1 = 100 XP / 250 $SHARD · phase 2 = 300 / 1050 · clear = 500 / 2350.
export const PAYOUTS = {
  p1:    { suffix: ':p1', xp: 100, shard: 250,  label: 'STRUCTURE NECK SEVERED' },
  p2:    { suffix: ':p2', xp: 300, shard: 1050, label: 'SKIN NECK SEVERED' },
  clear: { suffix: '',    xp: 500, shard: 2350, label: 'VARKUL SLAIN' },
}

export const PHASES = [
  { n: 1, key: 'structure', label: 'PHASE I — STRUCTURE', sub: 'The bone neck. Three heads of broken markup.', color: '#3df0e8' },
  { n: 2, key: 'skin',      label: 'PHASE II — SKIN',      sub: 'The hide neck. Three heads of ruined style.',  color: '#f5c453' },
  { n: 3, key: 'nerves',    label: 'PHASE III — NERVES',   sub: 'The live neck. Three heads of dead signal.',   color: '#ff3d8b' },
]

// ─── Shared doc builders ───────────────────────────────────────────────────────

const DARK_BASE = `<style>
  html { font-size: 10px; }
  body { margin: 0; padding: 10px 12px; background: #0a0a12; color: #cfe3e0;
         font-family: 'Courier New', monospace; line-height: 1.5; }
  a { color: #3df0e8; }
</style>`

const cssDoc = (scaffold, css) =>
  `<!DOCTYPE html><html><head>${DARK_BASE}<style>${css}</style></head><body>${scaffold}</body></html>`

const jsDoc = (scaffold, js) =>
  `<!DOCTYPE html><html><head>${DARK_BASE}</head><body>${scaffold}<script>${js}<\/script></body></html>`

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE I — STRUCTURE (HTML)
// ═══════════════════════════════════════════════════════════════════════════════

const H1_STARTER = `<html>
<head>
  <title>BROODGATE — Breach Bulletin</title>
</head>
<body>

  <h1>BREACH CONFIRMED — THE FLOOR

  <p><em>All licensed hunters: the Broodgate is open.</p></em>

  <p>Nine heads. Nine wounds. Sever them all.</p>

  <ul>
    <li>Do not enter alone
    <li>Do not idle — the brood feeds on stillness
  </ul>

</body>
</html>`

const H1_SOLUTION = `<!DOCTYPE html>
<html>
<head>
  <title>BROODGATE — Breach Bulletin</title>
</head>
<body>

  <h1>BREACH CONFIRMED — THE FLOOR</h1>

  <p><em>All licensed hunters: the Broodgate is open.</em></p>

  <p>Nine heads. Nine wounds. Sever them all.</p>

  <ul>
    <li>Do not enter alone</li>
    <li>Do not idle — the brood feeds on stillness</li>
  </ul>

</body>
</html>`

const H2_STARTER = `<!DOCTYPE html>
<html>
<head>
  <title>Hunter Ledger</title>
</head>
<body>

  <div class="header"><div class="title">HUNTER LEDGER</div></div>

  <div class="nav">
    <a href="#kills">Kills</a>
    <a href="#bounties">Bounties</a>
  </div>

  <div class="main">
    <div class="section" id="kills">
      <div class="heading">Confirmed Kills</div>
      <p>Wraith of the Document Tomb — confirmed.</p>
    </div>
  </div>

  <div class="footer">Association of Hunters — Seoul</div>

</body>
</html>`

const H2_SOLUTION = `<!DOCTYPE html>
<html>
<head>
  <title>Hunter Ledger</title>
</head>
<body>

  <header><h1>HUNTER LEDGER</h1></header>

  <nav>
    <a href="#kills">Kills</a>
    <a href="#bounties">Bounties</a>
  </nav>

  <main>
    <section id="kills">
      <h2>Confirmed Kills</h2>
      <p>Wraith of the Document Tomb — confirmed.</p>
    </section>
  </main>

  <footer>Association of Hunters — Seoul</footer>

</body>
</html>`

const H3_STARTER = `<!DOCTYPE html>
<html>
<head>
  <title>Breach Report</title>
</head>
<body>

  <h1>Breach Report</h1>

  <img src="sigil.svg">

  <form>
    <input type="text" id="hunter" placeholder="Hunter name">
    <input id="email" placeholder="Email">
    <div onclick="send()">SEND</div>
  </form>

</body>
</html>`

const H3_SOLUTION = `<!DOCTYPE html>
<html>
<head>
  <title>Breach Report</title>
</head>
<body>

  <h1>Breach Report</h1>

  <img src="sigil.svg" alt="Association breach sigil">

  <form>
    <label for="hunter">Hunter name</label>
    <input type="text" id="hunter" placeholder="Hunter name" required>
    <label for="email">Email</label>
    <input type="email" id="email" placeholder="Email" required>
    <button type="submit">SEND</button>
  </form>

</body>
</html>`

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE II — SKIN (CSS)
// ═══════════════════════════════════════════════════════════════════════════════

const H4_SCAFFOLD = `
  <div class="card">
    <h2 class="card-title">VARKUL</h2>
    <p class="card-body">Nullheart Hydra — nine heads, one heart of static.</p>
    <span class="tag">S-CLASS THREAT</span>
  </div>`

const H4_STARTER = `/* THE MOLTED HIDE — the threat card regrew wrong. Reshape it. */

.card {
  background: #111120;
  /* TODO: 16px padding on all sides */
  /* TODO: 1px solid #3df0e8 border */
  /* TODO: 6px border-radius */
}

card-title {
  /* BUG: this selector matches nothing — the title never turns cyan */
  color: #3df0e8;
}

.tag {
  /* TODO: display inline-block · 4px 10px padding · background #ff3d8b */
}`

const H4_SOLUTION = `/* THE MOLTED HIDE — the threat card regrew wrong. Reshape it. */

.card {
  background: #111120;
  padding: 16px;
  border: 1px solid #3df0e8;
  border-radius: 6px;
}

.card-title {
  color: #3df0e8;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: #ff3d8b;
}`

const H5_SCAFFOLD = `
  <nav class="raid-nav">
    <span class="logo">BROODGATE</span>
    <a href="#">Heads</a>
    <a href="#">Party</a>
    <a href="#">Loot</a>
  </nav>
  <div class="hero">
    <button class="cta">ENTER THE GATE</button>
  </div>`

const H5_STARTER = `/* THE COILED SPINE — the layout bones are limp. Flex them. */

.raid-nav {
  border-bottom: 1px solid #1e1e32;
  padding: 10px 14px;
  /* TODO: lay children out in a flex row, vertically centered, 24px gap */
}

.logo {
  color: #3df0e8;
  font-weight: bold;
  /* TODO: push the links to the right side (auto margin) */
}

.hero {
  height: 200px;
  /* TODO: center .cta on BOTH axes with flexbox */
}`

const H5_SOLUTION = `/* THE COILED SPINE — the layout bones are limp. Flex them. */

.raid-nav {
  border-bottom: 1px solid #1e1e32;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  color: #3df0e8;
  font-weight: bold;
  margin-right: auto;
}

.hero {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}`

const H6_SCAFFOLD = `
  <div class="scale-grid">
    <div class="scale"></div><div class="scale"></div><div class="scale"></div>
    <div class="scale"></div><div class="scale"></div><div class="scale"></div>
  </div>`

const H6_STARTER = `/* THE SHIFTING SCALES — six scales, no formation. Grid them. */

.scale-grid {
  /* TODO: display grid · 3 equal columns · 12px gap */
}

.scale {
  background: #111120;
  border: 1px solid #1e1e32;
  height: 80px;
}

/* TODO: below 768px the scales must collapse to a SINGLE column —
   write the media query */`

const H6_SOLUTION = `/* THE SHIFTING SCALES — six scales, no formation. Grid them. */

.scale-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.scale {
  background: #111120;
  border: 1px solid #1e1e32;
  height: 80px;
}

@media (max-width: 768px) {
  .scale-grid {
    grid-template-columns: 1fr;
  }
}`

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE III — NERVES (JS)
// ═══════════════════════════════════════════════════════════════════════════════

const H7_SCAFFOLD = `
  <div id="status-panel">
    <span id="status">UNKNOWN</span>
    <span id="threat"></span>
  </div>`

const H7_STARTER = `// THE FIRST SYNAPSE — it misfires. Open the CONSOLE: it dies with a
// TypeError before it does anything. Find why, fix it, then finish the wiring.

const panel = document.querySelector('#status-pannel')
panel.classList.add('online')

// TODO: set the #status element's text to exactly: LINKED
// TODO: set the #threat element's text to exactly: VARKUL`

const H7_SOLUTION = `// THE FIRST SYNAPSE — it misfires. Open the CONSOLE: it dies with a
// TypeError before it does anything. Find why, fix it, then finish the wiring.

const panel = document.querySelector('#status-panel')
panel.classList.add('online')

document.querySelector('#status').textContent = 'LINKED'
document.querySelector('#threat').textContent = 'VARKUL'`

const H8_SCAFFOLD = `
  <button id="pulse-btn">SEND PULSE</button>
  <div id="pulse-light" class="dark" style="width:40px;height:40px;border:1px solid #1e1e32;margin-top:10px"></div>`

const H8_STARTER = `// THE TWITCHING CORD — a dead nerve. Wire the click.
//
// TODO: when #pulse-btn is clicked:
//   1. TOGGLE the class "lit" on #pulse-light  (toggle — not add)
//   2. set the button's text to exactly: PULSE SENT`

const H8_SOLUTION = `// THE TWITCHING CORD — a dead nerve. Wire the click.

const btn = document.querySelector('#pulse-btn')
const light = document.querySelector('#pulse-light')

btn.addEventListener('click', () => {
  light.classList.toggle('lit')
  btn.textContent = 'PULSE SENT'
})`

const H9_SCAFFOLD = `
  <ul id="head-list"></ul>
  <div id="crown-status"></div>`

const H9_STARTER = `// THE SCREAMING CROWN — the final head. It knows its brothers are dead.
// Make it read the list.

const severed = ['HOLLOW SKULL', 'FALSE TONGUE', 'BLIND EYE', 'MOLTED HIDE',
                 'COILED SPINE', 'SHIFTING SCALES', 'FIRST SYNAPSE', 'TWITCHING CORD']

// TODO: render ONE <li> into #head-list per entry in the array
//       each li's text must be exactly:  <name> — SEVERED
// TODO: after rendering all 8, set #crown-status text to exactly: THE CROWN FALLS`

const H9_SOLUTION = `// THE SCREAMING CROWN — the final head. It knows its brothers are dead.
// Make it read the list.

const severed = ['HOLLOW SKULL', 'FALSE TONGUE', 'BLIND EYE', 'MOLTED HIDE',
                 'COILED SPINE', 'SHIFTING SCALES', 'FIRST SYNAPSE', 'TWITCHING CORD']

const list = document.querySelector('#head-list')
severed.forEach(name => {
  const li = document.createElement('li')
  li.textContent = name + ' — SEVERED'
  list.appendChild(li)
})

document.querySelector('#crown-status').textContent = 'THE CROWN FALLS'`

// ═══════════════════════════════════════════════════════════════════════════════
// THE NINE HEADS
// ═══════════════════════════════════════════════════════════════════════════════

export const HEADS = [
  // ── PHASE I — STRUCTURE ──────────────────────────────────────────────────────
  {
    id: 'h1', phase: 1, name: 'THE HOLLOW SKULL', glyph: '◐',
    language: 'html', filename: 'bulletin.html',
    brief: {
      what: 'The skull is a breach bulletin whose bones never set — tags open and never close, and the whole document renders in quirks mode.',
      skill: 'HTML document structure — DOCTYPE, closing tags, correct nesting.',
      objective: 'Four structural wounds. Close every open tag, seal the nesting, declare the DOCTYPE. All four wards green → STRIKE to sever.',
    },
    starter: H1_STARTER,
    solution: H1_SOLUTION,
    buildPreview: (code) => DARK_BASE + code,
    buildCheckDoc: (code) => code,
    wards: [
      { id: 'doctype', label: 'Missing DOCTYPE — page renders in quirks mode',
        hint: 'The very first line of a modern HTML document declares the document type. It starts with <! and comes before <html>.',
        test: (doc) => !!doc.doctype && doc.doctype.name?.toLowerCase() === 'html' && doc.compatMode === 'CSS1Compat' },
      { id: 'h1close', label: 'Unclosed <h1> — the heading swallows the page',
        hint: 'Heading tags come in pairs. Find where the heading text ends and seal it.',
        test: (doc, win, code) => /<\/h1>/i.test(code) },
      { id: 'nesting', label: 'Crossed nesting — </p> closes before </em>',
        hint: 'Last opened, first closed. <em> opened inside <p>, so </em> must come before </p>.',
        test: (doc, win, code) => /<\/em>/i.test(code) && !/<\/p>\s*<\/em>/i.test(code) },
      { id: 'liclose', label: 'Unclosed <li> items in the warning list',
        hint: 'Each list item opens with <li> and should seal with its own closing tag.',
        test: (doc, win, code) => (code.match(/<\/li>/gi) || []).length >= 2 },
    ],
  },
  {
    id: 'h2', phase: 1, name: 'THE FALSE TONGUE', glyph: '◑',
    language: 'html', filename: 'ledger.html',
    brief: {
      what: 'This head speaks only in <div> — a page with no meaning in its bones. Screen readers hear nothing. Search engines see soup.',
      skill: 'Semantic HTML — header, nav, main, section, footer, heading hierarchy.',
      objective: 'Replace the classed divs with real semantic elements and give the page one <h1> and a proper <h2>. Five wards.',
    },
    starter: H2_STARTER,
    solution: H2_SOLUTION,
    buildPreview: (code) => DARK_BASE + code,
    buildCheckDoc: (code) => code,
    wards: [
      { id: 'headfoot', label: 'No <header> / <footer> elements',
        hint: 'The page banner and the closing line each have a dedicated semantic element — not a classed div.',
        test: (doc) => !!doc.querySelector('header') && !!doc.querySelector('footer') },
      { id: 'nav', label: 'Navigation is a nameless <div>',
        hint: 'A group of navigation links belongs inside the element literally named for it.',
        test: (doc) => doc.querySelectorAll('nav a').length >= 2 },
      { id: 'mainsec', label: 'No <main> landmark / kills is not a <section>',
        hint: 'The primary content wrapper is <main>; the kills block is a <section> that keeps its id.',
        test: (doc) => !!doc.querySelector('main section#kills') },
      { id: 'headings', label: 'No heading hierarchy — titles are divs',
        hint: 'The page title should be the one and only <h1>; the section title an <h2>.',
        test: (doc) => doc.querySelectorAll('h1').length === 1 && doc.querySelectorAll('h2').length >= 1 },
      { id: 'nosoup', label: 'Div-soup remains (div.header / .nav / .main / .footer)',
        hint: 'Once the real elements are in place, the old classed wrappers must be gone entirely.',
        test: (doc) => !doc.querySelector('div.header, div.nav, div.main, div.footer') },
    ],
  },
  {
    id: 'h3', phase: 1, name: 'THE BLIND EYE', glyph: '◒',
    language: 'html', filename: 'report.html',
    brief: {
      what: 'A report form no one can use: unlabeled inputs, an image with no description, a fake button made of <div>. To a keyboard or a screen reader, this page is a wall.',
      skill: 'Forms & accessibility — label/for, input types, required, alt text, real buttons.',
      objective: 'Label both inputs, type + require them properly, describe the image, replace the div-button with a real submit button.',
    },
    starter: H3_STARTER,
    solution: H3_SOLUTION,
    buildPreview: (code) => DARK_BASE + code,
    buildCheckDoc: (code) => code,
    wards: [
      { id: 'alt', label: 'Image has no alt text — invisible to screen readers',
        hint: 'Every <img> needs an alt attribute describing what it shows.',
        test: (doc) => { const img = doc.querySelector('img'); return !!img && (img.getAttribute('alt') || '').trim().length > 0 } },
      { id: 'labels', label: 'Inputs have no <label> — placeholder is not a label',
        hint: 'Each input needs a <label> whose for attribute matches the input\'s id.',
        test: (doc) => !!doc.querySelector('label[for="hunter"]') && !!doc.querySelector('label[for="email"]') },
      { id: 'types', label: 'Email input untyped · nothing is required',
        hint: 'The email field should be type="email"; both fields should carry the required attribute.',
        test: (doc) => {
          const e = doc.getElementById('email'); const h = doc.getElementById('hunter')
          return !!e && e.type === 'email' && e.required && !!h && h.required
        } },
      { id: 'realbtn', label: 'Submit is a <div onclick> — not a button',
        hint: 'Forms submit with <button type="submit">. A clickable div has no keyboard support and no form semantics.',
        test: (doc) => !!doc.querySelector('form button[type="submit"]') && !doc.querySelector('form div') },
    ],
  },

  // ── PHASE II — SKIN ──────────────────────────────────────────────────────────
  {
    id: 'h4', phase: 2, name: 'THE MOLTED HIDE', glyph: '◓',
    language: 'css', filename: 'hide.css',
    brief: {
      what: 'The hydra shed its skin and the threat card beneath grew back raw — no padding, no border, a selector that grips nothing.',
      skill: 'CSS selectors & the box model — class selectors, padding, border, radius, inline-block.',
      objective: 'Fix the broken selector (watch the leading dot), then rebuild the card\'s box: padding, border, radius, and the threat tag.',
    },
    starter: H4_STARTER,
    solution: H4_SOLUTION,
    buildPreview: (code) => cssDoc(H4_SCAFFOLD, code),
    buildCheckDoc: (code) => cssDoc(H4_SCAFFOLD, code),
    wards: [
      { id: 'pad', label: '.card has no padding — content touches the edge',
        hint: 'One shorthand property sets all four sides at once. 16px.',
        test: (doc, win) => { const c = doc.querySelector('.card'); if (!c) return false
          const s = win.getComputedStyle(c); return s.paddingTop === '16px' && s.paddingLeft === '16px' } },
      { id: 'border', label: '.card has no border',
        hint: '1px, solid, #3df0e8 — one shorthand line.',
        test: (doc, win) => { const c = doc.querySelector('.card'); if (!c) return false
          const s = win.getComputedStyle(c)
          return s.borderTopWidth === '1px' && s.borderTopStyle === 'solid' && s.borderTopColor === 'rgb(61, 240, 232)' } },
      { id: 'selector', label: 'Title never turns cyan — a selector matches nothing',
        hint: 'Class selectors start with a dot. card-title without the dot looks for a <card-title> element that doesn\'t exist.',
        test: (doc, win) => { const t = doc.querySelector('.card-title'); if (!t) return false
          return win.getComputedStyle(t).color === 'rgb(61, 240, 232)' } },
      { id: 'tag', label: '.tag is bare text — needs box + magenta background',
        hint: 'Spans are inline — padding needs display: inline-block to behave. Background #ff3d8b.',
        test: (doc, win) => { const t = doc.querySelector('.tag'); if (!t) return false
          const s = win.getComputedStyle(t)
          return s.display === 'inline-block' && s.backgroundColor === 'rgb(255, 61, 139)' && s.paddingLeft === '10px' } },
    ],
  },
  {
    id: 'h5', phase: 2, name: 'THE COILED SPINE', glyph: '◔',
    language: 'css', filename: 'spine.css',
    brief: {
      what: 'The spine holds the raid\'s command bar and its war banner — but every vertebra lies in a heap. Nothing aligns; nothing centers.',
      skill: 'Flexbox — flex rows, align-items, gap, auto margins, two-axis centering.',
      objective: 'Flex the nav into an aligned row with the logo pushed left of the links, then center the ENTER button dead-center of the hero.',
    },
    starter: H5_STARTER,
    solution: H5_SOLUTION,
    buildPreview: (code) => cssDoc(H5_SCAFFOLD, code),
    buildCheckDoc: (code) => cssDoc(H5_SCAFFOLD, code),
    wards: [
      { id: 'flexrow', label: 'Nav is a vertical heap — not a flex row',
        hint: 'display: flex on the container. Rows are the default direction.',
        test: (doc, win) => { const n = doc.querySelector('.raid-nav'); if (!n) return false
          const s = win.getComputedStyle(n); return s.display === 'flex' && s.alignItems === 'center' } },
      { id: 'gap', label: 'Links are glued together — no gap',
        hint: 'Flex containers space their children with the gap property. 24px.',
        test: (doc, win) => { const n = doc.querySelector('.raid-nav'); if (!n) return false
          return win.getComputedStyle(n).columnGap === '24px' } },
      { id: 'push', label: 'Links are not pushed to the right side',
        hint: 'An auto margin on one flex child absorbs all free space on that side. margin-right: auto on the logo shoves everything after it to the far edge.',
        test: (doc) => {
          const n = doc.querySelector('.raid-nav'); const links = doc.querySelectorAll('.raid-nav a')
          if (!n || links.length < 3) return false
          const last = links[links.length - 1].getBoundingClientRect()
          const nav = n.getBoundingClientRect()
          return nav.right - last.right < 60 && last.width > 0
        } },
      { id: 'center', label: 'ENTER button is not centered in the hero',
        hint: 'On the container: display flex, align-items center (vertical), justify-content center (horizontal).',
        test: (doc) => {
          const h = doc.querySelector('.hero'); const b = doc.querySelector('.cta')
          if (!h || !b) return false
          const hr = h.getBoundingClientRect(); const br = b.getBoundingClientRect()
          const dx = Math.abs((hr.left + hr.width / 2) - (br.left + br.width / 2))
          const dy = Math.abs((hr.top + hr.height / 2) - (br.top + br.height / 2))
          return dx < 8 && dy < 8
        } },
    ],
  },
  {
    id: 'h6', phase: 2, name: 'THE SHIFTING SCALES', glyph: '◕',
    language: 'css', filename: 'scales.css',
    brief: {
      what: 'Six armor scales that should lock into a 3-wide lattice — and reshape into a single column when the viewport narrows. Right now they just stack.',
      skill: 'CSS Grid + responsive design — grid-template-columns, repeat(), gap, media queries.',
      objective: 'Grid the scales 3 across with a 12px gap, then write the ≤768px media query that collapses them to one column.',
    },
    starter: H6_STARTER,
    solution: H6_SOLUTION,
    buildPreview: (code) => cssDoc(H6_SCAFFOLD, code),
    buildCheckDoc: (code) => cssDoc(H6_SCAFFOLD, code),
    wards: [
      { id: 'grid', label: '.scale-grid is not a grid',
        hint: 'display: grid on the container.',
        test: (doc, win) => { const g = doc.querySelector('.scale-grid'); if (!g) return false
          return win.getComputedStyle(g).display === 'grid' } },
      { id: 'cols', label: 'Not three equal columns',
        hint: 'repeat(3, 1fr) — three tracks, one fraction of free space each.',
        test: (doc, win) => { const g = doc.querySelector('.scale-grid'); if (!g) return false
          const cols = win.getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean)
          if (cols.length !== 3) return false
          const w = cols.map(parseFloat)
          return Math.abs(w[0] - w[1]) < 2 && Math.abs(w[1] - w[2]) < 2 } },
      { id: 'gap', label: 'Scales are welded together — no gap',
        hint: 'The gap property works on grid exactly like on flex. 12px.',
        test: (doc, win) => { const g = doc.querySelector('.scale-grid'); if (!g) return false
          return win.getComputedStyle(g).columnGap === '12px' } },
      { id: 'mq', label: 'No mobile collapse — scales stay 3-wide on phones',
        hint: '@media (max-width: 768px) { … } — inside it, override the columns to a single 1fr track.',
        test: (doc, win, code) => {
          const m = code.match(/@media[^{]*max-width\s*:\s*768px[^{]*\{([\s\S]*)\}/i)
          if (!m) return false
          return /grid-template-columns\s*:\s*1fr\s*[;}]/.test(m[1] + '}')
        } },
    ],
  },

  // ── PHASE III — NERVES ───────────────────────────────────────────────────────
  {
    id: 'h7', phase: 3, name: 'THE FIRST SYNAPSE', glyph: '◖',
    language: 'js', filename: 'synapse.js',
    brief: {
      what: 'The first live nerve — and it\'s misfiring. The script dies on line 4 with a TypeError before doing anything. The CONSOLE knows exactly why.',
      skill: 'DOM selection & debugging — querySelector, textContent, reading a console error.',
      objective: 'Open the console, read the TypeError, fix the selector, then wire the two status readouts.',
    },
    starter: H7_STARTER,
    solution: H7_SOLUTION,
    buildPreview: (code) => jsDoc(H7_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(H7_SCAFFOLD, code),
    wards: [
      { id: 'alive', label: 'Script crashes — panel never comes online',
        hint: 'The console shows a TypeError: reading classList of null. querySelector returned null — compare the selector to the actual id, letter by letter.',
        test: (doc) => { const p = doc.getElementById('status-panel'); return !!p && p.classList.contains('online') } },
      { id: 'status', label: '#status still reads UNKNOWN',
        hint: 'Select #status and set its textContent to exactly LINKED.',
        test: (doc) => doc.getElementById('status')?.textContent === 'LINKED' },
      { id: 'threat', label: '#threat is empty — no target designated',
        hint: 'Same move: #threat\'s textContent becomes exactly VARKUL.',
        test: (doc) => doc.getElementById('threat')?.textContent === 'VARKUL' },
    ],
  },
  {
    id: 'h8', phase: 3, name: 'THE TWITCHING CORD', glyph: '◗',
    language: 'js', filename: 'cord.js',
    brief: {
      what: 'A nerve that should fire on command — but no one connected it. The pulse button is dead weight.',
      skill: 'Events — addEventListener, classList.toggle, updating the DOM in a handler.',
      objective: 'Wire the click: each press toggles the light\'s "lit" class (on, off, on…) and stamps the button text.',
    },
    starter: H8_STARTER,
    solution: H8_SOLUTION,
    buildPreview: (code) => jsDoc(H8_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(H8_SCAFFOLD, code),
    wards: [
      // Ward order matters and is guaranteed (tests run top to bottom on one doc):
      // ward 1 performs click #1, ward 2 performs click #2.
      { id: 'fires', label: 'Click does nothing — light stays dark',
        hint: 'addEventListener("click", …) on the button; toggle the class inside the handler and set the button text.',
        test: (doc) => { const b = doc.getElementById('pulse-btn'); if (!b) return false
          b.click()
          return doc.getElementById('pulse-light')?.classList.contains('lit') === true
            && b.textContent === 'PULSE SENT' } },
      { id: 'toggles', label: 'Second click must switch the light OFF (toggle, not add)',
        hint: 'classList.toggle flips the class each call. classList.add only ever turns it on.',
        test: (doc) => { const b = doc.getElementById('pulse-btn'); if (!b) return false
          b.click()
          return doc.getElementById('pulse-light')?.classList.contains('lit') === false } },
    ],
  },
  {
    id: 'h9', phase: 3, name: 'THE SCREAMING CROWN', glyph: '◍',
    language: 'js', filename: 'crown.js',
    brief: {
      what: 'The last head. It holds the names of its eight dead brothers and refuses to speak them. Make it read the list — and it falls.',
      skill: 'Arrays & DOM building — forEach/loops, createElement, appendChild, textContent.',
      objective: 'Render one <li> per severed head into the list, exact text "<name> — SEVERED", then declare THE CROWN FALLS.',
    },
    starter: H9_STARTER,
    solution: H9_SOLUTION,
    buildPreview: (code) => jsDoc(H9_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(H9_SCAFFOLD, code),
    wards: [
      { id: 'count', label: 'The list is empty — eight names unspoken',
        hint: 'Loop the array (forEach or for…of), createElement("li") for each, append into #head-list.',
        test: (doc) => doc.querySelectorAll('#head-list li').length === 8 },
      { id: 'text', label: 'Names spoken wrong — exact format required',
        hint: 'Each li\'s text is the name, a space, an em-dash (—), a space, SEVERED. Copy the dash from the comment.',
        test: (doc) => {
          const lis = doc.querySelectorAll('#head-list li')
          if (lis.length !== 8) return false
          return lis[0].textContent === 'HOLLOW SKULL — SEVERED' && lis[7].textContent === 'TWITCHING CORD — SEVERED'
        } },
      { id: 'falls', label: 'The crown still stands — no declaration',
        hint: 'After the loop: #crown-status textContent becomes exactly THE CROWN FALLS.',
        test: (doc) => doc.getElementById('crown-status')?.textContent === 'THE CROWN FALLS' },
    ],
  },
]

export const HEADS_BY_ID = Object.fromEntries(HEADS.map(h => [h.id, h]))
export const PHASE_HEADS = (n) => HEADS.filter(h => h.phase === n)

// ═══════════════════════════════════════════════════════════════════════════════
// HUNTER SPECIALIZATIONS — chosen in the War Room, stored in raid_members.role.
// Soft guidance ONLY: a specialization tells the party which neck you came to
// cut. Any hunter can still claim and sever any unlocked head — the Gate does
// not check your license class, only your code.
// ═══════════════════════════════════════════════════════════════════════════════

export const ROLES = {
  bonesaw: {
    id: 'bonesaw', label: 'BONESAW', glyph: '◐', color: '#3df0e8', neck: 1,
    owns: 'THE STRUCTURE NECK — HTML',
    duty: 'Opens the raid. Nothing on Varkul unlocks until your neck falls.',
    heads: PHASE_HEADS(1).map(h => h.name),
    skills: PHASE_HEADS(1).map(h => h.brief.skill),
    flavor: 'Bones first, hunter. A beast framed wrong falls under its own weight.',
  },
  flayer: {
    id: 'flayer', label: 'FLAYER', glyph: '◓', color: '#f5c453', neck: 2,
    owns: 'THE SKIN NECK — CSS',
    duty: 'Second cut. Your heads unlock the moment the bones are down — be ready.',
    heads: PHASE_HEADS(2).map(h => h.name),
    skills: PHASE_HEADS(2).map(h => h.brief.skill),
    flavor: 'The hide remembers every bad cut ever made on it. Yours will be clean.',
  },
  nervecutter: {
    id: 'nervecutter', label: 'NERVECUTTER', glyph: '◖', color: '#ff3d8b', neck: 3,
    owns: 'THE NERVES NECK — JS',
    duty: 'The closer. The last neck is live wire — your STRIKE ends Varkul.',
    heads: PHASE_HEADS(3).map(h => h.name),
    skills: PHASE_HEADS(3).map(h => h.brief.skill),
    flavor: 'Kill the signal and all that is left is meat. Finish it.',
  },
  slayer: {
    id: 'slayer', label: 'SLAYER', glyph: '⚔', color: '#eaf6f5', neck: null,
    owns: 'EVERY NECK — generalist',
    duty: 'The floater. No fixed neck — backfill whichever head is starving.',
    heads: null, // floats — expected to claim whatever head is open
    skills: ['The full kit — HTML structure, CSS layout, JS behavior, at raid tempo.'],
    flavor: 'No neck is yours, so every neck is yours. Go where the party bleeds.',
  },
}

export const ROLE_LIST = Object.values(ROLES)
export const ROLE_IDS = Object.keys(ROLES)

// ═══════════════════════════════════════════════════════════════════════════════
// RAID DOSSIER — everything shown to hunters BEFORE they enter (the War Room)
// ═══════════════════════════════════════════════════════════════════════════════

export const RAID01 = {
  id: 'raid01',
  code: 'RAID 01',
  title: 'THE BROODGATE',
  region: 'THE FLOOR · BREACH SITE ZERO',
  boss: {
    name: 'VARKUL, THE NULLHEART HYDRA',
    tier: 'B',
    lore: 'First herald of Gorgoroth Blackblood. When the Broodgate breached, every page that ever died unfinished poured through the wound and fused — nine heads on three necks, one heart of pure static. The Association does not have a confirmed kill. You will be the first, or you will be a case study.',
    threat: 'Herald-class. Solo entry is lethal by policy: the Gate will not open for fewer than two licensed hunters.',
  },
  handlerIntro: 'VERA // WAR ROOM: Listen once, because the Gate won\'t repeat it. Varkul has nine heads and every one of them is a wound in real code. You sever a head by fixing what it guards — every ward green, then STRIKE. The necks fall in order: STRUCTURE, then SKIN, then NERVES. Claim a head so your party doesn\'t double-cut, watch the feed, and do not idle — the brood feeds on stillness. Payouts clear per neck, automatically, to every hunter in the party. Bring at least one friend. Bring your best code.',
  rules: [
    { k: 'PARTY',   v: `${PARTY_MIN}–${PARTY_MAX} hunters. The Gate stays sealed below ${PARTY_MIN}.` },
    { k: 'ENTRY',   v: `${ENTRY_COST} $SHARD per hunter — burned on join, refunded in full if you leave before the raid starts.` },
    { k: 'THE BOSS', v: `${BOSS_HP_MAX} HP across nine heads. Severing a head deals ${HEAD_DAMAGE} damage — the only damage Varkul takes. Boss HP is shared by the whole party, live.` },
    { k: 'HEADS',   v: 'Claim a head to target it (your party sees the claim). All of its wards green + STRIKE = severed. Severed is forever.' },
    { k: 'PHASES',  v: 'Three necks × three heads. A neck\'s heads unlock only when the previous neck is fully severed.' },
    { k: 'YOUR HP', v: `${PLAYER_HP_MAX} HP, personal. A deflected STRIKE (nothing new passing) costs ${STRIKE_FAIL_DMG}. Idling past ${IDLE_BLEED_AFTER}s bleeds 1/s. Falling costs you nothing but time — respawn at the Gate, progress intact.` },
    { k: 'PAYOUT',  v: 'Automatic, per hunter, per neck: Neck I = 100 XP + 250 $SHARD · Neck II = 300 XP + 1050 $SHARD · Varkul slain = 500 XP + 2350 $SHARD. Full clear: 900 XP + 3650 $SHARD each.' },
    { k: 'CONDUCT', v: 'Anti-cheat is live inside the Gate. Paste is blocked. Every line you sever a head with is a line you typed.' },
  ],
  // Field Manual served through the Hunter Browser inside the raid.
  guide: {
    slug: 'raid-protocol',
    tag: 'FM-R1',
    title: 'Raid Protocol — The Broodgate',
    intro: 'VERA // FIELD MANUAL: raids are not gates. A gate tests whether you learned a skill. A raid tests whether five people can aim nine skills at one monster without cutting each other. Read this before your first STRIKE.',
    sections: [
      { heading: 'Severing a head', body: 'Select a head in the rail, <strong>CLAIM</strong> it so your party sees you on it, and fix the code it guards. Wards go green live as you type. When every ward on the head is green, <strong>STRIKE</strong> — the sever is permanent, the damage is shared, and the whole party sees the head die.' },
      { heading: 'The necks fall in order', body: 'STRUCTURE (HTML) → SKIN (CSS) → NERVES (JS). A neck\'s three heads unlock together when the previous neck is fully severed. Split the three heads across the party — three hunters on three heads is the tempo the Gate was tuned for.' },
      { heading: 'Reading the fight', body: 'The boss HP bar and event feed are live for everyone. <code>CLAIMED</code> means a hunter is on it — pick a different head. Your own HP is yours alone: deflected strikes and idling drain it, falling just sends you back to the Gate mouth with your code intact.' },
      { heading: 'Getting paid', body: 'Payouts are automatic and individual — every hunter in the party collects the full neck bounty when the neck falls, whether or not their blade made the final cut. Carrying your party still pays; being carried still teaches.' },
    ],
    links: [
      { label: 'MDN — HTML, CSS and JavaScript references', note: 'developer.mozilla.org · everything the nine heads test', url: 'https://developer.mozilla.org/en-US/docs/Web' },
      { label: 'roadmap.sh — Frontend path', note: 'roadmap.sh · where each head sits on the climb', url: 'https://roadmap.sh/frontend' },
    ],
  },
}

export default RAID01
