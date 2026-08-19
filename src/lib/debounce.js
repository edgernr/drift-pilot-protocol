/**
 * Trailing-edge debounce.
 *
 * Used on realtime handlers that trigger multi-query reloads. Creating one
 * warband writes several rows; without this, every connected client runs a
 * full reload once per row, which is how a 20-person lobby produces hundreds
 * of queries in a 200ms window and exhausts the connection pool.
 *
 * `cancel()` is exposed so React cleanups can drop a pending call on unmount.
 */
export function debounce(fn, wait = 400) {
  let t = null
  const wrapped = (...args) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => { t = null; fn(...args) }, wait)
  }
  wrapped.cancel = () => { if (t) { clearTimeout(t); t = null } }
  return wrapped
}
