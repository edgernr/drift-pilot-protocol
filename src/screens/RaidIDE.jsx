import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './RaidIDE.css'

// ── Per-role starter file templates ───────────────────────────────────────────

const STARTERS = {
  interface: {
    'App.jsx': `import { useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// TODO: implement credential form component (email + password, calls the auth API)
// TODO: implement district list component (renders array of district cards)
// TODO: add a route guard that blocks unauthenticated users from protected views

export default function App() {
  const [user, setUser] = useState(null)
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // TODO: async fetchDistricts(token) — GET /api/districts with Authorization: Bearer <token>

  return (
    <div className="app">
      <header className="app-header">
        <h1>EVA City — District Portal</h1>
        {user && <span className="user-chip">{user.email}</span>}
      </header>
      <main className="app-main">
        {loading && <div className="loader">Loading...</div>}
        {error && <div className="error-msg">{error}</div>}
        {/* TODO: credential form when !user, district list when authenticated */}
      </main>
    </div>
  )
}`,
    'App.css': `* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0a0a0f;
  color: #e0e0ec;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.app { min-height: 100vh; display: flex; flex-direction: column; }

.app-header {
  padding: 16px 24px;
  border-bottom: 1px solid #1e1e2e;
  display: flex;
  align-items: center;
  gap: 16px;
}
.app-header h1 { font-size: 18px; font-weight: 600; color: #a0f0d0; }

.user-chip {
  background: #1a1a2e;
  border: 1px solid #2a2a3e;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  color: #8080a0;
}

.app-main { padding: 24px; flex: 1; max-width: 960px; margin: 0 auto; width: 100%; }

.loader { color: #6060a0; font-size: 12px; font-family: monospace; }
.error-msg { color: #e060a0; background: rgba(224,96,160,0.1); border: 1px solid rgba(224,96,160,0.2); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; }

.login-form { max-width: 340px; display: flex; flex-direction: column; gap: 12px; }
.login-form h2 { font-size: 20px; margin-bottom: 4px; }
.login-form input {
  background: #111120;
  border: 1px solid #2a2a3e;
  color: #e0e0ec;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.login-form input:focus { border-color: #4080c0; }
.login-form button {
  background: #1e3a5e;
  border: 1px solid #2a4a6e;
  color: #60c0ff;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.login-form button:hover { background: #2a4a6e; }

.empty-state { color: #606080; font-size: 13px; }

.district-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.district-item {
  background: #111120;
  border: 1px solid #1e1e2e;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.district-name { font-size: 14px; font-weight: 500; }
.district-status { font-size: 11px; font-family: monospace; padding: 2px 8px; border-radius: 4px; }
.status-active { background: rgba(96,224,160,0.12); color: #60e0a0; }
.status-quarantined { background: rgba(224,160,60,0.12); color: #e0a040; }
.status-sealed { background: rgba(224,96,96,0.12); color: #e06060; }`,
    'index.js': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)`,
  },

  signal: {
    'src/app.js': `const express = require('express')
// TODO: import cors, cookieParser, morgan
// TODO: import request throttle middleware for auth and general routes
// TODO: import token verification middleware
// TODO: import global error handler middleware

const app = express()

// TODO: configure middleware chain
//   - request logging (morgan combined)
//   - CORS (read ALLOWED_ORIGINS from env, credentials: true)
//   - JSON body parser
//   - cookie parser

// TODO: mount authentication routes (with auth throttle)
// TODO: mount district routes (protected + global throttle)
// TODO: mount citizen routes  (protected + global throttle)
// TODO: mount events routes   (protected + global throttle)
// TODO: add system health check endpoint (GET with status/uptime/db/environment/timestamp)
// TODO: mount global error handler last

module.exports = app`,
    'src/server.js': `require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 3001

// TODO: register global exception handler — log and keep process alive
// TODO: register unhandled promise rejection handler — log reason

app.listen(PORT, () => {
  console.log('[Signal Hunter] API online → port ' + PORT)
})`,
    'src/db.js': `const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error', err)
})

module.exports = { query: (text, params) => pool.query(text, params), pool }`,
    'src/middleware/errorHandler.js': `// TODO: implement the 4-argument Express error handling middleware
// Must be the last app.use() call in app.js
// Read err.status (default 500), log the error, return JSON:
// { error: { code: string, message: string, details?: any } }
`,
    'src/middleware/verifyToken.js': `// TODO: implement JWT bearer token verification middleware
// Extract Authorization: Bearer <token> from the request header
// Verify using the helper from ../auth/tokens
// On success: attach decoded payload to req.user, call next()
// On failure: 401 with the correct error code (see Cipher Contract)
`,
    'src/middleware/authLimiter.js': `// TODO: implement request throttling for authentication routes
// Window: 15 minutes, max 10 requests per window
// On exceed: return HTTP 429 with a JSON error body
`,
    'src/middleware/globalLimiter.js': `// TODO: implement request throttling for general API routes
// Window: 15 minutes, max 100 requests per window
// On exceed: return HTTP 429 with a JSON error body
`,
    'src/auth/tokens.js': `const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET

if (!ACCESS_SECRET  || ACCESS_SECRET.length  < 32) throw new Error('ACCESS_TOKEN_SECRET missing or < 32 chars — refusing to start')
if (!REFRESH_SECRET || REFRESH_SECRET.length < 32) throw new Error('REFRESH_TOKEN_SECRET missing or < 32 chars — refusing to start')
if (ACCESS_SECRET === REFRESH_SECRET) throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different strings')

const generateAccessToken  = payload => jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
const generateRefreshToken = () => crypto.randomUUID()
const verifyAccessToken    = token => jwt.verify(token, ACCESS_SECRET)

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken }`,
  },

  vault: {
    'schema.sql': `-- EVA City District Database Schema
-- Vault Hunter executes this exactly as-is during Phase 02.
-- No changes without a full party vote.

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','operator','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','quarantined','sealed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citizens (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district_id  INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  access_level INTEGER NOT NULL DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('security','maintenance','alert')),
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  resource   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
    'indexes.sql': `-- EVA City — Performance Indexes
-- Run this after schema migration

-- TODO: add indexes on citizens (district_id, user_id)
-- TODO: add indexes on events (district_id, type, created_at DESC)
-- TODO: add index on refresh_tokens token column (fast lookup)
-- TODO: add index on audit_logs user_id column
`,
    'seed.sql': `-- Seed data — run after schema + indexes
INSERT INTO districts (name, status) VALUES
  ('Sector Zero',     'active'),
  ('Command Centre',  'active'),
  ('Reactor Grid',    'quarantined')
ON CONFLICT DO NOTHING;

-- Test users: passwords should be replaced with real bcrypt hashes before use
-- Use: require('bcrypt').hashSync('password123', 12)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User',  'admin@eva.city',   '$2b$12$REPLACE_WITH_REAL_HASH', 'admin'),
  ('Operator One','op@eva.city',      '$2b$12$REPLACE_WITH_REAL_HASH', 'operator'),
  ('Citizen A',   'citizen@eva.city', '$2b$12$REPLACE_WITH_REAL_HASH', 'citizen')
ON CONFLICT (email) DO NOTHING;

INSERT INTO citizens (user_id, district_id, name, access_level)
SELECT u.id, d.id, u.name, 1
FROM users u CROSS JOIN districts d
WHERE u.role = 'citizen' AND d.name = 'Sector Zero'
ON CONFLICT DO NOTHING;`,
    'queries.js': `// Vault Hunter — Database Query Layer
// All DB access goes through this module. No raw SQL in route handlers.
const { query } = require('../db')

// ── Users ──────────────────────────────────────────────────────────────────
// TODO: function to insert a new user — returns { id, name, email, role, created_at }
// TODO: function to fetch a user record by email address
// TODO: function to fetch a user by integer ID (exclude password column)

// ── Refresh Tokens ──────────────────────────────────────────────────────────
// TODO: function to store a new token entry for a user with expiry timestamp
// TODO: function to look up a token string and return its row
// TODO: function to delete one token by its string value
// TODO: function to delete all tokens belonging to a user ID

// ── Districts ───────────────────────────────────────────────────────────────
// TODO: function to get all districts ordered newest first
// TODO: function to get a single district by ID
// TODO: function to insert a new district (name field)
// TODO: function to update a district status field

// ── Citizens ────────────────────────────────────────────────────────────────
// TODO: function to get citizens — optional filter by district, with limit + offset
// TODO: function to get a single citizen by ID
// TODO: function to insert a citizen
// TODO: function to update citizen name and/or access_level
// TODO: function to delete a citizen by ID

// ── Events ──────────────────────────────────────────────────────────────────
// TODO: function to get events — optional filters: type, district, date range
// TODO: function to insert an event record
// TODO: function to get a 7-day aggregate event count grouped by district

// ── Audit ────────────────────────────────────────────────────────────────────
// TODO: function to insert an audit log entry

module.exports = {}`,
  },

  cipher: {
    'tokens.js': `const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET

if (!ACCESS_SECRET  || ACCESS_SECRET.length  < 32) throw new Error('ACCESS_TOKEN_SECRET missing or < 32 chars')
if (!REFRESH_SECRET || REFRESH_SECRET.length < 32) throw new Error('REFRESH_TOKEN_SECRET missing or < 32 chars')
if (ACCESS_SECRET === REFRESH_SECRET) throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must differ')

const generateAccessToken  = payload => jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
const generateRefreshToken = () => crypto.randomUUID()
const verifyAccessToken    = token  => jwt.verify(token, ACCESS_SECRET)

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken }`,
    'middleware.js': `// Cipher Hunter — Authentication Middleware
// Reference: Cipher Contract (token architecture, RBAC rules, error codes)

// Implement and export three middleware functions:
//
// 1. Token verifier: extract Bearer token from Authorization header,
//    call the token verifier helper from ./tokens, attach payload to req.user
//    On failure: return 401 with the correct error code
//
// 2. Role-based access guard: accept a list of allowed roles,
//    return a middleware that checks req.user.role
//    On failure: return 403 with INSUFFICIENT_PERMISSIONS
//
// 3. Resource access guard: async, accepts a function to retrieve
//    the resource's owner ID; operators and admins bypass the check;
//    citizens must match the resource they own
//    On failure: return 403 with ACCESS_DENIED

module.exports = {}`,
    'authController.js': `const bcrypt = require('bcrypt')
const { generateAccessToken, generateRefreshToken } = require('./tokens')
const db = require('../db/queries')

// TODO: define cookie configuration object
// Required properties: httpOnly (true), secure (production only), sameSite (strict), maxAge (7 days in ms)

async function register(req, res, next) {
  try {
    // TODO: validate req.body — name, email, password all required
    // TODO: check email not already registered — 409 if exists
    // TODO: hash password with bcrypt cost factor 12
    // TODO: create user record, generate access + refresh tokens
    // TODO: store refresh token in DB, set cookie, return { accessToken, user }
  } catch (err) { next(err) }
}

async function login(req, res, next) {
  try {
    // TODO: validate email + password present
    // TODO: find user by email — 401 if not found
    // TODO: compare password with bcrypt — 401 if mismatch
    // TODO: generate tokens, store refresh, set cookie, return { accessToken, user }
  } catch (err) { next(err) }
}

async function refresh(req, res, next) {
  try {
    // TODO: read refresh token from cookies — 401 if missing
    // TODO: find and validate token in DB — 401 if not found or expired
    // TODO: rotate: delete old token, generate and store new pair
    // TODO: set new cookie, return { accessToken }
  } catch (err) { next(err) }
}

async function logout(req, res, next) {
  try {
    // TODO: read token from cookies, delete it from DB
    // TODO: clear the cookie, return { ok: true }
  } catch (err) { next(err) }
}

function me(req, res) {
  // TODO: return { user: req.user } — attached by token verifier middleware
}

module.exports = { register, login, refresh, logout, me }`,
  },

  architect: {
    // ci.yml — TODO: create .github/workflows/ci.yml
    // Runs on pull_request: checkout, setup-node v20, npm ci, lint, test for both api/ and client/
    //
    // deploy.yml — TODO: create .github/workflows/deploy.yml
    // Runs on push to main: DB migration step (npx prisma migrate deploy), then deploy API + client
    // Must include the DB migration step for Sync 3 to pass
    '.env.example': `# === VAULT HUNTER — database ===
DATABASE_URL=postgresql://user:password@host:5432/eva_city

# === CIPHER HUNTER — auth secrets (each min 32 chars, must be DIFFERENT) ===
ACCESS_TOKEN_SECRET=replace-with-openssl-rand-hex-32-output
REFRESH_TOKEN_SECRET=replace-with-different-openssl-rand-hex-32-output

# === SIGNAL HUNTER — api server ===
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com

# === INTERFACE HUNTER — react app ===
VITE_API_URL=https://your-api-domain.com`,
    'README.md': `# EVA City — Gate Zero

## Deployment Order

1. **Architect Hunter** — provision database, configure secrets, set env vars
2. **Vault Hunter** — run migrations (\`npx prisma migrate deploy\`), run seed.js
3. **Signal Hunter** — deploy API to production host, confirm /api/health returns 200
4. **Cipher Hunter** — confirm auth endpoints functioning with real secrets
5. **Interface Hunter** — deploy frontend, confirm VITE_API_URL points to production API

## Pre-Siege Checklist

- [ ] DATABASE_URL set in production
- [ ] ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET set (32+ chars, different values)
- [ ] GET /api/health returns \`{ status: "ok", db: "connected" }\`
- [ ] Test users seeded (admin, operator, 3 citizens)
- [ ] Auto-restart configured (PM2 or hosting platform restart policy)
- [ ] Logs accessible and streaming
- [ ] Frontend reachable from production URL
- [ ] CORS confirmed — no wildcard origins in production`,
  },
}

// ── Automated code checks per sync ritual ──────────────────────────────────

function allFiles(files) { return Object.values(files || {}).join('\n') }

export const SYNC_CODE_CHECKS = [
  {
    vault:     [{ label: 'users table defined',          ok: f => /CREATE TABLE.*users/is.test(allFiles(f)) },
                { label: 'refresh_tokens table defined', ok: f => /CREATE TABLE.*refresh_tokens/is.test(allFiles(f)) },
                { label: 'NOT NULL constraints present', ok: f => /NOT NULL/.test(allFiles(f)) }],
    signal:    [{ label: 'Express app initialized',      ok: f => /express\(\)/.test(allFiles(f)) },
                { label: '/api/health defined',          ok: f => /\/api\/health/.test(allFiles(f)) },
                { label: 'Auth routes mounted',          ok: f => /\/api\/auth/.test(allFiles(f)) }],
    cipher:    [{ label: 'generateAccessToken defined',  ok: f => /generateAccessToken/.test(allFiles(f)) },
                { label: 'JWT 15m expiry',               ok: f => /expiresIn.*15m|15m.*expir/i.test(allFiles(f)) },
                { label: 'Secret startup check',         ok: f => /throw.*Error.*secret|process\.exit/i.test(allFiles(f)) }],
    interface: [{ label: 'React component exported',     ok: f => /export default/.test(allFiles(f)) }],
    architect: [{ label: 'ci.yml present',               ok: f => !!f['.github/workflows/ci.yml'] }],
  },
  {
    vault:     [{ label: 'All 6 tables defined', ok: f => ['users','refresh_tokens','districts','citizens','events','audit_logs'].every(t => new RegExp(`CREATE TABLE.*${t}`, 'is').test(allFiles(f))) }],
    signal:    [{ label: 'Auth controller (register+login+logout+me)', ok: f => /register.*login|login.*register/is.test(allFiles(f)) }],
    cipher:    [{ label: 'verifyToken defined', ok: f => /verifyToken/.test(allFiles(f)) },
                { label: 'requireRole defined', ok: f => /requireRole/.test(allFiles(f)) },
                { label: 'TOKEN_EXPIRED code', ok: f => /TOKEN_EXPIRED/.test(allFiles(f)) }],
    interface: [{ label: 'Login form present',  ok: f => /login|Login/i.test(allFiles(f)) },
                { label: 'API URL configured',  ok: f => /VITE_API_URL|API_URL|api.*url/i.test(allFiles(f)) }],
    architect: [{ label: 'deploy.yml present',  ok: f => !!f['.github/workflows/deploy.yml'] }],
  },
  {
    vault:     [{ label: 'Indexes defined',   ok: f => /CREATE INDEX/.test(allFiles(f)) },
                { label: 'Connection pool',   ok: f => /max.*\d|Pool\s*\(|pool/i.test(allFiles(f)) }],
    signal:    [{ label: 'Rate limiting',     ok: f => /rate.?limit|rateLimit/i.test(allFiles(f)) },
                { label: 'Error handler',     ok: f => /errorHandler|error_handler/.test(allFiles(f)) }],
    cipher:    [{ label: 'Cookie config (httpOnly)', ok: f => /httpOnly.*true|httpOnly:\s*true/i.test(allFiles(f)) },
                { label: 'requireOwnership',  ok: f => /requireOwnership|ownership/.test(allFiles(f)) }],
    interface: [{ label: 'Protected routes',  ok: f => /Protected|PrivateRoute|requireAuth|isAuthenticated/i.test(allFiles(f)) }],
    architect: [{ label: 'DB migrate step in deploy.yml', ok: f => { const c = f['.github/workflows/deploy.yml'] || ''; return /migrate/.test(c) } }],
  },
  {
    vault:     [{ label: 'Query layer complete (createUser+findUserByEmail+createRefreshToken)', ok: f => /createUser/.test(allFiles(f)) && /findUserByEmail/.test(allFiles(f)) && /createRefreshToken/.test(allFiles(f)) }],
    signal:    [{ label: 'NODE_ENV check',   ok: f => /NODE_ENV/.test(allFiles(f)) },
                { label: 'uncaughtException handler', ok: f => /uncaughtException/.test(allFiles(f)) }],
    cipher:    [{ label: 'Refresh rotation (delete old token)', ok: f => /deleteRefreshToken/.test(allFiles(f)) }],
    interface: [{ label: 'Error boundary',  ok: f => /ErrorBoundary|error.?boundary/i.test(allFiles(f)) }],
    architect: [{ label: '.env.example complete', ok: f => { const c = f['.env.example'] || ''; return /DATABASE_URL/.test(c) && /TOKEN_SECRET/.test(c) && /VITE_API_URL/.test(c) } }],
  },
]

// ── ROLE_ORDER constant ────────────────────────────────────────────────────

const ROLE_ORDER = ['interface', 'signal', 'vault', 'cipher', 'architect']
const ROLES = {
  interface: { label: 'Interface', icon: '◈', color: 'var(--teal)',    lang: 'javascript' },
  signal:    { label: 'Signal',    icon: '◉', color: 'var(--violet)',  lang: 'javascript' },
  vault:     { label: 'Vault',     icon: '⬡', color: 'var(--amber)',   lang: 'sql' },
  cipher:    { label: 'Cipher',    icon: '⬢', color: 'var(--magenta)', lang: 'javascript' },
  architect: { label: 'Architect', icon: '△', color: 'var(--lime)',    lang: 'yaml' },
}

function getFileLang(path) {
  if (path.endsWith('.sql'))  return 'sql'
  if (path.endsWith('.css'))  return 'css'
  if (path.endsWith('.md'))   return 'markdown'
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml'
  if (path.endsWith('.json')) return 'json'
  return 'javascript'
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RaidIDE({
  raid, members, myRole, isLeader, isAdmin, events, busy,
  passedSyncs, expandedSync, setExpandedSync, expandedWave, setExpandedWave,
  syncEvidence, setSyncEvidence,
  onSync, onWave, onBonus, onLeave,
  onAdminSkipToSiege, onAdminSkipWave, onAdminForceComplete,
  healthColor, SYNCS, WAVES, ROLES_FULL,
}) {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('workspace')
  const [viewRole, setViewRole] = useState(myRole ?? 'interface')
  const [syncAiResults, setSyncAiResults] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [dbFiles, setDbFiles] = useState({})   // { role: { path: content } }
  const [editContent, setEditContent] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const saveTimer = useRef(null)
  const filesChannel = useRef(null)

  // Interface preview
  const [previewFiles, setPreviewFiles] = useState({})
  const [previewKey, setPreviewKey] = useState(0)
  const previewTimer = useRef(null)

  // Vault SQL runner
  const [sqlResult, setSqlResult] = useState(null)
  const [sqlError, setSqlError] = useState(null)
  const [sqlRunning, setSqlRunning] = useState(false)
  const pglite = useRef(null)

  const isSiege = raid.status === 'siege'
  const health = raid.health ?? 1000
  const currentWave = raid.current_wave ?? 0

  // ── Load files from DB ─────────────────────────────────────────────────

  const loadFiles = useCallback(async () => {
    const { data } = await supabase
      .from('raid_files').select('role, path, content').eq('raid_id', raid.id)
    if (!data) return
    const map = {}
    for (const f of data) {
      if (!map[f.role]) map[f.role] = {}
      map[f.role][f.path] = f.content
    }
    setDbFiles(map)
  }, [raid.id])

  useEffect(() => {
    loadFiles()

    filesChannel.current = supabase
      .channel(`raid-files:${raid.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'raid_files', filter: `raid_id=eq.${raid.id}` },
        payload => {
          if (payload.new) {
            const f = payload.new
            setDbFiles(prev => ({
              ...prev,
              [f.role]: { ...(prev[f.role] ?? {}), [f.path]: f.content },
            }))
          }
        }
      )
      .subscribe()

    return () => {
      if (filesChannel.current) filesChannel.current.unsubscribe()
    }
  }, [loadFiles, raid.id])

  // ── Select default file when role changes ──────────────────────────────

  useEffect(() => {
    const files = getRoleFiles(viewRole)
    const paths = Object.keys(files)
    if (!paths.length) return
    const first = paths[0]
    setSelectedFile(first)
    setEditContent(files[first])
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('idle')
  }, [viewRole]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Init PGlite lazily ─────────────────────────────────────────────────

  useEffect(() => {
    if (viewRole !== 'vault') return
    if (pglite.current) return
    import('@electric-sql/pglite').then(({ PGlite }) => {
      pglite.current = new PGlite()
    })
  }, [viewRole])

  // ── Helpers ────────────────────────────────────────────────────────────

  function getRoleFiles(role) {
    return { ...(STARTERS[role] ?? {}), ...(dbFiles[role] ?? {}) }
  }

  async function handleAiGrade(syncNum, syncDef) {
    setSyncAiResults(prev => ({ ...prev, [syncNum]: 'loading' }))
    const roles = [...new Set(syncDef.conditions.map(c => c.role).filter(r => r !== 'all'))]
    const codeSnippets = roles.map(role => {
      const files = getRoleFiles(role)
      const main = Object.values(files)[0] ?? ''
      return `[${role}]\n${main.slice(0, 700)}`
    }).join('\n\n')
    const requirements = syncDef.conditions.map(c => `- ${c.role === 'all' ? 'all roles' : c.role}: ${c.text}`).join('\n')
    const { data } = await supabase.functions.invoke('grade-code', {
      body: { code: codeSnippets, quest_title: `Raid Sync #${syncNum}`, requirements, language: 'javascript' },
    }).catch(() => ({ data: { passed: false, score: 0, feedback: 'Could not grade — try again.' } }))
    setSyncAiResults(prev => ({ ...prev, [syncNum]: data ?? { passed: false, score: 0, feedback: 'Could not grade — try again.' } }))
  }

  function canEdit() {
    return viewRole === myRole
  }

  // ── Editor change + auto-save ──────────────────────────────────────────

  function handleEditorChange(value) {
    const v = value ?? ''
    setEditContent(v)
    setSaveStatus('idle')

    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (canEdit()) {
      saveTimer.current = setTimeout(() => doSave(v), 1800)
    }

    // Interface live preview debounce
    if (viewRole === 'interface') {
      if (previewTimer.current) clearTimeout(previewTimer.current)
      previewTimer.current = setTimeout(() => {
        const roleFiles = getRoleFiles('interface')
        if (selectedFile) roleFiles[selectedFile] = v
        setPreviewFiles(buildSandpackFiles(roleFiles))
        setPreviewKey(k => k + 1)
      }, 1500)
    }
  }

  async function doSave(content) {
    if (!selectedFile || !canEdit()) return
    setSaveStatus('saving')
    const { error } = await supabase.from('raid_files').upsert({
      raid_id: raid.id, role: viewRole, path: selectedFile,
      content, updated_by: user?.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'raid_id,role,path' })
    setSaveStatus(error ? 'error' : 'saved')
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  function selectFile(path) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('idle')
    setSelectedFile(path)
    const files = getRoleFiles(viewRole)
    setEditContent(files[path] ?? '')
  }

  function buildSandpackFiles(files) {
    const result = {}
    for (const [p, c] of Object.entries(files)) {
      result[`/${p}`] = { code: c }
    }
    return result
  }

  // ── PGlite SQL runner ──────────────────────────────────────────────────

  async function runSQL() {
    if (!pglite.current || !editContent.trim()) return
    setSqlRunning(true)
    setSqlError(null)
    setSqlResult(null)
    try {
      const res = await pglite.current.query(editContent)
      setSqlResult(res)
    } catch (err) {
      setSqlError(err.message)
    } finally {
      setSqlRunning(false)
    }
  }

  // ── Code checks for right panel (non-interface/vault) ─────────────────

  function getChecksForSync(role) {
    const roleFiles = getRoleFiles(role)
    const result = []
    for (let i = 0; i < SYNC_CODE_CHECKS.length; i++) {
      const checks = SYNC_CODE_CHECKS[i][role] ?? []
      result.push({
        syncN: i + 1,
        items: checks.map(c => ({ label: c.label, passed: c.ok(roleFiles) })),
      })
    }
    return result
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const roleFiles = getRoleFiles(viewRole)
  const filePaths = Object.keys(roleFiles)
  const hColor = healthColor(health)

  return (
    <div className="ride-root">

      {/* ── Tab bar + health ── */}
      <div className="ride-topbar">
        <div className="ride-tabs">
          <button className={`ride-tab${activeTab === 'workspace' ? ' ride-tab-active' : ''}`} onClick={() => setActiveTab('workspace')}>
            ⌨ Workspace
          </button>
          <button className={`ride-tab${activeTab === 'mission' ? ' ride-tab-active' : ''}`} onClick={() => setActiveTab('mission')}>
            ◎ Mission Control
            {isSiege && <span className="ride-siege-badge">SIEGE</span>}
          </button>
        </div>
        <div className="ride-health-compact">
          <div className="ride-hbar">
            <div className="ride-hfill" style={{ width: `${health / 10}%`, background: hColor, boxShadow: `0 0 8px ${hColor}` }} />
          </div>
          <span className="ride-hp" style={{ color: hColor }}>{health} HP</span>
          {isSiege && <span className="ride-siege-chip">⚠ SIEGE</span>}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          WORKSPACE TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'workspace' && (
        <div className="ride-workspace">

          {/* ── Role switcher ── */}
          <div className="ride-role-bar">
            {ROLE_ORDER.map(k => {
              const r = ROLES[k]
              const isMe = k === myRole
              return (
                <button
                  key={k}
                  className={`ride-role-btn${viewRole === k ? ' ride-role-active' : ''}${isMe ? ' ride-role-mine' : ''}`}
                  style={{ '--rc': r.color }}
                  onClick={() => setViewRole(k)}
                  title={isMe ? 'Your role' : 'View only'}
                >
                  <span className="ride-role-icon">{r.icon}</span>
                  <span className="ride-role-label">{r.label}</span>
                  {isMe && <span className="ride-role-you">YOU</span>}
                </button>
              )
            })}
            <div className="ride-save-status">
              {saveStatus === 'saving' && <span className="ride-ss-saving">● saving…</span>}
              {saveStatus === 'saved'  && <span className="ride-ss-saved">✓ saved</span>}
              {saveStatus === 'error'  && <span className="ride-ss-error">✗ save failed</span>}
              {!canEdit() && viewRole !== myRole && <span className="ride-ss-ro">view only</span>}
            </div>
          </div>

          {/* ── 3-panel IDE ── */}
          <div className="ride-ide-panels">

            {/* File tree */}
            <div className="ride-file-tree">
              <div className="ride-ft-head">
                <span style={{ color: ROLES[viewRole]?.color }}>{ROLES[viewRole]?.icon}</span>
                {ROLES[viewRole]?.label}
              </div>
              {filePaths.map(p => (
                <button
                  key={p}
                  className={`ride-ft-file${selectedFile === p ? ' ride-ft-active' : ''}`}
                  onClick={() => selectFile(p)}
                  title={p}
                >
                  {p.split('/').pop()}
                  {p.includes('/') && <span className="ride-ft-dir">{p.split('/').slice(0, -1).join('/')}/</span>}
                </button>
              ))}
            </div>

            {/* Monaco editor */}
            <div className="ride-editor-wrap">
              {selectedFile && (
                <div className="ride-editor-filename">{selectedFile}</div>
              )}
              <Editor
                height="100%"
                language={getFileLang(selectedFile ?? '')}
                value={editContent}
                onChange={handleEditorChange}
                options={{
                  readOnly: !canEdit(),
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  tabSize: 2,
                  wordWrap: 'off',
                  renderLineHighlight: 'line',
                  smoothScrolling: true,
                  cursorBlinking: 'phase',
                }}
                theme="vs-dark"
              />
            </div>

            {/* Right panel: role-specific output */}
            <div className="ride-output-panel">

              {/* Interface: Sandpack live preview */}
              {viewRole === 'interface' && (
                <div className="ride-preview-wrap">
                  <div className="ride-out-head">Live Preview</div>
                  {Object.keys(previewFiles).length > 0
                    ? (
                      <SandpackProvider
                        key={previewKey}
                        template="react"
                        files={previewFiles}
                        options={{ externalResources: [] }}
                        theme="dark"
                      >
                        <SandpackPreview showOpenInCodeSandbox={false} />
                      </SandpackProvider>
                    )
                    : (
                      <div className="ride-preview-idle">
                        <span>Start editing to see live preview</span>
                      </div>
                    )
                  }
                </div>
              )}

              {/* Vault: PGlite SQL runner */}
              {viewRole === 'vault' && (
                <div className="ride-sql-wrap">
                  <div className="ride-out-head">
                    SQL Runner (PGlite)
                    {canEdit() && (
                      <button className="ride-run-btn" onClick={runSQL} disabled={sqlRunning}>
                        {sqlRunning ? '⏳' : '▶ Run'}
                      </button>
                    )}
                  </div>
                  <div className="ride-sql-note">In-browser PostgreSQL — run schema.sql, then query</div>
                  {sqlError && (
                    <div className="ride-sql-error">{sqlError}</div>
                  )}
                  {sqlResult && (
                    <div className="ride-sql-result">
                      {sqlResult.fields?.length > 0 ? (
                        <table className="ride-sql-table">
                          <thead>
                            <tr>{sqlResult.fields.map(f => <th key={f.name}>{f.name}</th>)}</tr>
                          </thead>
                          <tbody>
                            {sqlResult.rows.map((row, i) => (
                              <tr key={i}>
                                {sqlResult.fields.map(f => <td key={f.name}>{String(row[f.name] ?? '')}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="ride-sql-ok">
                          ✓ Query executed — {sqlResult.affectedRows ?? 0} rows affected
                        </div>
                      )}
                    </div>
                  )}
                  <div className="ride-code-checks">
                    <div className="ride-checks-head">Code Checks</div>
                    {getChecksForSync(viewRole).map(sg => (
                      <div key={sg.syncN} className="ride-check-group">
                        <div className="ride-check-sync-label">Sync {sg.syncN}</div>
                        {sg.items.map((item, i) => (
                          <div key={i} className={`ride-check-item${item.passed ? ' ride-check-pass' : ''}`}>
                            <span>{item.passed ? '✓' : '○'}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signal / Cipher / Architect: code pattern checks */}
              {(viewRole === 'signal' || viewRole === 'cipher' || viewRole === 'architect') && (
                <div className="ride-checks-wrap">
                  <div className="ride-out-head">Code Checks</div>
                  <div className="ride-checks-note">Auto-detected from your code</div>
                  {getChecksForSync(viewRole).map(sg => (
                    <div key={sg.syncN} className="ride-check-group">
                      <div className="ride-check-sync-label">Sync {sg.syncN}</div>
                      {sg.items.map((item, i) => (
                        <div key={i} className={`ride-check-item${item.passed ? ' ride-check-pass' : ''}`}>
                          <span className="ride-ci-dot">{item.passed ? '✓' : '○'}</span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MISSION CONTROL TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mission' && (
        <div className="ride-mission">

          {/* Health + admin controls */}
          <div className="raid-health-block">
            <div className="raid-health-row">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>District Health</span>
                {isSiege && <span className="chip" style={{ padding: '1px 8px', fontSize: 9, color: 'var(--magenta)', borderColor: 'oklch(0.72 0.28 340 / 0.3)' }}>⚠ SIEGE ACTIVE</span>}
                {isAdmin && isLeader && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--magenta)', letterSpacing: '0.08em' }}>ADMIN</span>}
              </div>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 24, fontWeight: 700, color: hColor, letterSpacing: '-0.02em' }}>{health}</span>
            </div>
            <div className="raid-health-bar">
              <div className="raid-health-fill" style={{ width: `${health / 10}%`, background: hColor, boxShadow: `0 0 12px ${hColor}` }} />
              <div className="raid-health-mark" title="Minimum 700 to clear" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 5 }}>
              <span>0 — COLLAPSED</span>
              <span style={{ color: health >= 700 ? 'var(--lime)' : 'var(--amber)' }}>700 — MIN TO CLEAR</span>
              <span>1000 — PERFECT RAID</span>
            </div>
            {isAdmin && isLeader && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid oklch(0.72 0.28 340 / 0.2)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--magenta)', letterSpacing: '0.1em', textTransform: 'uppercase', alignSelf: 'center' }}>Admin:</span>
                {!isSiege && (
                  <button className="btn" style={{ fontSize: 10, padding: '3px 10px', color: 'var(--magenta)', borderColor: 'oklch(0.72 0.28 340 / 0.4)' }} disabled={busy} onClick={onAdminSkipToSiege}>Skip to Siege →</button>
                )}
                {isSiege && currentWave < 5 && (
                  <button className="btn" style={{ fontSize: 10, padding: '3px 10px', color: 'var(--amber)', borderColor: 'oklch(0.82 0.18 75 / 0.4)' }} disabled={busy} onClick={onAdminSkipWave}>Skip Wave {currentWave + 1} →</button>
                )}
                <button className="btn" style={{ fontSize: 10, padding: '3px 10px', color: 'var(--lime)', borderColor: 'oklch(0.9 0.22 135 / 0.4)' }} disabled={busy} onClick={onAdminForceComplete}>Force Complete ★</button>
                <button className="btn" style={{ fontSize: 10, padding: '3px 10px', color: 'var(--magenta)' }} disabled={busy} onClick={onLeave}>Disband</button>
              </div>
            )}
          </div>

          {/* Phase timeline */}
          <div className="raid-phases">
            {[
              { label: 'DESCENT', sub: 'Hrs 0–4',  active: false },
              { label: 'BUILD',   sub: 'Hrs 4–40', active: !isSiege },
              { label: 'SIEGE',   sub: 'Hrs 44–50', active: isSiege },
            ].map((ph, i) => (
              <div key={ph.label} className={`raid-phase${ph.active ? ' raid-phase-active' : (i === 0 || (isSiege && i === 1)) ? ' raid-phase-done' : ''}`}>
                {i > 0 && <div className="raid-phase-line" />}
                <div className="raid-phase-dot" />
                <div>
                  <div className="raid-phase-label">{ph.label}</div>
                  <div className="raid-phase-sub">{ph.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="raid-active-cols">
            {/* Left: my role + squad */}
            <div>
              {myRole && ROLES_FULL[myRole] && (
                <div className="raid-my-role" style={{ '--rc': ROLES_FULL[myRole].color }}>
                  <div className="rmr-icon">{ROLES_FULL[myRole].icon}</div>
                  <div className="rmr-label">{ROLES_FULL[myRole].label}</div>
                  <div className="rmr-owns"><strong>Owns:</strong> {ROLES_FULL[myRole].owns}</div>
                  <div className="rmr-challenge" style={{ color: isSiege ? 'var(--magenta)' : 'var(--ink-3)' }}>
                    {isSiege ? '⚠ ' : ''}<strong>Siege Challenge:</strong> {ROLES_FULL[myRole].challenge}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Squad</div>
                {ROLE_ORDER.map(k => {
                  const r = ROLES_FULL[k]
                  const m = members.find(x => x.role === k)
                  return (
                    <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid oklch(1 0 0 / 0.05)' }}>
                      <span style={{ color: r.color, fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{r.icon}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, flex: 1, color: m ? 'var(--ink-1)' : 'var(--ink-4)' }}>
                        {m ? (m.user_id === user?.id
                          ? <span style={{ color: 'var(--magenta)' }}>{m.profiles?.name ?? 'You'}</span>
                          : m.profiles?.name ?? 'Pilot')
                        : '—'}
                      </span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{r.label.split(' ')[0].toUpperCase()}</span>
                    </div>
                  )
                })}
              </div>
              {isLeader && !isAdmin && (
                <button className="btn" style={{ marginTop: 20, fontSize: 11, color: 'var(--magenta)' }} disabled={busy} onClick={onLeave}>
                  Disband Raid
                </button>
              )}
            </div>

            {/* Right: syncs/waves + event log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Sync Rituals */}
              {!isSiege && (
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="raid-panel-head">Sync Rituals</div>
                  {SYNCS.map(s => {
                    const passed = passedSyncs.has(s.n)
                    const open = expandedSync === s.n
                    const syncChecks = SYNC_CODE_CHECKS[s.n - 1] ?? {}
                    const codeChecksPassed = ROLE_ORDER.every(rk => {
                      const checks = syncChecks[rk] ?? []
                      if (!checks.length) return true
                      return checks.every(c => c.ok(getRoleFiles(rk)))
                    })
                    return (
                      <div key={s.n} className={`sync-card${passed ? ' sync-passed' : ''}${open ? ' sync-open' : ''}`}>
                        <div className="sync-card-head" onClick={() => setExpandedSync(open ? null : s.n)}>
                          <div className={`raid-check${passed ? ' raid-check-pass' : ''}`}>{passed ? '✓' : ''}</div>
                          <div style={{ flex: 1 }}>
                            <div className="sync-title" style={{ textDecoration: passed ? 'line-through' : 'none', color: passed ? 'var(--ink-3)' : 'var(--ink-1)' }}>
                              Hr {s.hour} — {s.label}
                            </div>
                            <div className="sync-desc">{s.desc}</div>
                          </div>
                          <div className="sync-chevron">{open ? '▲' : '▼'}</div>
                        </div>
                        {open && (
                          <div className="sync-body">
                            {/* Code evidence panel */}
                            <div className="ride-sync-evidence-panel">
                              <div className="ride-sep-head">Code checks</div>
                              {ROLE_ORDER.map(rk => {
                                const checks = syncChecks[rk] ?? []
                                if (!checks.length) return null
                                const roleFiles2 = getRoleFiles(rk)
                                return (
                                  <div key={rk} className="ride-sep-role">
                                    <span style={{ color: ROLES[rk].color, marginRight: 6 }}>{ROLES[rk].icon}</span>
                                    {checks.map((c, i) => {
                                      const ok = c.ok(roleFiles2)
                                      return (
                                        <span key={i} className={`ride-sep-chip${ok ? ' ride-sep-pass' : ''}`}>
                                          {ok ? '✓' : '○'} {c.label}
                                        </span>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>

                            <div className="sync-conditions">
                              {s.conditions.map((c, i) => (
                                <div key={i} className="sync-condition">
                                  <span className="sync-cond-role" style={{ color: ROLES_FULL[c.role]?.color ?? 'var(--ink-3)' }}>
                                    {c.role === 'all' ? '◈◉⬡⬢△' : ROLES_FULL[c.role]?.icon}
                                  </span>
                                  <span className="sync-cond-text">{c.text}</span>
                                </div>
                              ))}
                            </div>
                            <div className="sync-outcomes">
                              <div className="sync-outcome sync-outcome-pass">PASS {s.passEffect}</div>
                              <div className="sync-outcome sync-outcome-fail">FAIL {s.failEffect}</div>
                            </div>
                            <div className="sync-fail-mode">{s.failMode}</div>
                            {isLeader && !passed && (
                              <div className="sync-evidence-wrap">
                                <div className="sync-evidence-label">Evidence required before passing</div>
                                <input
                                  className="set-input sync-evidence-input"
                                  placeholder="GitHub URL, test output, or what was verified and by whom..."
                                  value={syncEvidence[s.n] ?? ''}
                                  onChange={e => setSyncEvidence(prev => ({ ...prev, [s.n]: e.target.value }))}
                                />
                                <div className="sync-actions">
                                  <button
                                    className="btn"
                                    style={{ fontSize: 10, padding: '4px 14px', color: 'var(--lime)' }}
                                    disabled={busy || (syncEvidence[s.n] ?? '').trim().length < 10 || !codeChecksPassed}
                                    onClick={() => onSync(s.n, true, syncEvidence[s.n])}
                                  >PASS RITUAL</button>
                                  <button className="btn" style={{ fontSize: 10, padding: '4px 14px', color: 'var(--magenta)' }} disabled={busy} onClick={() => onSync(s.n, false)}>FAIL RITUAL</button>
                                  <button
                                    className="btn"
                                    style={{ fontSize: 10, padding: '4px 14px', color: 'var(--amber)' }}
                                    disabled={syncAiResults[s.n] === 'loading'}
                                    onClick={() => handleAiGrade(s.n, s)}
                                  >{syncAiResults[s.n] === 'loading' ? '⟳ Grading…' : 'AI Grade'}</button>
                                </div>
                                {syncAiResults[s.n] && syncAiResults[s.n] !== 'loading' && (
                                  <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: syncAiResults[s.n].passed ? 'rgba(132,204,22,0.06)' : 'rgba(232,67,147,0.06)', borderLeft: `2px solid ${syncAiResults[s.n].passed ? 'var(--lime)' : 'var(--magenta)'}`, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                                    <span style={{ color: syncAiResults[s.n].passed ? 'var(--lime)' : 'var(--magenta)', fontWeight: 700, marginRight: 6 }}>AI {syncAiResults[s.n].score}/100</span>{syncAiResults[s.n].feedback}
                                  </div>
                                )}
                                {(syncEvidence[s.n] ?? '').trim().length < 10 && (
                                  <div className="sync-evidence-hint">PASS requires at least one piece of evidence — no blind passing allowed</div>
                                )}
                                {!codeChecksPassed && (
                                  <div className="sync-evidence-hint" style={{ color: 'var(--amber)' }}>⚠ Code checks for this sync have not all passed — open Workspace and verify</div>
                                )}
                              </div>
                            )}
                            {passed && <div className="sync-cleared">— RITUAL CLEARED —</div>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Siege Waves */}
              {isSiege && (
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="raid-panel-head" style={{ color: 'var(--magenta)' }}>
                    <span className="dot dot-pulse" style={{ color: 'var(--magenta)' }} /> SIEGE WAVES
                  </div>
                  {WAVES.map(w => {
                    const survived   = events.some(e => e.type === 'wave_survived' && e.label?.startsWith(w.label))
                    const breached   = events.some(e => e.type === 'wave_failed'   && e.label?.startsWith(w.label))
                    const isCurrent  = !survived && !breached && w.n === currentWave + 1
                    const isFuture   = !survived && !breached && w.n > currentWave + 1
                    const open       = expandedWave === w.n
                    return (
                      <div key={w.n} className={`wave-card${survived ? ' wave-held' : breached ? ' wave-breached' : isCurrent ? ' wave-active' : ''}`} style={{ opacity: isFuture ? 0.4 : 1 }}>
                        <div className="wave-card-head" onClick={() => !isFuture && setExpandedWave(open ? null : w.n)}>
                          <div className={`raid-check${survived ? ' raid-check-pass' : breached ? ' raid-check-fail' : ''}`} style={{ fontSize: 10 }}>
                            {survived ? '✓' : breached ? '✗' : w.n}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="wave-title" style={{ color: breached ? 'var(--magenta)' : survived ? 'var(--ink-3)' : isCurrent ? w.color : 'var(--ink-2)', textDecoration: survived ? 'line-through' : 'none' }}>
                              {w.label}
                              {isCurrent && <span className="wave-active-chip">INCOMING</span>}
                            </div>
                            <div className="wave-desc">{w.desc}</div>
                          </div>
                          {!isFuture && <div className="sync-chevron">{open ? '▲' : '▼'}</div>}
                        </div>
                        {open && (
                          <div className="wave-body">
                            <div className="wave-section-label">MONITORING STATIONS</div>
                            <div className="wave-stations">
                              {w.stations.map((s, i) => (
                                <div key={i} className="wave-station">
                                  <span className="wave-station-role" style={{ color: ROLES_FULL[s.role].color }}>{ROLES_FULL[s.role].icon} {ROLES_FULL[s.role].label.replace(' Hunter', '')}</span>
                                  <span className="wave-station-duty">{s.duty}</span>
                                </div>
                              ))}
                            </div>
                            <div className="wave-section-label" style={{ color: 'var(--magenta)' }}>IF UNPREPARED</div>
                            <div className="wave-unprepared">
                              {w.unprepared.map((u, i) => (
                                <div key={i} className="wave-threat">
                                  <span className="wave-threat-role" style={{ color: ROLES_FULL[u.role].color }}>{ROLES_FULL[u.role].icon}</span>
                                  <span className="wave-threat-text">{u.cost}</span>
                                </div>
                              ))}
                            </div>
                            <div className="wave-outcomes">
                              <div className="sync-outcome sync-outcome-pass">HELD {w.heldEffect}</div>
                              <div className="sync-outcome sync-outcome-fail">BREACHED {w.breachedEffect}</div>
                            </div>
                            {isLeader && isCurrent && (
                              <div className="sync-actions" style={{ marginTop: 4 }}>
                                <button className="btn" style={{ fontSize: 10, padding: '4px 14px', color: 'var(--lime)' }} disabled={busy} onClick={() => onWave(w.n, true)}>WAVE HELD</button>
                                <button className="btn" style={{ fontSize: 10, padding: '4px 14px', color: 'var(--magenta)' }} disabled={busy} onClick={() => onWave(w.n, false)}>WAVE BREACHED</button>
                              </div>
                            )}
                            {survived && <div className="sync-cleared">— WAVE HELD —</div>}
                            {breached && <div className="sync-cleared" style={{ color: 'var(--magenta)' }}>— WAVE BREACHED —</div>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Bonus conditions (siege only) */}
              {isSiege && (() => {
                const bonusLabels = ['Zero Crashes', 'Zero DB Corruption']
                return (
                  <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="raid-panel-head" style={{ color: 'var(--lime)' }}>Bonus Conditions</div>
                    {bonusLabels.map(bl => {
                      const applied = events.some(e => e.type === 'bonus_applied' && e.label?.includes(bl))
                      return (
                        <div key={bl} className="bonus-row">
                          <div className={`raid-check${applied ? ' raid-check-pass' : ''}`}>{applied ? '✓' : ''}</div>
                          <div style={{ flex: 1 }}>
                            <div className="bonus-label" style={{ color: applied ? 'var(--ink-3)' : 'var(--ink-1)', textDecoration: applied ? 'line-through' : 'none' }}>{bl}</div>
                            <div className="bonus-sub">{bl === 'Zero Crashes' ? 'No process crashes during the entire Siege' : 'No data corruption events across all 5 waves'} — confirmed by the squad</div>
                          </div>
                          <div className="bonus-hp" style={{ color: applied ? 'var(--lime)' : 'var(--ink-3)' }}>{applied ? '+150' : '+150 HP'}</div>
                          {isLeader && !applied && (
                            <button className="btn" style={{ fontSize: 9, padding: '2px 8px', color: 'var(--lime)', flexShrink: 0 }} disabled={busy} onClick={() => onBonus(bl)}>CONFIRM</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Event log */}
              <div className="panel" style={{ padding: 0, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                <div className="raid-panel-head">Event Log</div>
                {events.length === 0
                  ? <div style={{ padding: '14px 16px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No events yet.</div>
                  : events.map((e, i) => {
                    const pos = e.health_delta > 0
                    const neg = e.health_delta < 0
                    return (
                      <div key={e.id ?? i} style={{ padding: '9px 16px', borderBottom: '1px solid oklch(1 0 0 / 0.04)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0, color: pos ? 'var(--lime)' : neg ? 'var(--magenta)' : 'var(--ink-3)', marginTop: 1 }}>{pos ? '↑' : neg ? '↓' : '·'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: pos ? 'var(--lime)' : neg ? 'var(--magenta)' : 'var(--ink-2)' }}>{e.label}</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-4)', marginTop: 2 }}>
                            {new Date(e.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {e.health_delta !== 0 && (
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 600, color: pos ? 'var(--lime)' : 'var(--magenta)', flexShrink: 0 }}>
                            {pos ? '+' : ''}{e.health_delta}
                          </span>
                        )}
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
