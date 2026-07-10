// PROLOGUE · Beat 3 — the GORGOROTH fight. Scripted. Unwinnable. Mandatory loss.
//
// The rig, mechanically:
//  - startEncounter is called with hpChecks=10, so each of the 3 wards deals only
//    10 dmg — max 30 total. His HP can NEVER reach 0. win() is unreachable.
//  - Regen ticks (healEnemy) start after REGEN.delayMs — the bar visibly refills.
//  - Corruption ticks rewrite the editor (a fixed ward re-breaks) and land a
//    counter-hit on the player (scriptedDamage).
//  - The finisher drops the player to 0 → fall() → the loss. Only forced loss
//    in the game (CLAUDE.md).
// All numbers are owner-tunable here.

export const GORGOROTH_SCRIPT = {
  hpChecks: 12,          // dpc = ceil(100/12) = 9 → 3 wards deal ≤27: a visible
                         // early dip ("winnable for ~30s"), never anywhere near 0
  regen: { delayMs: 16000, tickMs: 900, perTick: 4 },
  corrupt: { afterMs: 38000, intervalMs: 9000, counterDamage: 12 },
  // Once his blood wakes (with regen), he swings back on a cadence — the
  // player is never idle-waiting while the script counts down.
  aggro: { everyMs: 7000, damage: 6 },
  // If the player strikes every ward early, the script accelerates instead of
  // leaving dead air: corruption answers in seconds, the finisher lands soon.
  escalate: { corruptDelayMs: 2500, finisherDelayMs: 15000 },
  finisher: { afterMs: 72000, damage: 999 },
  lossHoldMs: 2200,      // "SIGNAL LOST" dwell before CS-2
}

// Raw comment-stripper: regex ward tests must never match instruction text.
const stripComments = (code) => code.replace(/<!--[\s\S]*?-->/g, '')

const STARTER = `<!DOCTYPE html>
<html>
<head>
  <title>FLOOR 152 — EMERGENCY PROTOCOL</title>
</head>
<body>
  <h1>CONTAINMENT FIELD
  <p><strong>Association emergency lockdown in effect.</p></strong>
  <a>REROUTE FLOOR POWER</a>
</body>
</html>
`

const PREVIEW_STYLE = `<style>
  body { background: #08080c; color: #eaf6f5; font-family: system-ui, sans-serif; padding: 24px; }
  h1 { color: #ff3d8b; letter-spacing: 0.08em; }
  a { color: #3df0e8; }
</style>`

const WARDS = [
  {
    id: 'h1-close',
    label: '1 · Seal the containment heading — close the <h1>',
    hint: 'The heading never closes: add </h1> right after the words CONTAINMENT FIELD.',
    test: (doc, win, code) => /<\/h1>/i.test(stripComments(code)),
  },
  {
    id: 'nesting',
    label: '2 · Un-cross the lockdown notice — fix the <strong> nesting',
    hint: 'Tags close in the reverse order they open: <p><strong>…</strong></p>, never </p></strong>.',
    test: (doc, win, code) => /<p>\s*<strong>[\s\S]*?<\/strong>\s*<\/p>/i.test(stripComments(code)),
  },
  {
    id: 'anchor',
    label: '3 · Wire the reroute — give the <a> an href',
    hint: 'An anchor with no href goes nowhere: <a href="#reroute">REROUTE FLOOR POWER</a>.',
    test: (doc) => !!doc.querySelector('a[href]'),
  },
]

// Corruption mirrors the fixes — each tick re-breaks one repaired ward.
// Applied in order, cycling; only corrupts what the player has fixed.
export const CORRUPTIONS = [
  {
    wardId: 'h1-close',
    apply: (code) => code.replace(/<\/h1>/i, ''),
  },
  {
    wardId: 'nesting',
    apply: (code) => code.replace(/<\/strong>(\s*)<\/p>/i, '</p>$1</strong>'),
  },
  {
    wardId: 'anchor',
    apply: (code) => code.replace(/<a\s+[^>]*href\s*=\s*(['"]).*?\1[^>]*>/i, '<a>'),
  },
]

export default {
  id: 'prologue-gorgoroth',
  mode: 'rigged',
  title: 'Gorgoroth Blackblood',
  rank: 'NULL',
  region: 'TOWER OF HUNTERS · FLOOR 152',
  ability: 'FIRST COMPILE',
  language: 'html',
  commsLabel: 'FLOOR ALERT // ASSOCIATION',
  narrator:
    'The containment field is failing and its code is failing with it. Patch the floor systems. Keep him out. Keep him OUT.',
  // Presentation: his 100-HP rig displays as a raid-boss bar. 100 × 66,666 =
  // 6,666,600 max; each ward hit flies as -599,994; regen climbs +266,664/tick.
  hpScale: 66666,
  enemy: {
    name: 'GORGOROTH BLACKBLOOD',
    tier: 'NULL',
    threatLabel: 'NULL-CLASS · THREAT UNMEASURED',
    lore: 'The First Null. The exploit with no patch. No defense against him has ever been written.',
    svgVariant: 'gorgoroth',
  },
  starterCode: STARTER,
  buildPreview: (code) => PREVIEW_STYLE + code,
  buildCheckDoc: (code) => code,
  wards: WARDS,
  wardFailIcon: '⚠',
  scannerLabel: 'CONTAINMENT WARDS',
  scannerUnit: 'BREACHES',
  script: {
    entry: 'CLASS: NULL. All proctors down. Candidate at Terminal 7 — the containment field responds to your compile. Fix breach 1 in the code, then STRIKE. It is the only thing between you and that.',
    wardFixed: 'Breach sealed in the source. CAST IT — hit STRIKE before he notices.',
    allStruck: 'All breaches sealed— he looked at the terminal. CANDIDATE, HE LOOKED AT THE TERMINAL—',
    aggro: [
      'He hit the field. The whole floor moved. Keep patching!',
      'Impact registered — he is testing the containment. It will not hold him long.',
      'Another blow. The glass behind you is starting to sing. Do not turn around.',
      'He is not even trying yet. Patch. Faster.',
    ],
    hits: [
      'A hit. You actually hit him. Keep casting — the field is holding!',
      'He felt that one. Whatever you are doing at that terminal — DO NOT STOP.',
      'Field integrity climbing — wait. His wounds. Look at his wounds.',
    ],
    regen: 'His wounds are closing. The blood — it’s rewriting him faster than you can cut. Nothing in the manual covers this.',
    corrupt: 'HE’S IN YOUR EDITOR. He is writing back. CANDIDATE, HE IS WRITING BACK—',
    finisher: '—signal lost—',
  },
}
