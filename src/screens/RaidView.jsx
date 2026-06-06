import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import RaidIDE, { SYNC_CODE_CHECKS } from './RaidIDE'
import './RaidView.css'

const ROLES = {
  interface: {
    label: 'Interface Hunter', icon: '◈', color: 'var(--teal)',
    owns: 'Frontend — React app, routing, UI state, real-time data display, accessibility.',
    challenge: 'UI Corruption Waves — malformed data must not crash the interface.',
  },
  signal: {
    label: 'Signal Hunter', icon: '◉', color: 'var(--violet)',
    owns: 'Backend — Node.js/Express API, all endpoints, middleware chain, rate limiting, error handling.',
    challenge: 'Request Floods — thousands of malformed requests must not take the server down.',
  },
  vault: {
    label: 'Vault Hunter', icon: '⬡', color: 'var(--amber)',
    owns: 'Data layer — database schema, migrations, seed data, query optimization, integrity constraints.',
    challenge: 'Corruption Attempts — direct DB attacks; schema constraints are your only defense.',
  },
  cipher: {
    label: 'Cipher Hunter', icon: '⬢', color: 'var(--magenta)',
    owns: 'Auth & security — JWT system, refresh tokens, RBAC, route protection, input sanitization.',
    challenge: 'Phantom Attacks — token replays, role escalation, brute force sequences.',
  },
  architect: {
    label: 'Architect Hunter', icon: '△', color: 'var(--lime)',
    owns: 'Infrastructure — CI/CD, production hosting, env config, logging, monitoring, health checks.',
    challenge: 'Infrastructure Attacks — env corruption, server crashes, connection drops; automatic recovery required.',
  },
}

const ROLE_ORDER = ['interface', 'signal', 'vault', 'cipher', 'architect']

const ROLE_BRIEFS = {
  interface: {
    stack: 'React + Vite · React Router · no UI library — custom CSS only',
    sections: [
      { title: 'Application Shell', items: [
        'React Router: / /login /register /dashboard /districts /districts/:id /citizens /citizens/:id /events',
        'Protected route wrapper — redirects to /login if no valid access token',
        'Global API client — fetch wrapper that attaches Authorization header, handles TOKEN_EXPIRED by triggering silent refresh, retries original request after token refreshed',
        'Global error boundary — catches all unhandled errors, renders fallback UI instead of white screen',
      ]},
      { title: 'Auth Screens', items: [
        'Login — email + password, stores access token in memory (NOT localStorage), handles all Cipher Contract error codes',
        'Register — name + email + password',
        'Silent refresh — TOKEN_EXPIRED → auto POST /api/auth/refresh (cookie sent automatically) → update token → retry. User never sees this.',
      ]},
      { title: 'Dashboard + All Resource Views', items: [
        'Dashboard — GET /api/auth/me, district list, citizen count, event count (real numbers), role-aware UI (admin controls not rendered at all for non-admins — not hidden with CSS)',
        'Districts — list with search, detail (citizens + events), create form (admin only — not rendered for others)',
        'Citizens — list (operators see all, citizens see only themselves), detail, edit (ownership enforced on frontend AND backend)',
        'Events — list with type + date range filter, create form (operator+), aggregate view (admin)',
      ]},
      { title: 'Siege Preparation — UI Cascade defense', items: [
        'Every API response that could be null must be handled — no .map() on potentially undefined arrays',
        'Every loading state must render a skeleton or spinner — no blank sections during fetch',
        'Every error state must render a user-facing message — no silent failures',
        'Network timeout: if any request exceeds 10 seconds, show a timeout message',
      ]},
    ],
    dependsOn: [
      "Signal Hunter's API reachable at VITE_API_URL",
      "Cipher Hunter's token format matching what you send in Authorization header",
      'Signal Contract being accurate — you build against it exactly',
    ],
    dependedOnBy: ['Nobody depends on you technically — but the raid is evaluated visually first. A broken frontend makes a working backend invisible.'],
  },
  signal: {
    stack: 'Node.js · Express · pg or Prisma · bcrypt · jsonwebtoken · express-rate-limit · morgan',
    sections: [
      { title: 'Server Structure', items: [
        'src/app.js — Express app, middleware registration, route mounting',
        'src/server.js — HTTP server, port binding, startup logging',
        'src/db.js — PostgreSQL connection pool',
        'middleware/ — auth.js · rateLimit.js · errorHandler.js · requestLogger.js',
        'routes/ + controllers/ + services/ — one file per resource group',
      ]},
      { title: 'Middleware Chain — Non-Negotiable Order', items: [
        '1. morgan("combined") — log everything',
        '2. cors({ origin: ALLOWED_ORIGINS, credentials: true })',
        '3. express.json() + cookieParser()',
        '4. /api/auth → authLimiter (10 req/15min/IP) → auth routes',
        '5. /api/districts /api/citizens /api/events → globalLimiter (100 req/15min/IP) + verifyToken → route handlers',
        '6. /api/health → no auth, no rate limit',
        '7. errorHandler — must be last middleware registered',
      ]},
      { title: 'All Endpoints + Rate Limiting', items: [
        'Implement every endpoint from the Signal Contract exactly — method, path, auth, response shape',
        'authLimiter: 10 requests per 15 minutes per IP on all /api/auth routes',
        'globalLimiter: 100 requests per 15 minutes per IP on all other routes',
        'Rate limit responses must use standard error format — include X-RateLimit-* headers',
      ]},
      { title: 'Siege Preparation — Phantom Flood defense', items: [
        'Every route handler wrapped in try/catch — uncaught async errors must reach global errorHandler, not crash the process',
        'Input validation on every POST/PATCH body — missing required fields return 400 VALIDATION_ERROR',
        'Parameterized queries only — never string concatenation (SQL injection)',
        'No console.log in production — morgan for requests, structured error logging for errors',
      ]},
    ],
    dependsOn: [
      "Vault Hunter's database reachable at DATABASE_URL",
      "Cipher Hunter's auth middleware — you integrate it, they write it",
      'Data Contract schema matching what your queries expect',
    ],
    dependedOnBy: [
      'Interface Hunter — every API call hits your server',
      "Cipher Hunter — their middleware runs inside your Express app",
    ],
  },
  vault: {
    stack: 'PostgreSQL · Prisma (schema + migrations + client) or raw SQL + node-postgres',
    sections: [
      { title: 'Schema + Migrations', items: [
        'Execute the Data Contract exactly — every table, column, type, constraint, FK, cascade rule. No deviation without full party vote.',
        'Every schema change is a migration file — never edit the database directly',
        'prisma/schema.prisma — complete Data Contract schema',
        'prisma/migrations/001_initial/ — all tables',
        'prisma/migrations/002_indexes/ — performance indexes',
        'seed.js — populates districts, creates test users for all three roles (citizen, operator, admin)',
      ]},
      { title: 'Required Indexes — Siege Survival', items: [
        'idx_citizens_district ON citizens(district_id)',
        'idx_citizens_user ON citizens(user_id)',
        'idx_events_district ON events(district_id)',
        'idx_events_type ON events(type)',
        'idx_events_created ON events(created_at DESC)',
        'idx_refresh_tokens_token ON refresh_tokens(token)',
        'idx_audit_logs_user ON audit_logs(user_id)',
      ]},
      { title: 'Query Layer — Expose to Signal Hunter', items: [
        'users: createUser / findUserByEmail / findUserById',
        'refresh_tokens: createRefreshToken / findRefreshToken / deleteRefreshToken / deleteAllUserTokens',
        'districts: getAllDistricts / getDistrictById / createDistrict / updateDistrictStatus',
        'citizens: getCitizens({ districtId, limit, offset }) / getCitizenById / createCitizen / updateCitizen / deleteCitizen',
        'events: getEvents({ type, districtId, from, to }) / createEvent / getEventAggregate',
        'audit: createAuditLog({ userId, action, resource })',
      ]},
      { title: 'Siege Preparation — Corruption Attempt defense', items: [
        'Every FK constraint enforced at schema level — not application level',
        'ON DELETE CASCADE on all child records — deleting a user cleans up citizens, tokens, logs',
        'UNIQUE constraints on email and refresh token — duplicates rejected at DB level',
        'Connection pool: max 20 connections · timeout 5s · idle timeout 30s',
        'No N+1 queries — any list query must not make additional queries per item',
      ]},
    ],
    dependsOn: [
      "Architect Hunter's database provisioned and reachable",
      'The Data Contract — you wrote it, you execute it exactly',
    ],
    dependedOnBy: [
      'Signal Hunter — every database operation goes through your query layer',
      'Cipher Hunter — refresh token storage and lookup is yours',
    ],
  },
  cipher: {
    stack: 'jsonwebtoken · bcrypt · crypto (Node built-in) · cookie-parser · helmet',
    sections: [
      { title: 'Token Utilities', items: [
        'generateAccessToken(payload) → signed JWT, 15-minute expiry',
        'generateRefreshToken() → crypto.randomUUID()',
        'verifyAccessToken(token) → payload or throws (expiry checked separately from signature)',
      ]},
      { title: 'Auth Middleware', items: [
        'verifyToken(req, res, next) — extracts Bearer token from Authorization header, verifies signature + expiry, attaches req.user = { userId, email, role }',
        'requireRole(...roles) — factory; returns middleware checking req.user.role. Role comes from verified token payload, NEVER from request body or headers.',
        'requireOwnership(getResourceUserId) — factory; operators + admins bypass; citizens blocked from others\' records → 403 ACCESS_DENIED',
      ]},
      { title: 'Auth Controller (all 5 endpoints)', items: [
        'register — validate input → check email unique → hash password (bcrypt rounds 12) → create user → generate tokens → set cookie → return access token',
        'login — find user → verify password (bcrypt.compare) → generate tokens → set cookie → return access token',
        'refresh — read httpOnly cookie → find token in DB → check expiry → delete old token → generate new access + refresh tokens (rotation) → set new cookie → return new access token',
        'logout — delete refresh token from DB → clear cookie → 200',
        'me — return req.user (already verified by verifyToken middleware, no DB call needed)',
      ]},
      { title: 'Security Config', items: [
        'Cookie: httpOnly: true · secure: true · sameSite: strict · maxAge: 7 days',
        'Helmet.js on Express app — sets security headers automatically',
        'Startup validation: if ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is missing or < 32 chars → process.exit(1). Crash loudly.',
        'The two secrets must be different strings',
        'Never return password field in any response. Never log passwords.',
      ]},
      { title: 'Siege Preparation — Phantom Attack defense', items: [
        'Expired access tokens replayed → verifyAccessToken checks expiry separately from signature',
        'Wrong-secret tokens → caught by signature verification',
        'Refresh token used twice → rotation deletes old token on use; second use finds nothing in DB',
        'Role escalation → requireRole reads req.user.role from verified token payload only',
        'Missing Authorization header → TOKEN_MISSING returned immediately, no verification attempt',
      ]},
    ],
    dependsOn: [
      "Vault Hunter's refresh_tokens table (createRefreshToken, findRefreshToken, deleteRefreshToken)",
      "Signal Hunter integrating your middleware into their Express app at the correct position in the chain",
    ],
    dependedOnBy: [
      "Signal Hunter — your middleware runs on every protected route in their app",
      "Interface Hunter — your token format determines what they send in Authorization header",
      'Everyone — if auth is broken, nothing in the district is accessible',
    ],
  },
  architect: {
    stack: 'GitHub Actions (CI/CD) · chosen hosting platforms from Architecture Map · Docker optional',
    sections: [
      { title: 'Repository Structure — Set Up Before Anyone Writes Code', items: [
        '.github/workflows/ci.yml — on every PR: lint + test for both api/ and client/',
        '.github/workflows/deploy.yml — on main merge: migrate DB → deploy API → build + deploy frontend',
        'api/ — Signal Hunter\'s Express app (src/, package.json, .env.example)',
        'client/ — Interface Hunter\'s React app (src/, package.json, .env.example)',
        'db/ — Vault Hunter\'s migrations (prisma/) and seed.js',
        'README.md — deployment instructions for all five roles',
      ]},
      { title: 'CI Pipeline (ci.yml)', items: [
        'Trigger: on pull_request',
        'api-checks: checkout → npm install → lint → test (if tests exist)',
        'client-checks: checkout → npm install → lint → npm run build (catches build errors before deploy)',
      ]},
      { title: 'Deploy Pipeline (deploy.yml)', items: [
        'Trigger: on push to main branch',
        'deploy-api: run prisma migrate deploy → deploy to API host',
        'deploy-client: npm run build → deploy dist/ to frontend host',
      ]},
      { title: 'Pre-Siege Checklist — Complete Before Hour 44', items: [
        '☐ All environment variables confirmed present in production',
        '☐ Database migrations run successfully in production',
        '☐ Seed data present — test users for all three roles exist and can log in',
        '☐ GET /api/health returns 200 with { status: ok, db: connected }',
        '☐ API reachable from frontend domain (CORS confirmed in browser)',
        '☐ Frontend reachable at production URL',
        '☐ Auto-restart confirmed — simulate a process crash, confirm restart within 60s',
        '☐ Logs streaming and readable during the Siege',
      ]},
      { title: 'Siege Preparation — Void Attack defense', items: [
        'Missing env vars — API must fail loudly on startup with a clear message, not a cryptic runtime error deep in the code',
        'DB connection drop — connection pool must retry with exponential backoff; must reconnect automatically when DB comes back',
        'Process crash — hosting platform must auto-restart within 60 seconds. Verify this is configured BEFORE Hour 44.',
        'Monitor GET /api/health every 60 seconds during Siege — anything other than { db: connected } = district in distress',
      ]},
    ],
    dependsOn: [
      'All four other Hunters communicating their environment variable needs during Descent',
      "Vault Hunter's migrations committed to the repo and runnable",
    ],
    dependedOnBy: [
      'Everyone — if the environment is not ready, nobody can integrate',
      'The Architect Hunter is the only Hunter who can block the entire party',
    ],
  },
}

function RoleBrief({ roleKey }) {
  const brief = ROLE_BRIEFS[roleKey]
  const r = ROLES[roleKey]
  if (!brief) return null
  return (
    <div className="role-brief">
      <div className="role-brief-stack">
        <span style={{ color: 'var(--ink-3)' }}>Stack</span>
        <span style={{ color: 'var(--ink-1)' }}>{brief.stack}</span>
      </div>
      {brief.sections.map(sec => (
        <div key={sec.title} className="role-brief-section">
          <div className="role-brief-section-title">{sec.title}</div>
          {sec.items.map((item, i) => (
            <div key={i} className="role-brief-item">
              <span className="role-brief-bullet" style={{ color: r.color }}>›</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="role-brief-deps">
        <div className="role-brief-dep-col">
          <div className="role-brief-dep-label">Depends on</div>
          {brief.dependsOn.map((d, i) => <div key={i} className="role-brief-dep-item">{d}</div>)}
        </div>
        <div className="role-brief-dep-col">
          <div className="role-brief-dep-label">Others depend on you</div>
          {brief.dependedOnBy.map((d, i) => <div key={i} className="role-brief-dep-item">{d}</div>)}
        </div>
      </div>
    </div>
  )
}

const SYNCS = [
  {
    n: 1, hour: 10, label: 'Sync Ritual I',
    desc: 'Schema finalized. Auth endpoints responding. Frontend reaching backend.',
    passEffect: '+50 HP — foundation is solid',
    failEffect: '−30 HP — rebuild window opens; team loses 2 hours',
    conditions: [
      { role: 'vault',     text: 'PostgreSQL running and reachable — all tables created (users, refresh_tokens, districts, citizens, events, audit_logs)' },
      { role: 'vault',     text: 'All NOT NULL constraints, PKs, FKs, and UNIQUE constraints in place' },
      { role: 'signal',    text: 'Express server starts without error on PORT 3001' },
      { role: 'signal',    text: 'GET /api/health returns { status: "ok" } with 200' },
      { role: 'signal',    text: 'POST /api/auth/register creates a user row and returns a token pair' },
      { role: 'cipher',    text: 'Access token is a valid JWT (correct secret, 15min exp, payload matches contract)' },
      { role: 'interface', text: 'React app starts on PORT 5173 without error' },
      { role: 'interface', text: 'React app reaches Express — login page renders, register flow completes end-to-end' },
    ],
    failMode: 'Any condition fails → FAIL. Leader calls out which layer broke. That role owns the fix. 2-hour extension granted — no HP recovery.',
  },
  {
    n: 2, hour: 16, label: 'Sync Ritual II',
    desc: 'Core features end-to-end. Register, log in, see real data in frontend.',
    passEffect: '+50 HP — auth layer battle-ready',
    failEffect: '−30 HP — full team standby; blocked features freeze',
    conditions: [
      { role: 'interface', text: 'Register via UI — new user visible in DB immediately after' },
      { role: 'interface', text: 'Login via UI — dashboard renders with real name from GET /api/auth/me' },
      { role: 'cipher',    text: 'GET /api/auth/me returns correct user with 200 on valid token; returns 401 on missing or expired token' },
      { role: 'signal',    text: 'Protected route blocks unauthenticated request — returns 401 with correct error code' },
      { role: 'interface', text: 'Logout — token cleared, subsequent /me request returns 401, UI redirects to login' },
      { role: 'cipher',    text: 'After logout, attempting to reuse the old access token returns 401 TOKEN_INVALID' },
    ],
    failMode: 'Any condition fails → FAIL. Cipher and Signal investigate together. Interface unblocked only after auth confirmed fixed.',
  },
  {
    n: 3, hour: 28, label: 'Sync Ritual III',
    desc: 'All features complete. Full auth flow. All endpoints working. Deployed to staging.',
    passEffect: '+50 HP — fully armed, staging confirmed',
    failEffect: '−30 HP — staging blocked; 4 hours to resolve before production window',
    conditions: [
      { role: 'signal',    text: 'All 18 endpoints in the Signal Contract return correct responses for happy-path requests' },
      { role: 'cipher',    text: 'RBAC enforced — citizen cannot access admin routes, operator cannot access admin routes, admin can access all' },
      { role: 'cipher',    text: 'Ownership enforced — citizen can only update/delete their own records; returns 403 on others' },
      { role: 'signal',    text: 'Rate limiting active — POST /api/auth/login returns 429 after 5 rapid attempts' },
      { role: 'signal',    text: 'All error responses match the Signal Contract error format exactly: { error: { code, message, details? } }' },
      { role: 'interface', text: 'Role-aware UI: admin controls (create district, view all citizens) not rendered for non-admin users — not hidden with CSS, not rendered at all' },
      { role: 'interface', text: 'All error states render user-facing messages — no silent failures or blank sections' },
      { role: 'architect', text: 'Application deployed to staging URL — all endpoints reachable, env vars injected, no localhost references' },
    ],
    failMode: 'Any condition fails → FAIL. Architect owns staging fix. Signal + Cipher own endpoint/RBAC fix. Interface unblocks when backend confirmed.',
  },
  {
    n: 4, hour: 40, label: 'Sync Ritual IV',
    desc: 'Production deploy complete. All five layers live. Defense begins in 4 hours.',
    passEffect: '+50 HP — Siege begins. All 5 hunters at stations.',
    failEffect: '−30 HP — production broken; Siege begins anyway',
    conditions: [
      { role: 'architect', text: 'All Sync III conditions verified at the production URL — not staging' },
      { role: 'architect', text: 'All environment variables set in production — no .env file shipped, no hardcoded secrets' },
      { role: 'architect', text: 'Process manager configured — app auto-restarts on crash (PM2 or equivalent)' },
      { role: 'architect', text: 'Logs accessible — application errors visible in production log output' },
      { role: 'all',       text: 'Pre-Siege checklist complete — every hunter confirms their layer is siege-ready' },
      { role: 'vault',     text: 'Test users seeded — at least 1 admin, 1 operator, 3 citizens in production DB' },
      { role: 'all',       text: '30-minute stability window passed — no crashes, no 500s under normal load for 30 minutes before Siege starts' },
    ],
    failMode: 'Any condition fails → FAIL. Siege begins 4 hours later regardless. Team uses the window to patch. HP penalty stands.',
  },
]

const WAVES = [
  {
    n: 1, label: 'Wave I — The Phantom Flood',
    desc: 'API request flood. Rate limiting and error handling under maximum pressure.',
    color: 'var(--violet)',
    heldEffect: '+100 HP — flood absorbed',
    breachedEffect: '−100 HP — server taken down',
    stations: [
      { role: 'signal',    duty: 'Monitor Express process — watch for crash or hang. Confirm rate limiter returns 429 after 5 rapid requests. Confirm all 500s return the correct error format.' },
      { role: 'cipher',    duty: 'Confirm no auth bypass possible under load — token validation must not be skipped when requests pile up.' },
      { role: 'architect', duty: 'Watch process manager — confirm auto-restart fires if Express crashes. Check log output for OOM or uncaught exceptions.' },
      { role: 'interface', duty: 'Confirm UI shows a timeout or error state if API goes unresponsive — no infinite spinner with no feedback.' },
      { role: 'vault',     duty: 'Monitor DB connection pool — confirm pool exhaustion does not corrupt data. All partial writes must roll back.' },
    ],
    unprepared: [
      { role: 'signal',    cost: 'No rate limiter → server takes the full flood → likely crash → −100 HP' },
      { role: 'signal',    cost: 'Unhandled errors return 500 with stack trace → error format violated → BREACHED' },
      { role: 'architect', cost: 'No process manager → crash is permanent until manual restart → full downtime' },
    ],
  },
  {
    n: 2, label: 'Wave II — The Data Corruption',
    desc: 'Direct database attacks. Constraint violations. Schema integrity under fire.',
    color: 'var(--amber)',
    heldEffect: '+100 HP — schema held',
    breachedEffect: '−100 HP — data integrity lost',
    stations: [
      { role: 'vault',     duty: 'Primary station. Confirm all NOT NULL, UNIQUE, FK, and CHECK constraints are in place. Watch for any INSERT that succeeds when it should have failed.' },
      { role: 'signal',    duty: 'Confirm all API input validation runs before touching the DB — malformed payloads must be rejected at the service layer, not rely on DB alone.' },
      { role: 'cipher',    duty: 'Confirm no endpoint allows an unauthenticated write to any table — auth check must come before any DB call.' },
      { role: 'architect', duty: 'Confirm DB connection is not exposed directly — no direct Postgres port open. All writes go through the API.' },
      { role: 'interface', duty: 'Confirm the frontend never sends a write with missing required fields — client-side validation must not be the only guard.' },
    ],
    unprepared: [
      { role: 'vault',     cost: 'Missing NOT NULL constraint → null written to critical field → data corruption' },
      { role: 'vault',     cost: 'Missing UNIQUE constraint → duplicate records → broken joins + leaderboard corruption' },
      { role: 'signal',    cost: 'No input validation → raw attacker payload hits DB → constraint violation or injection' },
    ],
  },
  {
    n: 3, label: 'Wave III — The UI Cascade',
    desc: 'Every endpoint returns edge-case data — nulls, empty arrays, wrong types.',
    color: 'var(--teal)',
    heldEffect: '+100 HP — interface survived',
    breachedEffect: '−100 HP — UI crashed or blank',
    stations: [
      { role: 'interface', duty: 'Primary station. Every list must handle empty array without crashing. Every field that could be null must render a fallback — not undefined, not a blank space. Every fetch must have a loading state and an error state.' },
      { role: 'signal',    duty: 'Confirm all endpoints return the correct shape on edge cases — empty district returns { citizens: [] } not { citizens: null }. Type contract must hold.' },
      { role: 'vault',     duty: 'Confirm DB queries return empty arrays, not null, when no rows match — confirm ORM/query behavior on 0-row results.' },
      { role: 'cipher',    duty: 'Confirm /me returns a full user object even for a new user with no activity — no missing fields.' },
      { role: 'architect', duty: 'Monitor error tracking — any unhandled exception in the frontend means Interface Hunter missed a null guard.' },
    ],
    unprepared: [
      { role: 'interface', cost: '.map() on null → TypeError crash → white screen → BREACHED' },
      { role: 'interface', cost: 'No loading state on slow fetch → blank section with no feedback → BREACHED' },
      { role: 'signal',    cost: 'Endpoint returns null instead of [] on empty result → interface crashes on that resource' },
    ],
  },
  {
    n: 4, label: 'Wave IV — The Identity Crisis',
    desc: 'Token attacks. Role escalation attempts. User privacy under direct assault.',
    color: 'var(--magenta)',
    heldEffect: '+100 HP — identity held',
    breachedEffect: '−100 HP — auth layer breached',
    stations: [
      { role: 'cipher',    duty: 'Primary station. Confirm expired tokens return 401 TOKEN_EXPIRED. Confirm tampered tokens return 401 TOKEN_INVALID. Confirm role field in JWT cannot be overridden by the client. Confirm brute-force login returns 429 after threshold.' },
      { role: 'signal',    duty: 'Confirm every protected route runs the auth middleware before the controller. Confirm no route skips the middleware chain. Confirm role check runs after auth check — never before.' },
      { role: 'vault',     duty: 'Confirm user table has no exposed password hash in any API response. Confirm refresh_tokens table rows are single-use — reuse returns 401.' },
      { role: 'interface', duty: 'Confirm admin UI elements are not rendered at all for non-admin users — not hidden with CSS, not rendered. A class toggle is a security failure.' },
      { role: 'architect', duty: 'Confirm no secrets are in client-accessible files. Confirm CORS is locked to your domain — not open wildcard.' },
    ],
    unprepared: [
      { role: 'cipher',    cost: 'JWT secret weak or default → token forged → role escalation → BREACHED' },
      { role: 'cipher',    cost: 'No refresh token invalidation → stolen refresh token works forever → silent breach' },
      { role: 'signal',    cost: 'Route missing auth middleware → admin endpoint publicly accessible → immediate BREACHED' },
      { role: 'interface', cost: 'Admin UI hidden with CSS → inspect element → admin actions exposed to any logged-in user' },
    ],
  },
  {
    n: 5, label: 'Wave V — THE VOID',
    desc: 'The environment itself attacks. Env corruption. Connection drops. Cascade failures.',
    color: 'var(--lime)',
    heldEffect: '+100 HP — system survived the Void',
    breachedEffect: '−100 HP — infrastructure collapse',
    stations: [
      { role: 'architect', duty: 'Primary station. This is your wave. Confirm process manager auto-restarts on crash. Confirm health endpoint recovers within 30 seconds of any restart. Confirm no hardcoded localhost or dev URLs exist in production build. Confirm logs are capturing the crash reason.' },
      { role: 'signal',    duty: 'Confirm Express has a global uncaughtException handler — unhandled rejection must not silently kill the process without logging. Confirm DB reconnect logic exists if the pool drops.' },
      { role: 'vault',     duty: 'Confirm DB is on a managed host with automatic failover — not a single instance with no backup. Confirm no migration runs automatically on startup that could corrupt production data.' },
      { role: 'cipher',    duty: 'Confirm the JWT secret is loaded from env at startup — if the env var is missing, the app must refuse to start, not start with an empty secret.' },
      { role: 'interface', duty: 'Confirm frontend has a global error boundary — any JS crash renders the fallback UI, not a white screen. Confirm frontend gracefully handles the API being temporarily unreachable.' },
    ],
    unprepared: [
      { role: 'architect', cost: 'No process manager → one crash → permanent downtime → BREACHED' },
      { role: 'architect', cost: 'Hardcoded localhost in production → API unreachable from day one → instant BREACHED' },
      { role: 'signal',    cost: 'No uncaughtException handler → silent crash → no log → impossible to diagnose' },
      { role: 'cipher',    cost: 'JWT secret missing from prod env → app starts with empty string secret → any token accepted → full breach' },
    ],
  },
]

const SYNC_NUMS = { I: 1, II: 2, III: 3, IV: 4 }

function healthColor(h) {
  if (h >= 700) return 'var(--lime)'
  if (h >= 400) return 'var(--amber)'
  return 'var(--magenta)'
}

export default function RaidView() {
  const { user, profile, completeQuest, burnRaidEntry, refundRaidEntry } = useAuth()
  const isAdmin = profile?.is_admin ?? false
  const spendableDrift = (profile?.totalDrift ?? 0) - (profile?.totalDriftSpent ?? 0)
  const RAID_ENTRY_COST = 1000

  const [activeRaid, setActiveRaid] = useState(null)
  const [myMembership, setMyMembership] = useState(null)
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [openRaids, setOpenRaids] = useState([])
  const [openRaidMembers, setOpenRaidMembers] = useState({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [raidName, setRaidName] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [joiningRaid, setJoiningRaid] = useState(null)
  const [busy, setBusy] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [expandedDoc, setExpandedDoc] = useState(1)
  const [expandedSync, setExpandedSync] = useState(null)
  const [expandedWave, setExpandedWave] = useState(null)
  const [briefRole, setBriefRole] = useState(null)
  const [syncEvidence, setSyncEvidence] = useState({ 1: '', 2: '', 3: '', 4: '' })
  const [myFlagged, setMyFlagged] = useState(0)
  const [raidFiles, setRaidFiles] = useState([])
  const [raidFilesLoaded, setRaidFilesLoaded] = useState(false)
  const raidChannel = useRef(null)
  const lobbyChannel = useRef(null)

  const loadRaidDetails = useCallback(async (raidId) => {
    const [{ data: raid }, { data: mems }, { data: evts }] = await Promise.all([
      supabase.from('raids').select('*').eq('id', raidId).single(),
      supabase.from('raid_members').select('*, profiles(name)').eq('raid_id', raidId),
      supabase.from('raid_events').select('*').eq('raid_id', raidId).order('created_at', { ascending: false }).limit(60),
    ])
    if (raid) setActiveRaid(raid)
    if (mems) setMembers(mems)
    if (evts) setEvents(evts)
  }, [])

  const loadOpenRaids = useCallback(async () => {
    // Supabase query builders are then-only thenables (no .catch) — calling .catch
    // throws synchronously. Wrap in try/catch; the RPC is optional (lobby auto-expiry).
    try { await supabase.rpc('cleanup_expired_lobby_raids') } catch { /* ignore if RPC missing */ }
    const { data: raids } = await supabase
      .from('raids').select('*').eq('status', 'lobby').order('created_at', { ascending: false })
    const list = raids ?? []
    setOpenRaids(list)
    if (!list.length) { setOpenRaidMembers({}); return }
    const { data: allMems } = await supabase
      .from('raid_members').select('*, profiles(name)').in('raid_id', list.map(r => r.id))
    const grouped = {}
    for (const m of allMems ?? []) {
      if (!grouped[m.raid_id]) grouped[m.raid_id] = []
      grouped[m.raid_id].push(m)
    }
    setOpenRaidMembers(grouped)
  }, [])

  // Realtime subscription for the lobby list (when user is not in a raid)
  const subscribeLobby = useCallback(() => {
    if (lobbyChannel.current) lobbyChannel.current.unsubscribe()
    lobbyChannel.current = supabase
      .channel('raid-lobby-watch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'raids' }, loadOpenRaids)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'raids' }, loadOpenRaids)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'raid_members' }, loadOpenRaids)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'raid_members' }, loadOpenRaids)
      .subscribe()
  }, [loadOpenRaids])

  // Realtime subscription for an active raid
  function subscribeToRaid(raidId) {
    if (raidChannel.current) raidChannel.current.unsubscribe()
    if (lobbyChannel.current) { lobbyChannel.current.unsubscribe(); lobbyChannel.current = null }
    raidChannel.current = supabase
      .channel(`raid:${raidId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raids', filter: `id=eq.${raidId}` },
        payload => { if (payload.new) setActiveRaid(payload.new) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raid_members', filter: `raid_id=eq.${raidId}` },
        () => loadRaidDetails(raidId))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'raid_events', filter: `raid_id=eq.${raidId}` },
        payload => { if (payload.new) setEvents(e => [payload.new, ...e].slice(0, 60)) })
      .subscribe()
  }

  const loadActiveRaid = useCallback(async () => {
    if (!user) return
    // try/finally guarantees the "INITIALIZING…" loading state always clears,
    // even if a query/realtime call throws — otherwise the view hangs forever.
    try {
      const { data: myMems } = await supabase
        .from('raid_members').select('raid_id, role').eq('user_id', user.id)

      if (myMems?.length) {
        const { data: activeRaids } = await supabase
          .from('raids').select('*')
          .in('id', myMems.map(m => m.raid_id))
          .in('status', ['lobby', 'descent', 'active', 'siege'])
        if (activeRaids?.length) {
          const raid = activeRaids[0]
          const mem = myMems.find(m => m.raid_id === raid.id)
          setMyMembership(mem)
          setActiveRaid(raid)
          await loadRaidDetails(raid.id)
          subscribeToRaid(raid.id)
          return
        }
      }
      await loadOpenRaids()
      subscribeLobby()
    } catch (e) {
      console.error('Raid init failed:', e)
    } finally {
      setLoading(false)
    }
  }, [user, loadRaidDetails, loadOpenRaids, subscribeLobby])

  useEffect(() => {
    loadActiveRaid()
    return () => {
      if (raidChannel.current) raidChannel.current.unsubscribe()
      if (lobbyChannel.current) lobbyChannel.current.unsubscribe()
    }
  }, [loadActiveRaid])

  useEffect(() => {
    if (!user) return
    supabase.from('quest_completions').select('id').eq('user_id', user.id).eq('flagged', true)
      .then(({ data }) => setMyFlagged(data?.length ?? 0))
  }, [user])

  // Load all raid_files when raid ends, for code-check scoring
  useEffect(() => {
    if (!activeRaid?.id) return
    if (activeRaid.status !== 'complete' && activeRaid.status !== 'failed') return
    if (raidFilesLoaded) return
    supabase.from('raid_files').select('user_id, path, content').eq('raid_id', activeRaid.id)
      .then(({ data }) => {
        setRaidFiles(data ?? [])
        setRaidFilesLoaded(true)
      })
  }, [activeRaid?.id, activeRaid?.status, raidFilesLoaded])

  // Per-member code check score: fraction of checks that pass (0..1)
  const memberScores = useMemo(() => {
    if (!raidFilesLoaded || !members.length) return {}
    const scores = {}
    for (const mem of members) {
      const myFiles = raidFiles.filter(f => f.user_id === mem.user_id)
      const fileMap = Object.fromEntries(myFiles.map(f => [f.path, f.content ?? '']))
      const role = mem.role
      let total = 0; let passed = 0
      for (const syncSet of SYNC_CODE_CHECKS) {
        const checks = syncSet[role] ?? []
        for (const c of checks) {
          total++
          if (c.ok(fileMap)) passed++
        }
      }
      scores[mem.user_id] = total > 0 ? passed / total : 0
    }
    return scores
  }, [raidFilesLoaded, members, raidFiles])

  // Auto-claim payouts once the raid reaches result/complete status.
  // Runs as a side effect (not during render) and is gated on the already-paid
  // flags from completedQuestIds, so it does not refire on every render. The
  // quest_completions UNIQUE (user_id, quest_id) constraint + upsert onConflict
  // keep this idempotent even if it fires twice before the profile refreshes.
  useEffect(() => {
    if (activeRaid?.status !== 'complete' && activeRaid?.status !== 'failed') return
    if (!myMembership) return

    const isAdminForced = events.some(e => e.label?.includes('[ADMIN] Raid force-completed'))
    if (isAdminForced) return

    const bankPot    = members.length * 1000
    const myScore    = memberScores[user?.id] ?? 0
    const myXpEarned = Math.round(myScore * 500)

    const sorted = [...members].sort((a, b) => {
      const diff = (memberScores[b.user_id] ?? 0) - (memberScores[a.user_id] ?? 0)
      return diff !== 0 ? diff : a.user_id.localeCompare(b.user_id)
    })
    const winnerId = sorted[0]?.user_id ?? null
    const iWin     = user?.id === winnerId && myScore > 0

    const payoutKey       = `raid:${activeRaid.id}`
    const bankKey         = `raid:${activeRaid.id}:bank`
    const alreadyPaid     = profile?.completedQuestIds?.has(payoutKey) ?? false
    const bankAlreadyPaid = profile?.completedQuestIds?.has(bankKey) ?? false

    // Auto-claim XP once per member
    if (myXpEarned > 0 && !alreadyPaid) {
      completeQuest(payoutKey, myXpEarned, {})
    }
    // Auto-claim bank for winner once
    if (iWin && !bankAlreadyPaid) {
      completeQuest(bankKey, bankPot, {})
    }
  }, [activeRaid?.status, activeRaid?.id, myMembership, members, events, memberScores, user?.id, profile?.completedQuestIds, completeQuest])

  // ── Integrity helpers ─────────────────────────────────────────────────

  async function applyIntegrityPenalty(raidId, currentHealth) {
    if (myFlagged === 0) return currentHealth
    const penalty = Math.min(100, myFlagged * 25)
    const newHealth = Math.max(0, currentHealth - penalty)
    await Promise.all([
      supabase.from('raids').update({ health: newHealth }).eq('id', raidId),
      supabase.from('raid_events').insert({
        raid_id: raidId, type: 'integrity_penalty',
        label: `⚠ INTEGRITY BREACH — ${profile?.name ?? 'Pilot'} carries ${myFlagged} flagged gate submission${myFlagged !== 1 ? 's' : ''}. Squad penalised −${penalty} HP. Every hunter pays for one hunter's shortcuts.`,
        health_delta: -penalty, created_by: user.id,
      }),
    ])
    return newHealth
  }

  // ── Actions ──────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!raidName.trim() || !selectedRole) return
    if (spendableDrift < RAID_ENTRY_COST && !isAdmin) return
    setBusy(true)
    try {
      const { data: raid, error } = await supabase
        .from('raids').insert({ name: raidName.trim(), created_by: user.id }).select().single()
      if (error || !raid) return
      await supabase.from('raid_members').insert({ raid_id: raid.id, user_id: user.id, role: selectedRole })
      if (!isAdmin) await burnRaidEntry(raid.id)
      await applyIntegrityPenalty(raid.id, raid.health ?? 1000)
      setCreating(false); setRaidName(''); setSelectedRole(null)
      setMyMembership({ raid_id: raid.id, user_id: user.id, role: selectedRole })
      setActiveRaid(raid)
      await loadRaidDetails(raid.id)
      subscribeToRaid(raid.id)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(raidId, role) {
    if (spendableDrift < RAID_ENTRY_COST && !isAdmin) return
    setBusy(true)
    try {
      const { error } = await supabase.from('raid_members').insert({ raid_id: raidId, user_id: user.id, role })
      if (error) return
      const { data: raid } = await supabase.from('raids').select('*').eq('id', raidId).single()
      if (!raid) return
      if (!isAdmin) await burnRaidEntry(raidId)
      await applyIntegrityPenalty(raidId, raid.health ?? 1000)
      setMyMembership({ raid_id: raidId, user_id: user.id, role })
      setActiveRaid(raid)
      setJoiningRaid(null); setOpenRaids([])
      await loadRaidDetails(raidId)
      subscribeToRaid(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function handleLeave() {
    if (!activeRaid || !myMembership) return
    setBusy(true)
    try {
      // Entry is only refundable before the raid starts (lobby). Admins never paid.
      const refundable = activeRaid.status === 'lobby' && !isAdmin
      if (activeRaid.created_by === user.id) {
        // Leader disbands: refund everyone (RPC, best-effort for joiners) + self (always),
        // BEFORE deleting the raid (the RPC authorizes against the raids row).
        if (refundable) {
          try { await supabase.rpc('refund_raid_entries', { p_raid_id: activeRaid.id }) } catch { /* RPC optional — self-refund below still covers the leader */ }
          await refundRaidEntry(activeRaid.id)
        }
        await supabase.from('raids').delete().eq('id', activeRaid.id)
      } else {
        if (refundable) await refundRaidEntry(activeRaid.id)
        await supabase.from('raid_members').delete().eq('raid_id', activeRaid.id).eq('user_id', user.id)
      }
      if (raidChannel.current) raidChannel.current.unsubscribe()
      setActiveRaid(null); setMyMembership(null); setMembers([]); setEvents([])
      await loadOpenRaids()
      subscribeLobby()
    } finally {
      setBusy(false)
    }
  }

  async function handleStart() {
    if (!activeRaid || (!isAdmin && members.length < 5) || activeRaid.created_by !== user.id) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      await supabase.from('raids').update({ status: 'descent', started_at: new Date().toISOString() }).eq('id', raidId)
      await supabase.from('raid_events').insert({
        raid_id: raidId, type: 'phase_change',
        label: 'PHASE 01 — THE DESCENT begins. No Hunter writes a single line of code until all five documents are signed. Read. Study. Plan.',
        health_delta: 0, created_by: user.id,
      })
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function handlePledge() {
    if (!activeRaid) return
    setBusy(true)
    try {
      await supabase.from('raid_events').insert({
        raid_id: activeRaid.id, type: 'ai_pledge',
        label: `${profile?.name ?? 'Pilot'} — AI PLEDGE SWORN. No AI wrote my code. No tool completed my work. Every line is mine.`,
        health_delta: 0, created_by: user.id,
      })
      await loadRaidDetails(activeRaid.id)
    } finally {
      setBusy(false)
    }
  }

  async function handleBeginBuild() {
    if (!activeRaid || activeRaid.created_by !== user.id) return
    const pledgedIds = new Set(events.filter(e => e.type === 'ai_pledge').map(e => e.created_by))
    const allPledged = members.every(m => pledgedIds.has(m.user_id))
    if (!allPledged && !isAdmin) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      await supabase.from('raids').update({ status: 'active' }).eq('id', raidId)
      await supabase.from('raid_events').insert({
        raid_id: raidId, type: 'phase_change',
        label: 'DESCENT complete. All Hunters pledged. PHASE 02 — THE BUILD begins. 36 hours. Build the district.',
        health_delta: 0, created_by: user.id,
      })
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function handleSync(syncN, passed, evidence = '') {
    if (!activeRaid || activeRaid.created_by !== user.id) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      const delta = passed ? 50 : -30
      const newHealth = Math.max(0, Math.min(1000, (activeRaid.health ?? 1000) + delta))
      const s = SYNCS[syncN - 1]
      const updates = { health: newHealth }
      if (passed && syncN === 4) { updates.status = 'siege'; updates.siege_started_at = new Date().toISOString() }
      const evLabel = passed
        ? `${s.label} — PASSED (+${delta} HP) | Evidence: ${evidence}`
        : `${s.label} — FAILED (${delta} HP) — conditions not met`
      await Promise.all([
        supabase.from('raids').update(updates).eq('id', raidId),
        supabase.from('raid_events').insert({
          raid_id: raidId,
          type: passed ? 'sync_passed' : 'sync_failed',
          label: evLabel, health_delta: delta, created_by: user.id,
        }),
      ])
      if (passed) setSyncEvidence(prev => ({ ...prev, [syncN]: '' }))
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function handleWave(waveN, survived) {
    if (!activeRaid || activeRaid.created_by !== user.id) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      const w = WAVES[waveN - 1]
      const delta = survived ? 100 : -100
      const newHealth = Math.max(0, Math.min(1000, (activeRaid.health ?? 1000) + delta))
      const isLast = waveN === 5
      const updates = { health: newHealth, current_wave: waveN }
      if (isLast) { updates.status = newHealth >= 700 ? 'complete' : 'failed'; updates.ended_at = new Date().toISOString() }
      await Promise.all([
        supabase.from('raids').update(updates).eq('id', raidId),
        supabase.from('raid_events').insert({
          raid_id: raidId,
          type: survived ? 'wave_survived' : 'wave_failed',
          label: survived
            ? `${w.label} — HELD (+${delta} HP) — district stood`
            : `${w.label} — BREACHED (${delta} HP) — defenses failed`,
          health_delta: delta, created_by: user.id,
        }),
      ])
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function handleBonus(bonusLabel) {
    if (!activeRaid || activeRaid.created_by !== user.id) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      const delta = 150
      const newHealth = Math.min(1000, (activeRaid.health ?? 0) + delta)
      await Promise.all([
        supabase.from('raids').update({ health: newHealth }).eq('id', raidId),
        supabase.from('raid_events').insert({
          raid_id: raidId, type: 'bonus_applied',
          label: `BONUS CONFIRMED — ${bonusLabel} (+${delta} HP) — squad integrity rewarded`,
          health_delta: delta, created_by: user.id,
        }),
      ])
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  // ── Admin-only actions ────────────────────────────────────────────────

  async function adminSkipToSiege() {
    if (!isAdmin || !activeRaid || activeRaid.created_by !== user.id) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      await supabase.from('raids').update({ status: 'siege', siege_started_at: new Date().toISOString() }).eq('id', raidId)
      await supabase.from('raid_events').insert({
        raid_id: raidId, type: 'phase_change',
        label: '[ADMIN] Skipped directly to Siege phase.', health_delta: 0, created_by: user.id,
      })
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function adminSkipWave() {
    if (!isAdmin || !activeRaid || activeRaid.created_by !== user.id) return
    const nextWave = (activeRaid.current_wave ?? 0) + 1
    if (nextWave > 5) return
    await handleWave(nextWave, true)
  }

  async function adminForceComplete() {
    if (!isAdmin || !activeRaid || activeRaid.created_by !== user.id) return
    setBusy(true)
    try {
      const raidId = activeRaid.id
      await supabase.from('raids').update({ status: 'complete', health: 1000, ended_at: new Date().toISOString() }).eq('id', raidId)
      await supabase.from('raid_events').insert({
        raid_id: raidId, type: 'phase_change',
        label: '[ADMIN] Raid force-completed. Perfect health granted.', health_delta: 0, created_by: user.id,
      })
      await loadRaidDetails(raidId)
    } finally {
      setBusy(false)
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────

  const isLeader = activeRaid?.created_by === user?.id
  const myRole = myMembership?.role
  const passedSyncs = new Set(
    events.filter(e => e.type === 'sync_passed').map(e => {
      const m = e.label?.match(/Sync Ritual (IV|III|II|I)/)
      return m ? SYNC_NUMS[m[1]] : null
    }).filter(Boolean)
  )
  const pledgedIds = new Set(events.filter(e => e.type === 'ai_pledge').map(e => e.created_by))
  const myPledged = pledgedIds.has(user?.id)
  const allPledged = members.length > 0 && members.every(m => pledgedIds.has(m.user_id))
  const filteredOpenRaids = searchName.trim()
    ? openRaids.filter(r => r.name.toLowerCase().includes(searchName.trim().toLowerCase()))
    : openRaids

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ padding: '60px 0', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.1em' }}>
      INITIALIZING RAID SYSTEMS...
    </div>
  )

  // RESULT
  if (activeRaid?.status === 'complete' || activeRaid?.status === 'failed') {
    const cleared = activeRaid.status === 'complete'
    const h = activeRaid.health ?? 0
    const isAdminForced = events.some(e => e.label?.includes('[ADMIN] Raid force-completed'))

    // ── Payout — score-based ────────────────────────────────────────────
    const bankPot    = members.length * 1000
    const myScore    = myMembership ? (memberScores[user?.id] ?? 0) : 0
    const myXpEarned = isAdminForced ? 0 : Math.round(myScore * 500)

    // Winner = member with highest score (first by score desc, then by user_id for tie-break)
    const sorted     = [...members].sort((a, b) => {
      const diff = (memberScores[b.user_id] ?? 0) - (memberScores[a.user_id] ?? 0)
      return diff !== 0 ? diff : a.user_id.localeCompare(b.user_id)
    })
    const winnerId   = sorted[0]?.user_id ?? null
    const iWin       = !isAdminForced && myMembership && user?.id === winnerId && myScore > 0

    const payoutKey  = `raid:${activeRaid.id}`
    const bankKey    = `raid:${activeRaid.id}:bank`
    const alreadyPaid = profile?.completedQuestIds?.has(payoutKey) ?? false
    const bankAlreadyPaid = profile?.completedQuestIds?.has(bankKey) ?? false
    // NOTE: the actual payout (completeQuest) is fired by the auto-claim
    // useEffect above — never during this render body. These flags only drive
    // the display labels below ("already claimed" / "bank already claimed").

    // Timing analysis

    const tsStart  = activeRaid.started_at      ? new Date(activeRaid.started_at)       : null
    const tsSiege  = activeRaid.siege_started_at ? new Date(activeRaid.siege_started_at) : null
    const tsEnd    = activeRaid.ended_at         ? new Date(activeRaid.ended_at)         : null
    const buildHrs = tsStart && tsSiege ? ((tsSiege - tsStart) / 3_600_000).toFixed(1) : null
    const siegeHrs = tsSiege && tsEnd   ? ((tsEnd - tsSiege)  / 3_600_000).toFixed(1)  : null
    const totalHrs = tsStart && tsEnd   ? ((tsEnd - tsStart)  / 3_600_000).toFixed(1)  : null
    const speedFlag = totalHrs !== null && parseFloat(totalHrs) < 2

    // Integrity penalties recorded during raid
    const penaltyEvents = events.filter(e => e.type === 'integrity_penalty')

    // Build scoring lines from recorded events
    const scoreLines = []
    for (const s of SYNCS) {
      const pass = events.find(e => e.type === 'sync_passed' && e.label?.includes(s.label))
      const fail = events.find(e => e.type === 'sync_failed'  && e.label?.includes(s.label))
      if (pass) scoreLines.push({ label: `${s.label} — PASSED`, delta: 50,  color: 'var(--lime)' })
      if (fail) scoreLines.push({ label: `${s.label} — FAILED`, delta: -30, color: 'var(--magenta)' })
    }
    for (const w of WAVES) {
      const held    = events.find(e => e.type === 'wave_survived' && e.label?.startsWith(w.label))
      const breached = events.find(e => e.type === 'wave_failed'  && e.label?.startsWith(w.label))
      if (held)    scoreLines.push({ label: `${w.label} — HELD`,     delta: 100,  color: 'var(--lime)' })
      if (breached) scoreLines.push({ label: `${w.label} — BREACHED`, delta: -100, color: 'var(--magenta)' })
    }
    const bonusEvents = events.filter(e => e.type === 'bonus_applied')
    for (const b of bonusEvents) {
      scoreLines.push({ label: b.label.replace('BONUS CONFIRMED — ', '').replace(/\s*\(\+150 HP\).*/, '') + ' — BONUS', delta: 150, color: 'var(--amber)' })
    }
    for (const p of penaltyEvents) {
      scoreLines.push({ label: 'Integrity Breach Penalty', delta: p.health_delta, color: 'var(--magenta)' })
    }

    const tier = h >= 1000 ? { label: 'PERFECT', color: 'var(--amber)', sub: 'Flawless execution. Top 1%.' }
      : h >= 700  ? { label: 'PASSED',  color: 'var(--lime)',    sub: 'Gate Zero cleared. Squad delivered.' }
      : h >= 400  ? { label: 'PARTIAL', color: 'var(--teal)',    sub: 'District held — barely. Partial credit.' }
      :             { label: 'FAILED',  color: 'var(--magenta)', sub: 'District fell. Entry fee burned.' }

    return (
      <div className="raid-result">
        <div className={`raid-result-glyph ${cleared ? 'raid-glyph-clear' : 'raid-glyph-fail'}`}>{cleared ? '◈' : '⊘'}</div>
        <div className={`raid-result-title ${cleared ? 'raid-title-clear' : 'raid-title-fail'}`}>
          {cleared ? 'GATE ZERO — CLEARED' : 'DISTRICT COLLAPSED'}
        </div>
        <div className="raid-result-tier" style={{ color: tier.color }}>{tier.label}</div>
        <div className="raid-result-sub">{tier.sub}</div>

        {/* Payout badges */}
        <div className="raid-payout-row">
          {isAdminForced ? (
            <div className="raid-payout-badge raid-payout-zero" style={{ gridColumn: '1 / -1' }}>
              <span className="raid-payout-icon">⚑</span>
              <span className="raid-payout-label">ADMIN TEST — no XP or $DRIFT awarded</span>
            </div>
          ) : myMembership ? (
            <>
              {myXpEarned > 0 ? (
                <div className="raid-payout-badge raid-payout-xp">
                  <span className="raid-payout-icon">⟐</span>
                  <span className="raid-payout-amount">+{myXpEarned} XP</span>
                  <span className="raid-payout-label">{alreadyPaid ? 'already claimed' : `${Math.round(myScore * 100)}% checks passed`}</span>
                </div>
              ) : (
                <div className="raid-payout-badge raid-payout-zero">
                  <span className="raid-payout-icon">⊘</span>
                  <span className="raid-payout-label">0 XP — no checks passed</span>
                </div>
              )}
              {iWin ? (
                <div className="raid-payout-badge" style={{ borderColor: 'oklch(0.82 0.18 75 / 0.5)', background: 'oklch(0.82 0.18 75 / 0.08)' }}>
                  <span className="raid-payout-icon" style={{ color: 'var(--amber)' }}>◈</span>
                  <span className="raid-payout-amount" style={{ color: 'var(--amber)' }}>+{bankPot} $DRIFT</span>
                  <span className="raid-payout-label">{bankAlreadyPaid ? 'bank already claimed' : 'BANK WON — highest score'}</span>
                </div>
              ) : (
                <div className="raid-payout-badge raid-payout-zero">
                  <span className="raid-payout-icon">⊘</span>
                  <span className="raid-payout-label">−1000 $DRIFT — entry fee burned</span>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Per-player score table */}
        {raidFilesLoaded && members.length > 0 && !isAdminForced && (
          <div className="score-table" style={{ marginBottom: 0 }}>
            <div className="score-table-head"><span>HUNTER</span><span>CHECKS</span></div>
            {sorted.map((mem) => {
              const pct = memberScores[mem.user_id] ?? 0
              const xp  = Math.round(pct * 500)
              const isWinner = mem.user_id === winnerId && pct > 0
              return (
                <div key={mem.user_id} className="score-row" style={isWinner ? { background: 'oklch(0.82 0.18 75 / 0.06)' } : undefined}>
                  <span className="score-row-label">
                    {isWinner && <span style={{ color: 'var(--amber)', marginRight: 6 }}>★</span>}
                    {mem.profiles?.name ?? 'Hunter'}
                    <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
                      [{ROLES[mem.role]?.label ?? mem.role}]
                    </span>
                  </span>
                  <span className="score-row-delta" style={{ color: pct >= 0.7 ? 'var(--lime)' : pct >= 0.4 ? 'var(--amber)' : 'var(--magenta)' }}>
                    {Math.round(pct * 100)}% · +{xp} XP
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="score-table">
          <div className="score-table-head">
            <span>EVENT</span><span>HP</span>
          </div>
          <div className="score-table-start">
            <span>Starting Health</span><span style={{ color: 'var(--ink-2)' }}>1000</span>
          </div>
          {scoreLines.map((l, i) => (
            <div key={i} className="score-row">
              <span className="score-row-label">{l.label}</span>
              <span className="score-row-delta" style={{ color: l.color }}>{l.delta > 0 ? '+' : ''}{l.delta}</span>
            </div>
          ))}
          <div className="score-total">
            <span>FINAL HEALTH</span>
            <span style={{ color: healthColor(h), fontWeight: 700 }}>{h} / 1000</span>
          </div>
          {cleared && bonusEvents.length === 0 && (
            <div className="score-bonus-note">No bonus conditions confirmed — up to +300 HP left on the table</div>
          )}
          {penaltyEvents.length > 0 && (
            <div className="score-bonus-note" style={{ color: 'oklch(0.72 0.28 340 / 0.7)' }}>
              Integrity penalties applied — {penaltyEvents.length} flagged hunter{penaltyEvents.length !== 1 ? 's' : ''} in this squad
            </div>
          )}
        </div>

        {/* Timing report */}
        <div className="timing-report">
          <div className="timing-report-head">
            Timing Report
            {speedFlag && <span className="chip" style={{ marginLeft: 10, padding: '1px 8px', fontSize: 9, color: 'var(--magenta)', borderColor: 'oklch(0.72 0.28 340 / 0.4)' }}>⚠ SPEED FLAG — Audit Required</span>}
          </div>
          <div className="timing-rows">
            {buildHrs !== null && <div className="timing-row"><span>Build phase</span><span>{buildHrs}h</span></div>}
            {siegeHrs !== null && <div className="timing-row"><span>Siege phase</span><span>{siegeHrs}h</span></div>}
            {totalHrs !== null && <div className="timing-row timing-row-total"><span>Total elapsed</span><span style={{ color: speedFlag ? 'var(--magenta)' : 'var(--ink-1)' }}>{totalHrs}h</span></div>}
            {speedFlag && (
              <div className="timing-flag-note">Raid completed in under 2 hours. A legitimate Gate Zero build takes 48–72 hours. This result has been flagged for review.</div>
            )}
            {!tsStart && <div className="timing-row" style={{ color: 'var(--ink-4)' }}><span>No timing data recorded</span><span>—</span></div>}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 8 }} disabled={busy} onClick={handleLeave}>
          {isLeader ? 'Close Raid' : 'Leave'}
        </button>
      </div>
    )
  }

  // LOBBY
  if (!activeRaid) {
    return (
      <div className="raid-lobby">
        <div className="raid-lore-banner">
          <div className="raid-lore-glyph">※</div>
          <div>
            <div className="raid-lore-name">THE ABYSSAL RAID — GATE ZERO</div>
            <div className="raid-lore-text">
              Gate Zero doesn't appear on any map. A party of <strong>five hunters</strong> is the minimum.
              Gate Zero is a <strong>living system</strong> — build, deploy, and defend it in 48 to 72 hours
              while it actively tries to destroy what you're creating.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              {[{ ic: '⚑', t: '5 Hunters' }, { ic: '⏱', t: '48–72 Hours' }, { ic: '$', t: 'DRIFT Bounty' }, { ic: '★', t: 'Raid Badge' }].map(f => (
                <span key={f.t} className="chip" style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', gap: 6 }}><span>{f.ic}</span>{f.t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setCreating(c => !c)}>
            {creating ? 'Cancel' : 'Form a Squad →'}
          </button>
          <input
            className="set-input"
            placeholder="Search by squad name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ maxWidth: 220, padding: '8px 12px', fontSize: 12 }}
          />
          <button className="btn" onClick={loadOpenRaids} style={{ fontSize: 12 }}>↺ Refresh</button>
        </div>

        {creating && (
          <div className="panel raid-create-panel">
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>New Raid</div>
            <input
              className="set-input"
              placeholder="Squad name (e.g. Team Zero)"
              value={raidName}
              onChange={e => setRaidName(e.target.value)}
              style={{ marginBottom: 18, maxWidth: 360, display: 'block' }}
            />
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Your Role</div>
            <div className="raid-role-grid">
              {ROLE_ORDER.map(k => {
                const r = ROLES[k]
                return (
                  <div key={k} className={`raid-role-card${selectedRole === k ? ' selected' : ''}`} style={{ '--rc': r.color }} onClick={() => setSelectedRole(k)}>
                    <div className="rrc-icon">{r.icon}</div>
                    <div className="rrc-label">{r.label}</div>
                    <div className="rrc-owns">{r.owns}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn btn-primary" disabled={!raidName.trim() || !selectedRole || busy || (spendableDrift < RAID_ENTRY_COST && !isAdmin)} onClick={handleCreate}>
                {busy ? 'Creating...' : `Create Raid → (${RAID_ENTRY_COST} $DRIFT)`}
              </button>
              <button className="btn" onClick={() => { setCreating(false); setRaidName(''); setSelectedRole(null) }}>Cancel</button>
            </div>
          </div>
        )}

        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Open Squads {openRaids.length > 0 && <span style={{ color: 'var(--ink-4)' }}>· {openRaids.length} available · live</span>}
          </div>
          {filteredOpenRaids.length === 0 ? (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-3)', padding: '20px 0' }}>
              {searchName.trim() ? `No squads matching "${searchName}"` : 'No open squads. Form one and share your squad name with your team.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredOpenRaids.map(raid => {
                const mems = openRaidMembers[raid.id] ?? []
                const alreadyIn = mems.some(m => m.user_id === user?.id)
                const remainMin = Math.max(0, Math.floor((60 * 60 * 1000 - (Date.now() - new Date(raid.created_at).getTime())) / 60000))
                const expirySoon = remainMin <= 10
                return (
                  <div key={raid.id} className="panel raid-open-card">
                    <div className="raid-open-header">
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 14, color: 'var(--ink-1)', fontWeight: 600 }}>{raid.name}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{mems.length}/5 hunters</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: expirySoon ? 'var(--magenta)' : 'var(--ink-3)' }}>
                          {expirySoon ? `⚠ expires in ${remainMin}m` : `expires in ${remainMin}m`}
                        </div>
                      </div>
                    </div>
                    <div className="raid-slots">
                      {ROLE_ORDER.map(k => {
                        const r = ROLES[k]
                        const member = mems.find(m => m.role === k)
                        const isMe = member?.user_id === user?.id
                        const canJoin = !member && !alreadyIn
                        return (
                          <div key={k}
                            className={`raid-slot${member ? ' slot-taken' : canJoin ? ' slot-open' : ''}`}
                            style={{ '--rc': r.color }}
                            onClick={canJoin ? () => setJoiningRaid({ raidId: raid.id, role: k }) : undefined}
                          >
                            <span className="slot-icon">{r.icon}</span>
                            <span className="slot-name">{member ? (isMe ? 'YOU' : (member.profiles?.name ?? 'Pilot')) : r.label.split(' ')[0]}</span>
                          </div>
                        )
                      })}
                    </div>
                    {joiningRaid?.raidId === raid.id && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)' }}>Join as {ROLES[joiningRaid.role]?.label}?</span>
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} disabled={busy || (spendableDrift < RAID_ENTRY_COST && !isAdmin)}
                          onClick={() => handleJoin(joiningRaid.raidId, joiningRaid.role)}>Join → ({RAID_ENTRY_COST} $DRIFT)</button>
                        <button className="btn" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setJoiningRaid(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // WAITING ROOM
  if (activeRaid.status === 'lobby') {
    const full = isAdmin || members.length >= 5
    return (
      <div className="raid-waiting">
        <div className="raid-waiting-header">
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              {isLeader ? 'SQUAD LEADER' : 'WAITING'} · {members.length}/5 HUNTERS
              {isAdmin && <span className="chip" style={{ marginLeft: 10, padding: '1px 6px', fontSize: 8, color: 'var(--magenta)' }}>ADMIN MODE</span>}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>{activeRaid.name}</h2>
          </div>
          <button className="btn" style={{ color: isLeader ? 'var(--magenta)' : undefined, fontSize: 12 }} disabled={busy} onClick={handleLeave}>
            {isLeader ? 'Disband' : 'Leave'}
          </button>
        </div>

        <div className="raid-role-grid raid-role-grid-lg">
          {ROLE_ORDER.map(k => {
            const r = ROLES[k]
            const member = members.find(m => m.role === k)
            const isMe = myMembership?.role === k
            return (
              <div key={k} className={`raid-role-card${member ? ' filled' : ' empty'}${briefRole === k ? ' selected' : ''}`} style={{ '--rc': r.color }} onClick={() => setBriefRole(briefRole === k ? null : k)}>
                <div className="rrc-icon">{r.icon}</div>
                <div className="rrc-label">{r.label}</div>
                <div className={`rrc-pilot${member ? '' : ' rrc-await'}`}>
                  {member
                    ? (isMe
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'var(--magenta)' }}>YOU — {member.profiles?.name ?? 'Pilot'}</span>
                            {myFlagged > 0 && <span className="integrity-flag" title={`${myFlagged} flagged gate submission${myFlagged !== 1 ? 's' : ''} on record`}>⚠</span>}
                          </span>
                        : member.profiles?.name ?? 'Pilot')
                    : 'AWAITING HUNTER'}
                </div>
                <div className="rrc-owns">{r.owns}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--rc)', letterSpacing: '0.08em', marginTop: 4 }}>
                  {briefRole === k ? 'hide brief −' : 'view brief →'}
                </div>
              </div>
            )
          })}
        </div>

        {myFlagged > 0 && (
          <div className="integrity-warning">
            <span className="integrity-warning-icon">⚠</span>
            <div>
              <div className="integrity-warning-title">Integrity Flag on Record</div>
              <div className="integrity-warning-body">You have {myFlagged} flagged gate submission{myFlagged !== 1 ? 's' : ''} — suspicious timing, paste attempts, or rapid-change patterns detected. When you join or launch a raid, your squad takes −{Math.min(100, myFlagged * 25)} HP. Fix your reputation by completing gates cleanly.</div>
            </div>
          </div>
        )}

        {briefRole && (
          <div className="role-brief-panel-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: ROLES[briefRole].color, fontSize: 20, fontFamily: 'var(--f-mono)' }}>{ROLES[briefRole].icon}</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>{ROLES[briefRole].label} — Build Brief</span>
              </div>
              <button className="btn" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => setBriefRole(null)}>✕</button>
            </div>
            <RoleBrief roleKey={briefRole} />
          </div>
        )}

        {isLeader ? (
          <div style={{ marginTop: 20, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={!full || busy} onClick={handleStart}>
              {busy ? 'Launching...' : full ? 'Launch Raid — Enter Gate Zero →' : `Waiting for ${5 - members.length} more hunter${5 - members.length !== 1 ? 's' : ''}...`}
            </button>
            {isAdmin && (
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)' }}>Admin mode — solo launch enabled</span>
            )}
            {!full && !isAdmin && (
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>Share "{activeRaid.name}" with your team</span>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 20 }}>
            Waiting for squad leader to launch...
          </p>
        )}
      </div>
    )
  }

  // DESCENT
  if (activeRaid.status === 'descent') {
    const docHead = (n, title, owner) => (
      <div className="descent-doc-head" onClick={() => setExpandedDoc(expandedDoc === n ? null : n)}>
        <span className="descent-doc-n">{String(n).padStart(2, '0')}</span>
        <div style={{ flex: 1 }}>
          <div className="descent-doc-title">{title}</div>
          <div className="descent-doc-owner">{owner}</div>
        </div>
        <span className="descent-chevron">{expandedDoc === n ? '−' : '+'}</span>
      </div>
    )
    return (
      <div style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--violet)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Phase 01 — The Descent · Hours 0–4</div>
            <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8 }}>{activeRaid.name}</h2>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-2)', maxWidth: 560, lineHeight: 1.7 }}>
              No Hunter touches code for four hours. Produce all five documents. Every member must understand each before Phase 02 begins.
            </p>
          </div>
          <button className="btn" style={{ color: isLeader ? 'var(--magenta)' : undefined, flexShrink: 0, fontSize: 12 }} disabled={busy} onClick={handleLeave}>
            {isLeader ? 'Disband' : 'Leave'}
          </button>
        </div>

        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'oklch(0.72 0.28 340 / 0.06)', border: '1px solid oklch(0.72 0.28 340 / 0.2)', marginBottom: 24, display: 'flex', gap: 10 }}>
          <span style={{ color: 'var(--magenta)', flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Skipping the Descent and jumping straight to building will cause integration failures around hour 20 that cost 12+ hours to fix. This is by design.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>

          {/* DOC 01 — DATA CONTRACT */}
          <div className="descent-doc">
            {docHead(1, 'Data Contract', 'Vault Hunter writes · All five approve')}
            {expandedDoc === 1 && (
              <div className="descent-doc-body">
                <p className="descent-desc">The complete database schema — every table, every column, every type, every constraint. Produced as a Prisma schema or raw SQL. Not a sketch. The Vault Hunter executes this as-is during Phase 02.</p>
                {[
                  { name: 'users', cols: [['id','uuid','PRIMARY KEY'],['email','text','UNIQUE NOT NULL'],['password','text','NOT NULL — hashed'],['role','text',"DEFAULT 'citizen' — citizen | operator | admin"],['created_at','timestamptz','DEFAULT now()']] },
                  { name: 'refresh_tokens', cols: [['id','uuid','PRIMARY KEY'],['user_id','uuid','FK → users ON DELETE CASCADE'],['token','text','UNIQUE NOT NULL'],['expires_at','timestamptz','NOT NULL'],['created_at','timestamptz','DEFAULT now()']] },
                  { name: 'districts', cols: [['id','uuid','PRIMARY KEY'],['name','text','NOT NULL'],['status','text',"DEFAULT 'active'"],['created_at','timestamptz','DEFAULT now()']] },
                  { name: 'citizens', cols: [['id','uuid','PRIMARY KEY'],['user_id','uuid','FK → users ON DELETE CASCADE'],['district_id','uuid','FK → districts'],['name','text','NOT NULL'],['access_level','int','DEFAULT 1 — range 1–5'],['created_at','timestamptz','DEFAULT now()']] },
                  { name: 'events', cols: [['id','uuid','PRIMARY KEY'],['district_id','uuid','FK → districts'],['type','text','NOT NULL — security | maintenance | alert'],['metadata','jsonb',''],['created_at','timestamptz','DEFAULT now()']] },
                  { name: 'audit_logs', cols: [['id','uuid','PRIMARY KEY'],['user_id','uuid','FK → users'],['action','text','NOT NULL'],['resource','text','NOT NULL'],['created_at','timestamptz','DEFAULT now()']] },
                ].map(t => (
                  <div key={t.name} style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--teal)', fontWeight: 600, marginBottom: 5 }}>{t.name}</div>
                    {t.cols.map(([col, type, note]) => (
                      <div key={col} style={{ display: 'grid', gridTemplateColumns: '140px 110px 1fr', gap: 8, padding: '3px 0', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                        <span style={{ color: 'var(--ink-1)' }}>{col}</span>
                        <span style={{ color: 'var(--amber)' }}>{type}</span>
                        <span style={{ color: 'var(--ink-3)' }}>{note}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="descent-rule">Every FK constraint must be explicit. Every cascade behavior must be decided. The Vault Hunter cannot change this schema after Descent ends without a full party vote — every other role builds against it.</div>
              </div>
            )}
          </div>

          {/* DOC 02 — SIGNAL CONTRACT */}
          <div className="descent-doc">
            {docHead(2, 'Signal Contract', 'Signal Hunter writes · Interface + Cipher approve')}
            {expandedDoc === 2 && (
              <div className="descent-doc-body">
                <p className="descent-desc">The complete API contract — every endpoint, every request shape, every response shape, every error format. Not approximate. Exact. The Interface Hunter builds against this contract — any deviation breaks the frontend.</p>
                {[
                  { group: 'AUTH', rows: [['POST','/api/auth/register','none','{ email, password, name }'],['POST','/api/auth/login','none','{ email, password }'],['POST','/api/auth/refresh','none','refresh token via httpOnly cookie'],['POST','/api/auth/logout','token','{}'],['GET','/api/auth/me','token','{}']] },
                  { group: 'DISTRICTS', rows: [['GET','/api/districts','token','list all'],['GET','/api/districts/:id','token','single'],['POST','/api/districts','admin','{ name }'],['PATCH','/api/districts/:id','admin','{ status }']] },
                  { group: 'CITIZENS', rows: [['GET','/api/citizens','operator','list, filter by district'],['GET','/api/citizens/:id','token','own (citizen) / any (operator+)'],['POST','/api/citizens','token','{ name, district_id, access_level }'],['PATCH','/api/citizens/:id','token','own record only'],['DELETE','/api/citizens/:id','admin','hard delete']] },
                  { group: 'EVENTS', rows: [['GET','/api/events','operator','filter by type, district, date range'],['POST','/api/events','operator','{ district_id, type, metadata }'],['GET','/api/events/aggregate','admin','count by district, last 7 days']] },
                  { group: 'HEALTH', rows: [['GET','/api/health','none','{ status, uptime, db, environment, timestamp }']] },
                ].map(g => (
                  <div key={g.group} style={{ marginBottom: 14 }}>
                    <div className="descent-section-label">{g.group}</div>
                    {g.rows.map(([method, path, auth, note]) => (
                      <div key={path+method} style={{ display: 'grid', gridTemplateColumns: '50px 230px 68px 1fr', gap: 8, padding: '4px 0', fontFamily: 'var(--f-mono)', fontSize: 11, borderBottom: '1px solid oklch(1 0 0 / 0.04)' }}>
                        <span style={{ color: method==='GET'?'var(--teal)':method==='POST'?'var(--lime)':method==='PATCH'?'var(--amber)':'var(--magenta)', fontWeight:600 }}>{method}</span>
                        <span style={{ color: 'var(--ink-1)' }}>{path}</span>
                        <span style={{ color: auth==='none'?'var(--ink-4)':auth==='admin'?'var(--magenta)':auth==='operator'?'var(--amber)':'var(--teal)' }}>{auth}</span>
                        <span style={{ color: 'var(--ink-3)' }}>{note}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="descent-section-label" style={{ marginTop: 16 }}>Standard Error Format — Non-Negotiable</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.08)', borderRadius: 8, padding: '12px 14px', lineHeight: 1.9 }}>
                  {'{'}<br/>
                  &nbsp;&nbsp;<span style={{ color: 'var(--teal)' }}>"error"</span>: <span style={{ color: 'var(--amber)' }}>true</span>,<br/>
                  &nbsp;&nbsp;<span style={{ color: 'var(--teal)' }}>"code"</span>: <span style={{ color: 'var(--lime)' }}>"RESOURCE_NOT_FOUND"</span>,<br/>
                  &nbsp;&nbsp;<span style={{ color: 'var(--teal)' }}>"message"</span>: <span style={{ color: 'var(--lime)' }}>"Citizen with id xyz does not exist"</span>,<br/>
                  &nbsp;&nbsp;<span style={{ color: 'var(--teal)' }}>"status"</span>: <span style={{ color: 'var(--amber)' }}>404</span><br/>
                  {'}'}
                </div>
              </div>
            )}
          </div>

          {/* DOC 03 — CIPHER CONTRACT */}
          <div className="descent-doc">
            {docHead(3, 'Cipher Contract', 'Cipher Hunter writes · Signal Hunter approves')}
            {expandedDoc === 3 && (
              <div className="descent-doc-body">
                <p className="descent-desc">The complete auth flow — how tokens are issued, validated, refreshed, and revoked. Every Hunter reads this because every layer touches auth. If the Cipher Hunter changes this spec mid-raid, it is a breaking change and the Signal Hunter must be notified immediately.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <div className="descent-section-label">Token Architecture</div>
                    {[['Access token','JWT · 15-minute expiry · signed with ACCESS_TOKEN_SECRET'],['Refresh token','opaque UUID · 7-day expiry · stored in refresh_tokens table'],['Access token payload','{ userId, email, role, iat, exp }'],['Refresh delivery','httpOnly cookie named refreshToken']].map(([k,v]) => (
                      <div key={k} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, padding: '5px 0', fontFamily: 'var(--f-mono)', fontSize: 11, borderBottom: '1px solid oklch(1 0 0 / 0.04)' }}>
                        <span style={{ color: 'var(--violet)' }}>{k}</span><span style={{ color: 'var(--ink-2)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="descent-section-label">Auth Middleware — verifyToken error codes</div>
                    {[['TOKEN_EXPIRED','401','token signature valid but exp in the past'],['TOKEN_INVALID','401','signature does not match ACCESS_TOKEN_SECRET'],['TOKEN_MISSING','401','Authorization header absent — do not attempt verification']].map(([code,status,note]) => (
                      <div key={code} style={{ display: 'grid', gridTemplateColumns: '160px 36px 1fr', gap: 10, padding: '5px 0', fontFamily: 'var(--f-mono)', fontSize: 11, borderBottom: '1px solid oklch(1 0 0 / 0.04)' }}>
                        <span style={{ color: 'var(--magenta)' }}>{code}</span><span style={{ color: 'var(--amber)' }}>{status}</span><span style={{ color: 'var(--ink-3)' }}>{note}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="descent-section-label">RBAC Middleware — requireRole</div>
                    {[["requireRole('operator')","blocks citizens · passes operators and admins"],["requireRole('admin')","blocks citizens and operators · passes admins only"],['403 on block','code: INSUFFICIENT_PERMISSIONS'],['Ownership check','requireOwnership — operators and admins bypass · citizens blocked from others\' resources · code: ACCESS_DENIED']].map(([k,v]) => (
                      <div key={k} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 10, padding: '5px 0', fontFamily: 'var(--f-mono)', fontSize: 11, borderBottom: '1px solid oklch(1 0 0 / 0.04)' }}>
                        <span style={{ color: 'var(--teal)' }}>{k}</span><span style={{ color: 'var(--ink-3)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="descent-section-label">Refresh Flow</div>
                    {['1. Client request returns TOKEN_EXPIRED','2. Client silently sends POST /api/auth/refresh — cookie delivered automatically','3. Server validates refresh token against DB, checks expiry','4. Server deletes old token, issues new access token + new refresh token (rotation)','5. Client updates in-memory access token, retries original request — user sees nothing'].map((s,i) => (
                      <div key={i} style={{ padding: '5px 0', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', borderBottom: '1px solid oklch(1 0 0 / 0.04)', lineHeight: 1.5 }}>{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DOC 04 — ENVIRONMENT CONTRACT */}
          <div className="descent-doc">
            {docHead(4, 'Environment Contract', 'Architect Hunter writes · All five approve')}
            {expandedDoc === 4 && (
              <div className="descent-doc-body">
                <p className="descent-desc">Every environment variable the system needs, what it's for, and who owns the value. Produced as a .env.example committed to the repo. The Architect Hunter ensures every variable exists in production before Hour 40 — missing variables at deploy time are a raid failure condition.</p>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.08)', borderRadius: 8, padding: '14px 16px', lineHeight: 2.1 }}>
                  {[
                    { comment: '# DATABASE — Vault Hunter owns these values', vars: ['DATABASE_URL=postgresql://user:password@host:5432/dbname'] },
                    { comment: '# AUTH — Cipher Hunter owns these values', vars: ['ACCESS_TOKEN_SECRET=minimum-32-character-random-string','REFRESH_TOKEN_SECRET=minimum-32-character-random-string-different'] },
                    { comment: '# SERVER — Signal Hunter owns these values', vars: ['PORT=3000','NODE_ENV=production','ALLOWED_ORIGINS=https://your-frontend-domain.com'] },
                    { comment: '# FRONTEND — Interface Hunter owns these values', vars: ['VITE_API_URL=https://your-api-domain.com'] },
                  ].map((sec, i) => (
                    <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
                      <div style={{ color: 'var(--ink-4)' }}>{sec.comment}</div>
                      {sec.vars.map(v => {
                        const [k, ...rest] = v.split('=')
                        return <div key={v}><span style={{ color: 'var(--teal)' }}>{k}</span><span style={{ color: 'var(--ink-4)' }}>=</span><span style={{ color: 'var(--lime)' }}>{rest.join('=')}</span></div>
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DOC 05 — ARCHITECTURE MAP */}
          <div className="descent-doc">
            {docHead(5, 'Architecture Map', 'All five produce together')}
            {expandedDoc === 5 && (
              <div className="descent-doc-body">
                <p className="descent-desc">Which services exist, where each is hosted, how they connect, who owns each service, and the deployment order. Hosting decisions made during Descent are permanent — switching platforms mid-build costs 6+ hours.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <div className="descent-section-label">Services</div>
                    {[['Frontend','React + Vite','Interface Hunter','Vercel · Netlify · Cloudflare Pages'],['API Server','Node.js + Express','Signal Hunter','Railway · Render · Fly.io'],['Database','PostgreSQL','Vault Hunter','Railway · Supabase · Render']].map(([svc,stack,owner,opts]) => (
                      <div key={svc} style={{ display: 'grid', gridTemplateColumns: '100px 160px 140px 1fr', gap: 10, padding: '6px 0', fontFamily: 'var(--f-mono)', fontSize: 11, borderBottom: '1px solid oklch(1 0 0 / 0.04)' }}>
                        <span style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{svc}</span>
                        <span style={{ color: 'var(--teal)' }}>{stack}</span>
                        <span style={{ color: 'var(--violet)' }}>{owner}</span>
                        <span style={{ color: 'var(--ink-3)' }}>{opts}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="descent-section-label">Deployment Order — Non-Negotiable</div>
                    {['1. Database — provision, run migrations, seed test users for all three roles','2. API Server — deploy, set all env vars, verify GET /api/health returns { db: \'connected\' }','3. Frontend — build, deploy, verify VITE_API_URL reaches the live API'].map((s,i) => (
                      <div key={i} style={{ padding: '6px 0', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', borderBottom: '1px solid oklch(1 0 0 / 0.04)', lineHeight: 1.5 }}>{s}</div>
                    ))}
                  </div>
                  <div>
                    <div className="descent-section-label">Connection Rules</div>
                    {[['CORS','API must list the exact frontend URL in ALLOWED_ORIGINS — not a wildcard'],['SSL','Database connection string must include SSL params for all production hosts'],['Cookies','Frontend fetch calls must include credentials: \'include\' for cookies to reach the API'],['Hosting lock','No Hunter changes their service host after Descent ends without a party vote']].map(([k,v]) => (
                      <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, padding: '6px 0', fontFamily: 'var(--f-mono)', fontSize: 11, borderBottom: '1px solid oklch(1 0 0 / 0.04)' }}>
                        <span style={{ color: 'var(--amber)' }}>{k}</span><span style={{ color: 'var(--ink-3)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* AI Pledge */}
        <div className="pledge-panel">
          <div className="pledge-header">
            <span className="pledge-glyph">⊕</span>
            <div>
              <div className="pledge-title">ANTI-AI PLEDGE</div>
              <div className="pledge-desc">Every Hunter must swear before the Build begins. No AI writes your code. No tool completes your work. The raid tests what YOU can build.</div>
            </div>
          </div>
          <div className="pledge-roster">
            {ROLE_ORDER.map(k => {
              const m = members.find(x => x.role === k)
              const r = ROLES[k]
              const pledged = m && pledgedIds.has(m.user_id)
              return (
                <div key={k} className={`pledge-member${pledged ? ' pledged' : m ? '' : ' absent'}`}>
                  <span className="pledge-check">{pledged ? '✓' : m ? '○' : '—'}</span>
                  <span style={{ color: m ? r.color : 'var(--ink-4)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>{r.icon}</span>
                  <span className="pledge-name">{m ? (m.user_id === user?.id ? 'YOU' : (m.profiles?.name ?? 'Pilot')) : r.label.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
          {!myPledged && (
            <button className="btn pledge-btn" disabled={busy} onClick={handlePledge}>
              ⊕ Take the Pledge
            </button>
          )}
          {myPledged && !allPledged && (
            <div className="pledge-wait">Pledge taken. Waiting for all Hunters to confirm...</div>
          )}
          {allPledged && (
            <div className="pledge-all-clear">All Hunters pledged. Squad integrity confirmed.</div>
          )}
        </div>

        {isLeader ? (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={busy || (!allPledged && !isAdmin)} onClick={handleBeginBuild}>
              {busy ? 'Starting...' : 'Descent Complete — Begin Build →'}
            </button>
            {!allPledged && !isAdmin && (
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)' }}>Waiting for all Hunters to take the Anti-AI Pledge</span>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>Waiting for squad leader to advance to the Build phase...</p>
        )}
      </div>
    )
  }

  // ACTIVE / SIEGE — delegate to RaidIDE
  return (
    <RaidIDE
      raid={activeRaid}
      members={members}
      myRole={myRole}
      isLeader={isLeader}
      isAdmin={isAdmin}
      events={events}
      busy={busy}
      passedSyncs={passedSyncs}
      expandedSync={expandedSync}
      setExpandedSync={setExpandedSync}
      expandedWave={expandedWave}
      setExpandedWave={setExpandedWave}
      syncEvidence={syncEvidence}
      setSyncEvidence={setSyncEvidence}
      onSync={handleSync}
      onWave={handleWave}
      onBonus={handleBonus}
      onLeave={handleLeave}
      onAdminSkipToSiege={adminSkipToSiege}
      onAdminSkipWave={adminSkipWave}
      onAdminForceComplete={adminForceComplete}
      healthColor={healthColor}
      SYNCS={SYNCS}
      WAVES={WAVES}
      ROLES_FULL={ROLES}
    />
  )

}
