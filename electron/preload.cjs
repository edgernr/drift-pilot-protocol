// Preload (CommonJS — required for sandboxed preloads).
// Exposes a minimal, safe bridge to the renderer as window.drift.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('drift', {
  isDesktop: true,
  platform: process.platform,
  // Supabase auth deep links (driftpilot://auth-callback#...) arrive here.
  onDeepLink: (cb) => {
    const handler = (_e, url) => cb(url)
    ipcRenderer.on('deep-link', handler)
    return () => ipcRenderer.removeListener('deep-link', handler)
  },
  // A deep link may have launched the app before the renderer was listening.
  getPendingDeepLink: () => ipcRenderer.invoke('deep-link:pending'),
  // Push the current streak to the tray indicator.
  setStreak: (n) => ipcRenderer.send('tray:streak', n),
  // Fire a native OS notification.
  notify: (title, body) => ipcRenderer.send('notify', { title, body }),
})
