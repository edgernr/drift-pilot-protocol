# Drift Pilot Protocol — Desktop App (Electron)

Cross-platform desktop build (Linux / Windows / macOS) that wraps the **same** React SPA
that runs at driftprotocol.net — both the main platform (`/`) and the Academy (`/academy`)
ship in one app. The Vite build is bundled and served over a custom `app://` scheme, so
React Router and the WASM-heavy Raid IDE (PGlite / Sandpack / Monaco) behave exactly as in
the browser.

## Layout
- `electron/main.js` — main process: serves `dist/` over `app://` (SPA fallback to index.html), opens external links in the real browser, deep links, tray, auto-update, single-instance.
- `electron/preload.cjs` — safe `window.drift` bridge (deep links, tray streak, notifications).
- `src/lib/desktop.js` — renderer helpers; **no-ops on web** (gated on `window.drift`).
- `electron-builder.yml` — packaging targets + GitHub publish + the `driftpilot://` protocol.
- `.github/workflows/desktop-release.yml` — CI matrix that builds all three OSes.

## Develop
Run on your **host** (not the VM — no display here):
```bash
npm install
npm run electron:dev      # vite dev server + Electron with hot reload
npm run electron:preview  # build, then run the packaged-style bundle (app://) locally
```

## Build installers
- **Current OS only (local):** `npm run desktop:build` → outputs to `release/`.
- **All three OSes (recommended):** push a version tag and let CI build + publish to a GitHub Release:
  ```bash
  npm version patch          # bumps version, creates a v* tag
  git push --follow-tags
  ```
  The `Desktop Release` workflow builds on ubuntu/windows/macos runners and uploads
  `.AppImage` + `.deb` (Linux), `.exe` (Windows), `.dmg` (macOS). Uses the auto-provided
  `GITHUB_TOKEN`; no extra secrets needed for an unsigned release.

## ⚠️ Required Supabase config (deep-link auth)
For email confirmation / password reset to land back in the app, add the deep link as an
allowed redirect: **Supabase → Authentication → URL Configuration → Redirect URLs** →
add `driftpilot://auth-callback`. The app picks this URL automatically when running in
Electron (`authRedirectTo()` in `src/lib/desktop.js`); on web it still uses the dashboard URL.
> For the first test round with "Confirm email" OFF, signup/login work without this — only
> password-reset needs it.

## Icons (optional, recommended before public release)
Drop a 1024×1024 `build/icon.png` (electron-builder derives `.ico`/`.icns`) and an optional
small `build/tray.png` for the tray. Without them you get the default Electron icon.

## Code signing / notarization (before wide distribution)
Currently builds **unsigned** (`CSC_IDENTITY_AUTO_DISCOVERY: false`). Unsigned apps work but warn:
- **macOS:** users right-click → **Open** the first time. Proper fix: Apple Developer account ($99/yr) → set `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` and enable notarization.
- **Windows:** SmartScreen "More info → Run anyway". Proper fix: a code-signing cert → set `CSC_LINK` / `CSC_KEY_PASSWORD`.
- **Linux:** no signing needed.

## Notes
- Auto-update (`electron-updater`) checks GitHub Releases on launch of packaged builds.
- The app loads the bundled SPA but talks to live Supabase, so it needs a network connection
  (true offline gates would be a later enhancement).
