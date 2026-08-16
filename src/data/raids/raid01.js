// ═══════════════════════════════════════════════════════════════════════════════
// RAID 01 — THE BROODGATE (v3 — Deep Raid Content)
// Boss: VARKUL, THE NULLHEART HYDRA — first herald of Gorgoroth Blackblood.
//
// FIVE sequential functions, ONE per hunter specialization. Functions unlock
// one at a time — the whole party works each function together before the next
// opens.
//
// Each function is a ~150-line program carrying 8 planted bugs of escalating
// difficulty, from a one-word typo to an inverted security check. Timings below
// are measured against the authored solutions, not aspirational: roughly an
// hour per function, a single evening for the full clear. If this raid is meant
// to be a multi-day siege, the CONTENT has to grow — do not stretch the copy.
//
// Boss HP is DERIVED: 1000 − completed × 200. No shared health counter, no
// write races. Each function completion severs a group of the hydra's heads.
//
// Rule #6: every function ships a machine-verified `solution` — proven end-to-end
// by scripts/solve-raid01.mjs through the real combat shell (dev route /__raidsolver).
// ═══════════════════════════════════════════════════════════════════════════════

export const BOSS_HP_MAX = 1000
export const FUNCTION_DAMAGE = 200
export const PLAYER_HP_MAX = 100
export const STRIKE_FAIL_DMG = 15
export const IDLE_BLEED_AFTER = 90
export const PARTY_MIN = 2
export const PARTY_MAX = 5
export const ENTRY_COST = 1000
// A warband can't sit waiting on someone who wandered off: an invite that goes
// unanswered for three minutes is treated as a refusal and the seat reopens.
export const INVITE_TTL_MS = 3 * 60 * 1000

export const PAYOUTS = {
  f1: { suffix: ':f1', xp: 100, shard: 250,  label: 'THE SHELL — INTERFACE DEPLOYED' },
  f2: { suffix: ':f2', xp: 150, shard: 500,  label: 'THE PIPELINE — SIGNAL SECURED' },
  f3: { suffix: ':f3', xp: 200, shard: 800,  label: 'THE STORE — VAULT SEALED' },
  f4: { suffix: ':f4', xp: 200, shard: 800,  label: 'THE SEAL — CIPHER LOCKED' },
  // Every Broodgate row carries an :fN suffix so the ledger can tell these
  // tiers apart from the legacy 48-hour raid's payouts, which share the
  // `raid:<uuid>` prefix but use a completely different XP scale.
  f5: { suffix: ':f5', xp: 350, shard: 1650, label: 'VARKUL SLAIN — FULL CLEAR' },
}

export const PHASES = [
  { n: 1, key: 'shell',    label: 'PHASE I — THE SHELL',    sub: 'Frontend breach. One function: build the interface.', color: '#3df0e8' },
  { n: 2, key: 'pipeline', label: 'PHASE II — THE PIPELINE', sub: 'Backend rupture. One function: compose the chain.',   color: '#f5c453' },
  { n: 3, key: 'core',     label: 'PHASE III — THE CORE',    sub: 'Deep systems. Three functions: data, security, rig.',  color: '#ff3d8b' },
]

const DARK_BASE = `<style>
  html { font-size: 10px; }
  body { margin: 0; padding: 10px 12px; background: #0a0a12; color: #cfe3e0;
         font-family: 'Courier New', monospace; line-height: 1.5; }
  a { color: #3df0e8; }
  .card { background: #0e0e18; border: 1px solid #1a1a2c; border-radius: 3px; padding: 8px 12px; margin-bottom: 6px; }
  .card h3 { margin: 0 0 4px; color: #eaf6f5; }
  .card .rank { font-size: 9px; color: #3df0e880; letter-spacing: 0.1em; }
  .valid { color: #3df0e8; } .invalid { color: #ff3d8b80; }
  table { border-collapse: collapse; width: 100%; font-size: 10px; }
  th, td { border: 1px solid #1a1a2c; padding: 4px 8px; text-align: left; }
  th { color: #3df0e8; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; }
  .btn { background: #0e0e18; border: 1px solid #1a1a2c; color: #cfe3e0; padding: 4px 10px; cursor: pointer; font-size: 9px; }
  .btn:hover { border-color: #3df0e840; }
  input { background: #0e0e18; border: 1px solid #1a1a2c; color: #cfe3e0; padding: 4px 8px; font-size: 9px; font-family: inherit; }
  .bar { height: 6px; background: #1a1a2c; border-radius: 3px; overflow: hidden; margin: 4px 0; }
  .bar-fill { height: 100%; background: #3df0e8; border-radius: 3px; transition: width 0.3s; }
  .tag { display: inline-block; font-size: 8px; padding: 2px 6px; border-radius: 2px; background: #1a1a2c; color: #eaf6f560; letter-spacing: 0.08em; margin-right: 4px; }
  .pulse { animation: p 1.5s ease-in-out infinite; }
  @keyframes p { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>`

const jsDoc = (scaffold, js) =>
  `<!DOCTYPE html><html><head>${DARK_BASE}</head><body>${scaffold}<script>${js}<\/script></body></html>`

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 1 — THE SHELL (Interface Seeker — Frontend / DOM / React patterns)
// Build a live mission control dashboard: hunter roster table with sort, filter,
// search, pagination, theme toggle, and keyboard navigation.
// ═══════════════════════════════════════════════════════════════════════════════

const F1_SCAFFOLD = `<div id="app">
  <div id="toolbar">
    <input id="search" placeholder="Filter by name..." />
    <select id="rankFilter">
      <option value="all">All ranks</option>
      <option value="S">S</option><option value="A">A</option>
      <option value="B">B</option><option value="C">C</option>
      <option value="D">D</option><option value="E">E</option>
    </select>
    <button class="btn" id="themeBtn">☾ DARK</button>
  </div>
  <div id="counter"><span id="shownCount">0</span> / <span id="totalCount">0</span> hunters</div>
  <table id="roster">
    <thead><tr>
      <th data-col="name">NAME <span id="sortName">▲</span></th>
      <th data-col="rank">RANK <span id="sortRank">▽</span></th>
      <th data-col="kills">KILLS</th>
      <th data-col="status">STATUS</th>
      <th data-col="actions"></th>
    </tr></thead>
    <tbody id="rosterBody"></tbody>
  </table>
  <div id="pagination"><span id="pageInfo">Page 1 of 1</span></div>
</div>`

const F1_DATA = `const hunters = [
  { name: 'MAYA K',  rank: 'S', kills: 47, status: 'active' },
  { name: 'JIN S',   rank: 'A', kills: 32, status: 'active' },
  { name: 'ARIS T',  rank: 'B', kills: 18, status: 'wounded' },
  { name: 'NOAH V',  rank: 'S', kills: 51, status: 'active' },
  { name: 'LYRA M',  rank: 'A', kills: 28, status: 'active' },
  { name: 'CAEL W',  rank: 'C', kills: 9,  status: 'MIA' },
  { name: 'SERA F',  rank: 'A', kills: 35, status: 'active' },
  { name: 'DORIAN P',rank: 'B', kills: 14, status: 'wounded' },
  { name: 'REN O',   rank: 'D', kills: 5,  status: 'active' },
  { name: 'VESPER H',rank: 'E', kills: 2,  status: 'active' },
  { name: 'CRANE L', rank: 'C', kills: 11, status: 'MIA' },
  { name: 'MORGAN X',rank: 'S', kills: 63, status: 'active' },
  { name: 'IVY Q',   rank: 'B', kills: 16, status: 'wounded' },
  { name: 'ZEPH W',  rank: 'A', kills: 41, status: 'active' },
  { name: 'ORIEN D', rank: 'D', kills: 7,  status: 'active' },
  { name: 'FENN K',  rank: 'C', kills: 12, status: 'active' },
  { name: 'NOVA P',  rank: 'E', kills: 1,  status: 'active' },
  { name: 'SAGE Y',  rank: 'B', kills: 22, status: 'active' },
  { name: 'THORN M', rank: 'A', kills: 37, status: 'wounded' },
  { name: 'WRAITH E',rank: 'D', kills: 6,  status: 'active' },
]`

const F1_STARTER = `// ═══════════════════════════════════════════════════════════════
// THE SHELL — Mission Control Dashboard
// Build a live hunter roster table with sort, filter, search, and
// pagination. Every bug listed below breaks a different feature.
// FIX ALL BUGS for full clear.
//
// BUG 1 (EASY):  forEach misspelled -> "foreach" — crashes entire script
// BUG 2 (EASY):  sort comparator missing — ranks sort alphabetically
// BUG 3 (MEDIUM): rank filter checks "value" instead of select value
// BUG 4 (MEDIUM): search is case-sensitive — "maya" won't find "MAYA K"
// BUG 5 (MEDIUM): pagination never advances past page 1
// BUG 6 (HARD):   theme toggle doesn't persist — resets on render
// BUG 7 (HARD):   duplicate hunters leak into roster on each re-render
// BUG 8 (EXPERT): counter shows NaN when no hunters match filter
// ═══════════════════════════════════════════════════════════════════

${F1_DATA}

let currentPage = 1
const PAGE_SIZE = 5
let darkMode = false

function render() {
  const searchVal = document.getElementById('search').value
  const rankVal = document.getElementById('rankFilter').value || 'all'
  const tbody = document.getElementById('rosterBody')
  const shownSpan = document.getElementById('shownCount')
  const totalSpan = document.getElementById('totalCount')

  // BUG 2: no comparator — sort is alphabetically by string coercion
  let sorted = hunters.sort()

  // BUG 4: search is case-sensitive
  let filtered = sorted.filter(h => h.name.includes(searchVal))

  // BUG 3: rank filter checks wrong property
  if (rankVal !== 'all') filtered = filtered.filter(h => h.value === rankVal)

  const total = hunters.length
  const start = (currentPage - 1) * PAGE_SIZE
  const page = filtered.slice(start, start + PAGE_SIZE)

  // BUG 7: tbody.innerHTML = '' missing — duplicates accumulate
  page.forEach(h => {
    const tr = document.createElement('tr')
    tr.innerHTML = '<td>' + h.name + '</td><td>' + h.rank + '</td><td>' + h.kills + '</td><td>' + h.status + '</td>'
    tr.innerHTML += '<td><button class="btn">SELECT</button></td>'
    tbody.appendChild(tr)
  })

  // BUG 8: shownCount shows NaN when filtered empty
  shownSpan.textContent = filtered.length || 'NaN'
  totalSpan.textContent = total
  document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + Math.ceil(filtered.length / PAGE_SIZE)

  if (darkMode) document.body.style.background = '#020206'
  else document.body.style.background = ''
}

// BUG 1: "foreach" should be "forEach"
document.querySelectorAll('.btn').foreach(b => b.addEventListener('click', () => {}))

document.getElementById('search').addEventListener('input', () => { currentPage = 1; render() })
document.getElementById('rankFilter').addEventListener('change', () => { currentPage = 1; render() })

// BUG 5: pagination buttons missing — no way to advance page
document.getElementById('roster').addEventListener('click', e => {
  if (e.target.dataset.col === 'name') { /* sort by name */ }
})

// BUG 6: theme toggle doesn't actually toggle — onclick is a no-op
document.getElementById('themeBtn').addEventListener('click', () => {
  darkMode = !darkMode
})

render()`

const F1_SOLUTION = `// ═══════════════════════════════════════════════════════════════
// THE SHELL — Mission Control Dashboard (SOLUTION)
// All 8 bugs fixed.
// ═══════════════════════════════════════════════════════════════════

${F1_DATA}

let currentPage = 1
const PAGE_SIZE = 5
let darkMode = false

function render() {
  const searchVal = document.getElementById('search').value
  const rankVal = document.getElementById('rankFilter').value
  const tbody = document.getElementById('rosterBody')
  const shownSpan = document.getElementById('shownCount')
  const totalSpan = document.getElementById('totalCount')

  const sorted = [...hunters].sort((a, b) => {
    const rankOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5 }
    return rankOrder[a.rank] - rankOrder[b.rank]
  })

  const filtered = sorted.filter(h =>
    h.name.toLowerCase().includes(searchVal.toLowerCase()) &&
    (rankVal === 'all' || h.rank === rankVal)
  )

  const total = hunters.length
  const start = (currentPage - 1) * PAGE_SIZE
  const page = filtered.slice(start, start + PAGE_SIZE)
  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  tbody.innerHTML = ''

  page.forEach(h => {
    const tr = document.createElement('tr')
    tr.innerHTML = '<td>' + h.name + '</td><td>' + h.rank + '</td><td>' + h.kills + '</td><td>' + h.status + '</td>'
    tr.innerHTML += '<td><button class="btn" data-action="select" data-name="' + h.name + '">SELECT</button></td>'
    tbody.appendChild(tr)
  })

  shownSpan.textContent = filtered.length
  totalSpan.textContent = total
  document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + maxPage

  document.querySelectorAll('[data-action="select"]').forEach(b =>
    b.addEventListener('click', () => alert('Selected: ' + b.dataset.name))
  )

  if (darkMode) {
    document.body.style.background = '#020206'
    document.getElementById('themeBtn').textContent = '☀ LIGHT'
  } else {
    document.body.style.background = ''
    document.getElementById('themeBtn').textContent = '☾ DARK'
  }
}

document.getElementById('search').addEventListener('input', () => { currentPage = 1; render() })
document.getElementById('rankFilter').addEventListener('change', () => { currentPage = 1; render() })

document.getElementById('roster').addEventListener('click', e => {
  const th = e.target.closest('th')
  if (!th) return
  const col = th.dataset.col
  const arrow = document.getElementById(col === 'name' ? 'sortName' : 'sortRank')
  if (col === 'name') {
    hunters.sort((a, b) => a.name.localeCompare(b.name))
    document.getElementById('sortName').textContent = document.getElementById('sortName').textContent === '▲' ? '▼' : '▲'
  } else if (col === 'rank') {
    const ro = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5 }
    hunters.sort((a, b) => ro[a.rank] - ro[b.rank])
    document.getElementById('sortRank').textContent = document.getElementById('sortRank').textContent === '▽' ? '△' : '▽'
  }
  render()
})

document.getElementById('themeBtn').addEventListener('click', () => {
  darkMode = !darkMode
  render()
})

// Pagination via keyboard left/right
document.addEventListener('keydown', e => {
  const maxPage = Math.max(1, Math.ceil(
    [...hunters].sort((a, b) => (a.name > b.name ? 1 : -1))
      .filter(h => h.name.toLowerCase().includes(document.getElementById('search').value.toLowerCase()))
      .length / PAGE_SIZE
  ))
  if (e.key === 'ArrowRight' && currentPage < maxPage) { currentPage++; render() }
  if (e.key === 'ArrowLeft' && currentPage > 1) { currentPage--; render() }
})

render()`

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 2 — THE PIPELINE (Signal Seeker — Backend / Middleware / Express)
// Build a complete middleware pipeline: request processing, error handling,
// async middleware, rate limiting, caching, and response transformation.
// ═══════════════════════════════════════════════════════════════════════════════

const F2_SCAFFOLD = `<ul id="pipeline"></ul>
<div id="errLog"></div>
<div id="stats">REQUESTS: <span id="reqCount">0</span> · CACHE HITS: <span id="cacheHits">0</span></div>`

const F2_STARTER = `// ═══════════════════════════════════════════════════════════════
// THE PIPELINE — Request Processing Middleware
// Build a composable middleware chain that processes requests through
// 6 stages: timestamp, auth, parse, rate-limit, cache, respond.
//
// BUG 1 (EASY):  attachTimestamp never calls next() — chain stalls at step 1
// BUG 2 (EASY):  compose stops one short — the last middleware never runs
// BUG 3 (MEDIUM): parsePath crashes on URLs without query strings
// BUG 4 (MEDIUM): rate limiter pools every client into one bucket
// BUG 5 (MEDIUM): auth check is inverted — public paths fail, private ones pass
// BUG 6 (HARD):   cache reads the wrong property — never returns a hit
// BUG 7 (HARD):   errors are swallowed — nothing reaches the error log
// BUG 8 (EXPERT): pipeline ignores promise-returning (async) middleware
// ═══════════════════════════════════════════════════════════════════

let reqCount = 0
let cacheHits = 0

// ── Middleware steps ──

function attachTimestamp(req, next) {
  req.startedAt = Date.now()
  // BUG 1: next() never called
}

function parsePath(req, next) {
  const url = req.rawUrl || '/'
  req.path = url.split('?')[0]
  req.query = {}
  // BUG 3: when the url carries no '?', split('?')[1] is undefined and this
  // throws before the request ever reaches auth.
  url.split('?')[1].split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    req.query[k] = v
  })
  next()
}

function checkAuth(req, next) {
  const publicPaths = ['/', '/health', '/login']
  // BUG 5: the comparison is inverted — this branch fires for PRIVATE paths,
  // waving them through unauthenticated, while public paths fall to the
  // token check below and get rejected.
  if (publicPaths.includes(req.path) === false) {
    req.authenticated = false
    return next()
  }
  if (!req.token || req.token.length < 8) {
    return next(new Error('AUTH_FAILED: token too short or missing'))
  }
  req.authenticated = true
  next()
}

let requestTimestamps = []
function rateLimit(req, next) {
  const now = Date.now()
  const WINDOW = 10000
  const MAX = 5
  // BUG 4: every client shares this one array, so a single noisy caller
  // rate-limits everybody. Bucket the timestamps per req.client (and drop the
  // ones that have aged out of the window).
  if (requestTimestamps.length >= MAX) {
    return next(new Error('RATE_LIMITED: too many requests'))
  }
  requestTimestamps.push(now)
  next()
}

const cache = {}
function checkCache(req, next) {
  const key = req.path + ':' + JSON.stringify(req.query)
  // BUG 6: respond() stores results under .result but this reads .data,
  // so the lookup never matches and every request is a miss.
  if (cache[key] && cache[key].data !== undefined) {
    req.cached = true
    req.response = cache[key].result
    cacheHits++
    return
  }
  next()
}

function errorHandler(err, req, next) {
  // BUG 7: the error is recorded on the request and then goes nowhere —
  // #errLog stays empty and the failure is invisible.
  req.error = err.message
}

function respond(req, next) {
  if (!req.response) {
    req.response = {
      path: req.path,
      query: req.query,
      authenticated: req.authenticated,
      timestamp: req.startedAt,
      id: req.id,
    }
  }
  if (!req.cached && !req.error) {
    const key = req.path + ':' + JSON.stringify(req.query)
    cache[key] = { result: req.response }
  }
  reqCount++
  const li = document.createElement('li')
  li.textContent = req.id + ' → ' + req.path + (req.cached ? ' (CACHED)' : '') + (req.error ? ' ERROR: ' + req.error : '')
  document.getElementById('pipeline').appendChild(li)
  document.getElementById('reqCount').textContent = reqCount
  document.getElementById('cacheHits').textContent = cacheHits
  next()
}

function compose(...middleware) {
  return function run(req) {
    let i = 0
    function next(err) {
      if (err) {
        const eh = middleware.find(m => m.length === 3)
        if (eh) eh(err, req, () => {})
        return
      }
      // BUG 2: stops one short of the end — the final middleware never runs.
      if (i < middleware.length - 1) {
        const fn = middleware[i]
        i++
        // BUG 8: if fn returns a Promise we drop it on the floor, so an async
        // middleware that rejects never reaches the error handler.
        fn(req, next)
      }
    }
    next()
  }
}

// ── Test requests ──
const requests = [
  { id: 'r01', client: 'seoul-01', rawUrl: '/hunters', token: 'validtoken123' },
  { id: 'r02', client: 'seoul-01', rawUrl: '/hunters?page=1', token: 'validtoken123' },
  { id: 'r03', client: 'seoul-02', rawUrl: '/health', token: '' },
  { id: 'r04', client: 'seoul-02', rawUrl: '/hunters', token: 'validtoken456' },
  { id: 'r05', client: 'seoul-03', rawUrl: '/login', token: 'short' },
  { id: 'r06', client: 'seoul-03', rawUrl: '/metrics', token: 'validtoken789' },
]

const chain = compose(attachTimestamp, parsePath, checkAuth, rateLimit, checkCache, respond, errorHandler)
requests.forEach(r => chain(r))`

const F2_SOLUTION = `// ═══════════════════════════════════════════════════════════════
// THE PIPELINE — Request Processing Middleware (SOLUTION)
// All 8 bugs fixed.
// ═══════════════════════════════════════════════════════════════════

let reqCount = 0
let cacheHits = 0

function attachTimestamp(req, next) {
  req.startedAt = Date.now()
  next()
}

function parsePath(req, next) {
  const url = req.rawUrl || '/'
  const parts = url.split('?')
  req.path = parts[0]
  req.query = {}
  if (parts.length > 1 && parts[1]) {
    parts[1].split('&').forEach(pair => {
      const [k, v] = pair.split('=')
      req.query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : ''
    })
  }
  next()
}

function checkAuth(req, next) {
  const publicPaths = ['/', '/health', '/login']
  if (publicPaths.includes(req.path) && (typeof req.token === 'undefined' || req.token === '')) {
    req.authenticated = false
    return next()
  }
  if (!req.token || req.token.length < 8) {
    return next(new Error('AUTH_FAILED: token too short or missing'))
  }
  req.authenticated = true
  next()
}

const clientBuckets = {}
function rateLimit(req, next) {
  const now = Date.now()
  const WINDOW = 10000
  const MAX = 5
  const key = req.client || 'anonymous'
  // One bucket per client, pruned to the rolling window.
  const bucket = (clientBuckets[key] || []).filter(t => now - t < WINDOW)
  clientBuckets[key] = bucket
  if (bucket.length >= MAX) {
    return next(new Error('RATE_LIMITED: too many requests'))
  }
  bucket.push(now)
  next()
}

const cache = {}
function checkCache(req, next) {
  const key = req.path + ':' + JSON.stringify(req.query)
  if (cache[key] && cache[key].result !== undefined) {
    req.cached = true
    req.response = cache[key].result
    cacheHits++
    return
  }
  next()
}

function respond(req, next) {
  if (!req.response) {
    req.response = {
      path: req.path,
      query: req.query,
      authenticated: req.authenticated,
      timestamp: req.startedAt,
      id: req.id,
    }
  }
  if (!req.cached && !req.error) {
    const key = req.path + ':' + JSON.stringify(req.query)
    cache[key] = { result: req.response }
  }
  reqCount++
  const li = document.createElement('li')
  li.textContent = req.id + ' → ' + req.path + (req.cached ? ' (CACHED)' : '') + (req.error ? ' ERROR: ' + req.error : '')
  document.getElementById('pipeline').appendChild(li)
  document.getElementById('reqCount').textContent = reqCount
  document.getElementById('cacheHits').textContent = cacheHits
  next()
}

function errorHandler(err, req, next) {
  req.error = err.message
  const log = document.getElementById('errLog')
  if (log) {
    const div = document.createElement('div')
    div.textContent = '[' + new Date().toISOString() + '] ' + err.message
    div.style.color = '#ff3d8b'
    div.style.fontSize = '9px'
    log.appendChild(div)
  }
  next()
}

function compose(...middleware) {
  return function run(req) {
    let i = 0
    function next(err) {
      if (err) {
        for (let j = i; j < middleware.length; j++) {
          if (middleware[j].length === 3) {
            middleware[j](err, req, () => {})
            break
          }
        }
        return
      }
      if (i < middleware.length) {
        const fn = middleware[i]
        i++
        if (fn.length === 3) { next(); return }
        const result = fn(req, next)
        if (result && typeof result.then === 'function') {
          result.catch(e => next(e))
        }
      }
    }
    next()
  }
}

const requests = [
  { id: 'r01', client: 'seoul-01', rawUrl: '/hunters', token: 'validtoken123' },
  { id: 'r02', client: 'seoul-01', rawUrl: '/hunters?page=1', token: 'validtoken123' },
  { id: 'r03', client: 'seoul-02', rawUrl: '/health', token: '' },
  { id: 'r04', client: 'seoul-02', rawUrl: '/hunters', token: 'validtoken456' },
  { id: 'r05', client: 'seoul-03', rawUrl: '/login', token: 'short' },
  { id: 'r06', client: 'seoul-03', rawUrl: '/metrics', token: 'validtoken789' },
]

const chain = compose(attachTimestamp, parsePath, checkAuth, rateLimit, checkCache, respond, errorHandler)
requests.forEach(r => chain(r))`

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 3 — THE STORE (Vault Seeker — Data / SQL / Query Engine)
// Build a query engine: filter, sort, aggregate, join, paginate, full-text
// search, time-series analysis over a dataset of hunt records.
// ═══════════════════════════════════════════════════════════════════════════════

const F3_SCAFFOLD = `<div>
  <div id="qControls">
    <input id="qSearch" placeholder="Search by monster or hunter..." style="width:200px" />
    <select id="qType"><option value="all">All types</option><option value="behemoth">Behemoth</option><option value="swarm">Swarm</option><option value="herald">Herald</option></select>
    <select id="qSort"><option value="date">Sort by date</option><option value="kills">Sort by kills</option><option value="monster">Sort by monster</option></select>
    <button class="btn" id="qGroupBtn">TOGGLE GROUP</button>
  </div>
  <div id="qSummary">RESULTS: <span id="qCount">0</span></div>
  <table id="qResults"><thead><tr><th>DATE</th><th>HUNTER</th><th>MONSTER</th><th>TYPE</th><th>KILLS</th><th>DURATION</th></tr></thead><tbody id="qBody"></tbody></table>
  <div id="qAgg"></div>
</div>`

// Ledger dates are logged the way the Association's field terminals write them:
// year-month-day with NO zero padding. That detail is the whole point of BUG 2 —
// '2081-11-04' sorts BEFORE '2081-3-12' as a string, but comes after it in time.
const F3_DATA = `const hunts = [
  { id: 1, date: '2081-3-12', hunter: 'MAYA K', monster: 'Ravager Alpha', type: 'behemoth', kills: 1, duration: 340, zone: 'Sector 7' },
  { id: 2, date: '2081-3-14', hunter: 'JIN S', monster: 'Spitter Swarm', type: 'swarm', kills: 47, duration: 180, zone: 'Sector 3' },
  { id: 3, date: '2081-9-15', hunter: 'ARIS T', monster: 'Crawler Brood', type: 'swarm', kills: 23, duration: 210, zone: 'Sector 3' },
  { id: 4, date: '2081-10-16', hunter: 'NOAH V', monster: 'Gorgoroth Spawn', type: 'herald', kills: 1, duration: 540, zone: 'Sector 1' },
  { id: 5, date: '2081-3-18', hunter: 'LYRA M', monster: 'Ravager Beta', type: 'behemoth', kills: 1, duration: 290, zone: 'Sector 7' },
  { id: 6, date: '2081-11-19', hunter: 'MAYA K', monster: 'Crawler Brood', type: 'swarm', kills: 31, duration: 195, zone: 'Sector 4' },
  { id: 7, date: '2081-9-20', hunter: 'SERA F', monster: 'Ravager Alpha', type: 'behemoth', kills: 2, duration: 310, zone: 'Sector 7' },
  { id: 8, date: '2081-10-21', hunter: 'JIN S', monster: 'Varkul Echo', type: 'herald', kills: 0, duration: 480, zone: 'Sector 0' },
  { id: 9, date: '2081-3-22', hunter: 'DORIAN P', monster: 'Spitter Swarm', type: 'swarm', kills: 52, duration: 165, zone: 'Sector 3' },
  { id: 10, date: '2081-11-23', hunter: 'NOAH V', monster: 'Ravager Alpha', type: 'behemoth', kills: 3, duration: 275, zone: 'Sector 7' },
  { id: 11, date: '2081-9-24', hunter: 'SERA F', monster: 'Crawler Brood', type: 'swarm', kills: 38, duration: 200, zone: 'Sector 5' },
  { id: 12, date: '2081-10-25', hunter: 'ARIS T', monster: 'Varkul Echo', type: 'herald', kills: 0, duration: 510, zone: 'Sector 0' },
  { id: 13, date: '2081-3-26', hunter: 'MAYA K', monster: 'Ravager Beta', type: 'behemoth', kills: 1, duration: 305, zone: 'Sector 4' },
  { id: 14, date: '2081-11-27', hunter: 'LYRA M', monster: 'Spitter Swarm', type: 'swarm', kills: 44, duration: 175, zone: 'Sector 3' },
  { id: 15, date: '2081-9-28', hunter: 'CAEL W', monster: 'Crawler Brood', type: 'swarm', kills: 19, duration: 230, zone: 'Sector 4' },
]`

const F3_STARTER = `// ═══════════════════════════════════════════════════════════════
// THE STORE — Hunt Record Query Engine
// Build a full query engine: filter by type and search term, sort by
// date/kills/monster, group by zone with aggregates, and display results.
//
// BUG 1 (EASY):  typo "staus" instead of "status" in data — breaks filter
// BUG 2 (EASY):  sort by date sorts alphabetically, not chronologically
// BUG 3 (MEDIUM): case-insensitive search broken — uses wrong method
// BUG 4 (MEDIUM): aggregation counts NaN grouped values
// BUG 5 (MEDIUM): monster sort by length not by name
// BUG 6 (HARD):   grouping toggle never ungroups — state stuck
// BUG 7 (HARD):   kills sum wrong after filter — uses original data
// BUG 8 (EXPERT): pagination missing entirely — shows all rows at once
// ═══════════════════════════════════════════════════════════════════

${F3_DATA}

let groupByZone = false

function query() {
  const search = document.getElementById('qSearch').value
  const type = document.getElementById('qType').value
  const sort = document.getElementById('qSort').value
  const tbody = document.getElementById('qBody')
  const aggDiv = document.getElementById('qAgg')

  // BUG 1: filtering on non-existent property 'staus'
  let filtered = type === 'all' ? [...hunts] : hunts.filter(h => h.staus === type)

  // BUG 3: search is case-sensitive
  if (search) filtered = filtered.filter(h => h.monster.includes(search) || h.hunter.includes(search))

  // BUG 2: sort by date does string comparison
  if (sort === 'date') filtered.sort((a, b) => a.date > b.date ? 1 : -1)
  else if (sort === 'kills') filtered.sort((a, b) => a.kills - b.kills)
  // BUG 5: sort by monster sorts by string length, not name
  else if (sort === 'monster') filtered.sort((a, b) => a.monster.length - b.monster.length)

  // BUG 8: no pagination — render everything
  tbody.innerHTML = ''
  filtered.forEach(h => {
    const tr = document.createElement('tr')
    tr.innerHTML = '<td>' + h.date + '</td><td>' + h.hunter + '</td><td>' + h.monster + '</td><td>' + h.type + '</td><td>' + h.kills + '</td><td>' + h.duration + 's</td>'
    tbody.appendChild(tr)
  })

  document.getElementById('qCount').textContent = filtered.length

  // Aggregation
  // BUG 6: grouping toggle never ungroups
  if (groupByZone) {
    const groups = {}
    // BUG 7: the count respects the filter but the kill sum re-reads EVERY hunt
    // in that zone from the original array — filtered-out hunts still count.
    filtered.forEach(h => {
      if (!groups[h.zone]) groups[h.zone] = { zone: h.zone, count: 0, totalKills: 0, totalDuration: 0 }
      groups[h.zone].count++
      groups[h.zone].totalKills = hunts
        .filter(x => x.zone === h.zone)
        .reduce((sum, x) => sum + x.kills, 0)
      groups[h.zone].totalDuration += h.duration
    })

    // BUG 4: toLocaleString may show NaN for undefined values
    let html = '<div class="tag">GROUPED BY ZONE</div><table><tr><th>ZONE</th><th>HUNTS</th><th>KILLS</th><th>AVG DURATION</th></tr>'
    Object.values(groups).forEach(g => {
      html += '<tr><td>' + g.zone + '</td><td>' + (g.count || 'NaN') + '</td><td>' + (g.totalKills || 'NaN') + '</td><td>' + Math.round(g.totalDuration / g.count) + 's</td></tr>'
    })
    html += '</table>'
    aggDiv.innerHTML = html
  } else {
    aggDiv.innerHTML = ''
  }
}

// BUG 6: event listener never inverts the state
document.getElementById('qGroupBtn').addEventListener('click', () => {
  // groupByZone stays false — nothing happens
})

document.getElementById('qSearch').addEventListener('input', query)
document.getElementById('qType').addEventListener('change', query)
document.getElementById('qSort').addEventListener('change', query)

query()`

const F3_SOLUTION = `// ═══════════════════════════════════════════════════════════════
// THE STORE — Hunt Record Query Engine (SOLUTION)
// All 8 bugs fixed with pagination, proper aggregation, and grouping.
// ═══════════════════════════════════════════════════════════════════

${F3_DATA}

let groupByZone = false
let page = 1
const PER_PAGE = 5

function query(direction) {
  if (direction === 'next') page++
  else if (direction === 'prev') page = Math.max(1, page - 1)
  else page = 1

  const search = document.getElementById('qSearch').value
  const type = document.getElementById('qType').value
  const sort = document.getElementById('qSort').value
  const tbody = document.getElementById('qBody')
  const aggDiv = document.getElementById('qAgg')

  const filtered = [...hunts].filter(h => {
    if (type !== 'all' && h.type !== type) return false
    if (search) {
      const s = search.toLowerCase()
      if (!h.monster.toLowerCase().includes(s) && !h.hunter.toLowerCase().includes(s)) return false
    }
    return true
  })

  // Dates are unpadded ('2081-3-12'), so string comparison is NOT chronological.
  // Parse to real dates before ordering.
  const asDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
  if (sort === 'date') filtered.sort((a, b) => asDate(a.date) - asDate(b.date))
  else if (sort === 'kills') filtered.sort((a, b) => a.kills - b.kills)
  else if (sort === 'monster') filtered.sort((a, b) => a.monster.localeCompare(b.monster))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  if (page > totalPages) page = totalPages
  const start = (page - 1) * PER_PAGE
  const pageData = filtered.slice(start, start + PER_PAGE)

  tbody.innerHTML = ''
  pageData.forEach(h => {
    const tr = document.createElement('tr')
    tr.innerHTML = '<td>' + h.date + '</td><td>' + h.hunter + '</td><td>' + h.monster + '</td><td>' + h.type + '</td><td>' + h.kills + '</td><td>' + h.duration + 's</td>'
    tbody.appendChild(tr)
  })

  document.getElementById('qCount').textContent = filtered.length + ' (page ' + page + '/' + totalPages + ')'

  // Pagination buttons
  const nav = document.getElementById('qPagination') || (() => {
    const d = document.createElement('div')
    d.id = 'qPagination'
    d.style.marginTop = '6px'
    d.innerHTML = '<button class="btn" id="qPrev">◀ PREV</button> <button class="btn" id="qNext">NEXT ▶</button>'
    document.getElementById('qControls').after(d)
    document.getElementById('qPrev').addEventListener('click', () => query('prev'))
    document.getElementById('qNext').addEventListener('click', () => query('next'))
    return d
  })()
  document.getElementById('qPrev').disabled = page <= 1
  document.getElementById('qNext').disabled = page >= totalPages

  // Aggregation
  if (groupByZone) {
    const groups = {}
    filtered.forEach(h => {
      if (!groups[h.zone]) groups[h.zone] = { zone: h.zone, count: 0, totalKills: 0, totalDuration: 0 }
      groups[h.zone].count++
      groups[h.zone].totalKills += h.kills
      groups[h.zone].totalDuration += h.duration
    })
    let html = '<div class="tag">GROUPED BY ZONE</div><table><tr><th>ZONE</th><th>HUNTS</th><th>KILLS</th><th>AVG DURATION</th></tr>'
    Object.values(groups).forEach(g => {
      html += '<tr><td>' + g.zone + '</td><td>' + g.count + '</td><td>' + g.totalKills + '</td><td>' + Math.round(g.totalDuration / g.count) + 's</td></tr>'
    })
    html += '</table>'
    aggDiv.innerHTML = html
  } else {
    aggDiv.innerHTML = ''
  }
}

document.getElementById('qGroupBtn').addEventListener('click', () => {
  groupByZone = !groupByZone
  document.getElementById('qGroupBtn').textContent = groupByZone ? 'UNGROUP' : 'TOGGLE GROUP'
  query()
})

document.getElementById('qSearch').addEventListener('input', () => query())
document.getElementById('qType').addEventListener('change', () => query())
document.getElementById('qSort').addEventListener('change', () => query())

query()`

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 4 — THE SEAL (Cipher Seeker — Auth / Security / Cryptography)
// Build an authentication gateway: token validation, JWT-style signing, RBAC,
// session rotation, brute-force detection, audit logging, and CSRF protection.
// ═══════════════════════════════════════════════════════════════════════════════

const F4_SCAFFOLD = `<ul id="results"></ul>
<pre id="auditLog" style="font-size:8px;color:#eaf6f540;max-height:80px;overflow-y:auto;border:1px solid #1a1a2c;padding:6px;margin-top:8px"></pre>
<div id="sessionPanel" style="margin-top:8px">
  <span id="sessionStatus" class="tag">NO SESSION</span>
  <button class="btn" id="rotateBtn">ROTATE SESSION</button>
</div>`

const F4_STARTER = `// ═══════════════════════════════════════════════════════════════
// THE SEAL — Authentication Gateway
// Validate tokens, enforce RBAC, detect brute-force attempts, rotate
// sessions, and log every auth decision to the audit trail.
//
// BUG 1 (EASY):  operator precedence in isValid() — && mixed with ||
// BUG 2 (EASY):  brute-force counter never increments — always 0
// BUG 3 (MEDIUM): RBAC allows "admin" access when role is wrong
// BUG 4 (MEDIUM): session rotation doesn't change session ID
// BUG 5 (MEDIUM): audit log overwrites previous entries
// BUG 6 (HARD):   token expiry check uses wrong comparison (<= vs <)
// BUG 7 (HARD):   CSRF token doesn't validate — always passes
// BUG 8 (EXPERT): timing attack vulnerability — early return on user check
// ═══════════════════════════════════════════════════════════════════

const audit = []
let sessions = {}
let bruteForceAttempts = {}

// ── Token validation ──
function isValid(token) {
  // BUG 1: && and || without parentheses — wrong precedence
  return token.user && token.user.length > 0 || typeof token.exp === 'number' && token.exp > Date.now() && token.sig && token.sig.length === 8 || false
}

// ── Brute-force detection ──
function checkBruteForce(ip) {
  // BUG 2: attempts never increment
  const attempts = bruteForceAttempts[ip] || 0
  const maxAttempts = 5
  if (attempts >= maxAttempts) return true
  return false
}

function recordAttempt(ip, success) {
  // BUG 2: never increments — bruteForceAttempts[ip] stays undefined
  if (!success) {
    bruteForceAttempts[ip] = (bruteForceAttempts[ip] || 0)
  } else {
    delete bruteForceAttempts[ip]
  }
}

// ── RBAC ──
const ACCESS_LEVELS = { admin: 3, senior: 2, junior: 1, viewer: 0 }
const PROTECTED_OPS = {
  'delete:hunt': 'admin',
  'edit:hunt': 'senior',
  'view:classified': 'senior',
  'view:hunt': 'junior',
}

function checkAccess(token, operation) {
  const required = PROTECTED_OPS[operation]
  if (!required) return true
  // BUG 3: this only checks that the role is KNOWN — it never compares it
  // against the level the operation demands, so a viewer walks straight into
  // classified records.
  const userLevel = ACCESS_LEVELS[token.role]
  const reqLevel = ACCESS_LEVELS[required]
  if (userLevel !== undefined) return true
  return false
}

// ── Session management ──
function createSession(user) {
  const sid = 'sess_' + Math.random().toString(36).slice(2)
  sessions[sid] = { user, createdAt: Date.now(), lastAccess: Date.now() }
  return sid
}

function rotateSession(sid) {
  // BUG 4: returns the SAME sid — never rotates
  const session = sessions[sid]
  if (!session) return null
  return sid
}

// ── CSRF protection ──
function validateCSRFToken(reqToken, sessionToken) {
  // BUG 7: always returns true — never validates
  return true
}

// ── Token expiry (BUG 6: uses <= instead of <) ──
function isExpired(token) {
  if (typeof token.exp !== 'number') return true
  return Date.now() <= token.exp
}

// ── Audit logging ──
function log(event, details) {
  const entry = '[' + new Date().toISOString() + '] ' + event + ': ' + JSON.stringify(details)
  audit.push(entry)
  // BUG 5: uses innerHTML = instead of += — overwrites previous log
  document.getElementById('auditLog').textContent = entry
}

// ── Process tokens ──
// Seven tokens exercise every gate: two clean admins, a clean senior, an
// expired token, a malformed signature, an empty user, and a viewer who must
// be turned away from classified records.
const tokens = [
  { user: 'maya',  exp: Date.now() + 50000, sig: 'a1b2c3d4', role: 'admin',  ip: '10.0.0.1' },
  { user: '',      exp: Date.now() + 50000, sig: 'abcdefgh', role: 'junior', ip: '10.0.0.2' },
  { user: 'jin',   exp: Date.now() - 1000,  sig: '12345678', role: 'senior', ip: '10.0.0.3' },
  { user: 'aris',  exp: Date.now() + 50000, sig: 'short',    role: 'viewer', ip: '10.0.0.4' },
  { user: 'noah',  exp: Date.now() + 50000, sig: 'abcdefgh', role: 'admin',  ip: '10.0.0.5' },
  { user: 'lyra',  exp: Date.now() + 50000, sig: 'x9y8z7w6', role: 'senior', ip: '10.0.0.1' },
  { user: 'evan',  exp: Date.now() + 50000, sig: 'deadbeef', role: 'viewer', ip: '10.0.0.6' },
]

const list = document.getElementById('results')
tokens.forEach((t, i) => {
  const li = document.createElement('li')

  // BUG 8: timing — returns early checking user BEFORE full validation
  if (!t.user || t.user.length === 0) {
    recordAttempt(t.ip, false)
    log('REJECTED', { reason: 'empty_user', token: t.user })
    li.className = 'invalid'
    li.textContent = '??? — REJECTED (empty user)'
    list.appendChild(li)
    return
  }

  if (isValid(t)) {
    if (checkAccess(t, 'view:classified')) {
      if (!checkBruteForce(t.ip)) {
        if (validateCSRFToken('dummy', 'dummy')) {
          const sid = createSession(t.user)
          if (!isExpired(t)) {
            recordAttempt(t.ip, true)
            log('GRANTED', { user: t.user, role: t.role, session: sid })
            li.className = 'valid'
            li.textContent = t.user + ' — ACCESS GRANTED (role: ' + t.role + ')'
          } else {
            log('REJECTED', { reason: 'expired_token', user: t.user })
            li.className = 'invalid'
            li.textContent = t.user + ' — REJECTED (token expired)'
          }
        } else {
          log('REJECTED', { reason: 'csrf_fail', user: t.user })
          li.className = 'invalid'
          li.textContent = t.user + ' — REJECTED (CSRF)'
        }
      } else {
        log('REJECTED', { reason: 'brute_force', user: t.user, ip: t.ip })
        li.className = 'invalid'
        li.textContent = t.user + ' — REJECTED (rate limited)'
      }
    } else {
      log('REJECTED', { reason: 'insufficient_access', user: t.user })
      li.className = 'invalid'
      li.textContent = t.user + ' — REJECTED (access denied)'
    }
  } else {
    recordAttempt(t.ip, false)
    log('REJECTED', { reason: 'invalid_token', token: t.user || '???' })
    li.className = 'invalid'
    li.textContent = (t.user || '???') + ' — REJECTED (invalid token)'
  }
  list.appendChild(li)
})

document.getElementById('rotateBtn').addEventListener('click', () => {
  const firstSid = Object.keys(sessions)[0]
  if (firstSid) {
    const newSid = rotateSession(firstSid)
    document.getElementById('sessionStatus').textContent = 'SESSION: ' + newSid
    log('ROTATED', { from: firstSid, to: newSid })
  }
})`

const F4_SOLUTION = `// ═══════════════════════════════════════════════════════════════
// THE SEAL — Authentication Gateway (SOLUTION)
// All 8 security bugs fixed — constant-time comparison, proper validation.
// ═══════════════════════════════════════════════════════════════════

const audit = []
let sessions = {}
let bruteForceAttempts = {}

function isValid(token) {
  return (
    token.user && token.user.length > 0 &&
    typeof token.exp === 'number' &&
    token.sig && token.sig.length === 8
  )
}

function checkBruteForce(ip) {
  const attempts = bruteForceAttempts[ip] || 0
  return attempts >= 5
}

function recordAttempt(ip, success) {
  if (!success) {
    bruteForceAttempts[ip] = (bruteForceAttempts[ip] || 0) + 1
  } else {
    delete bruteForceAttempts[ip]
  }
}

const ACCESS_LEVELS = { admin: 3, senior: 2, junior: 1, viewer: 0 }
const PROTECTED_OPS = {
  'delete:hunt': 'admin',
  'edit:hunt': 'senior',
  'view:classified': 'senior',
  'view:hunt': 'junior',
}

function checkAccess(token, operation) {
  const required = PROTECTED_OPS[operation]
  if (!required) return true
  const userLevel = ACCESS_LEVELS[token.role]
  if (userLevel === undefined) return false
  const reqLevel = ACCESS_LEVELS[required]
  return userLevel >= reqLevel
}

function createSession(user) {
  const sid = 'sess_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36)
  sessions[sid] = { user, createdAt: Date.now(), lastAccess: Date.now() }
  return sid
}

function rotateSession(sid) {
  const session = sessions[sid]
  if (!session) return null
  delete sessions[sid]
  const newSid = 'sess_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36)
  sessions[newSid] = { ...session, lastAccess: Date.now(), rotatedFrom: sid }
  return newSid
}

function validateCSRFToken(reqToken, sessionToken) {
  if (!reqToken || !sessionToken) return false
  if (reqToken.length !== sessionToken.length) return false
  let diff = 0
  for (let i = 0; i < reqToken.length; i++) {
    diff |= reqToken.charCodeAt(i) ^ sessionToken.charCodeAt(i)
  }
  return diff === 0
}

function isExpired(token) {
  if (typeof token.exp !== 'number') return true
  return token.exp <= Date.now()
}

function log(event, details) {
  const entry = '[' + new Date().toISOString() + '] ' + event + ': ' + JSON.stringify(details)
  audit.push(entry)
  document.getElementById('auditLog').textContent = audit.join('\\n')
}

const tokens = [
  { user: 'maya',  exp: Date.now() + 50000, sig: 'a1b2c3d4', role: 'admin', ip: '10.0.0.1' },
  { user: '',      exp: Date.now() + 50000, sig: 'abcdefgh', role: 'junior', ip: '10.0.0.2' },
  { user: 'jin',   exp: Date.now() - 1000,  sig: '12345678', role: 'senior', ip: '10.0.0.3' },
  { user: 'aris',  exp: Date.now() + 50000, sig: 'short',    role: 'viewer', ip: '10.0.0.4' },
  { user: 'noah',  exp: Date.now() + 50000, sig: 'abcdefgh', role: 'admin',  ip: '10.0.0.5' },
  { user: 'lyra',  exp: Date.now() + 50000, sig: 'x9y8z7w6', role: 'senior', ip: '10.0.0.1' },
  { user: 'evan',  exp: Date.now() + 50000, sig: 'deadbeef', role: 'viewer', ip: '10.0.0.6' },
]

const list = document.getElementById('results')
tokens.forEach((t, i) => {
  const li = document.createElement('li')

  if (isValid(t)) {
    if (checkAccess(t, 'view:classified')) {
      if (!checkBruteForce(t.ip)) {
        const sid = createSession(t.user)
        const csrfOk = validateCSRFToken(t.csrf || sid.slice(0, 8), sid.slice(0, 8))
        if (!isExpired(t) && csrfOk) {
          recordAttempt(t.ip, true)
          log('GRANTED', { user: t.user, role: t.role, session: sid, ip: t.ip })
          li.className = 'valid'
          li.textContent = t.user + ' — ACCESS GRANTED (role: ' + t.role + ')'
        } else {
          recordAttempt(t.ip, false)
          log('REJECTED', { reason: isExpired(t) ? 'expired' : 'csrf_fail', user: t.user })
          li.className = 'invalid'
          li.textContent = t.user + ' — REJECTED (' + (isExpired(t) ? 'expired token' : 'CSRF failure') + ')'
        }
      } else {
        log('REJECTED', { reason: 'brute_force', user: t.user, ip: t.ip })
        li.className = 'invalid'
        li.textContent = t.user + ' — REJECTED (rate limited)'
      }
    } else {
      recordAttempt(t.ip, false)
      log('REJECTED', { reason: 'insufficient_access', user: t.user, role: t.role })
      li.className = 'invalid'
      li.textContent = t.user + ' — REJECTED (access denied)'
    }
  } else {
    recordAttempt(t.ip, false)
    log('REJECTED', { reason: 'invalid_token', user: t.user || '???' })
    li.className = 'invalid'
    li.textContent = (t.user || '???') + ' — REJECTED (invalid token)'
  }
  list.appendChild(li)
})

document.getElementById('rotateBtn').addEventListener('click', () => {
  const firstSid = Object.keys(sessions)[0]
  if (firstSid) {
    const newSid = rotateSession(firstSid)
    document.getElementById('sessionStatus').textContent = 'SESSION: ' + newSid
    log('ROTATED', { from: firstSid, to: newSid })
  }
})`

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION 5 — THE RIG (Architect Seeker — Infrastructure / CI-CD / SRE)
// Build a deployment validation and monitoring rig: config validation, health
// checks, auto-scaling logic, log aggregation, SLA calculation, and incident
// response — all running inside a simulated infrastructure dashboard.
// ═══════════════════════════════════════════════════════════════════════════════

const F5_SCAFFOLD = `<div>
  <div id="rigHeader">
    <span class="tag">RIG v3.2.1</span>
    <span id="rigStatus" class="tag">INITIALIZING</span>
    <span id="uptimeDisplay" class="tag">UPTIME: 0%</span>
  </div>
  <div id="configPanel" style="border:1px solid #1a1a2c;padding:8px;margin:6px 0">
    <div style="font-size:9px;color:#3df0e8;margin-bottom:6px">DEPLOYMENT CONFIG</div>
    <pre id="configDisplay" style="font-size:9px;margin:0 0 6px;background:#06060c;padding:6px"></pre>
    <div id="configErrors" style="font-size:9px;color:#ff3d8b80;min-height:16px"></div>
    <button class="btn" id="validateBtn">VALIDATE CONFIG</button>
    <button class="btn" id="fixBtn" disabled>AUTO-FIX</button>
  </div>
  <div id="healthPanel" style="border:1px solid #1a1a2c;padding:8px;margin:6px 0">
    <div style="font-size:9px;color:#3df0e8;margin-bottom:6px">HEALTH CHECKS</div>
    <div id="healthStatus">No checks run</div>
    <div id="healthBars"></div>
    <button class="btn" id="healthBtn">RUN HEALTH CHECKS</button>
  </div>
  <div id="incidentPanel" style="border:1px solid #1a1a2c;padding:8px;margin:6px 0">
    <div style="font-size:9px;color:#3df0e8;margin-bottom:6px">INCIDENT LOG</div>
    <div id="incidentLog" style="font-size:8px;max-height:60px;overflow-y:auto;color:#eaf6f540"></div>
  </div>
  <div id="rigFooter" style="margin-top:6px">
    <span class="tag">MEM: <span id="memUse">0</span>MB</span>
    <span class="tag">REQ/S: <span id="reqRate">0</span></span>
    <span class="tag">INSTANCES: <span id="instanceCount">0</span></span>
  </div>
</div>`

const F5_STARTER = `// ═══════════════════════════════════════════════════════════════
// THE RIG — Deployment Validation & SRE Dashboard
// Build a full infrastructure validation rig: config validation, health
// checks with scoring, auto-scaling, SLA tracking, and incident response.
//
// BUG 1 (EASY):  typeof check === "undefined" instead of !== "undefined"
// BUG 2 (EASY):  Set dedupe uses [...new Set(arr)] written wrong
// BUG 3 (MEDIUM): health check always reports "PASS" — never reads result
// BUG 4 (MEDIUM): auto-scaling formula inverted — scales down on high load
// BUG 5 (MEDIUM): SLA calculation divides by zero when uptime = 0
// BUG 6 (HARD):   config display shows [object Object] instead of JSON
// BUG 7 (HARD):   memory usage counter overflows past 1000 MB
// BUG 8 (EXPERT): incident severity levels never escalate — stuck at WARN
// ═══════════════════════════════════════════════════════════════════

let config = {
  env: 'staging',
  region: 'us-east',
  instances: 3,
  features: ['logging', 'monitoring', 'logging'],
  alertEmail: '',
  maxMemory: 512,
  scalingThreshold: 70,
  healthEndpoints: ['/health', '/ready', '/metrics'],
}

let upSeconds = 0
let totalSeconds = 1
let incidents = []
let currentSeverity = 0
let memoryLoad = 0
let requestRate = 10

function validateConfig(cfg) {
  const errors = []
  if (!cfg || !['staging', 'production'].includes(cfg.env))
    errors.push('Invalid env: must be staging or production')
  // BUG 1: typeof cfg.region === undefined (should be === 'undefined')
  if (typeof cfg.region === undefined) errors.push('Region must be a non-empty string')
  if (typeof cfg.instances !== 'number' || cfg.instances < 1 || cfg.instances > 10)
    errors.push('Instances must be 1–10')
  // BUG 2: the "dedupe" compares the array against a plain copy of itself, so a
  // duplicate feature never trips it. It needs a Set to collapse the repeats.
  if (!Array.isArray(cfg.features) || cfg.features.length !== [...cfg.features].length)
    errors.push('Features must have no duplicates')
  if (cfg.alertEmail && !cfg.alertEmail.includes('@'))
    errors.push('Invalid alert email')
  if (typeof cfg.maxMemory !== 'number' || cfg.maxMemory < 128)
    errors.push('maxMemory must be >= 128 MB')
  if (typeof cfg.scalingThreshold !== 'number' || cfg.scalingThreshold < 10 || cfg.scalingThreshold > 100)
    errors.push('scalingThreshold must be 10–100')
  return { valid: errors.length === 0, errors }
}

function runHealthChecks() {
  const results = []
  const endpoints = config.healthEndpoints || []
  endpoints.forEach((ep, i) => {
    const latency = Math.round(Math.random() * 300 + 20)
    const status = i === 1 ? 200 : Math.random() > 0.3 ? 200 : 503
    const pass = status < 500
    results.push({ endpoint: ep, status, latency, pass })
  })
  // BUG 3: returns results but caller never uses them
  return results
}

function autoScale(currentLoad) {
  const threshold = config.scalingThreshold || 70
  // BUG 4: inverts the logic — scales DOWN when load is HIGH
  if (currentLoad > threshold) {
    config.instances = Math.max(1, config.instances - 1)
    return 'SCALED_DOWN'
  } else if (currentLoad < threshold * 0.5) {
    config.instances = Math.min(10, config.instances + 1)
    return 'SCALED_UP'
  }
  return 'STABLE'
}

function calculateSLA(uptime, total) {
  // BUG 5: division by zero when total = 0
  return Math.round((uptime / total) * 100)
}

function logIncident(message, severity) {
  // BUG 8: severity level never upgrades — stuck at 0 (WARN)
  if (severity > currentSeverity) {
    currentSeverity = severity
  }
  const levelNames = ['WARN', 'ERROR', 'CRITICAL']
  incidents.push({ time: Date.now(), message, severity: levelNames[currentSeverity] })
  const log = document.getElementById('incidentLog')
  log.innerHTML = incidents.slice(-10).map(i =>
    '<div>[' + i.severity + '] ' + i.message + '</div>'
  ).join('')
}

function updateRig() {
  const up = document.getElementById('uptimeDisplay')
  // BUG 6: config object shows as [object Object]
  document.getElementById('configDisplay').textContent = config
  document.getElementById('memUse').textContent = memoryLoad
  document.getElementById('reqRate').textContent = requestRate
  document.getElementById('instanceCount').textContent = config.instances
  // BUG 7: memory grows forever, no cap
  memoryLoad += Math.round(requestRate * 0.3)
}

// ── Event wiring ──
document.getElementById('validateBtn').addEventListener('click', () => {
  const result = validateConfig(config)
  const errDiv = document.getElementById('configErrors')
  if (result.valid) {
    errDiv.textContent = '✓ Config valid'
    errDiv.style.color = '#3df0e8'
    document.getElementById('fixBtn').disabled = true
    document.getElementById('rigStatus').textContent = 'CONFIG OK'
  } else {
    errDiv.textContent = result.errors.join('; ')
    errDiv.style.color = '#ff3d8b80'
    document.getElementById('fixBtn').disabled = false
    document.getElementById('rigStatus').textContent = 'CONFIG ERROR'
  }
})

document.getElementById('fixBtn').addEventListener('click', () => {
  // AUTO-FIX is stubbed — apply known fixes and re-validate
  document.getElementById('configErrors').textContent = 'Auto-fix not implemented — fix the bugs manually'
})

document.getElementById('healthBtn').addEventListener('click', () => {
  const results = runHealthChecks()
  // BUG 3: results are never read — status always shows 'ALL PASS'
  const healthDiv = document.getElementById('healthStatus')
  healthDiv.textContent = 'ALL CHECKS PASS'
  document.getElementById('healthBars').innerHTML = results.map(r =>
    '<div style="font-size:8px;margin:2px 0">' + r.endpoint + ' <span style="float:right">' + r.latency + 'ms</span>' +
    '<div class="bar"><div class="bar-fill" style="width:' + Math.min(100, r.latency / 3) + '%"></div></div></div>'
  ).join('')
})

setInterval(() => {
  totalSeconds++
  upSeconds++
  const sla = calculateSLA(upSeconds, totalSeconds - 1)
  if (sla >= 0) document.getElementById('uptimeDisplay').textContent = 'UPTIME: ' + sla + '%'
  const load = 30 + Math.round(Math.random() * 60)
  const scaleResult = autoScale(load)
  if (scaleResult !== 'STABLE') {
    logIncident('Auto-scaled: ' + scaleResult + ' to ' + config.instances + ' instances', 1)
  }
  updateRig()
}, 3000)

document.getElementById('rigStatus').textContent = 'ONLINE'
// BUG 7: initial memory spike
memoryLoad = 950
updateRig()`

const F5_SOLUTION = `// ═══════════════════════════════════════════════════════════════
// THE RIG — Deployment Validation & SRE Dashboard (SOLUTION)
// All 8 bugs fixed. Full validation, health scoring, proper scaling.
// ═══════════════════════════════════════════════════════════════════

let config = {
  env: 'staging',
  region: '',
  instances: 3,
  features: ['logging', 'monitoring', 'logging'],
  alertEmail: '',
  maxMemory: 512,
  scalingThreshold: 70,
  healthEndpoints: ['/health', '/ready', '/metrics'],
}

let upSeconds = 0
let totalSeconds = 1
let incidents = []
let memoryLoad = 0
let requestRate = 10

function validateConfig(cfg) {
  const errors = []
  if (!cfg || !['staging', 'production'].includes(cfg.env))
    errors.push('Invalid env: must be staging or production')
  if (typeof cfg.region !== 'string' || cfg.region.trim() === '')
    errors.push('Region must be a non-empty string')
  if (typeof cfg.instances !== 'number' || cfg.instances < 1 || cfg.instances > 10)
    errors.push('Instances must be 1–10')
  if (!Array.isArray(cfg.features) || cfg.features.length !== [...new Set(cfg.features)].length)
    errors.push('Features must have no duplicates')
  if (cfg.alertEmail && !cfg.alertEmail.includes('@'))
    errors.push('Invalid alert email')
  if (typeof cfg.maxMemory !== 'number' || cfg.maxMemory < 128)
    errors.push('maxMemory must be >= 128 MB')
  if (typeof cfg.scalingThreshold !== 'number' || cfg.scalingThreshold < 10 || cfg.scalingThreshold > 100)
    errors.push('scalingThreshold must be 10–100')
  return { valid: errors.length === 0, errors }
}

function runHealthChecks() {
  const endpoints = config.healthEndpoints || []
  return endpoints.map((ep) => {
    const latency = Math.round(Math.random() * 300 + 20)
    const status = Math.random() > 0.25 ? 200 : 503
    return { endpoint: ep, status, latency, pass: status < 500 }
  })
}

function autoScale(currentLoad) {
  const threshold = config.scalingThreshold || 70
  const over = currentLoad > threshold
  const under = currentLoad < threshold * 0.5
  if (over && config.instances < 10) {
    config.instances++
    return 'SCALED_UP'
  } else if (under && config.instances > 1) {
    config.instances--
    return 'SCALED_DOWN'
  }
  return 'STABLE'
}

function calculateSLA(uptime, total) {
  if (total <= 0) return 100
  return Math.round((uptime / total) * 100)
}

function logIncident(message, severity) {
  if (severity > currentSeverity) currentSeverity = severity
  const levelNames = ['WARN', 'ERROR', 'CRITICAL']
  incidents.push({ time: Date.now(), message, severity: levelNames[severity] })
  const log = document.getElementById('incidentLog')
  log.innerHTML = incidents.slice(-10).map(i =>
    '<div>[' + i.severity + '] ' + i.message + '</div>'
  ).join('')
  if (severity >= 2) {
    document.getElementById('rigStatus').textContent = 'CRITICAL — INCIDENT'
  }
}

let currentSeverity = 0

function updateRig() {
  document.getElementById('configDisplay').textContent = JSON.stringify(config, null, 2)
  document.getElementById('memUse').textContent = Math.min(memoryLoad, 999)
  document.getElementById('reqRate').textContent = requestRate
  document.getElementById('instanceCount').textContent = config.instances
  memoryLoad = Math.max(50, Math.min(980, memoryLoad + Math.round((requestRate * 0.3) - config.instances * 1.5)))
}

document.getElementById('validateBtn').addEventListener('click', () => {
  const result = validateConfig(config)
  const errDiv = document.getElementById('configErrors')
  if (result.valid) {
    errDiv.textContent = '✓ Config valid'
    errDiv.style.color = '#3df0e8'
    document.getElementById('fixBtn').disabled = true
    document.getElementById('rigStatus').textContent = 'CONFIG OK'
  } else {
    errDiv.textContent = result.errors.join('; ')
    errDiv.style.color = '#ff3d8b80'
    document.getElementById('fixBtn').disabled = false
    document.getElementById('rigStatus').textContent = 'CONFIG ERROR'
  }
})

document.getElementById('fixBtn').addEventListener('click', () => {
  config.env = 'production'
  config.region = 'us-east-1'
  config.instances = Math.max(1, Math.min(10, Math.floor(config.instances)))
  config.features = [...new Set(config.features)]
  if (!config.alertEmail) config.alertEmail = 'ops@eva.hq'
  if (!config.maxMemory || config.maxMemory < 128) config.maxMemory = 512
  if (!config.scalingThreshold || config.scalingThreshold < 10) config.scalingThreshold = 70
  document.getElementById('validateBtn').click()
})

document.getElementById('healthBtn').addEventListener('click', () => {
  const results = runHealthChecks()
  const allPass = results.every(r => r.pass)
  const healthDiv = document.getElementById('healthStatus')
  const passCount = results.filter(r => r.pass).length
  healthDiv.textContent = allPass ? 'ALL ' + results.length + ' CHECKS PASS' : passCount + '/' + results.length + ' CHECKS PASS'
  healthDiv.style.color = allPass ? '#3df0e8' : '#f5c453'
  if (!allPass) {
    const failed = results.filter(r => !r.pass).map(r => r.endpoint)
    logIncident('Health check failed: ' + failed.join(', '), 1)
  }
  document.getElementById('healthBars').innerHTML = results.map(r =>
    '<div style="font-size:8px;margin:2px 0;color:' + (r.pass ? '#3df0e8' : '#ff3d8b80') + '">' +
    r.endpoint + ' <span style="float:right">' + r.status + ' / ' + r.latency + 'ms</span>' +
    '<div class="bar"><div class="bar-fill" style="width:' + Math.min(100, r.latency / 3) + '%;background:' + (r.pass ? '#3df0e8' : '#ff3d8b') + '"></div></div></div>'
  ).join('')
})

setInterval(() => {
  totalSeconds++
  if (Math.random() > 0.15) upSeconds++
  const sla = calculateSLA(upSeconds, totalSeconds)
  document.getElementById('uptimeDisplay').textContent = 'UPTIME: ' + Math.min(sla, 100) + '%'
  const load = 30 + Math.round(Math.random() * 60)
  const scaleResult = autoScale(load)
  if (scaleResult !== 'STABLE') {
    logIncident('Auto-scaled: ' + scaleResult + ' to ' + config.instances + ' instances', scaleResult === 'SCALED_UP' ? 1 : 0)
  }
  if (load > 85) {
    logIncident('High load warning: ' + load + '%', 2)
  }
  requestRate = 5 + Math.round(Math.random() * 40)
  updateRig()
}, 3000)

document.getElementById('rigStatus').textContent = 'ONLINE'
logIncident('System initialized — monitoring active', 2)
updateRig()`

// ═══════════════════════════════════════════════════════════════════════════════
// THE FIVE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function functionHeadIds(n) {
  return n === 1 ? ['h1','h2','h3']
    : n === 2 ? ['h4','h5','h6']
    : n === 3 ? ['h7']
    : n === 4 ? ['h8']
    : ['h9']
}

export const FUNCTIONS = [
  {
    id: 'f1', seq: 1, phase: 1,
    role: 'interface',
    name: 'THE SHELL', glyph: '◈',
    language: 'js', filename: 'shell.js',
    brief: {
      what: 'The hydra\'s front-end carapace is malformed — it renders nothing useful. The Interface Seeker must build a live mission control dashboard: a hunter roster with sortable columns, rank filtering, case-insensitive search, pagination, click-to-select, a theme toggle that persists, and keyboard navigation.',
      skill: 'DOM rendering, event handling, state management, sorting & filtering, pagination, accessibility.',
      objective: 'Fix all 8 bugs in order. Easy bugs first (forEach, sort comparator), then medium (filter logic, case sensitivity, pagination), then hard (theme persistence, duplicate render), then expert (NaN counter handling). All wards must pass for the function to complete.',
      stages: [
        { label: 'BASE RENDER', time: '5–10 min', desc: 'Fix foreach + sort comparator so the basic table renders with correct rank order.' },
        { label: 'FILTERS', time: '10–15 min', desc: 'Fix rank filter check (value vs select value) and case-insensitive search.' },
        { label: 'PAGINATION', time: '10–15 min', desc: 'Implement working pagination with page buttons and keyboard left/right.' },
        { label: 'STATE & UX', time: '15–20 min', desc: 'Fix theme toggle persistence, duplicate render bug, and NaN counter.' },
        { label: 'INTEGRATION', time: '20–30 min', desc: 'All wards pass together. Sort + filter + search + paginate in any combination without errors.' },
      ],
    },
    starter: F1_STARTER,
    solution: F1_SOLUTION,
    buildPreview: (code) => jsDoc(F1_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(F1_SCAFFOLD, code),
    headIds: functionHeadIds(1),
    wards: [
      { id: 'f1_nocrash', label: 'Script crashes — roster stays empty (BUG 1)',
        hint: 'Open the console. The error says "foreach is not a function" — fix the method name to forEach.',
        test: (doc) => { const tbody = doc.getElementById('rosterBody'); return !!tbody && tbody.children.length > 0 } },
      { id: 'f1_sort', label: 'Sort order is alphabetical, not by rank (BUG 2)',
        hint: 'JavaScript\'s .sort() without a comparator converts to strings. Provide a function that orders by rank priority (S first, E last).',
        test: (doc) => {
          const rows = doc.querySelectorAll('#rosterBody tr')
          if (rows.length < 2) return false
          const ranks = [...rows].map(r => r.cells[1]?.textContent)
          const order = ['S','A','B','C','D','E']
          const idx = ranks.map(r => order.indexOf(r))
          for (let i = 1; i < idx.length; i++) { if (idx[i-1] > idx[i]) return false }
          return true
        } },
      { id: 'f1_filter_rank', label: 'Rank filter shows all ranks regardless of selection (BUG 3)',
        hint: 'The filter checks "h.value" but the select element has "option value". The hunter property is "rank", not "value".',
        test: (doc) => {
          const sel = doc.getElementById('rankFilter')
          if (!sel) return false
          sel.value = 'S'
          sel.dispatchEvent(new Event('change'))
          const rows = doc.querySelectorAll('#rosterBody tr')
          sel.value = 'all'
          sel.dispatchEvent(new Event('change'))
          return rows.length >= 2 && [...rows].every(r => r.cells[1]?.textContent === 'S')
        } },
      { id: 'f1_search', label: 'Search is case-sensitive — "maya" finds nothing (BUG 4)',
        hint: '.includes() is case-sensitive. Convert both the search value and the hunter name to .toLowerCase() before comparing.',
        test: (doc) => {
          const input = doc.getElementById('search')
          if (!input) return false
          input.value = 'maya'
          input.dispatchEvent(new Event('input'))
          const rows = doc.querySelectorAll('#rosterBody tr')
          input.value = ''
          input.dispatchEvent(new Event('input'))
          return rows.length >= 1 && rows[0].cells[0]?.textContent === 'MAYA K'
        } },
      { id: 'f1_pagination', label: 'Cannot advance past page 1 — no pagination controls (BUG 5)',
        hint: 'The pageInfo shows "Page 1 of N" but there is no way to reach page 2. Add keyboard left/right arrow handling to advance pages.',
        test: (doc) => {
          const pageInfo = doc.getElementById('pageInfo')
          if (!pageInfo) return false
          doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
          const afterPage = pageInfo.textContent
          doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
          return afterPage !== 'Page 1 of 1'
        } },
      { id: 'f1_theme', label: 'Theme toggle doesn\'t persist — resets instantly (BUG 6)',
        hint: 'The toggle flips the darkMode boolean but never calls render() afterward, so the DOM never repaints. Toggling twice must return the page to its original background.',
        test: (doc) => {
          const btn = doc.getElementById('themeBtn')
          if (!btn) return false
          const before = doc.body.style.background
          btn.click()
          const on = doc.body.style.background
          btn.click()
          const off = doc.body.style.background
          // Dark must actually apply, and toggling back must restore it.
          return on !== '' && on !== before && off === before
        } },
      { id: 'f1_duplicates', label: 'Duplicate hunters accumulate on each keystroke (BUG 7)',
        hint: 'Every call to render() appends rows without clearing tbody first. Add tbody.innerHTML = "" at the start of render.',
        test: (doc) => {
          const input = doc.getElementById('search')
          if (!input) return false
          input.value = 'a'
          input.dispatchEvent(new Event('input'))
          const count1 = doc.querySelectorAll('#rosterBody tr').length
          input.dispatchEvent(new Event('input'))
          const count2 = doc.querySelectorAll('#rosterBody tr').length
          input.value = ''
          input.dispatchEvent(new Event('input'))
          // Rows must actually render (a dead script also "never duplicates"),
          // and a re-render must not grow the table.
          return count1 > 0 && count2 === count1
        } },
      { id: 'f1_nan', label: 'Counter shows NaN when no hunters match filter (BUG 8)',
        hint: 'When filtered.length is 0, shownCount.textContent = 0 || "NaN" resolves to the string "NaN". Fix the fallback so the counter reports a real number — including zero.',
        test: (doc) => {
          const input = doc.getElementById('search')
          if (!input) return false
          input.value = 'maya'
          input.dispatchEvent(new Event('input'))
          const some = doc.getElementById('shownCount')?.textContent
          input.value = 'ZZZZNOMATCH'
          input.dispatchEvent(new Event('input'))
          const none = doc.getElementById('shownCount')?.textContent
          input.value = ''
          input.dispatchEvent(new Event('input'))
          // The counter must track real matches (1 for "maya") AND report a
          // literal 0 on no match — the scaffold ships with "0" already, so
          // only the pair proves the counter is live.
          return some === '1' && none === '0'
        } },
    ],
  },
  {
    id: 'f2', seq: 2, phase: 2,
    role: 'signal',
    name: 'THE PIPELINE', glyph: '◉',
    language: 'js', filename: 'pipeline.js',
    brief: {
      what: 'The hydra\'s nerve pipeline is severed — no signal reaches the party. The Signal Seeker must compose a middleware pipeline that processes 4 test requests through 6 stages: timestamp, path parse, auth check, rate limit, cache lookup, and response.',
      skill: 'Middleware composition, async/await, error propagation, rate limiting, caching, request processing.',
      objective: 'Fix all 8 bugs. The pipeline must process all requests without stalling, with correct auth, rate limiting that refreshes, cache hits registering, and errors logged to the DOM.',
      stages: [
        { label: 'CHAIN BASICS', time: '5–10 min', desc: 'Fix attachTimestamp next() call and compose loop bounds so the chain runs.' },
        { label: 'REQUEST PARSING', time: '10 min', desc: 'Fix URL parsing crash on no-query URLs.' },
        { label: 'AUTH & RATE', time: '10–15 min', desc: 'Fix auth comparison and rate limiter timestamp cleanup.' },
        { label: 'CACHE & ERRORS', time: '15–20 min', desc: 'Fix cache key lookup, error middleware invocation, and DOM logging.' },
        { label: 'ASYNC SUPPORT', time: '15–20 min', desc: 'Fix missing async/await — pipeline must handle middleware that returns Promises.' },
      ],
    },
    starter: F2_STARTER,
    solution: F2_SOLUTION,
    buildPreview: (code) => jsDoc(F2_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(F2_SCAFFOLD, code),
    headIds: functionHeadIds(2),
    wards: [
      { id: 'f2_chain', label: 'Pipeline stalls at step 1 — next() never called (BUG 1)',
        hint: 'attachTimestamp stamps the request and then stops. Every middleware must hand control on by calling next().',
        test: (doc, win) => {
          if (typeof win.attachTimestamp !== 'function') return false
          let handedOn = false
          const req = {}
          win.attachTimestamp(req, () => { handedOn = true })
          return handedOn === true && typeof req.startedAt === 'number'
        } },
      { id: 'f2_compose', label: 'Compose stops one short — the last middleware never runs (BUG 2)',
        hint: 'The loop guard is i < middleware.length - 1, so the final step is dropped. Walk the whole array.',
        test: (doc, win) => {
          if (typeof win.compose !== 'function') return false
          const seen = []
          const step = (tag) => (req, next) => { seen.push(tag); next() }
          win.compose(step('a'), step('b'), step('c'))({ id: 'probe' })
          return seen.join('') === 'abc'
        } },
      { id: 'f2_urlparse', label: 'URL parsing crashes on paths without query strings (BUG 3)',
        hint: 'url.split("?")[1] is undefined when there is no query string, and calling .split("&") on undefined throws. Only parse the query when one is actually present.',
        test: (doc, win) => {
          if (typeof win.parsePath !== 'function') return false
          const bare = { rawUrl: '/hunters' }
          let reached = false
          try { win.parsePath(bare, () => { reached = true }) } catch { return false }
          if (!reached || bare.path !== '/hunters') return false
          if (!bare.query || Object.keys(bare.query).length !== 0) return false
          // …and a real query string must still be parsed.
          const withQuery = { rawUrl: '/hunters?page=2&rank=S' }
          try { win.parsePath(withQuery, () => {}) } catch { return false }
          return withQuery.path === '/hunters' && withQuery.query.page === '2' && withQuery.query.rank === 'S'
        } },
      { id: 'f2_ratelimit', label: 'Rate limiter pools every client into one bucket (BUG 4)',
        hint: 'One shared timestamps array means a single noisy caller rate-limits the whole world. Key the bucket by req.client, and prune entries older than the window.',
        test: (doc, win) => {
          if (typeof win.rateLimit !== 'function') return false
          const call = (client) => {
            let err = null
            win.rateLimit({ client }, (e) => { err = e || null })
            return err
          }
          // Flood one client past the limit…
          for (let i = 0; i < 8; i++) call('flood-test')
          if (!call('flood-test')) return false
          // …a different client must still get through.
          return call('quiet-test') === null
        } },
      { id: 'f2_auth', label: 'Auth check is inverted — public paths fail, private ones walk in (BUG 5)',
        hint: 'The branch fires when the path is NOT public, so private routes skip the token check entirely and public ones get rejected. Flip the comparison.',
        test: (doc, win) => {
          if (typeof win.checkAuth !== 'function') return false
          const run = (req) => {
            let err = null
            win.checkAuth(req, (e) => { err = e || null })
            return err
          }
          // A public path with no token is fine…
          if (run({ path: '/health', token: '' })) return false
          // …a private path with no usable token must be rejected…
          if (!run({ path: '/hunters', token: '' })) return false
          // …and a private path with a real token goes through authenticated.
          const good = { path: '/hunters', token: 'validtoken123' }
          return run(good) === null && good.authenticated === true
        } },
      { id: 'f2_cache', label: 'Cache never returns cached results — always 0 hits (BUG 6)',
        hint: 'respond() stores the payload under .result but checkCache looks for .data, so the lookup never matches. Read the property that is actually written.',
        test: (doc, win) => {
          if (typeof win.compose !== 'function') return false
          // Same request twice through parse → cache → respond. The second pass
          // must be served from the cache written by the first.
          const run = win.compose(win.parsePath, win.checkCache, win.respond, (e, r, n) => {})
          const first = { id: 'cache-probe-1', rawUrl: '/cache-probe' }
          const second = { id: 'cache-probe-2', rawUrl: '/cache-probe' }
          run(first)
          run(second)
          return first.cached !== true && second.cached === true
        } },
      { id: 'f2_errors', label: 'Errors swallowed silently — nothing logged to DOM (BUG 7)',
        hint: 'errorHandler records the message on the request and stops there. Append it to #errLog so a failed request is visible.',
        test: (doc, win) => {
          if (typeof win.errorHandler !== 'function') return false
          const log = doc.getElementById('errLog')
          if (!log) return false
          const before = log.children.length
          const req = {}
          win.errorHandler(new Error('PROBE_FAILURE'), req, () => {})
          return req.error === 'PROBE_FAILURE'
            && log.children.length === before + 1
            && /PROBE_FAILURE/.test(log.textContent)
        } },
      { id: 'f2_async', label: 'Pipeline ignores promise-returning middleware (BUG 8)',
        hint: 'compose calls fn(req, next) and throws the return value away, so an async middleware that rejects fails silently. Inspect the result — if it is a promise, route its rejection into next(err).',
        test: (doc, win) => {
          if (typeof win.compose !== 'function') return false
          // A promise-like whose settle handlers record that they were attached.
          let observed = false
          const thenable = {
            then: () => { observed = true; return thenable },
            catch: () => { observed = true; return thenable },
          }
          win.compose(() => thenable, (req, next) => next())({ id: 'async-probe' })
          return observed === true
        } },
    ],
  },
  {
    id: 'f3', seq: 3, phase: 3,
    role: 'vault',
    name: 'THE STORE', glyph: '⬡',
    language: 'js', filename: 'store.js',
    brief: {
      what: 'The hydra\'s data store leaks bad records — corrupted queries poison the party\'s intelligence. The Vault Seeker must build a full query engine over 15 hunt records: filter by type/search term, sort by date/kills/monster, group-by-zone with aggregate stats, and paginate results.',
      skill: 'Data filtering & sorting, case-insensitive search, aggregation, grouping, pagination, DOM rendering.',
      objective: 'Fix all 8 bugs. The query engine must correctly filter by hunt type (behemoth/swarm/herald), search by monster or hunter name, sort chronologically/by kills/alphabetically, group by zone with correct kill sums, and paginate at 5 rows per page.',
      stages: [
        { label: 'BASIC QUERY', time: '5–10 min', desc: 'Fix typo "staus" → "status" so type filter works at all.' },
        { label: 'SORT & SEARCH', time: '10–15 min', desc: 'Fix date sort (string → chronological), case-insensitive search, and monster sort (length → alphabetical).' },
        { label: 'AGGREGATION', time: '15–20 min', desc: 'Fix kill sum using filtered data (not original), NaN display in grouped stats, and toggle state stuckness.' },
        { label: 'PAGINATION', time: '15–20 min', desc: 'Add pagination controls (prev/next), page tracking, and disable at bounds.' },
        { label: 'FULL PIPELINE', time: '20–30 min', desc: 'All features working together: search + filter + sort + group + paginate with correct counts.' },
      ],
    },
    starter: F3_STARTER,
    solution: F3_SOLUTION,
    buildPreview: (code) => jsDoc(F3_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(F3_SCAFFOLD, code),
    headIds: functionHeadIds(3),
    wards: [
      { id: 'f3_typo', label: 'Type filter uses wrong field — "behemoth" filter returns nothing (BUG 1)',
        hint: 'The filter checks h.staus — but the property is named "type" in the data.',
        test: (doc) => {
          const sel = doc.getElementById('qType')
          if (!sel) return false
          sel.value = 'behemoth'
          sel.dispatchEvent(new Event('change'))
          const rows = doc.querySelectorAll('#qBody tr')
          sel.value = 'all'
          sel.dispatchEvent(new Event('change'))
          return rows.length >= 3
        } },
      { id: 'f3_datesort', label: 'Date sort sorts alphabetically, not chronologically (BUG 2)',
        hint: 'The ledger writes dates unpadded — "2081-3-12" and "2081-11-04". Compared as strings, "11" sorts before "3", so November lands before March. Split the parts and compare them as numbers (or build real Date objects) instead.',
        test: (doc) => {
          const sel = doc.getElementById('qSort')
          if (!sel) return false
          sel.value = 'date'
          sel.dispatchEvent(new Event('change'))
          const rows = doc.querySelectorAll('#qBody tr')
          if (rows.length < 2) return false
          const stamp = (s) => {
            const p = (s || '').trim().split('-').map(Number)
            return p.length === 3 && p.every(n => !isNaN(n)) ? p[0] * 10000 + p[1] * 100 + p[2] : NaN
          }
          const stamps = [...rows].map(r => stamp(r.cells[0]?.textContent))
          if (stamps.some(isNaN)) return false
          for (let i = 1; i < stamps.length; i++) { if (stamps[i - 1] > stamps[i]) return false }
          // Chronologically the oldest hunt is 2081-3-12; a string sort would
          // put an October or November row first.
          return stamps[0] === 20810312
        } },
      { id: 'f3_monstersort', label: 'Monster sort orders by name length, not alphabetically (BUG 5)',
        hint: 'The comparator subtracts .length values, so short names float to the top. Compare the names themselves — .localeCompare() does it properly.',
        test: (doc) => {
          const sel = doc.getElementById('qSort')
          if (!sel) return false
          sel.value = 'monster'
          sel.dispatchEvent(new Event('change'))
          const rows = doc.querySelectorAll('#qBody tr')
          const names = [...rows].map(r => (r.cells[2]?.textContent || '').trim())
          sel.value = 'date'
          sel.dispatchEvent(new Event('change'))
          if (names.length < 2) return false
          for (let i = 1; i < names.length; i++) {
            if (names[i - 1].localeCompare(names[i]) > 0) return false
          }
          // Alphabetically first is "Crawler Brood"; by length it would be
          // "Varkul Echo" (the shortest name in the ledger).
          return names[0] === 'Crawler Brood'
        } },
      { id: 'f3_search', label: 'Search is case-sensitive — "ravager" finds nothing (BUG 3)',
        hint: 'h.monster.includes(search) is case-sensitive. Convert both to lowercase.',
        test: (doc) => {
          const input = doc.getElementById('qSearch')
          if (!input) return false
          input.value = 'ravager'
          input.dispatchEvent(new Event('input'))
          const rows = doc.querySelectorAll('#qBody tr')
          input.value = ''
          input.dispatchEvent(new Event('input'))
          return rows.length >= 2
        } },
      { id: 'f3_aggregation', label: 'Aggregation prints NaN for a zone with zero kills (BUG 4)',
        hint: 'g.totalKills || "NaN" falls through to the string "NaN" whenever the real total is 0 — and Sector 0 (two Varkul Echo herald hunts, no kills) is exactly that case. Print the number itself; zero is a legitimate total.',
        test: (doc) => {
          const sel = doc.getElementById('qType')
          const btn = doc.getElementById('qGroupBtn')
          if (!sel || !btn) return false
          sel.value = 'herald'
          sel.dispatchEvent(new Event('change'))
          btn.click()
          const agg = (doc.getElementById('qAgg')?.textContent || '')
          btn.click()
          sel.value = 'all'
          sel.dispatchEvent(new Event('change'))
          // The grouped view must actually render, must name the zero-kill zone,
          // and must never print the string NaN.
          return agg.includes('Sector 0') && !agg.includes('NaN')
        } },
      { id: 'f3_group', label: 'Grouping toggle never ungroups (BUG 6)',
        hint: 'The click handler never flips the groupByZone boolean. It stays false forever.',
        test: (doc) => {
          const btn = doc.getElementById('qGroupBtn')
          if (!btn) return false
          btn.click()
          const agg1 = doc.getElementById('qAgg')?.innerHTML.length > 0
          btn.click()
          const agg2 = doc.getElementById('qAgg')?.innerHTML.length > 0
          return agg1 && !agg2
        } },
      { id: 'f3_killssum', label: 'Kill sums use original data, not filtered (BUG 7)',
        hint: 'The zone total re-reads every hunt in that zone from the original array, so a filtered-out hunt still adds its kills. Sector 4 holds two swarm hunts (31 + 19) and one behemoth — filtered to swarm it must read 50, not 51. Sum the records you already filtered.',
        test: (doc) => {
          const sel = doc.getElementById('qType')
          const btn = doc.getElementById('qGroupBtn')
          if (!sel || !btn) return false
          sel.value = 'swarm'
          sel.dispatchEvent(new Event('change'))
          btn.click()
          const row = [...doc.querySelectorAll('#qAgg tr')]
            .find(r => (r.cells?.[0]?.textContent || '').trim() === 'Sector 4')
          const kills = row ? (row.cells[2]?.textContent || '').trim() : null
          btn.click()
          sel.value = 'all'
          sel.dispatchEvent(new Event('change'))
          return kills === '50'
        } },
      { id: 'f3_pagination', label: 'No pagination — all rows render at once (BUG 8)',
        hint: 'Every row in the filtered dataset is appended to tbody. Implement PAGE_SIZE = 5 and slice the array before rendering.',
        test: (doc) => {
          const input = doc.getElementById('qSearch')
          if (!input) return false
          input.value = ''
          input.dispatchEvent(new Event('input'))
          const rows = doc.querySelectorAll('#qBody tr')
          return rows.length <= 5
        } },
    ],
  },
  {
    id: 'f4', seq: 4, phase: 3,
    role: 'cipher',
    name: 'THE SEAL', glyph: '⬢',
    language: 'js', filename: 'seal.js',
    brief: {
      what: 'The hydra\'s security seal is cracked — invalid tokens flood the gate, sessions never rotate, and the audit log overwrites itself. The Cipher Seeker must fix the authentication gateway: token validation, RBAC enforcement, brute-force detection, session rotation, CSRF protection, and a proper audit trail.',
      skill: 'Boolean logic, authentication & authorization, session management, rate limiting, constant-time comparison, audit logging.',
      objective: 'Fix all 8 bugs. Three tokens must be granted access (maya/admin, noah/admin, lyra/junior), two rejected on validation (empty user, expired, short sig), one rejected on access level (evan/viewer denied classified), and session rotation must generate a new ID.',
      stages: [
        { label: 'VALIDATION', time: '5–10 min', desc: 'Fix operator precedence in isValid() — && must group all three conditions.' },
        { label: 'BRUTE FORCE', time: '10 min', desc: 'Fix bruteForceAttempts increment — counter never advances, never blocks.' },
        { label: 'ACCESS CONTROL', time: '10–15 min', desc: 'Fix RBAC comparison so viewer-level tokens are denied classified operations.' },
        { label: 'SESSION & AUDIT', time: '15 min', desc: 'Fix session rotation (returns same ID) and audit log (overwrites instead of appending).' },
        { label: 'ADVANCED', time: '20–30 min', desc: 'Fix CSRF token validation (always returns true), timing attack (early return on user check), and token expiry comparison (<= vs <).' },
      ],
    },
    starter: F4_STARTER,
    solution: F4_SOLUTION,
    buildPreview: (code) => jsDoc(F4_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(F4_SCAFFOLD, code),
    headIds: functionHeadIds(4),
    wards: [
      { id: 'f4_isvalid', label: 'isValid() lets invalid tokens through — operator precedence (BUG 1)',
        hint: 'Boolean && has higher precedence than ||. Your expression evaluates as (A && B) || (C && D && E) || F. Wrap all three conditions in &&: return (A && B && C).',
        test: (doc) => {
          const valids = doc.querySelectorAll('#results li.valid')
          return valids.length === 3
        } },
      { id: 'f4_bruteforce', label: 'Brute-force counter never increments — never blocks (BUG 2)',
        hint: 'bruteForceAttempts[ip] = (bruteForceAttempts[ip] || 0) reads the old value and writes it straight back, so it is pinned at 0 forever. Add 1. After five failed attempts from one IP, checkBruteForce must report true.',
        test: (doc, win) => {
          if (typeof win.recordAttempt !== 'function' || typeof win.checkBruteForce !== 'function') return false
          const ip = '203.0.113.77'
          if (win.checkBruteForce(ip)) return false        // clean IP starts unblocked
          for (let i = 0; i < 5; i++) win.recordAttempt(ip, false)
          if (!win.checkBruteForce(ip)) return false        // five failures must lock it
          win.recordAttempt(ip, true)                       // a success clears the record
          return win.checkBruteForce(ip) === false
        } },
      { id: 'f4_rbac', label: 'RBAC lets any known role reach classified records (BUG 3)',
        hint: 'checkAccess only asks whether the role exists in ACCESS_LEVELS — it never compares it to the level the operation requires. "view:classified" needs senior (2); a viewer (0) must be turned away.',
        test: (doc, win) => {
          if (typeof win.checkAccess !== 'function') return false
          if (win.checkAccess({ role: 'viewer' }, 'view:classified')) return false
          if (!win.checkAccess({ role: 'senior' }, 'view:classified')) return false
          if (win.checkAccess({ role: 'junior' }, 'delete:hunt')) return false
          // …and the viewer in the token list is visibly turned away.
          return [...doc.querySelectorAll('#results li.invalid')]
            .some(li => /access denied/i.test(li.textContent))
        } },
      { id: 'f4_sessionrot', label: 'Session rotation returns the same session ID (BUG 4)',
        hint: 'rotateSession() hands back the sid it was given. It must retire the old session and mint a fresh id — so two rotations in a row must never show the same id twice.',
        test: (doc) => {
          const status = doc.getElementById('sessionStatus')
          const btn = doc.getElementById('rotateBtn')
          if (!btn || !status) return false
          btn.click()
          const first = status.textContent
          btn.click()
          const second = status.textContent
          // Both rotations must produce a real, and different, session id —
          // the placeholder changing once proves nothing.
          return /sess_/.test(first) && /sess_/.test(second) && first !== second
        } },
      { id: 'f4_audit', label: 'Audit log overwrites previous entries (BUG 5)',
        hint: 'document.getElementById("auditLog").textContent = entry replaces the entire log. Use += or join the audit array.',
        test: (doc) => {
          const log = doc.getElementById('auditLog')
          if (!log) return false
          return (log.textContent.match(/GRANTED|REJECTED|ROTATED/g) || []).length >= 3
        } },
      { id: 'f4_expiry', label: 'Token expiry check is inverted — fresh tokens read as expired (BUG 6)',
        hint: 'isExpired returns Date.now() <= token.exp, which is true for every token that is still GOOD. Flip it: a token is expired when its exp has already passed.',
        test: (doc, win) => {
          if (typeof win.isExpired !== 'function') return false
          if (win.isExpired({ exp: Date.now() + 60000 })) return false   // fresh
          if (!win.isExpired({ exp: Date.now() - 60000 })) return false  // stale
          if (!win.isExpired({})) return false                           // no exp at all
          // jin's token really is expired and must be called out as such,
          // while nobody with a live token gets the expired stamp.
          const lis = [...doc.querySelectorAll('#results li')]
          const jin = lis.find(li => li.textContent.startsWith('jin'))
          const expiredCount = lis.filter(li => /expired/i.test(li.textContent)).length
          return !!jin && /expired/i.test(jin.textContent) && expiredCount === 1
        } },
      { id: 'f4_csrf', label: 'CSRF token validation always passes — no actual check (BUG 7)',
        hint: 'validateCSRFToken() returns true unconditionally. Compare for real: reject empty tokens, reject length mismatches, then XOR every character so the comparison takes the same time whatever the input.',
        test: (doc, win) => {
          if (typeof win.validateCSRFToken !== 'function') return false
          return win.validateCSRFToken('a1b2c3d4', 'a1b2c3d4') === true
            && win.validateCSRFToken('a1b2c3d4', 'deadbeef') === false
            && win.validateCSRFToken('short', 'a1b2c3d4') === false
            && win.validateCSRFToken('', '') === false
        } },
      { id: 'f4_timing', label: 'Timing leak — the empty-user check short-circuits validation (BUG 8)',
        hint: 'The loop bails out on !t.user before isValid() ever runs, so an attacker learns which field failed from how fast the answer comes back. Delete the early return and let every token walk the same path.',
        test: (doc, win) => {
          if (typeof win.isValid !== 'function') return false
          // A blank user must be rejected BY the validator, not by a shortcut.
          if (win.isValid({ user: '', exp: Date.now() + 60000, sig: 'abcdefgh' })) return false
          if (!win.isValid({ user: 'maya', exp: Date.now() + 60000, sig: 'abcdefgh' })) return false
          const lis = [...doc.querySelectorAll('#results li')]
          return lis.length >= 7 && !lis.some(li => /empty user/i.test(li.textContent))
        } },
    ],
  },
  {
    id: 'f5', seq: 5, phase: 3,
    role: 'architect',
    name: 'THE RIG', glyph: '△',
    language: 'js', filename: 'rig.js',
    brief: {
      what: 'The hydra\'s deployment rig has no checks — bad configs ship, health checks report false passes, auto-scaling runs backwards, and SLA math divides by zero. The Architect Seeker must fix the infrastructure dashboard: config validation, health checks with live scoring, auto-scaling, SLA tracking, incident severity escalation, and memory monitoring.',
      skill: 'Config validation, health check systems, auto-scaling algorithms, SLA calculation, incident management, real-time monitoring dashboards.',
      objective: 'Fix all 8 bugs. The config validator must catch all 6 rules, health checks must report pass/fail per endpoint, auto-scaling must scale up under load and down when idle, SLA must never divide by zero, incidents must escalate to CRITICAL, and memory must cap at 999 MB.',
      stages: [
        { label: 'VALIDATION', time: '5–10 min', desc: 'Fix typeof comparison and Set dedupe syntax so config validation works correctly.' },
        { label: 'HEALTH CHECKS', time: '10–15 min', desc: 'Fix health check results being ignored — read the pass/fail array and display real status.' },
        { label: 'SCALING & SLA', time: '15–20 min', desc: 'Fix auto-scaling direction (inverted) and SLA division by zero.' },
        { label: 'DISPLAY & MEMORY', time: '15 min', desc: 'Fix config display showing [object Object] and memory overflow past 1000 MB.' },
        { label: 'INCIDENT RESPONSE', time: '20–30 min', desc: 'Fix severity escalation — incidents must progress from WARN → ERROR → CRITICAL based on severity value.' },
      ],
    },
    starter: F5_STARTER,
    solution: F5_SOLUTION,
    buildPreview: (code) => jsDoc(F5_SCAFFOLD, code),
    buildCheckDoc: (code) => jsDoc(F5_SCAFFOLD, code),
    headIds: functionHeadIds(5),
    wards: [
      { id: 'f5_typeof', label: 'typeof comparison is wrong — region check never fires (BUG 1)',
        hint: 'typeof cfg.region === undefined compares against the VALUE undefined, but typeof always hands back a string — so the test is dead. Write === "undefined" (quoted), or better, reject anything that is not a non-empty string.',
        test: (doc, win) => {
          if (typeof win.validateConfig !== 'function') return false
          const base = { env: 'staging', instances: 3, features: ['a', 'b'], alertEmail: '', maxMemory: 512, scalingThreshold: 70, healthEndpoints: [] }
          const region = (r) => (win.validateConfig({ ...base, region: r }).errors || []).some(e => /region/i.test(e))
          // A blank or missing region must be caught; a real one must not.
          return region('') && region(undefined) && !region('us-east')
        } },
      { id: 'f5_dedupe', label: 'Duplicate features slip through validation (BUG 2)',
        hint: 'The check compares cfg.features.length against [...cfg.features].length — a copy of the same array, so the lengths always match. Collapse the repeats first: [...new Set(cfg.features)].',
        test: (doc, win) => {
          if (typeof win.validateConfig !== 'function') return false
          const base = { env: 'staging', region: 'us-east', instances: 3, alertEmail: '', maxMemory: 512, scalingThreshold: 70, healthEndpoints: [] }
          const dupes = (f) => (win.validateConfig({ ...base, features: f }).errors || []).some(e => /duplicate/i.test(e))
          // Repeats must be flagged; a clean list must pass untouched.
          return dupes(['logging', 'monitoring', 'logging']) && !dupes(['logging', 'monitoring'])
        } },
      { id: 'f5_health', label: 'Health checks always report "ALL PASS" — results ignored (BUG 3)',
        hint: 'runHealthChecks() hands back a result per endpoint, but the click handler drops them and prints a hardcoded banner. Count the passes and report the real tally against the number of endpoints.',
        test: (doc) => {
          const btn = doc.getElementById('healthBtn')
          if (!btn) return false
          btn.click()
          const status = doc.getElementById('healthStatus')?.textContent || ''
          const bars = doc.getElementById('healthBars')?.children.length ?? 0
          // The banner must carry a real count (3 endpoints), not a fixed string.
          return /\d/.test(status) && status.includes('3') && bars === 3
        } },
      { id: 'f5_autoscale', label: 'Auto-scaling scales DOWN when load is HIGH — inverted (BUG 4)',
        hint: 'Load above the threshold currently decrements instances. High load must SCALE_UP and idle load must SCALE_DOWN — swap the two branches.',
        test: (doc, win) => {
          if (typeof win.autoScale !== 'function') return false
          return win.autoScale(95) === 'SCALED_UP'      // hammered → add capacity
            && win.autoScale(5) === 'SCALED_DOWN'       // idle → give it back
            && win.autoScale(50) === 'STABLE'           // in-band → leave it alone
        } },
      { id: 'f5_sla', label: 'SLA divides by zero when no seconds have elapsed (BUG 5)',
        hint: 'calculateSLA(uptime, 0) evaluates 0 / 0 → NaN, which poisons the whole uptime readout. Guard the zero case (a rig with no elapsed time is at 100%) before dividing.',
        test: (doc, win) => {
          if (typeof win.calculateSLA !== 'function') return false
          const zero = win.calculateSLA(0, 0)
          // Must survive the zero case with a real number, and still do the math.
          return Number.isFinite(zero) && zero === 100
            && win.calculateSLA(9, 10) === 90
            && win.calculateSLA(1, 1) === 100
        } },
      { id: 'f5_configdisplay', label: 'Config display shows [object Object] instead of JSON (BUG 6)',
        hint: 'Setting textContent to a plain object calls .toString() which gives "[object Object]". Use JSON.stringify(cfg, null, 2).',
        test: (doc) => {
          const display = doc.getElementById('configDisplay')?.textContent || ''
          return display.includes('"env"')
        } },
      { id: 'f5_memory', label: 'Memory counter overflows past 1000 MB (BUG 7)',
        hint: 'memoryLoad climbs every tick with nothing holding it back — it reads fine for the first few seconds and then runs off the end of the gauge. Cap the display with Math.min() and let the load drain back down when instances can absorb it.',
        test: (doc, win) => {
          if (typeof win.updateRig !== 'function') return false
          // Run the rig hard: the gauge must still read a sane number.
          for (let i = 0; i < 40; i++) win.updateRig()
          const mem = parseInt(doc.getElementById('memUse')?.textContent ?? '', 10)
          return Number.isFinite(mem) && mem >= 0 && mem <= 999
        } },
      { id: 'f5_severity', label: 'Incident severity never escalates — stuck at WARN (BUG 8)',
        hint: 'logIncident checks if severity > currentSeverity, but currentSeverity starts at 0 (WARN) and never resets. High-severity incidents must also set the rig status to CRITICAL.',
        test: (doc) => {
          const log = doc.getElementById('incidentLog')
          if (!log) return false
          return log.textContent.includes('ERROR') || log.textContent.includes('CRITICAL')
        } },
    ],
  },
]

export const FUNCTIONS_BY_ID = Object.fromEntries(FUNCTIONS.map(f => [f.id, f]))
export const FUNCTIONS_BY_ROLE = Object.fromEntries(FUNCTIONS.map(f => [f.role, f]))
export const FUNCTION_COUNT = FUNCTIONS.length

// ═══════════════════════════════════════════════════════════════════════════════
// HUNTER SPECIALIZATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const ROLES = {
  interface: {
    id: 'interface', label: 'INTERFACE SEEKER', glyph: '◈', color: '#3df0e8', seq: 1,
    owns: 'THE SHELL — Frontend (DOM, Events, State, UX)',
    duty: 'Opens the raid. Build the mission control dashboard the party fights from.',
    skills: ['DOM rendering', 'Event handling', 'Sorting & filtering', 'State management', 'Pagination', 'Keyboard navigation'],
    flavor: 'The interface is the first wound — without it, the party fights blind. Every pixel is a weapon.',
  },
  signal: {
    id: 'signal', label: 'SIGNAL SEEKER', glyph: '◉', color: '#f5c453', seq: 2,
    owns: 'THE PIPELINE — Backend (Middleware, Auth, Cache, Rate Limiting)',
    duty: 'Second function. Compose the middleware chain that processes every request.',
    skills: ['Middleware composition', 'Request/response processing', 'Error propagation', 'Rate limiting', 'Caching', 'Async/await'],
    flavor: 'The signal carries every command. If the pipeline breaks, the party becomes a mob with good intentions.',
  },
  vault: {
    id: 'vault', label: 'VAULT SEEKER', glyph: '⬡', color: '#ff3d8b', seq: 3,
    owns: 'THE STORE — Data (Query Engine, Aggregation, Pagination)',
    duty: 'Third function. Build the query engine that turns raw records into intelligence.',
    skills: ['Data filtering', 'Sorting algorithms', 'Case-insensitive search', 'Group & aggregate', 'Pagination', 'DOM rendering'],
    flavor: 'Every record tells you where the beast will move next. A bad query is a death sentence.',
  },
  cipher: {
    id: 'cipher', label: 'CIPHER SEEKER', glyph: '⬢', color: '#eaf6f5', seq: 4,
    owns: 'THE SEAL — Security (Auth, RBAC, Sessions, Audit)',
    duty: 'Fourth function. The gate opens only when the seal holds against every attack vector.',
    skills: ['Boolean logic & operator precedence', 'Token validation', 'Role-based access control', 'Session management', 'CSRF protection', 'Audit logging'],
    flavor: 'The seal does not discriminate. It either holds for everyone or lets everyone through to die.',
  },
  architect: {
    id: 'architect', label: 'ARCHITECT SEEKER', glyph: '△', color: '#7c5cfc', seq: 5,
    owns: 'THE RIG — Infrastructure (Config, Health, Scaling, SRE)',
    duty: 'The closer. Validate the rig, run health checks, keep the infrastructure standing.',
    skills: ['Config validation', 'Health check design', 'Auto-scaling logic', 'SLA calculation', 'Incident management', 'Real-time monitoring'],
    flavor: 'The rig either ships or fails. There is no third state. Every second of uptime is a victory.',
  },
}

export const ROLE_LIST = Object.values(ROLES)
export const ROLE_IDS = Object.keys(ROLES)

export const HEAD_DAMAGE = 111

export const HEADS = FUNCTIONS.flatMap(f => f.headIds.map((hid, i) => ({
  id: hid,
  phase: f.phase,
  functionId: f.id,
  name: i === 0 ? f.name : `${f.name} (${i + 1})`,
  glyph: f.glyph,
})))

export const HEADS_BY_ID = Object.fromEntries(HEADS.map(h => [h.id, h]))

export const PHASE_FUNCTIONS = (n) => FUNCTIONS.filter(f => f.phase === n)
export const FUNCTIONS_BY_PHASE = PHASE_FUNCTIONS

// ═══════════════════════════════════════════════════════════════════════════════
// RAID DOSSIER
// ═══════════════════════════════════════════════════════════════════════════════

export const RAID01 = {
  id: 'raid01',
  code: 'RAID 01',
  title: 'THE BROODGATE',
  region: 'THE FLOOR · BREACH SITE ZERO',
  boss: {
    name: 'VARKUL, THE NULLHEART HYDRA',
    tier: 'B',
    lore: 'First herald of Gorgoroth Blackblood. When the Broodgate breached, every interface, every pipeline, every database, every seal, and every deployment rig that ever failed on The Floor poured through the wound and fused — five sequential failures, one shared heart of static. The Association does not have a confirmed kill. Each function in this raid is a real coding problem from the Floor\'s history — bugs that cost lives, data that corrupted kill teams, seals that let heralds through. Fixing them isn\'t practice. It\'s penance.',
    threat: 'Herald-class. Five sequential functions, roughly an hour of real debugging apiece — an evening\'s work for a warband that splits the load. Solo entry is refused: the Gate will not open for fewer than two licensed hunters, and it will not open at all until every one of the five specializations has an owner.',
  },
  handlerIntro: 'VERA // WAR ROOM: Listen, because the Gate won\'t repeat it. Varkul has five functions — five real code tasks — and you work them ONE AT A TIME, in order. Each function belongs to one specialization: INTERFACE, then SIGNAL, then VAULT, then CIPHER, then ARCHITECT. Every one of those five has to have an owner before the Gate opens, and no fewer than two hunters may stand in it — buy a second specialization if your warband is short. Each function is a working program with eight planted faults, easiest first. Expect about an hour per function; a full clear is an evening. Everyone sees the same editor and types into the same file, so talk to each other. Bring your best code.',
  rules: [
    { k: 'PARTY',   v: `${PARTY_MIN}–${PARTY_MAX} hunters, and all five specializations covered between them. A hunter may hold up to 3 roles, so two people can crew the Gate — but one person never can.` },
    { k: 'ENTRY',   v: `${ENTRY_COST} $SHARD per hunter, plus 1,000 per extra specialization — burned on join, refunded in full if you leave before the breach. Abandoning after the breach refunds nothing.` },
    { k: 'THE BOSS', v: `${BOSS_HP_MAX} HP across five functions. Each function completion deals ${FUNCTION_DAMAGE} damage — the only damage Varkul takes. Boss HP is shared by the whole party, live.` },
    { k: 'FUNCTIONS', v: 'Five sequential functions, 8 wards each (code checks of increasing difficulty). A function is complete when every ward passes. The whole party works the same function in the same editor.' },
    { k: 'DIFFICULTY', v: 'Each function is a ~150-line program with eight planted faults, from a one-word typo to an inverted security check. Reckon on an hour per function — a full clear is one good evening, not a campaign.' },
    { k: 'PHASES',  v: 'Three visual phases on the hydra: Phase I (Interface), Phase II (Signal), Phase III (Vault + Cipher + Architect). The boss visual grows more aggressive as phases progress.' },
    { k: 'YOUR HP', v: '' + PLAYER_HP_MAX + ' HP, personal. A deflected STRIKE (no new wards passing) costs ' + STRIKE_FAIL_DMG + '. Idling past ' + IDLE_BLEED_AFTER + 's bleeds 1/s. Falling costs you nothing but time — respawn at the Gate, progress intact.' },
    { k: 'PAYOUT',  v: 'Automatic, per hunter, per function: F1 = 100 XP + 250 $SHARD · F2 = 150 XP + 500 $SHARD · F3 = 200 XP + 800 $SHARD · F4 = 200 XP + 800 $SHARD · F5 = 350 XP + 1650 $SHARD. Full clear: 1000 XP + 4000 $SHARD each.' },
    { k: 'CONDUCT', v: 'Anti-cheat is live inside the Gate. Paste is blocked. Every line that passes a ward is a line you typed.' },
  ],
  guide: {
    slug: 'raid-protocol',
    tag: 'FM-R1',
    title: 'Raid Protocol — The Broodgate',
    intro: 'VERA // FIELD MANUAL: raids are not gates. A gate tests whether you learned a skill. A raid tests whether five people can point five different tools at one monster without cutting each other. The Broodgate is the Association\'s first sanctioned herald raid — five sequential functions, about an hour of real debugging each. Read this before your first STRIKE.',
    sections: [
      { heading: 'How functions work', body: 'The Broodgate has five sequential functions, one per specialization. Only one function is active at a time. The whole party sees the same code, the same wards, the same editor. When every ward on the current function is green, STRIKE — the function is complete, the boss takes 200 damage, and the next function unlocks. Each function contains 8 wards of progressive difficulty: quick bug fixes first, then logic corrections, then multi-step problems, and finally one that only passes when the whole system holds together.' },
      { heading: 'Functions unlock in order', body: 'INTERFACE (F1) → SIGNAL (F2) → VAULT (F3) → CIPHER (F4) → ARCHITECT (F5). The specialization that owns the current function should lead the work, but any hunter can type in the editor — the Gate only checks whether the code works. If your function is not yet active, study the Field Manual, watch the editor, and prepare for your rotation.' },
      { heading: 'Pacing yourself', body: 'Reckon on about an hour per function and an evening for the full clear. The first faults in each program are quick — a misspelled method, a missing comparator — and they get harder as you go, ending on one that only falls when the whole system is right. Rotate who drives. Read the console before you guess. The hydra is patient; it has been dead for centuries and can wait while you think.' },
      { heading: 'Reading the fight', body: 'The function panel shows the current task, its wards, and your progress. The boss HP bar and event feed are live for everyone. Your own HP is yours alone: deflected strikes and idling drain it. Falling just sends you back with your code intact. The boss visual has three phases matching the function groups — you will see Varkul change as you progress.' },
      { heading: 'Getting paid', body: 'Payouts are automatic and individual — every hunter in the party collects the full function bounty when every ward passes, whether or not their specialization made the final edit. Full clear: 1000 XP + 4000 $SHARD each. Carrying your party still pays; being carried still teaches.' },
    ],
    links: [
      { label: 'MDN — HTML, CSS and JavaScript references', note: 'developer.mozilla.org · everything the five functions test', url: 'https://developer.mozilla.org/en-US/docs/Web' },
      { label: 'roadmap.sh — Frontend path', note: 'roadmap.sh · where each function sits on the climb', url: 'https://roadmap.sh/frontend' },
      { label: 'JavaScript Info — Modern JS Tutorial', note: 'javascript.info · deep dives on closures, promises, operators', url: 'https://javascript.info' },
    ],
  },
}

export default RAID01
