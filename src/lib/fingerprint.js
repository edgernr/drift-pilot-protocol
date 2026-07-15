// Dependency-free device fingerprint. Not cryptographically unique — good enough
// to correlate second accounts on the same machine (multi-account detection).
// Combines stable device traits + a canvas render hash into one short hex string.

function hashString(str) {
  // FNV-1a 32-bit → hex. Small, fast, no deps.
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function canvasSignature() {
  try {
    const c = document.createElement('canvas')
    c.width = 200; c.height = 40
    const ctx = c.getContext('2d')
    if (!ctx) return 'nocanvas'
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = '#f60'; ctx.fillRect(0, 0, 100, 20)
    ctx.fillStyle = '#069'; ctx.fillText('VoidShards◈', 2, 2)
    ctx.fillStyle = 'rgba(102,204,0,0.7)'; ctx.fillText('VoidShards◈', 4, 4)
    return c.toDataURL().slice(-64)
  } catch {
    return 'canvaserr'
  }
}

let cached = null

export function getFingerprint() {
  if (cached) return cached
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const scr = typeof screen !== 'undefined' ? screen : {}
  const traits = [
    nav.userAgent || '',
    nav.language || '',
    (nav.languages || []).join(','),
    nav.platform || '',
    nav.hardwareConcurrency || '',
    nav.deviceMemory || '',
    nav.maxTouchPoints || '',
    scr.width + 'x' + scr.height + 'x' + (scr.colorDepth || ''),
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat)
      ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
    new Date().getTimezoneOffset(),
    canvasSignature(),
  ].join('|')
  cached = 'fp_' + hashString(traits)
  return cached
}

export function shortUA() {
  return (typeof navigator !== 'undefined' ? navigator.userAgent : '').slice(0, 250)
}
