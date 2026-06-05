// Strip line-initial comments before running regex checks.
// Removes lines where the first non-whitespace chars are // (JS) or # (Python).
// Preserves inline comments and Python integer division (x // 2) since those
// don't start with // or #.
export function stripComments(code) {
  return code
    .split('\n')
    .filter(line => {
      const t = line.trimStart()
      return !t.startsWith('//') && !t.startsWith('#')
    })
    .join('\n')
}
