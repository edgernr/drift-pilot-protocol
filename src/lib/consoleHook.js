// ── Console capture hook ──────────────────────────────────────────────────────
// Prepended to the Hunter Browser INSTANCE srcdoc, ahead of the gate's preview
// document (same prepend trick each gate already uses for PREVIEW_STYLE — the
// HTML parser hoists it). Wraps console.* plus window error events inside the
// sandboxed iframe and streams entries to the parent shell via postMessage;
// ArenaShell's IDE console panel renders them. ES5 on purpose — it runs inside
// user-authored documents.
// Line numbers refer to the assembled preview document, not the editor.

export const CONSOLE_HOOK = `<script>
(function () {
  function fmt(a) {
    if (typeof a === 'string') return a
    if (a instanceof Error) return a.name + ': ' + a.message
    if (a === undefined) return 'undefined'
    try {
      var s = JSON.stringify(a)
      return s === undefined ? String(a) : s
    } catch (e) { return String(a) }
  }
  function send(level, parts) {
    try {
      window.parent.postMessage({ __vsConsole: true, level: level, text: parts.join(' ') }, '*')
    } catch (e) { /* parent gone — nothing to report to */ }
  }
  ;['log', 'info', 'warn', 'error'].forEach(function (m) {
    var orig = console[m]
    console[m] = function () {
      var args = Array.prototype.slice.call(arguments)
      send(m === 'info' ? 'log' : m, args.map(fmt))
      if (orig) orig.apply(console, args)
    }
  })
  window.addEventListener('error', function (e) {
    send('error', [e.message + (e.lineno ? '  (line ' + e.lineno + ')' : '')])
  })
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason
    send('error', ['Unhandled promise rejection: ' + (r && r.message ? r.message : fmt(r))])
  })
})()
</script>`
