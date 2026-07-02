const VARIANTS = [
  `<!DOCTYPE html>
<html lang="en">
<head><title>Sector Zero District</title></head>
<body>
<div class="site-header">
  <a href="#">Sector Zero</a>
  <div class="site-nav"><a href="#">Status</a><a href="#">Systems</a><a href="#">Alerts</a></div>
</div>
<div class="page-main">
  <div class="lead-story"><h2>Sector Status Report</h2><p>All systems nominal as of 06:44 UTC.</p></div>
  <div class="history-block"><h3>System History</h3><p>No critical events in the last 30 days.</p></div>
  <div class="page-sidebar"><p>Uptime: 99.2%</p></div>
  <div class="blueprint-block"><img alt="sector diagram"/><div class="blueprint-caption">Sector Zero layout — last updated cycle 44.</div></div>
</div>
<div class="page-footer"><p>EVA Command &copy; Cycle 2187</p></div>
</body>
</html>`,

  `<!DOCTYPE html>
<html lang="en">
<head><title>Command Centre Archives</title></head>
<body>
<div class="cmd-header">
  <a href="#">Command Centre</a>
  <div class="cmd-nav"><a href="#">Operations</a><a href="#">Intel</a><a href="#">Deploy</a></div>
</div>
<div class="cmd-main">
  <div class="briefing-block"><h2>Active Mission Brief</h2><p>Op Phoenix underway. Team Alpha deployed.</p></div>
  <div class="archive-block"><h3>Mission Archive</h3><p>Op Gridlock concluded successfully last cycle.</p></div>
  <div class="intel-sidebar"><p>Intel clearance required for full access.</p></div>
  <div class="schematic-block"><img alt="mission map"/><div class="schematic-caption">Op Phoenix deployment map — classified.</div></div>
</div>
<div class="cmd-footer"><p>Command Centre &copy; Cycle 2187</p></div>
</body>
</html>`,

  `<!DOCTYPE html>
<html lang="en">
<head><title>Reactor Grid Station</title></head>
<body>
<div class="reactor-header">
  <a href="#">Reactor Grid</a>
  <div class="reactor-nav"><a href="#">Cores</a><a href="#">Cooling</a><a href="#">Alerts</a></div>
</div>
<div class="reactor-main">
  <div class="status-block"><h2>Core Status</h2><p>All three reactor cores operational at 100%.</p></div>
  <div class="log-block"><h3>System Log</h3><p>Last inspection 6 hours ago. No anomalies detected.</p></div>
  <div class="specs-sidebar"><p>Containment field: 98%. Coolant: 18°C nominal.</p></div>
  <div class="diagram-block"><img alt="reactor diagram"/><div class="diagram-caption">Reactor Grid schematic — updated cycle 44.</div></div>
</div>
<div class="reactor-footer"><p>Reactor Grid &copy; Cycle 2187</p></div>
</body>
</html>`,
]

const PREVIEW_STYLE = `<style>
  html { font-size: 9px; overflow: hidden; }
  body { margin: 0; padding: 0; background: #080c14; color: #a0b0c0; font-family: 'Courier New', monospace; font-size: 1.1rem; line-height: 1.4; }
  header, .site-header, .cmd-header, .reactor-header { display: block; background: #0c1018; padding: 3px 6px; border-bottom: 1px solid #1e2a38; }
  nav, .site-nav, .cmd-nav, .reactor-nav { display: flex; gap: 8px; }
  nav a, .site-nav a, .cmd-nav a, .reactor-nav a { color: #5878b0; font-size: 0.9rem; text-decoration: none; }
  main, .page-main, .cmd-main, .reactor-main { display: block; padding: 5px 6px; }
  article, .lead-story, .briefing-block, .status-block { border-left: 2px solid #3858a0; padding: 3px 5px; margin-bottom: 4px; }
  section, .history-block, .archive-block, .log-block { padding: 3px 5px; margin-bottom: 3px; border-bottom: 1px solid #1a2030; }
  aside, .page-sidebar, .intel-sidebar, .specs-sidebar { background: #0a0e14; border: 1px solid #1e2a38; padding: 3px 5px; margin-bottom: 3px; font-size: 0.9rem; }
  figure, .blueprint-block, .schematic-block, .diagram-block { margin: 2px 0; padding: 3px 5px; background: #090c12; }
  figcaption, .blueprint-caption, .schematic-caption, .diagram-caption { font-size: 0.85rem; color: #4860a0; font-style: italic; }
  footer, .page-footer, .cmd-footer, .reactor-footer { background: #0c1018; border-top: 1px solid #1e2a38; padding: 3px 6px; font-size: 0.85rem; color: #405060; }
  h2 { font-size: 1.15rem; margin: 0 0 2px; color: #c0d0e0; }
  h3 { font-size: 1rem; margin: 0 0 2px; color: #90a8c0; }
  p { margin: 1px 0; }
  img { display: none; }
</style>`

const WARDS = [
  { id: 'header', label: 'Site banner → <header>', hint: 'The topmost band of the page — the one that contains the site name and main navigation — has a dedicated semantic element. It wraps content that appears at the top of every page.', test: (doc) => { const el = doc.querySelector('header'); return !!el && !!el.querySelector('a') } },
  { id: 'nav', label: 'Link group → <nav>', hint: 'A group of navigation links has its own semantic element. It signals to browsers and screen readers that the links inside form the site\'s primary navigation.', test: (doc) => { const el = doc.querySelector('nav'); return !!el && el.querySelectorAll('a').length >= 2 } },
  { id: 'main', label: 'Primary content → <main>', hint: 'The central region of the page — the content that changes from page to page, distinct from header/footer/nav — has a semantic container element. A page should have exactly one.', test: (doc) => { const els = doc.querySelectorAll('main'); return els.length === 1 && els[0].children.length > 0 } },
  { id: 'article', label: 'Lead story → <article>', hint: 'A self-contained piece of content that could stand alone — a news story, a report, a blog post — has its own semantic element. It should contain a heading.', test: (doc) => { const el = doc.querySelector('article'); return !!el && !!el.querySelector('h1, h2, h3') } },
  { id: 'section', label: 'History block → <section>', hint: 'A thematic grouping of content — not a standalone article, but a distinct section within a larger piece — has a semantic container. It should also contain a heading.', test: (doc) => { const el = doc.querySelector('section'); return !!el && !!el.querySelector('h1, h2, h3') } },
  { id: 'aside', label: 'Sidebar → <aside>', hint: 'Content that is tangentially related to the main content — a sidebar, pull quote, or supplementary info — has a semantic element that marks it as secondary.', test: (doc) => { const el = doc.querySelector('aside'); return !!el && el.children.length > 0 } },
  { id: 'figure', label: 'Blueprint block → <figure> + <figcaption>', hint: 'An image, diagram, or illustration paired with a caption has a two-element semantic structure: one wraps the visual content, the other wraps the descriptive text.', test: (doc) => { const fig = doc.querySelector('figure'); return !!fig && !!fig.querySelector('figcaption') } },
  { id: 'footer', label: 'Page footer → <footer>', hint: 'The bottom band of the page — copyright, contact, legal links — has a semantic element that mirrors the header. It marks content that closes the page.', test: (doc) => { const el = doc.querySelector('footer'); return !!el && (el.textContent || '').trim().length > 0 } },
]

const QUIZ = {
  question: 'What is the main benefit of using <article> instead of <div> for the lead story?',
  options: [
    'The browser and screen readers understand the content is self-contained and meaningful without the surrounding page context',
    'It automatically applies bolder text styling to the enclosed heading',
    'Search engines ignore divs but index article elements for featured snippets',
    'It prevents the section from collapsing in older browsers',
  ],
  correct: 0,
}

export default {
  id: 'gate02',
  gateNum: 2,
  title: 'The Semantic Crypt',
  rank: 'E',
  region: 'THE FOUNDRY',
  questId: 'act1-ch02',
  nextGate: 'quest3',
  ability: 'SEMANTIC STRIKE',
  language: 'html',
  narrator: 'Rows of identical, faceless figures — the Void strips meaning first. Mara\'s carving: "the scary ones are just wearing masks. name them." The Faceless has no weak points because every element is a meaningless div. Replace them with their true identities. Naming reveals. Sloppy naming punishes.',
  enemy: { name: 'The Faceless', tier: 'E', lore: 'A page built entirely of divs. Without semantic identity, it has no weak points — nothing to target. Name the elements and they become vulnerable.', svgVariant: 2 },
  variants: VARIANTS,
  buildPreview: (code) => PREVIEW_STYLE + code,
  buildCheckDoc: (code) => PREVIEW_STYLE + code,
  wards: WARDS,
  wardFailIcon: '?',
  scannerLabel: 'IDENTITY SCANNER',
  scannerUnit: 'UNIDENTIFIED',
  quiz: QUIZ,
  xpPerWard: 25,
  completionXp: 200,
  shardReward: 350,
  aiTitle: 'Gate 02 — The Semantic Crypt',
  aiRequirements: 'Replace all generic divs with correct semantic HTML5 elements: header, nav, main, section, article, aside, footer, figure, figcaption. Semantic structure must be meaningful and complete.',
  completion: {
    entryLabel: 'Gate 02 — Cleared',
    icon: '📜',
    chip: 'GATE CLEARED',
    heading: 'The Crypt yields.',
    body: 'The divs fell. The elements rose. The dungeon cannot consume what has identity. <strong>What you cannot see is more real than what you can.</strong>',
    rewards: [
      { label: '$SHARD EARNED', value: '+350' },
      { label: 'XP GAINED', value: '+200' },
      { label: 'CORE', value: 'Semantic Core' },
      { label: 'FRAGMENT', value: 'Identity Fragment' },
    ],
    nextLabel: 'NEXT GATE UNLOCKED',
    nextTitle: 'The Form Gate',
    nextSub: 'HTML Forms · Boss Gate',
    nextIcon: '📋',
  },
}
