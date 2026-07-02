export const HANDLER_LINES = {
  'SYNTAX PULSE': {
    entry:  "Gate open. The Document Tomb is live. Fix the HTML structure — your Daemon fights with it.",
    low_60: "Daemon taking hits. Check your tag nesting — unclosed tags drag the whole structure down.",
    low_30: "Critical. Find the mismatched brackets before you fall. One error cascades into three.",
  },
  'SEMANTIC STRIKE': {
    entry:  "The Semantic Scanner locks on meaning, not markup. Replace those divs. Give the code purpose.",
    low_60: "Daemon losing cohesion. The scanner wants semantic elements — header, main, nav, section.",
    low_30: "You're bleeding out. Swap the divs for the right elements. The scanner sees everything.",
  },
  'FORM FORGE': {
    entry:  "The Label Eater hunts orphaned inputs. Wire every field or it consumes them.",
    low_60: "Daemon destabilizing. Every input needs a label with a matching `for` attribute.",
    low_30: "Low integrity. Match your `for` values to your `id` values. Exactly. No shortcuts.",
  },
  'PALETTE CAST': {
    entry:  "The Colorless stripped the district bare. Define the token system and cast the palette back.",
    low_60: "Daemon flickering. Make sure your color variables are declared in :root and applied with var().",
    low_30: "Critical integrity. One hardcoded hex in a rule and the whole system fractures. Check everything.",
  },
  'GRAVITY LOCK': {
    entry:  "District in freefall. The Unaligned knocked everything loose. Wire the flex rules — pull it back.",
    low_60: "Daemon destabilizing. The alignment checks are failing — make sure flex is on the right containers.",
    low_30: "Daemon nearly gone. Focus on the remaining float points before the district takes you with it.",
  },
  default: {
    entry:  "Gate active. Your Daemon is compiled. Fight well.",
    low_60: "Your Daemon is taking damage. Read the checks — what does the scanner want that you haven't given it?",
    low_30: "Critical HP. Focus on the remaining checks before your Daemon falls.",
  },
}

export function getHandlerLine(ability, trigger) {
  const set = HANDLER_LINES[ability] || HANDLER_LINES.default
  return set[trigger] || HANDLER_LINES.default[trigger] || ''
}
