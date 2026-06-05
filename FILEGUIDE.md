# Drift Pilot Protocol — File Guide

> Gamified Web3 learning platform. Neon cyberpunk aesthetic.  
> Stack: **Vite + React 19 + React Router v7 + Supabase**

---

## Start here (reading order for a new contributor)

1. **[index.html](index.html)** — shell with Google Fonts + `#root`. Title: `Drift Pilot Protocol — Learn. Build. Earn.`
2. **[src/index.css](src/index.css)** — read before touching any component. All design tokens, every reusable class, page-transition animation, and world card styles live here.
3. **[src/lib/supabase.js](src/lib/supabase.js)** — Supabase client. Reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from `.env.local`.
4. **[src/App.jsx](src/App.jsx)** — router, `AuthProvider` + `NavigationProvider` wrappers, background layers. `ProtectedRoute` on `/dashboard` + `/quest`. `GateRoute` on `/quest2` (requires ch01) and `/quest3` (requires ch01+ch02).
5. **[src/context/AuthContext.jsx](src/context/AuthContext.jsx)** — auth state, profile fetch, streak calc, DRIFT rewards, password/email change. See Auth section below.
6. **[src/context/NavigationContext.jsx](src/context/NavigationContext.jsx)** — `goto('screen')` animated navigation.
7. **Pick a screen** (see below).

---

## Folder map

```
eva-react/
├── .env.local                     VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (never commit)
├── index.html                     HTML shell
├── vite.config.js                 default Vite config
├── FILEGUIDE.md                   ← you are here
├── src/
│   ├── main.jsx                   renders <App /> into #root
│   ├── App.jsx                    BrowserRouter, AuthProvider, routes, ProtectedRoute + GateRoute
│   ├── index.css                  ← THE DESIGN SYSTEM. Read this first.
│   │
│   ├── lib/
│   │   └── supabase.js            createClient() — import { supabase } from here
│   │
│   ├── context/
│   │   ├── AuthContext.jsx        user, profile, login/signup/logout, completeQuest, clearQuest,
│   │   │                          unlockGate, clearFlag (admin), toggleSubscription (admin),
│   │   │                          updateProfile, sendPasswordReset, updatePassword, updateEmail,
│   │   │                          passwordRecovery state, DRIFT_REWARDS, totalDrift in profile
│   │   └── NavigationContext.jsx  goto() + progress/overlay state
│   │
│   ├── components/
│   │   ├── RouteTransition.jsx    progress bar + loading overlay UI
│   │   ├── ProtectedRoute.jsx     redirects to /login if no session
│   │   └── GateRoute.jsx          ProtectedRoute + prerequisite check; redirects to /dashboard if gates not met
│   │
│   ├── hooks/
│   │   ├── useScrollReveal.js     IntersectionObserver scroll-fade-in
│   │   └── useQuestAnalytics.js   time tracking, paste blocking, rapid-change detection for all gate screens
│   │
│   └── screens/
│       ├── Landing.jsx            hero → worlds → skill tree → pricing → footer
│       │                          auth-aware: logged-in users see Dashboard button + real Supabase stats
│       ├── Login.jsx              email + password login
│       ├── Login.css
│       ├── Signup.jsx             name + email + wallet + password signup
│       ├── Signup.css
│       ├── Dashboard.jsx          pilot HQ — 8-view SPA (home/skill-tree/leaderboard/wallet/raids/settings/admin)
│       │                          all views + card variant persisted in localStorage
│       ├── Dashboard.css          includes responsive breakpoints: 1100px (hamburger), 768px, 480px
│       ├── RaidView.jsx           raids feature — lobby, waiting room, descent, result; active/siege delegates to RaidIDE
│       ├── RaidView.css           raid-specific styles
│       ├── RaidIDE.jsx            full in-browser IDE for active/siege phases; Monaco + Sandpack + PGlite
│       ├── RaidIDE.css            IDE layout styles (workspace + mission control tabs)
│       ├── Quest.jsx              GATE 01 — The Document Tomb. Fix corrupted HTML → validator passes → transmit.
│       ├── Quest.css              shared styles for all quest screens (editor, topbar, modal, dungeon entry)
│       ├── Quest2.jsx             GATE 02 — The Semantic Crypt. Replace div soup with semantic HTML → submit.
│       ├── Quest2.css             Gate 02-specific: scene codex tablet, codex slot (violet), codexVerify animation
│       ├── Quest3.jsx             GATE 03 — The Form Gate. Build citizen registration form → Label Eater defeated.
│       ├── Quest3.css             Gate 03-specific: Label Eater scene art, boss HP bar, form slot (crimson)
│       ├── Quest4.jsx             GATE 04 — Paint the City. Write CSS design system with custom properties → Protocol Override.
│       ├── Quest4.css             Gate 04-specific: amber accent, 8-swatch color matrix, protocol slot, preview frame
│       ├── Quest5.jsx             GATE 05 — The Gravity Anchor. Flexbox layouts → 6 checks → Gravity Slot.
│       ├── Quest5.css             Gate 05-specific: cyan accent, anchor hub + 6 arms scene art, gravity slot
│       ├── Quest6.jsx             GATE 06 — The Infinite Grid. CSS Grid dashboard → 7 checks → Grid Seal (Boss: White Void).
│       ├── Quest6.css             Gate 06-specific: steel-blue accent, 3×3 tile grid + mist scene art, boss HP bar, grid seal
│       ├── Quest7.jsx             GATE 07 — Ghost Feedback. CSS Transitions → 7 checks → Ghost Signal.
│       ├── Quest7.css             Gate 07-specific: ghost/white-blue accent, bar-chart figures scene art, ghost signal slot
│       ├── Quest8.jsx             GATE 08 — The Collapse. Mobile-first responsive → 7 checks → Mobile Gate (Boss: The Stack).
│       ├── Quest9.jsx             GATE 09 — The Control Room. Vanilla JS DOM → 8 checks → Control Room Slot.
│       ├── Quest9.css             Gate 09-specific: lime accent, 4×2 monitor grid scene, control slot
│       ├── Quest10.jsx            GATE 10 — The Static City. Fetch API → 6 checks → Signal Breach (Final Boss).
│       ├── Quest10.css            Gate 10-specific: magenta accent, city skyline scene, boss HP bar, breach slot
│       ├── Quest8.css             Gate 08-specific: orange accent, stacked panels scene art, boss HP bar, mobile gate slot
│       ├── QuestQuiz.jsx          shared knowledge-check overlay — shown before completion animation on all gates
│       ├── AcademyLanding.jsx     /academy — The Construct landing. Three tracks, auth-aware CTA, floating block decorations.
│       ├── AcademyLanding.css     Academy tokens (--builder-gold, --construct-dark, --block-*), hero, track cards, how-it-works
│       ├── AcademyOnboarding.jsx  /academy/onboarding — 4-step Builder setup (name→age→experience→intention→result)
│       ├── AcademyOnboarding.css  Progress bar, step animations, age grid, exp list, intention grid, result card
│       ├── AcademyDashboard.jsx   /academy/dashboard — Builder HQ. Child profile card, XP bar, gate grid, child switcher.
│       └── AcademyDashboard.css   Academy dashboard styles: profile card, avatar, XP bar, gate grid (done/active/locked)
```

---

## Screens & routes

| Route | Component | Auth | Notes |
|---|---|---|---|
| `/` | `Landing.jsx` | public | Auth-aware nav + hero CTAs. Real stats from `platform_stats` view. Worlds, skill tree preview, real Season-Pass pricing. (Tokenomics/partners sections removed.) |
| `/terms` | `Terms.jsx` | public | In-app Terms of Service. *Draft — pending legal review.* Linked from footers + auth pages. |
| `/privacy` | `Privacy.jsx` | public | In-app Privacy Policy (incl. children's data / parental rights). *Draft — pending legal review.* |
| `/login` | `Login.jsx` | public | Email + password. Redirects to `/dashboard` on success. |
| `/signup` | `Signup.jsx` | public | Name, email, wallet (optional), password. Trigger creates profile row. |
| `/dashboard` | `Dashboard.jsx` | protected | 8-view SPA. View + card variant persisted in localStorage. Admin view only visible to `is_admin` pilots. |
| `/quest` | `Quest.jsx` | protected | Gate 01. Pre-filled corrupted HTML, 4-error scanner, signal transmit, records `act1-ch01`. |
| `/quest2` | `Quest2.jsx` | `GateRoute` (ch01) | Gate 02. Div-soup HTML, 8-check identity scanner, codex submit, records `act1-ch02`. |
| `/quest3` | `Quest3.jsx` | `GateRoute` (ch01+ch02) | Gate 03 (Boss). Comment scaffold, 10-check form scanner, Label Eater HP bar, records `act1-ch03`. |
| `/quest4` | `Quest4.jsx` | `GateRoute` (ch01+ch02+ch03, or `unlockKey=act1-ch04`) | Gate 04. CSS-only editor, live preview iframe, 8-check CSS audit, Protocol Override slot, records `act1-ch04`. |
| `/quest5` | `Quest5.jsx` | `GateRoute` (ch04, or `unlockKey=act1-ch05`) | Gate 05. Flexbox. CSS-only editor, 6-check audit, Gravity Slot, records `act1-ch05`. |
| `/quest6` | `Quest6.jsx` | `GateRoute` (ch05, or `unlockKey=act1-ch06`) | Gate 06 (Boss). CSS Grid dashboard. 7-check audit, boss HP bar, Grid Seal, records `act1-ch06`. |
| `/quest7` | `Quest7.jsx` | `GateRoute` (ch06, or `unlockKey=act1-ch07`) | Gate 07. CSS Transitions. 7-check audit, Ghost Signal slot, records `act1-ch07`. |
| `/quest8` | `Quest8.jsx` | `GateRoute` (ch07, or `unlockKey=act1-ch08`) | Gate 08 (Boss). Mobile-first responsive. Full HTML pages. 7-check audit, boss HP bar, Mobile Gate slot, records `act1-ch08`. |
| `/quest9` | `Quest9.jsx` | `GateRoute` (ch08, or `unlockKey=act1-ch09`) | Gate 09. JS DOM manipulation. 3 HTML variants (same IDs). 8-check JS audit, 4×2 monitor grid scene, Control Room slot, records `act1-ch09`. |
| `/quest10` | `Quest10.jsx` | `GateRoute` (ch09, or `unlockKey=act1-ch10`) | Gate 10 (Final Boss). Fetch API. Single intelligence dashboard HTML. 6-check JS audit, city skyline scene, boss HP bar, Signal Breach slot, records `act1-ch10`. |
| `/academy` | `AcademyLanding.jsx` | public | The Construct landing. Three tracks, auth-aware CTA. |
| `/academy/onboarding` | `AcademyOnboarding.jsx` | `ProtectedRoute` | 4-step Builder setup. Determines track + startGate. Creates `child_profiles` row. |
| `/academy/dashboard` | `AcademyDashboard.jsx` | `ProtectedRoute` | Builder HQ. Active child card, gate grid, child switcher. |
| `/academy/gate/s01`–`s15` | `GateS01`–`GateS15` | `ProtectedRoute` | Scratch track (BlockCanvas drag-and-drop). S-06/S-11 are boss gates. |
| `/academy/gate/p01`–`p15` | `GateP01`–`GateP15` | `ProtectedRoute` | Python track (textarea + regex checks). P-15 is boss gate (debug mechanic). |

---

## Auth & Supabase

### AcademyContext API shape
```js
import { useAcademy } from '../context/AcademyContext'
const {
  childProfiles,       // all child_profiles rows for this parent
  activeChild,         // currently selected child (persisted in sessionStorage)
  setActiveChild,      // switch active child
  completedGateIds,    // Set<string> of gate_id strings completed by activeChild
  totalAcademyXp,      // sum of xp_earned for activeChild's completions
  createChildProfile,  // async ({ name, age, track, startGate, intention }) → { ok, child, error }
  completeAcademyGate, // async (childId, gateId, xpEarned) → boolean
  loadChildProfiles,   // reload from DB
  loading,             // true while fetching
} = useAcademy()
```
- `AcademyProvider` wraps `AuthProvider` children in `App.jsx` — must be inside `AuthProvider`
- Uses `useAuth()` to get `user.id` for all Supabase queries
- `activeChild` auto-selects first child on load; persisted in `sessionStorage` key `academy_active_child`
- DB tables: `public.child_profiles` + `public.academy_completions` (see schema section)
- Run `eva-react/academy_schema.sql` in Supabase SQL Editor before using Academy

---

### AuthContext API shape
```js
const {
  user, profile, loading, error, passwordRecovery,
  clearError, login, signup,
  completeQuest, clearQuest, unlockGate,
  clearFlag, toggleSubscription,
  updateProfile, sendPasswordReset, updatePassword, updateEmail,
  logout
} = useAuth()
```

- **`user`** — Supabase `auth.users` row (or `null`)
- **`profile`** — built from `public.profiles` + `public.quest_completions` + `public.gate_unlocks`:
  ```
  { name, wallet, is_admin, is_subscribed,
    questsCompleted, totalXp, totalDrift, totalDriftSpent,
    streak, completedQuestIds, unlockedGateIds, completions, unlocks }
  ```
  - `completedQuestIds` — `Set<string>` — quest_id strings like `'act1-ch01'`
  - `unlockedGateIds` — `Set<string>` — gates unlocked via DRIFT spending
  - `totalDrift` — earned: computed from `DRIFT_REWARDS[quest_id]` per completion
  - `totalDriftSpent` — spent: sum of `drift_cost` from `gate_unlocks`
  - Spendable balance = `totalDrift - totalDriftSpent` (computed in Dashboard)
  - `completions` — `[{ quest_id, xp_earned, completed_at }]` for transaction history
  - `unlocks` — `[{ quest_id, drift_cost, unlocked_at }]` for transaction history
  - `streak` — consecutive completion days (today/yesterday counts as alive)
  - `is_admin` — boolean; spread from `profiles` row via `select('*')`
  - `is_subscribed` — boolean; Season Pass holder flag
- **`loading`** — `true` while session resolves on mount (prevents flash-redirect)
- **`passwordRecovery`** — `true` when Supabase fires `PASSWORD_RECOVERY` auth event

### Functions
| Function | What it does |
|---|---|
| `login(email, password)` | `signInWithPassword` → returns `true` on success |
| `signup(email, password, name, wallet)` | `signUp` with metadata → `'ok'` / `'confirm'` / `false` |
| `completeQuest(questId, xpEarned, analytics)` | upserts into `quest_completions` with optional `{ time_taken, paste_count, flagged }`, refreshes profile |
| `clearQuest(questId)` | deletes from `quest_completions`; if new balance < spent, also wipes all `gate_unlocks`; refreshes profile |
| `unlockGate(questId, driftCost)` | checks spendable balance, inserts into `gate_unlocks`, refreshes profile → `{ ok, reason }` |
| `updateProfile(name, wallet)` | updates `public.profiles`, refreshes profile → returns `true/false` |
| `updateUsernameColor(key)` | Season Pass benefit: sets `profiles.username_color` to a `USERNAME_COLORS` key (or null). UI gates it to subscribers |
| `clearFlag(targetUserId, questId)` | admin-only: sets `flagged = false` on a specific completion row |
| `toggleSubscription(targetUserId, currentValue)` | admin-only: flips `is_subscribed` on a pilot's profile |
| `sendPasswordReset()` | `resetPasswordForEmail` to `user.email` with redirect to `/dashboard` |
| `updatePassword(newPassword)` | `updateUser({ password })` — called after `PASSWORD_RECOVERY` event; clears `passwordRecovery` |
| `updateEmail(newEmail)` | `updateUser({ email })` — Supabase sends confirmation to new address |
| `logout()` | `signOut`, clears user + profile |

### $DRIFT rewards (AuthContext)
```js
const DRIFT_REWARDS = {
  'act1-ch01': 80,   'act1-ch02': 160,  'act1-ch03': 300,
  'act1-ch04': 195,  'act1-ch05': 225,  'act1-ch06': 400,
  'act1-ch07': 280,  'act1-ch08': 400,  'act1-ch09': 700, 'act1-ch10': 1500,
}
```
`totalDrift` is derived from completions — no DB column needed. Add new entries here when new gates are built. Max earnable across Gates 01-10: 4240 $DRIFT.

### XP Level system (AuthContext)
```js
export const XP_LEVELS   // 10-level array: CADET(0) → LEGEND(5000)
export const RAID_XP_REWARDS  // { PERFECT:500, PASSED:300, PARTIAL:100, FAILED:0 }
export const STREAK_TIERS         // [{min:14,mult:1.5},{min:7,mult:1.25},{min:3,mult:1.1}]
export const SEASON_PASS_XP_MULT  // 1.25 — subscriber (is_subscribed) gate-XP boost
export function computeLevelData(xp)  // returns { level, label, color, progress, xpInLevel, xpNeeded, nextLabel }
export function computeStreakMultiplier(streak)  // highest qualifying tier mult, else 1
export function computeXpMultiplier({ streak, isSubscribed })  // streakMult × (isSubscribed ? 1.25 : 1)
```
- **Gate XP multiplier:** `completeQuest` boosts gate XP by `computeXpMultiplier({ streak, isSubscribed })` (rounded) at completion time — the boosted value is stored in `xp_earned`. It's the **streak bonus × Season Pass ×1.25**, multiplicative. Gates only (`raid:*` excluded so raid-format detection stays valid); XP-only ($DRIFT is computed from `DRIFT_REWARDS`, untouched). `profile.streakMultiplier`, `profile.subscriberMultiplier`, and combined `profile.xpMultiplier` are exposed for UI; the Dashboard hero shows the active boost and streak-art shows the streak mult.
- **`USERNAME_COLORS`** (exported map): curated brand-token palette for the Season Pass custom-name-colour benefit. DB stores the key in `profiles.username_color`; UI maps key → `var(--token)` and only honours it while `is_subscribed`. Applied to the pilot's own name in Dashboard + the public `/pilot/:id` page.
- `profile` exposes: `level`, `levelLabel`, `levelColor`, `levelProgress`, `xpInLevel`, `xpNeeded`, `nextLevelLabel`
- Raid rows in `quest_completions` store actual XP in `xp_earned` (not DRIFT). `fetchProfile` derives DRIFT via `RAID_XP_TO_DRIFT` lookup.
- Old raid rows (pre-level-system) that stored DRIFT as `xp_earned` are handled via `RAID_OLD_TO_XP` backward-compat map.

### Raid IDE packages
- `@monaco-editor/react` — code editor for all 5 roles (JS/SQL/YAML/CSS/Markdown language modes)
- `@codesandbox/sandpack-react` — React live preview for Interface role (in-browser compilation)
- `@electric-sql/pglite` — PostgreSQL in browser for Vault role (run schema/seed/queries)

Vite config excludes PGlite from `optimizeDeps` (WASM) and raises `chunkSizeWarningLimit` to suppress expected warnings.

`raid_files` table SQL: `eva-react/raid_files_table.sql` — run in Supabase SQL Editor before using the Raid IDE.

### Database tables (Supabase)
```
public.profiles
  id             uuid  PK → auth.users
  name           text
  wallet         text  nullable
  is_admin       boolean  default false
  is_subscribed  boolean  default false  (Season Pass holder)
  created_at     timestamptz

public.quest_completions
  id           uuid  PK
  user_id      uuid  → profiles
  quest_id     text  (e.g. 'act1-ch01')
  xp_earned    int
  completed_at timestamptz
  time_taken   int   nullable  (seconds from open to complete)
  paste_count  int   default 0 (paste attempts blocked + logged)
  flagged      bool  default false (auto-set if time<90s, paste>0, or rapid-change>2)
  UNIQUE(user_id, quest_id)

public.gate_unlocks
  id           uuid  PK
  user_id      uuid  → auth.users
  quest_id     text  (e.g. 'act1-ch04')
  drift_cost   int
  unlocked_at  timestamptz
  UNIQUE(user_id, quest_id)

public.raids
  id             uuid  PK
  name           text
  status         text  (lobby | descent | active | siege | complete | failed)
  health         int   default 1000
  current_wave   smallint  default 0
  started_at     timestamptz  nullable
  siege_started_at timestamptz nullable
  ended_at       timestamptz  nullable
  created_by     uuid  → profiles

public.raid_members
  id       uuid  PK
  raid_id  uuid  → raids (CASCADE)
  user_id  uuid  → profiles
  role     text  (interface | signal | vault | cipher | architect)
  UNIQUE(raid_id, user_id), UNIQUE(raid_id, role)

public.raid_events
  id           uuid  PK
  raid_id      uuid  → raids (CASCADE)
  type         text  (phase_change | sync_passed | sync_failed | wave_survived | wave_failed)
  label        text
  health_delta int   default 0
  created_by   uuid  → profiles nullable

public.raid_files
  id         uuid  PK
  raid_id    uuid  → raids (CASCADE)
  role       text  (interface | signal | vault | cipher | architect)
  path       text  (file path e.g. 'App.jsx', 'src/app.js', 'schema.sql')
  content    text
  updated_by uuid  → auth.users
  updated_at timestamptz
  UNIQUE(raid_id, role, path)

public.quests
  id           text  PK  (may be UUID — skill tree uses chapter-derived key, not this)
  world        smallint  (1–4)
  chapter      smallint
  title        text
  topic        text
  xp           int
  icon         text  (emoji)
  is_boss      boolean
  order_index  smallint
```

Profiles are auto-created by a Postgres trigger on `auth.users` insert.  
Quest completions use `upsert` — completing the same quest twice is safe.  
`public.quests` holds metadata for all 15 Act I quests; Dashboard fetches it live.

**Important:** `quests.id` may not match `quest_completions.quest_id`. The skill tree derives a `chKey = 'act1-ch' + chapter.padStart(2,'0')` and uses that for `isDone` checks and `GATE_NAMES` lookups — do not rely on `q.id`.

### RLS policies needed
```sql
-- profiles: anyone can read (needed for leaderboard), only owner can update
create policy "public profiles" on public.profiles for select using (true);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

-- quest_completions: users see/write/delete only their own rows
create policy "own completions" on public.quest_completions for all using (auth.uid() = user_id);

-- gate_unlocks: users see/insert/delete only their own rows
create policy "own_unlocks_select" on public.gate_unlocks for select using (auth.uid() = user_id);
create policy "own_unlocks_insert" on public.gate_unlocks for insert with check (auth.uid() = user_id);
create policy "own_unlocks_delete" on public.gate_unlocks for delete using (auth.uid() = user_id);

-- quests: public read
create policy "public quests" on public.quests for select using (true);

-- raids: any authed user can read; only creator can update/delete
create policy "raids_read"   on public.raids for select using (auth.uid() is not null);
create policy "raids_insert" on public.raids for insert with check (auth.uid() = created_by);
create policy "raids_update" on public.raids for update using (auth.uid() = created_by);
create policy "raids_delete" on public.raids for delete using (auth.uid() = created_by);
create policy "members_read"   on public.raid_members for select using (auth.uid() is not null);
create policy "members_insert" on public.raid_members for insert with check (auth.uid() = user_id);
create policy "members_delete" on public.raid_members for delete using (auth.uid() = user_id);
create policy "events_read"   on public.raid_events for select using (auth.uid() is not null);
create policy "events_insert" on public.raid_events for insert with check (auth.uid() is not null);

-- admin policies (subquery pattern avoids RLS recursion)
create policy "admin_read_all_completions" on public.quest_completions
  for select using ((select is_admin from public.profiles where id = auth.uid()) = true);
create policy "admin_update_completions" on public.quest_completions
  for update using ((select is_admin from public.profiles where id = auth.uid()) = true);
create policy "admin_update_profiles" on public.profiles
  for update using ((select is_admin from public.profiles where id = auth.uid()) = true);
```
Admin `is_admin` flag set manually: `UPDATE public.profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'x@x.com');`

### Pre-test SQL & public read views
Run in this order in the Supabase SQL Editor (all idempotent) before testing:
`supabase/pretest_setup.sql` → `supabase/quests_seed.sql` → `eva-react/academy_schema.sql` → `eva-react/raid_files_table.sql` → `supabase/security.sql`.
Edge functions: deploy per `supabase/DEPLOY.md` (secrets + commands). `quests_seed.sql` seeds World-1 with the 10 built gates. `pretest_setup.sql` also adds the `username_color`/stripe/chain columns and the `quests` table.

`pretest_setup.sql` provisions core tables (no-op if present), the on-signup `handle_new_user()` trigger, `raid_events` RLS, the `bug_reports` table + RLS, and three **definer views** that bypass the owner-only `quest_completions` RLS to expose only non-sensitive columns (no `time_taken`/`paste_count`/`flagged`):
- `public.leaderboard` (id, name, total_xp) — Dashboard leaderboard + global rank query `from('leaderboard')`.
- `public.platform_stats` (pilots, total_xp, gates_cleared) — Landing hero stats.
- `public.public_completions` (user_id, quest_id, xp_earned, completed_at) — shared `/pilot/:id` profiles.

### Environment
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_ALCHEMY_RPC=https://...   # optional — on-chain $DRIFT balance; shows "—" if unset
```
Restart `npm run dev` after editing `.env.local`. `supabase.js` throws a clear error at import if URL/ANON_KEY are missing (no silent white-screen).

---

## The Quest screens

`Quest.css` holds all shared styles (editor, topbar, brief panel, modal, dungeon entry animation). Each quest has its own CSS file for screen-specific visuals.

### Gate 01 — The Document Tomb (`/quest`) — HTML validator mechanic
- **Concept:** Player receives a pre-filled corrupted HTML document and must fix all structural errors
- **`VARIANTS`** — 3 randomised starting templates (same 4 errors, different content/context). Picked randomly on mount.
- **`ERROR_CHECKS`** — array of `{ id, label, hint, test }` objects; `test(code)` returns `true` when fixed
- **XP trickles** — +25 XP per error fixed (100 total); +80 DRIFT on completion
- **Live preview** — injects terminal-style CSS (dark bg, alarm-red h1, amber strong, teal link)
- **Signal slot** — `dq-signal-slot` (160×120px, teal), `signalTransmit` animation → modal
- **Scene art:** `dq-scene-tower` (CSS antenna with expanding signal ring when `.live`)
- **Anti-AI:** paste blocked, time+paste tracked, quiz required before submit
- **Reward:** +80 DRIFT, +100 XP, Signal Fragment, Rank E License

### Gate 02 — The Semantic Crypt (`/quest2`) — semantic HTML validator mechanic
- **Concept:** Player receives a fully div-soup EVA City page and replaces divs with correct semantic elements. Page looks identical — teaching that semantic HTML is about meaning, not appearance.
- **`VARIANTS`** — 3 randomised div-soup pages (Sector Zero / Command Centre / Reactor Grid). Same 8 semantic replacements required.
- **`SEMANTIC_CHECKS`** — 8 checks using strict regex `/<tag[^<>]*>/` + closing tag `/<\/tag>/`. Prevents passing with unclosed/malformed tags.
- **Twist:** the image+caption block must become `<figure>` + `<figcaption>`, not `<article>`
- **XP trickles** — +25 XP per check resolved (200 total); +160 DRIFT on completion
- **Codex slot** — `dq-codex-slot` (160×120px, violet), `codexVerify` animation → modal
- **Scene art:** `dq2-scene-codex` (CSS stone tablet, violet glyph pulses when `.verified`)
- **Anti-AI:** paste blocked, time+paste tracked, quiz required before submit
- **Reward:** +160 DRIFT, +200 XP, Semantic Core, Identity Fragment

### Gate 03 — The Form Gate (`/quest3`) — write-from-scratch forms + Boss: THE LABEL EATER
- **Concept:** Player builds a form from scratch. Every unlabeled input feeds the boss.
- **`VARIANTS`** — 3 randomised scaffolds (Citizen Registration / Mission Request / Sector Access Application). Same 10 requirements.
- **`FORM_CHECKS`** — 10 checks using strict regex (opening + closing tags required): `form`, `input[type=text]`, `input[type=email]`, `select+option`, `input[type=radio]`, `textarea`, 3+ `label[for=...]`, 3+ `id=` attrs, 2+ `required`, real `<button>`
- **Boss HP bar** — `dq3-boss-hp` depletes as checks pass (crimson → lime on defeat)
- **Scene art:** `dq3-scene-eater` — floating CSS creature, red eyes, `<div>` tag mouth, collapses on defeat
- **Form slot** — `dq-form-slot` (160×120px, crimson), `formExtract` animation → modal
- **GateRoute** requires both `act1-ch01` and `act1-ch02`
- **Anti-AI:** paste blocked, time+paste tracked, quiz required before submit
- **Reward:** +300 DRIFT, +300 XP, Label Eater Core, Rank D License

### Gate 04 — Paint the City (`/quest4`) — CSS design systems + custom properties
- **Concept:** EVA City's color system collapsed — 847 hardcoded hex values. Player writes a CSS design system using custom properties, applies it to a pre-built EVA City interface.
- **`VARIANT_HTML`** — 3 HTML templates (Sector Zero status report / Command Centre mission board / Reactor Grid monitor). All share the same class names so one CSS works for all.
- **`CSS_CHECKS`** — 8 checks at 25 XP each (200 XP total): `:root` vars declared, 3+ color variables, 2+ spacing variables, `var()` used in rules, no `#hex` outside `:root`, `.city-header` styled with var(), `.status-card` styled with var(), `@media` breakpoint present.
- **Live preview** — iframe with `srcdoc` built from player CSS + HTML template; always reflects current code in preview tab.
- **Brand Override** — `generateOverride(css)` extracts player's actual color variable names and reassigns them to magenta values, proving the cascade works regardless of variable names. Fires when player clicks the slot.
- **Protocol Override slot** — `dq4-protocol-slot`; amber, pulses when all 8 checks pass; click triggers brand switch animation → quiz → dungeon entry → modal.
- **`START_CSS`** — pre-populated scaffold with all class selectors empty and comments listing the 8 checks.
- **Scene art:** `dq4-scene-matrix` — 8 CSS swatches in a 4×2 grid; each lights a different neon color as its corresponding check passes; pulses amber when all 8 pass.
- **GateRoute** — requires ch01+ch02+ch03 OR `unlockKey=act1-ch04` (DRIFT unlock). Uses updated `GateRoute` with `unlockKey` prop.
- **Anti-AI:** paste blocked, time+paste tracked, quiz required before slot activates.
- **Reward:** +200 DRIFT, +200 XP, Color Protocol, CSS Architect I.
- **Key decision:** CSS checks use multiline-safe regexes — `[^}]` in character classes matches `\n`, so no `s` flag needed. `generateOverride` is dynamic — it reads the player's own variable names so the brand switch demo always works.

### Gate completion (all gates)
- Both "Continue →" and the next-gate card call `completeQuest(questId, xp, getAnalytics())`. Upsert is safe to call twice.
- `clearQuest(questId)` in Dashboard Settings → Gate History resets a gate; also wipes all `gate_unlocks` if the new balance would go negative.
- **Gate History UI:** shows only completed gates. **Reset** (with confirm step) removes the completion. **Replay →** resets and navigates to the gate in one click.

### Anti-AI system (`useQuestAnalytics` + `QuestQuiz`)
```js
// src/hooks/useQuestAnalytics.js
const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()
// onPaste: blocks paste (e.preventDefault) and logs attempt
// trackChange(newLen): detects rapid text growth (>80 chars at once = rapid change)
// getAnalytics(): returns { time_taken, paste_count, flagged }
// pasteBlocked: true for 2s after a paste attempt — used to flash status bar message
```
- `flagged = true` when: `time_taken < 90s` OR `paste_count > 0` OR `rapidChanges > 2`
- All three analytics fields saved to `quest_completions` on gate completion
- `QuestQuiz.jsx` — 4-option knowledge check overlay rendered before the completion animation. Must answer correctly to proceed. Different question per gate.

---

## Dashboard — 8-view layout

`Dashboard.jsx` renders one `<aside>` sidebar + one `<main>` that swaps content based on `view` state.  
**Both `view` and `cardVariant` are persisted in `localStorage`** — survive page reload.  
Sidebar has hamburger menu at ≤1100px (mobile/tablet) that overlays via `position: fixed`.

| `view` | Content |
|---|---|
| `'home'` | hero banner, stats grid (real XP/DRIFT/rank), active quest cards, season objectives, leaderboard preview, world map |
| `'skill-tree'` | 15-quest grid from `public.quests`. DONE/START/LOCKED + DRIFT cost badges for ch04+ gates. Season Pass banner for non-subscribers. |
| `'leaderboard'` | Full ranked list of all pilots by XP. YOU row highlighted in magenta. |
| `'wallet'` | Bank-style card (4 color variants, localStorage-persisted), earned/spent stats, transaction history |
| `'raids'` | `<RaidView />` — full multiplayer raid system (lobby, team formation, active raid, siege, result) |
| `'settings'` | Edit name + wallet; Season Pass status chip; change email; change password; Gate History reset |
| `'admin'` | Visible only when `profile.is_admin`. Flagged completions table + Pilot management table (grant/revoke Season Pass). |

### Season Objectives (home view)
Wired to real data — not hardcoded:
```js
const objectives = [
  { done: act1Done, text: 'Clear Gate 01 — The Document Tomb', rw: '+100 XP' },
  { done: act2Done, text: 'Clear Gate 02 — The Semantic Crypt', rw: '+200 XP' },
  { done: act3Done, text: 'Clear Gate 03 — The Form Gate',     rw: '+300 XP' },
  { done: streak >= 3, text: 'Build a 3-day streak',           rw: '+streak' },
]
```

### Skill tree node state (important: chapter-based key)
```js
const chKey    = `act1-ch${String(q.chapter).padStart(2, '0')}`
const prevChKey = `act1-ch${String(q.chapter - 1).padStart(2, '0')}`
const isDone    = doneQuests.has(chKey) || doneQuests.has(q.id)   // dual check for DB ID flexibility
const isUnlocked = q.chapter > 3 && unlockedGateIds.has(chKey)    // DRIFT-purchased unlock

// isActive: true when pilot can START this gate
const isActive = !isDone && !isUnlocked && (
  // ch01–03: sequential by default
  (q.chapter <= 3 && (q.chapter === 1 || doneQuests.has(prevChKey))) ||
  // ch04+: subscribers get sequential access without DRIFT
  (q.chapter > 3 && isSubscribed && (doneQuests.has(prevChKey) || unlockedGateIds.has(prevChKey)))
)
const isLocked  = !isDone && !isActive && !isUnlocked
// canUnlock: show DRIFT button (non-subscribers only, ch04+ with prev done/unlocked)
const canUnlock = !isSubscribed && q.chapter > 3 && (doneQuests.has(prevChKey) || unlockedGateIds.has(prevChKey))
```
- `isSubscribed = profile?.is_subscribed ?? false` — derived at component top before all `useEffect`
- ch01–03 locked gates show `LOCKED`
- ch04+ locked gates show DRIFT cost button for non-subscribers if prev gate done/unlocked (`canUnlock`)
- ch04+ locked gates show `LOCKED` chip for subscribers who haven't done the previous gate yet
- ch04+ unlocked (DRIFT) gates show `UNLOCKED` chip (teal) — no content yet
- Season Pass banner shown above the grid for non-subscribers
- `GATE_NAMES[chKey]` and `gotoQuestById(chKey)` both use the derived key

**CRITICAL:** `isAdmin` and `isSubscribed` must be declared BEFORE all `useEffect` calls in Dashboard.jsx due to JavaScript temporal dead zone with `const`. If they appear after any `useEffect` that references them in its dependency array, a `ReferenceError` is thrown.

### $DRIFT spending (skill tree)
```js
// unlock button (ch04+ only, canUnlock = prev done or unlocked)
<button onClick={e => { e.stopPropagation(); handleUnlock(chKey, driftCost) }}>
  {driftCost} $DRIFT
</button>
// driftCost = q.is_boss ? 250 : 100
// handleUnlock calls unlockGate(chKey, driftCost) from AuthContext
```
Wallet view shows: card balance = spendable (`totalDrift - totalDriftSpent`), EARNED tile = `totalDrift`, SPENT tile = `totalDriftSpent`. Transaction history merges earn (completions) and spend (unlocks) sorted newest-first.

### Smart quest routing
```js
function gotoActiveQuest() {
  // Routes to the first incomplete gate in sequence (ch01 → ch10)
  // act1Done…act10Done derived from doneQuests Set in Dashboard
}
```
`gotoActiveQuest()` checks act1Done through act10Done sequentially and routes to the first incomplete gate. `gotoQuestById(chKey)` maps `'act1-ch01'` through `'act1-ch10'` to their route names.

### Leaderboard fetch
```js
supabase.from('profiles').select('id, name, quest_completions(xp_earned)')
// aggregated client-side, re-fetches on every profile change
```
Requires `public profiles` RLS policy to be readable by all (for leaderboard to work cross-user).

---

## Landing page — auth awareness

`Landing.jsx` imports both `useNav` and `useAuth`:
- Nav button: `user ? 'Dashboard →' : 'Sign Up / Log In →'`
- Hero primary CTA: `user ? 'Go to Dashboard →' : 'Start Season 01 →'`
- Final CTA: same conditional
- Stats (`pilots enrolled / total XP earned / gates cleared`) fetched live from Supabase on mount

---

## Password / Email change flow

**Change password:**
1. Settings → Account → click **Change** next to password
2. `sendPasswordReset()` → `supabase.auth.resetPasswordForEmail(user.email, { redirectTo: origin/dashboard })`
3. User clicks link in email → redirected to `/dashboard` → `PASSWORD_RECOVERY` event fires
4. `passwordRecovery` becomes `true` in AuthContext → Settings shows new-password input form
5. User submits → `updatePassword(newPassword)` → `passwordRecovery` resets to `false`

**Change email:**
1. Click **Change** next to email → new email input appears
2. `updateEmail(newEmail)` → Supabase sends confirmation to new address
3. User clicks confirmation link → email updated

---

## Navigation pattern

**Never use `<Link>` or `useNavigate` directly.** Always use:

```jsx
import { useNav } from '../context/NavigationContext'
const { goto } = useNav()

goto('landing')    // → /
goto('login')      // → /login
goto('signup')     // → /signup
goto('dashboard')  // → /dashboard
goto('quest')      // → /quest   (Gate 01)
goto('quest2')     // → /quest2  (Gate 02)
goto('quest3')     // → /quest3  (Gate 03)
goto('quest4')     // → /quest4  (Gate 04)
goto('quest5')     // → /quest5  (Gate 05)
goto('quest6')     // → /quest6  (Gate 06)
goto('quest7')     // → /quest7  (Gate 07)
goto('quest8')     // → /quest8  (Gate 08)
goto('quest9')     // → /quest9  (Gate 09)
goto('quest10')    // → /quest10 (Gate 10)
goto('terms')      // → /terms   (Terms of Service)
goto('privacy')    // → /privacy (Privacy Policy)
```

`goto()` runs a 380ms animation (progress bar + blur overlay) before calling `navigate()`.

---

## CSS conventions

- **Design tokens** — CSS custom properties in `:root` in `index.css`. Never hardcode hex values.
- **Global utility classes** — `.btn`, `.panel`, `.chip`, `.gradient-text`, `.reveal`, `.world-card` in `index.css`.
- **Screen-specific styles** — co-located `ScreenName.css`. Flat class names (no CSS modules).
- **Neon colors**: `--teal`, `--violet`, `--magenta`, `--lime`, `--amber`, `--cyan`, `--steel-blue`, `--ghost`, `--orange` in `oklch()`.
- **Fonts**: `--f-display` (Space Grotesk), `--f-body` (Inter), `--f-mono` (JetBrains Mono).
- **Gate accent colors**: Gate 01 teal · Gate 02 violet · Gate 03 crimson · Gate 04 amber · Gate 05 cyan · Gate 06 steel-blue · Gate 07 ghost · Gate 08 orange · Gate 09 lime · Gate 10 magenta

---

## Running locally

```bash
cd c:\EVA\eva-react
npm run dev      # dev server at http://localhost:5173 (or 5174 if port taken)
npm run build    # production build → dist/
```

---

## For Claude — compact context

**What this project is:** Drift Pilot Protocol, gamified Web3 coding academy. React SPA + Supabase.  
**Token:** `$DRIFT`. **Brand:** "Drift Pilot Protocol". Neon cyberpunk dungeon aesthetic.

**Critical files:**
- `src/index.css` — design system, all tokens and shared classes; landing page responsive breakpoints (960px/768px/560px)
- `src/context/AuthContext.jsx` — auth, profile (`totalDrift`, `completions`, `completedQuestIds` Set, `is_admin`, `is_subscribed`, `streak`, `passwordRecovery`), `DRIFT_REWARDS` map, all auth functions + `clearFlag`/`toggleSubscription` (admin-only)
- `src/context/NavigationContext.jsx` — `goto(screenName)` only, never raw `useNavigate`
- `src/components/GateRoute.jsx` — like ProtectedRoute but also checks `requires` array against `completedQuestIds`
- `src/screens/Quest.css` — shared styles for all gate screens (editor, topbar, dungeon entry, modal)
- `src/screens/Quest.jsx` — Gate 01 (The Document Tomb); `ERROR_CHECKS`, `dq-signal-slot`, `signalTransmit`
- `src/screens/Quest2.jsx` — Gate 02 (The Semantic Crypt); `SEMANTIC_CHECKS`, `dq-codex-slot`, `codexVerify`
- `src/screens/Quest3.jsx` — Gate 03 (The Form Gate); `FORM_CHECKS`, boss HP bar, `dq3-scene-eater`, `dq-form-slot`, `formExtract`
- `src/screens/Quest5.jsx` — Gate 05 (The Gravity Anchor); 6 Flexbox checks, cyan anchor scene, `dq5-gravity-slot`
- `src/screens/Quest6.jsx` — Gate 06 (The Infinite Grid); 7 Grid checks, boss HP bar, 3×3 tile grid + mist, `dq6-grid-seal`
- `src/screens/Quest7.jsx` — Gate 07 (Ghost Feedback); 7 transition checks, bar-chart figures scene, `dq7-ghost-signal`
- `src/screens/Quest8.jsx` — Gate 08 (The Collapse); 7 responsive checks, full HTML page variants, boss HP bar, stacked panels scene, `dq8-mobile-gate`
- `src/screens/Dashboard.jsx` — 8-view SPA; `view` + `cardVariant` in localStorage; notification bell; profile dropdown; admin panel; subscription skill tree
- `src/screens/Dashboard.css` — includes responsive breakpoints: 1100px (hamburger + sidebar overlay), 768px, 480px
- `src/screens/RaidIDE.jsx` — full in-browser IDE for raid active/siege phases. Props: `raid, members, myRole, isLeader, isAdmin, events, busy, passedSyncs, expandedSync/setExpandedSync, expandedWave/setExpandedWave, syncEvidence/setSyncEvidence, onSync, onWave, onBonus, onLeave, onAdmin*, healthColor, SYNCS, WAVES, ROLES_FULL`. Two tabs: WORKSPACE (Monaco + file tree + role output) and MISSION CONTROL (existing sync/wave/event log UI). `STARTERS` map holds per-role starter file templates. `SYNC_CODE_CHECKS` array has regex checks per role per sync; rendered in right panel + inline in each sync ritual card. Auto-save debounced 1.8s to `raid_files` via Supabase upsert with `onConflict: 'raid_id,role,path'`. Realtime channel `raid-files:{raidId}` syncs file changes live. Interface right panel: `SandpackProvider`+`SandpackPreview` keyed on `previewKey` (re-mounts 1.5s after edit). Vault right panel: PGlite lazy-initialized on first Vault view; `runSQL()` runs current editor content. Non-editable roles show read-only Monaco.
- `src/screens/RaidView.jsx` — full raid system; 5 roles; lobby realtime; descent phase (5 reference docs); role briefs (ROLE_BRIEFS constant + RoleBrief component); sync ritual pass conditions (SYNCS array with conditions[], passEffect, failEffect, failMode; expandedSync state); siege wave details (WAVES array with stations[], unprepared[], color, heldEffect, breachedEffect; expandedWave state); Supabase Realtime on raid/members/events; admin solo+skip controls

**Key decisions:**
- `goto()` wraps `useNavigate` with 380ms progress bar + blur overlay.
- XP pop restarts CSS animation via `xpPopKey` increment (remount trick).
- Dungeon entry: 750ms after click → 2.4s corridor zoom → modal at 3.35s.
- Auth session via `onAuthStateChange` only — never `getSession` to avoid double fetch.
- Quest completions: `upsert` with `{ onConflict: 'user_id,quest_id' }`. Safe to call twice.
- `GateRoute` returns `null` while `!profile` (profile loading after auth) to prevent flash-redirect.
- Skill tree uses `chKey = 'act1-ch' + chapter.padStart(2,'0')` — not `q.id` — because quests table may use UUIDs while quest_completions stores string IDs.
- `totalDrift` computed from `DRIFT_REWARDS` map in AuthContext — no separate DB column.
- `totalDriftSpent` computed from `gate_unlocks.drift_cost` sum — no separate DB column.
- `completions` + `unlocks` arrays exposed in profile for wallet transaction history.
- `passwordRecovery` state becomes `true` on `PASSWORD_RECOVERY` Supabase auth event; clears after `updatePassword()`.
- Dashboard `view` and `cardVariant` both persisted in localStorage.
- Leaderboard fetches `profiles` with nested `quest_completions(xp_earned)` — requires public RLS on profiles.
- Skill tree `isActive` uses prev-chapter done check; subscribers bypass DRIFT spend for ch04+ gates.
- ch04+ gates show DRIFT cost button (canUnlock = prev done/unlocked, non-subscriber only) or LOCKED if prerequisite missing.
- `clearQuest` cascades: if new earned DRIFT < totalDriftSpent, all `gate_unlocks` are deleted too.
- Landing page imports `supabase` directly to fetch real stats on mount (pilot count, total XP, gates cleared).
- All quest textareas block paste (`e.preventDefault()`) and show `⊘ Paste disabled` in status bar for 2s.
- `completeQuest(questId, xp, analytics)` — analytics `{ time_taken, paste_count, flagged }` saved to DB.
- Checker regexes use `/<tag[^<>]*>/` + `/<\/tag>/` — prevents passing with unclosed/malformed tags.
- `isAdmin` and `isSubscribed` must be declared BEFORE all `useEffect` hooks in Dashboard to avoid temporal dead zone `ReferenceError`.
- Dropdown click-outside pattern: invisible fixed overlay div (`position: fixed; inset: 0`) rendered behind dropdown; clicking it closes the dropdown. Simpler than `useRef` + `document.addEventListener`.
- Mobile sidebar: `position: fixed; left: -260px` by default; `.open` class transitions to `left: 0`. Backdrop overlay at z-index 299, sidebar at 300.
- Admin data loaded in `useEffect` — no separate loading state (avoids Oxlint "synchronous setState in effect" rule). Data arrives fast enough.
- `clearFlag` and `toggleSubscription` both guard-check `profile?.is_admin` before running — server-side RLS also enforces this.
- Logo image in Dashboard sidebar links to landing page via `goto('landing')`; Settings and Sign Out moved to profile avatar dropdown (removed from sidebar Account section).
- Raids use two Supabase Realtime channels: `raid-lobby-watch` (INSERT/UPDATE on raids+members → refresh open list) and `raid:{id}` (active raid updates). Lobby channel is torn down when entering a raid; raid channel is torn down on leave.
- Admin bypass in RaidView: `isAdmin` from `profile?.is_admin` lowers start minimum to 1; adds Skip to Siege, Skip Wave, Force Complete controls visible only to the raid leader who is also admin.
- Raid launch flow: lobby → `status: 'descent'` (Phase 01 — 5 reference docs shown) → leader clicks "Begin Build →" → `status: 'active'` (Phase 02) → syncs + siege → complete/failed. All action handlers call `loadRaidDetails(raidId)` after writing to DB — no reliance on Realtime for leader UI updates.
- Descent phase shows 5 collapsible document panels: Data Contract (DB schema), Signal Contract (API endpoints + error format), Cipher Contract (JWT/RBAC/refresh flow), Environment Contract (.env.example), Architecture Map (services/hosting/deployment order). `expandedDoc` state controls which is open (default: 1).
- `ROLE_BRIEFS` module-level constant holds full build brief per role: stack, sections (title + items[]), dependsOn[], dependedOnBy[]. `RoleBrief` component renders it with color-coded bullets using `--rc` from ROLES. `briefRole` state (null | roleKey) controls display in both waiting room (click card) and active raid (toggle button on My Role card).
- `SYNCS` array holds all 4 sync ritual definitions: each has `conditions[]` (objects with role key + text), `passEffect`, `failEffect`, `failMode`. Conditions are role-tagged — `ROLES[c.role]?.icon` and color used for display; `role: 'all'` renders all 5 icons. `expandedSync` state (null | n) controls which card is open. PASS/FAIL buttons only appear inside the expanded card (not on the collapsed head).
- `WAVES` array holds all 5 siege wave definitions: each has `stations[]` (role + duty text), `unprepared[]` (role + cost text), `color` (wave accent), `heldEffect`, `breachedEffect`. `expandedWave` state (null | n) controls which card is open. Future waves (not yet current) are non-interactive (opacity 0.4, click disabled). HELD/BREACHED buttons only appear inside the expanded card when it is the current wave. Monitoring stations and failure costs use the same `ROLES[r].color` and `ROLES[r].icon` system as sync conditions.
- **Scoring system**: During siege, leader can confirm "Zero Crashes" and "Zero DB Corruption" bonus conditions (+150 HP each) via `handleBonus(label)` → writes a `bonus_applied` event. On the result screen, all events are replayed into score line items (sync pass/fail, wave held/breached, bonuses, integrity penalties). Tier rating computed from final HP: ≥1000 PERFECT · ≥900 S-ELITE · ≥750 A-CLEAR · ≥700 B-CLEAR · below FAILED. Note shown if bonuses were never claimed.
- **Anti-cheat/Anti-AI system**: (1) `applyIntegrityPenalty(raidId, health)` — called on `handleCreate` and `handleJoin`; fetches own flagged gate completions; applies −25 HP × flagged count (max −100) as an `integrity_penalty` event. (2) `handlePledge()` — writes `ai_pledge` event; `pledgedIds` Set derived from events; `allPledged` boolean gates `handleBeginBuild`; admin bypasses pledge check. (3) `syncEvidence` state `{ 1,2,3,4: '' }` — text input in expanded sync card; `handleSync(n, passed, evidence)` includes evidence in event label; PASS RITUAL disabled until evidence.trim().length >= 10. (4) Timing analysis on result screen — `buildHrs`, `siegeHrs`, `totalHrs` computed from `started_at`/`siege_started_at`/`ended_at`; `speedFlag = totalHrs < 2` shows SPEED FLAG chip + audit note. (5) `myFlagged` state — fetched on mount from own quest_completions; shows ⚠ badge on own role card in waiting room + warning panel with penalty preview. Event type `integrity_penalty` appears in score table on result screen.
