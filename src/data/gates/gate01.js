const VARIANTS = [
  `<html>
<head>
  <title>EVA City Emergency Broadcast</title>
</head>
<body>

  <h1>EMERGENCY — Sector Zero

  <p><strong>All seekers: report to designated shelters immediately.</p></strong>

  <p>This transmission originates from EVA Command.</p>

  <a href="shelter-protocol.html">→ Access Shelter Protocol<a>

</body>`,

  `<html>
<head>
  <title>EVA City — Seeker Registry Notice</title>
</head>
<body>

  <h1>NOTICE — Identity Verification Pending

  <p><strong>Your registry entry has expired and requires immediate renewal.</p></strong>

  <p>Report to EVA Command processing centre within 48 hours.</p>

  <a href="registry-renewal.html">→ Begin Registry Renewal<a>

</body>`,

  `<html>
<head>
  <title>EVA City — Sector Seven Dispatch</title>
</head>
<body>

  <h1>DISPATCH — Reactor Anomaly Confirmed

  <p><strong>All sublevel crews must evacuate via emergency corridors immediately.</p></strong>

  <p>Automated containment systems are now active. Await further orders.</p>

  <a href="containment-status.html">→ Check Containment Status<a>

</body>`,
]

const PREVIEW_STYLE = `<style>
  html { font-size: 9px; overflow: hidden; }
  body { margin: 0; padding: 5px 7px; background: #080c10; color: #a8bcc8; font-family: 'Courier New', monospace; font-size: 1.15rem; line-height: 1.45; }
  h1 { font-size: 1.25rem; color: #ff4444; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 5px; padding-bottom: 4px; border-bottom: 1px solid #ff444430; }
  p { margin: 3px 0; font-size: 1.05rem; }
  strong { color: #ffaa44; }
  a { color: #40c8c0; text-decoration: none; display: block; margin-top: 5px; font-size: 1rem; pointer-events: none; cursor: default; }
</style>`

const WARDS = [
  {
    id: 'doctype',
    label: 'Missing DOCTYPE declaration',
    hint: 'Every HTML document starts with a special declaration on line 1 that tells the browser it\'s working with modern HTML. It comes before the html tag and begins with an exclamation mark.',
    test: (doc) => !!doc.doctype && doc.doctype.name?.toLowerCase() === 'html' && doc.compatMode === 'CSS1Compat',
  },
  {
    id: 'h1',
    label: 'Unclosed <h1> tag',
    hint: 'Heading elements wrap content between two tags — one to open and one to close. Look at the heading text and think about what needs to come after it.',
    test: (doc, win, code) => /<\/h1>/i.test(code),
  },
  {
    id: 'nesting',
    label: 'Tag nesting violation (strong / p)',
    hint: 'Tags must close in reverse order of how they opened — the last tag opened is the first to close. Which of these two tags was opened most recently?',
    test: (doc, win, code) => !/<\/p>\s*<\/strong>/i.test(code) && /<\/strong>/i.test(code),
  },
  {
    id: 'anchor',
    label: 'Anchor tag not properly closed',
    hint: 'An element must end with its own dedicated closing tag. Check the very end of the link — does the tag there open something or close something?',
    test: (doc) => {
      const anchors = doc.body ? doc.body.querySelectorAll('a') : doc.querySelectorAll('a')
      if (anchors.length !== 1) return false
      return (anchors[0].textContent || '').trim().length > 0
    },
  },
]

const QUIZ = {
  question: 'Why does the browser display broken HTML without showing any errors?',
  options: [
    'Browsers have built-in error correction and silently fix issues for you',
    'HTML errors only appear in the browser console, not the page',
    'The browser downloads a separate validator script on each load',
    'HTML has no official specification for handling malformed code',
  ],
  correct: 0,
}

export default {
  id: 'gate01',
  gateNum: 1,
  title: 'The Document Tomb',
  rank: 'E',
  region: 'THE FLOOR · THE FOUNDRY',
  questId: 'act1-ch01',
  nextGate: 'interlude1',
  ability: 'SYNTAX PULSE',
  language: 'html',
  narrator: 'CONTRACT 001 — your first solo dive, registered by VERA with the Association. Nobody hunts at the Floor; nobody has ever STARTED here. The Tomb is a collapsed archive, its very bones malformed — and scratched by the entrance, in a confident hand: "the corruption\'s just bad code. don\'t panic. — M" Someone hunted this deep before you. Fix the structure — snap the Wraith\'s bones into place.',
  enemy: { name: 'Broken-Markup Wraith', tier: 'E', lore: 'A fragment of a once-valid page, corrupted by missing structure. It exists in every gap between an opening tag and its missing close.', svgVariant: 1 },
  variants: VARIANTS,
  buildPreview: (code) => PREVIEW_STYLE + code,
  buildCheckDoc: (code) => code,
  wards: WARDS,
  wardFailIcon: '⚠',
  scannerLabel: 'SCANNER REPORT',
  scannerUnit: 'ERRORS',
  quiz: QUIZ,
  xpPerWard: 25,
  completionXp: 100,
  shardReward: 250,
  aiTitle: 'Gate 01 — The Document Tomb',
  aiRequirements: 'Fix all HTML structural errors: valid DOCTYPE declaration, correct html/head/body nesting, all tags properly closed, no broken or unclosed tags.',
  completion: {
    entryLabel: 'Contract 001 — Closed',
    icon: '📡',
    chip: 'CONTRACT 001 CLOSED',
    heading: 'First kill, Hunter.',
    body: 'Confirmed kill at negative depth — the deepest first contract in Association history. The shards are stabilized code: <strong>the world pays you for putting it back in order.</strong> VERA logs the payout. Your license is real now.',
    rewards: [
      { label: '$SHARD PAYOUT', value: '+250' },
      { label: 'XP LOGGED', value: '+100' },
      { label: 'PROOF OF KILL', value: 'Signal Fragment' },
      { label: 'RANK', value: 'E — VALIDATED' },
    ],
    nextLabel: 'NEXT CONTRACT AVAILABLE',
    nextTitle: 'The Semantic Crypt',
    nextSub: 'Semantic HTML',
    nextIcon: '⚱️',
  },
}
