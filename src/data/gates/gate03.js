const VARIANTS = [
  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Citizen Registration</title>
</head>
<body>

<!--
  BUILD: EVA CITY CITIZEN REGISTRATION FORM
  The Label Eater feeds on inputs without identity.
  Starve it by satisfying all 10 scanner conditions:

  1. Wrap everything in a <form>
  2. Name field: <input type="text"> with id + <label for="...">
  3. Email field: <input type="email"> with id + <label for="...">
  4. Sector: <select> with <option> children + <label for="...">
  5. Access level: at least 2 <input type="radio"> sharing a name
  6. Message: <textarea> with id + <label for="...">
  7. Labels: at least 3 <label for="..."> elements
  8. IDs: at least 3 inputs with matching id attributes
  9. Required: name and email have the required attribute
  10. Submit: a real <button> — not a <div>, not styled text
-->

</body>
</html>`,

  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Mission Request</title>
</head>
<body>

<!--
  BUILD: EVA CITY MISSION REQUEST FORM
  The Label Eater feeds on inputs without identity.
  Starve it by satisfying all 10 scanner conditions:

  1. Wrap everything in a <form>
  2. Seeker name: <input type="text"> with id + <label for="...">
  3. Contact email: <input type="email"> with id + <label for="...">
  4. Mission type: <select> with <option> children + <label for="...">
  5. Priority level: at least 2 <input type="radio"> sharing a name
  6. Briefing notes: <textarea> with id + <label for="...">
  7. Labels: at least 3 <label for="..."> elements
  8. IDs: at least 3 inputs with matching id attributes
  9. Required: name and email have the required attribute
  10. Submit: a real <button> — not a <div>, not styled text
-->

</body>
</html>`,

  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Sector Access Application</title>
</head>
<body>

<!--
  BUILD: SECTOR ACCESS APPLICATION FORM
  The Label Eater feeds on inputs without identity.
  Starve it by satisfying all 10 scanner conditions:

  1. Wrap everything in a <form>
  2. Applicant name: <input type="text"> with id + <label for="...">
  3. Applicant email: <input type="email"> with id + <label for="...">
  4. Sector: <select> with <option> children + <label for="...">
  5. Clearance level: at least 2 <input type="radio"> sharing a name
  6. Reason for access: <textarea> with id + <label for="...">
  7. Labels: at least 3 <label for="..."> elements
  8. IDs: at least 3 inputs with matching id attributes
  9. Required: name and email have the required attribute
  10. Submit: a real <button> — not a <div>, not styled text
-->

</body>
</html>`,
]

const PREVIEW_STYLE = `<style>
  html { font-size: 9px; overflow: hidden; }
  body { margin: 0; padding: 5px 7px; background: #0c0810; color: #c0a8b8; font-family: 'Courier New', monospace; font-size: 1.05rem; line-height: 1.4; }
  form { display: flex; flex-direction: column; gap: 3px; }
  label { color: #906880; font-size: 0.9rem; display: block; }
  input, select, textarea { background: #1a1020; border: 1px solid #3a1e30; color: #d0b0c0; padding: 2px 3px; font-size: 0.9rem; width: 100%; box-sizing: border-box; font-family: inherit; }
  textarea { height: 18px; resize: none; }
  input[type="radio"] { width: auto; display: inline; margin-right: 3px; }
  fieldset { border: 1px solid #3a1e30; padding: 2px 4px; margin: 1px 0; }
  legend { color: #906880; font-size: 0.85rem; }
  button { background: oklch(0.28 0.1 25); border: 1px solid oklch(0.55 0.22 25); color: oklch(0.85 0.12 25); padding: 2px 8px; font-size: 0.9rem; cursor: pointer; margin-top: 2px; font-family: inherit; }
  select option { background: #1a1020; }
</style>`

const WARDS = [
  { id: 'form', label: 'Registration wrapped in <form>', hint: 'All input controls that work together to collect and send data must live inside a dedicated container element. Without it, submission has nowhere to go.', test: (doc) => !!doc.querySelector('form') },
  { id: 'text', label: 'Name: <input type="text">', hint: 'For a field that collects a short typed response, the input\'s type attribute has a specific value. What single word describes plain, unformatted text?', test: (doc) => !!doc.querySelector('input[type="text" i]') },
  { id: 'email', label: 'Email: <input type="email">', hint: 'Using the right input type for an email address does more than just collect text — it tells the browser the expected format so it can validate it automatically.', test: (doc) => !!doc.querySelector('input[type="email" i]') },
  { id: 'select', label: 'Sector: <select> with <option>s', hint: 'When a user picks from a fixed list, two elements work together: a container that creates the dropdown, and child elements that each define one choice.', test: (doc) => { const sel = doc.querySelector('select'); return !!sel && sel.querySelectorAll('option').length > 0 } },
  { id: 'radio', label: 'Access level: <input type="radio">', hint: 'When only one option in a group can be selected at a time, all the inputs in that group share the same name attribute. The input type is a small circular selector.', test: (doc) => doc.querySelectorAll('input[type="radio" i]').length >= 2 },
  { id: 'textarea', label: 'Message: <textarea>', hint: 'A field that accepts multiple lines of free-form text requires a completely different element — not a variation of input. It has its own opening and closing tags.', test: (doc) => !!doc.querySelector('textarea') },
  { id: 'labels', label: 'Inputs labeled: <label for="...">', hint: 'Every input needs a visible label connected to it — not just placed next to it. The connection is made by matching an attribute on the label to an attribute on the input.', test: (doc) => doc.querySelectorAll('label[for]').length >= 3 },
  { id: 'ids', label: 'Inputs have id attributes', hint: 'For a label to connect to its input, the input needs a unique identifier attribute. The label\'s "for" attribute must contain the exact same value to complete the link.', test: (doc) => doc.querySelectorAll('input[id], select[id], textarea[id]').length >= 3 },
  { id: 'required', label: 'Critical fields marked required', hint: 'Fields that must not be submitted empty can be enforced directly in HTML — no JavaScript needed. There\'s a single boolean attribute that activates native browser validation on an input.', test: (doc) => doc.querySelectorAll('input[required], select[required], textarea[required]').length >= 2 },
  { id: 'button', label: 'Submit is a real <button>', hint: 'The control that triggers submission should be a native interactive element with a type attribute that tells the browser its role. A styled div has no submission behaviour.', test: (doc) => !!doc.querySelector('button') },
]

const QUIZ = {
  question: 'What happens if a <label for="name"> exists but the input has id="username"?',
  options: [
    'The label won\'t focus the input when clicked — they\'re disconnected',
    'The browser automatically matches labels to inputs by their position',
    'The form will refuse to submit until the mismatch is resolved',
    'The label text becomes invisible to screen readers',
  ],
  correct: 0,
}

export default {
  id: 'gate03',
  gateNum: 3,
  title: 'The Form Gate',
  rank: 'D',
  region: 'THE FOUNDRY',
  questId: 'act1-ch03',
  nextGate: 'quest4',
  ability: 'FORM FORGE',
  language: 'html',
  narrator: 'The archive\'s registry hall. Something has been eating the records. Mara\'s carving: "boss. feed it labels. go." The Label Eater devours any unlabeled input — attacking with bare fields heals it. Pair every input with a proper label. Starve it.',
  enemy: { name: 'The Label Eater', tier: 'BOSS', lore: 'A horror that feeds on inputs without identity. Every unlabeled field is a meal. Every mismatched for="" attribute restores its strength. Starve it with perfect form structure.', svgVariant: 3 },
  variants: VARIANTS,
  buildPreview: (code) => PREVIEW_STYLE + code,
  buildCheckDoc: (code) => PREVIEW_STYLE + code,
  wards: WARDS,
  wardFailIcon: '×',
  scannerLabel: 'FORM SCANNER',
  scannerUnit: 'WOUNDS',
  quiz: QUIZ,
  xpPerWard: 30,
  completionXp: 300,
  shardReward: 700,
  aiTitle: 'Gate 03 — The Form Gate',
  aiRequirements: 'Build a complete HTML form with all required elements: form wrapper, text/email inputs, select with options, radio buttons, textarea, all inputs properly labeled with matching for="" and id="" attributes, required attributes on critical fields, and a submit button.',
  completion: {
    entryLabel: 'Label Eater — Defeated',
    icon: '⚗️',
    chip: 'BOSS DEFEATED',
    heading: 'The Label Eater collapses.',
    body: 'It couldn\'t find a single unlabeled input to feed on. Every field had identity. Every type was correct. <strong>The dungeon had nothing left to consume.</strong>',
    rewards: [
      { label: '$SHARD EARNED', value: '+700' },
      { label: 'XP GAINED', value: '+300' },
      { label: 'CORE', value: 'Label Eater Core' },
      { label: 'RANK', value: 'D License' },
    ],
    nextLabel: 'GATE 04 UNLOCKED',
    nextTitle: 'Gate 04 — Paint the City',
    nextSub: 'CSS Design Systems',
    nextIcon: '🎨',
  },
}
