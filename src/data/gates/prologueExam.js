// PROLOGUE · Beat 1 — "EXAM DAY"
// The Association licensing exam, top of the Tower of Hunters (Seoul). The exam IS the
// intro to programming: three one-line wards, each booting the Daemon further.
// No quiz, no completeQuest, no damage sources — this encounter is un-losable.
//
// Written for an ABSOLUTE beginner: the starter code is a numbered walkthrough
// in plain words (no tag syntax inside comments — comments must never be able
// to satisfy a ward), ward hints carry the exact lines to type, and every
// regex-based ward test runs against stripComments(code) so instruction text
// can never pass a check.

// Strip HTML comments before any regex test — instruction comments must never
// satisfy a ward on their own.
const stripComments = (code) => code.replace(/<!--[\s\S]*?-->/g, '')

const STARTER = `<!-- ═════ ASSOCIATION LICENSING TERMINAL · CANDIDATE BUILD ═════ -->
<!-- Proctor's notes. Grey lines like this one are notes. The Gate     -->
<!-- ignores every note line, so nothing here can break your build.    -->
<!-- Type your code on the empty lines BELOW these notes.              -->

<!-- STEP 1 · Declare the document type. A page's very first line of   -->
<!-- real code always declares what it is. Ward 1 on the left panel    -->
<!-- shows the exact line to type — click the ward to open its hint,   -->
<!-- then type that line on the first empty line under these notes.    -->

<!-- STEP 2 · Build the frame. Wrap the page: an opening html tag on   -->
<!-- the line under your STEP 1 line, body tags inside it, and the     -->
<!-- closing html tag on the very last line. Ward 2 lists all four     -->
<!-- exact lines, in order.                                            -->

<!-- STEP 3 · Say it out loud. Between your two body tags, add the     -->
<!-- big heading that reads DAEMON ONLINE. Ward 3 shows the exact      -->
<!-- line to type.                                                     -->

<!-- Each time a ward turns green, press STRIKE. Three strikes pass    -->
<!-- the exam. Begin.                                                  -->

`

const PREVIEW_STYLE = `<style>
  body { background: #08080c; color: #eaf6f5; font-family: system-ui, sans-serif; padding: 24px; }
  h1 { color: #3df0e8; letter-spacing: 0.08em; text-shadow: 0 0 18px rgba(61,240,232,0.5); }
</style>`

const WARDS = [
  {
    id: 'doctype',
    label: '1 · Declare the document — type: <!DOCTYPE html>',
    hint: 'On the first empty line below the grey notes, type this exact line: <!DOCTYPE html> — brackets, exclamation mark and all. It must come before any other code (the notes don’t count — the Gate ignores them). It tells the browser what kind of document it is about to compile.',
    proctor: 'Declaration accepted. Your Daemon boots. See the wireframe? That flicker is you, Hunter.',
    test: (doc) => !!doc.doctype && doc.doctype.name?.toLowerCase() === 'html' && doc.compatMode === 'CSS1Compat',
  },
  {
    id: 'skeleton',
    label: '2 · Build the frame — wrap everything in <html> and <body>',
    hint: 'Wrap everything. On the line under your DOCTYPE, type <html> on its own line. On the next line type <body>. Then close them in reverse: </body> on its own line, and </html> on the very last line. Everything visible on the page lives between <body> and </body>.',
    proctor: 'Structure is armor. The construct has a silhouette now. Most candidates cry at this part.',
    test: (doc, win, code) => {
      const src = stripComments(code)
      return /<html[\s>]/i.test(src) && /<\/html>/i.test(src) &&
        /<body[\s>]/i.test(src) && /<\/body>/i.test(src)
    },
  },
  {
    id: 'declare',
    label: '3 · Speak — <h1>DAEMON ONLINE</h1> inside <body>',
    hint: 'Inside <body> — on a new line between <body> and </body> — type this exact line: <h1>DAEMON ONLINE</h1>. An h1 is the loudest heading a page can shout: a declaration of intent.',
    proctor: 'DAEMON ONLINE. Cast it, candidate — put the drone down and take your license.',
    test: (doc) => {
      const h1 = doc.querySelector('h1')
      return !!h1 && /daemon\s+online/i.test(h1.textContent || '')
    },
  },
]

export default {
  id: 'prologue-exam',
  mode: 'exam',
  title: 'Licensing Exam',
  rank: 'EXAM',
  region: 'TOWER OF HUNTERS · FLOOR 152',
  ability: 'FIRST COMPILE',
  language: 'html',
  commsLabel: 'PROCTOR // ASSOCIATION',
  narrator:
    'Floor 152, golden hour, Seoul a kilometer below the glass — Terminal 7 is yours. Three wards, three strikes, one license. Follow the proctor. Start with ward 1.',
  enemy: {
    name: 'Exam Drone',
    tier: '—',
    lore: 'A chrome Association target dummy. It has never hurt anyone. It never will.',
    svgVariant: 'examDrone',
  },
  starterCode: STARTER,
  buildPreview: (code) => PREVIEW_STYLE + code,
  buildCheckDoc: (code) => code,
  wards: WARDS,
  wardFailIcon: '○',
  scannerLabel: 'EXAM PROTOCOL',
  scannerUnit: 'WARDS',
  script: {
    entry: 'Candidate, Terminal 7. Reality inside a Gate is written in code, so we license in code. Do this first: click ward 1 on the left panel to see the exact line, then type it into the code panel — the moment a ward turns green, your STRIKE button arms. Green ward, then STRIKE. That is the whole exam.',
    wardFixed: 'Ward sealed — your Daemon is charged. Press STRIKE to land the blow.',
    castIdle: 'STRIKE only fires wards that just turned green — nothing new is armed. Click the next numbered ward on the left for the exact code, type it, and STRIKE when it goes green.',
    hits: [
      'First blood — the drone staggers. Ward 1 sealed. Now STEP 2: click ward 2 for the four exact lines, wrap the page in <html> and <body>, and STRIKE.',
      'Structure locked — the construct has a silhouette. One left. STEP 3: click ward 3, type <h1>DAEMON ONLINE</h1> between your <body> tags, and STRIKE.',
      'DAEMON ONLINE. Kill-shot away, candidate.',
    ],
    win: 'Drone down. Clean compile, candidate — provisional Rank E. Congratulations, Hunter.',
  },
  winOverlay: {
    chip: 'EXAM PASSED',
    heading: 'PROVISIONAL RANK E',
    body: 'License pending Association countersign. Daemon registered. Welcome to the top of the world, Hunter.',
    cta: 'ACCEPT LICENSE',
  },
}
