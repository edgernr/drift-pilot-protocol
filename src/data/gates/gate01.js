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

// ─── Field Manual (Hunter Browser GUIDE tab) ───────────────────────────────────
// Authoring template for all gates: slug/tag/title/intro + sections (heading,
// body = trusted HTML string, optional code block) + external links that open
// in a real browser tab. Hierarchy: ward hint = nudge for one check, Field
// Manual = the whole lesson, external link = go deep.
const GUIDE = {
  slug: 'document-anatomy',
  tag: 'FM-01',
  title: 'Document Anatomy',
  intro: 'VERA // FIELD MANUAL: every page on the old net was a body — a skeleton of tags holding flesh of text. Broken-markup wraiths are what’s left when that skeleton shatters. Learn the bones and you can snap them back into place.',
  sections: [
    {
      heading: 'The skeleton — how a page is built',
      body: 'An HTML document is a <strong>tree of elements</strong>. The browser reads it top to bottom and builds the page from what it finds: <code>&lt;html&gt;</code> is the root, <code>&lt;head&gt;</code> holds information <em>about</em> the page, <code>&lt;body&gt;</code> holds everything you actually see.',
      code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Page name</title>\n  </head>\n  <body>\n    ...visible content...\n  </body>\n</html>',
    },
    {
      heading: 'The DOCTYPE rune',
      body: 'Line 1, before anything else: <code>&lt;!DOCTYPE html&gt;</code>. It tells the browser to render in <strong>modern standards mode</strong>. Without it the browser falls back to “quirks mode” — ancient, unpredictable layout rules kept alive for pages from the 90s net. One line, never optional.',
    },
    {
      heading: 'Every tag seals shut',
      body: 'Most elements are a pair: an opening tag and a closing tag with a slash — <code>&lt;h1&gt;</code> opens, <code>&lt;/h1&gt;</code> seals. Content lives between them. Leave a tag unsealed and the browser <em>guesses</em> where it ends — usually wrong. (A few “void” elements like <code>&lt;br&gt;</code> and <code>&lt;img&gt;</code> stand alone and never close.)',
      code: '<h1>A sealed heading</h1>\n<p>A sealed paragraph.</p>\n<a href="page.html">A sealed link</a>',
    },
    {
      heading: 'Nesting law — last opened, first closed',
      body: 'Tags close in <strong>reverse order</strong> of how they opened. If <code>&lt;p&gt;</code> opens and then <code>&lt;strong&gt;</code> opens inside it, <code>&lt;/strong&gt;</code> must seal before <code>&lt;/p&gt;</code>. Crossed closings are a nesting violation — a structural wound.',
      code: '✓ <p><strong>correct</strong></p>\n✕ <p><strong>crossed</p></strong>',
    },
    {
      heading: 'Why the browser never screams',
      body: 'Broken HTML shows no error message — browsers have <strong>built-in error correction</strong> and silently repair what they can. That mercy is the trap: the page “works” while the structure underneath is wrong, and every layer you build on top — CSS, JavaScript — inherits the damage. Hunters validate; civilians hope.',
    },
  ],
  links: [
    {
      label: 'MDN — HTML: HyperText Markup Language',
      note: 'developer.mozilla.org · the reference every working dev keeps open',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    },
    {
      label: 'W3Schools — HTML Introduction',
      note: 'w3schools.com · gentler on-ramp with live try-it editors',
      url: 'https://www.w3schools.com/html/html_intro.asp',
    },
    {
      label: 'roadmap.sh — Frontend path',
      note: 'roadmap.sh · the full climb, region by region',
      url: 'https://roadmap.sh/frontend',
    },
  ],
}

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

// ─── Solution (bible rule #6) ───────────────────────────────────────────────────
// The corrected VARIANT 0 document (the solver harness pins variantIdx = 0;
// the other variants share the same four bugs but different copy). No ward
// relies on `win`, so this passes both ArenaShell's synchronous DOMParser path
// (win = null) and the solver's EncounterShell iframe. Ward-by-ward:
//   doctype — <!DOCTYPE html> on line 1 → doc.doctype.name === 'html' and
//             standards mode (compatMode 'CSS1Compat')
//   h1      — literal </h1> now present in the raw code
//   nesting — closes inner-first (</strong></p>): /<\/p>\s*<\/strong>/ no
//             longer matches while </strong> exists
//   anchor  — the trailing <a> becomes </a>, so the parser yields exactly one
//             <a> in <body> with non-empty text

const SOLUTION = `<!DOCTYPE html>
<html>
<head>
  <title>EVA City Emergency Broadcast</title>
</head>
<body>

  <h1>EMERGENCY — Sector Zero</h1>

  <p><strong>All seekers: report to designated shelters immediately.</strong></p>

  <p>This transmission originates from EVA Command.</p>

  <a href="shelter-protocol.html">→ Access Shelter Protocol</a>

</body>
</html>`

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
  guide: GUIDE,
  quiz: QUIZ,
  xpPerWard: 25,
  completionXp: 100,
  shardReward: 250,
  solution: SOLUTION,
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
