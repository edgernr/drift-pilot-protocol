// Drift Pilot Protocol — Electron main process
// Wraps the bundled Vite SPA (both the main platform and the Academy live in the same
// React app). Serves it over a custom app:// scheme so React Router's /paths work under
// a packaged build, handles driftpilot:// deep links (Supabase auth callbacks), a system
// tray streak indicator, and auto-update.
import { app, BrowserWindow, protocol, net, Menu, Tray, shell, ipcMain, nativeImage, Notification } from 'electron'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const DEV_URL = process.env.VITE_DEV_URL || 'http://localhost:5173'
const APP_SCHEME = 'app'              // serves the bundled SPA
const DEEP_LINK_SCHEME = 'driftpilot' // OS deep links for auth callbacks
// Load the bundled SPA when packaged, or when explicitly testing the bundle locally.
const USE_BUNDLE = app.isPackaged || process.env.ELECTRON_BUNDLE === '1'

let mainWindow = null
let tray = null
let pendingDeepLink = null

// Must run before app 'ready'. Makes app:// a secure, fetch-capable origin so WASM
// (PGlite), workers (Sandpack) and crypto behave exactly as on the web.
protocol.registerSchemesAsPrivileged([
  { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
])

// Serve the bundled SPA via net.fetch — it reads from the asar archive and sets correct
// MIME types automatically. Real assets (have a file extension) are fetched directly;
// routes / missing assets fall back to index.html so React Router takes over.
// (Avoids fs.existsSync, which misbehaves on asar paths and was blanking the page.)
async function serveBundle(request) {
  const indexUrl = pathToFileURL(path.join(DIST, 'index.html')).toString()
  let rel = decodeURIComponent(new URL(request.url).pathname)
  if (rel === '/' || rel === '') rel = '/index.html'
  const filePath = path.normalize(path.join(DIST, rel))
  if (filePath.startsWith(DIST) && path.extname(filePath)) {
    try {
      const res = await net.fetch(pathToFileURL(filePath).toString())
      if (res.ok) return res
    } catch { /* fall through to the SPA index */ }
  }
  return net.fetch(indexUrl)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 940, minHeight: 600,
    backgroundColor: '#0a0a12',
    show: false,
    title: 'Drift Pilot Protocol',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  // Load at the ORIGIN ("/") — not /index.html — so React Router's "/" (Landing) route matches.
  mainWindow.loadURL(USE_BUNDLE ? `${APP_SCHEME}://bundle/` : DEV_URL)

  // Surface load failures, and auto-open DevTools when testing the bundle (electron:preview).
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => console.error('[did-fail-load]', code, desc, url))
  if (process.env.ELECTRON_BUNDLE === '1' && !app.isPackaged) mainWindow.webContents.openDevTools({ mode: 'detach' })

  // Open http(s) links and target=_blank in the real browser, never in-app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(`${APP_SCHEME}://`) && !url.startsWith(DEV_URL)) { e.preventDefault(); shell.openExternal(url) }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

function rebuildTrayMenu(streak) {
  if (!tray) return
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: streak > 0 ? `🔥 ${streak}-day streak` : 'No streak yet', enabled: false },
    { type: 'separator' },
    { label: 'Open Drift Pilot', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus() } else createWindow() } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]))
  tray.setToolTip(streak > 0 ? `Drift Pilot — ${streak}-day streak` : 'Drift Pilot Protocol')
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '..', 'build', 'tray.png')
    const img = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty()
    tray = new Tray(img)
    rebuildTrayMenu(0)
  } catch { /* tray is best-effort */ }
}

async function setupAutoUpdate() {
  if (!app.isPackaged) return
  try {
    const mod = await import('electron-updater')
    const autoUpdater = mod.autoUpdater ?? mod.default?.autoUpdater
    autoUpdater?.checkForUpdatesAndNotify?.().catch(() => {})
  } catch { /* updater is best-effort */ }
}

function handleDeepLink(url) {
  if (!url) return
  if (mainWindow) { mainWindow.webContents.send('deep-link', url); mainWindow.show(); mainWindow.focus() }
  else pendingDeepLink = url
}

// IPC from the renderer (via preload)
ipcMain.handle('deep-link:pending', () => { const l = pendingDeepLink; pendingDeepLink = null; return l })
ipcMain.on('tray:streak', (_e, streak) => rebuildTrayMenu(Number(streak) || 0))
ipcMain.on('notify', (_e, { title, body } = {}) => {
  if (Notification.isSupported()) new Notification({ title: title || 'Drift Pilot Protocol', body: body || '' }).show()
})

// Single instance — route a second launch's deep link into the running window.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (_e, argv) => {
    const link = argv.find(a => a.startsWith(`${DEEP_LINK_SCHEME}://`))
    if (link) handleDeepLink(link)
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus() }
  })

  app.on('open-url', (e, url) => { e.preventDefault(); handleDeepLink(url) }) // macOS

  app.whenReady().then(() => {
    protocol.handle(APP_SCHEME, serveBundle)

    if (process.defaultApp && process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME, process.execPath, [path.resolve(process.argv[1])])
    } else {
      app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME)
    }

    // win/linux: a deep link may be in the launch argv
    const launchLink = process.argv.find(a => a.startsWith(`${DEEP_LINK_SCHEME}://`))
    if (launchLink) pendingDeepLink = launchLink

    createWindow()
    createTray()
    setupAutoUpdate()

    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
  })
}

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
