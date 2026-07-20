// Cutscene TTS — runtime narration via OpenAI gpt-4o-mini-tts.
// Returns JSON { audio: <base64 mp3>, cached: bool }. Character voice + delivery
// chosen server-side from `voice`. Fixed cutscene lines are cached in a private
// Storage bucket ('tts') keyed by content hash, so each unique line is billed
// ONCE ever — repeat plays (any user) are served free from cache.
//
// DEPLOY (owner):
//   1. supabase secrets set OPENAI_API_KEY=sk-...
//   2. (optional but recommended) create a PRIVATE Storage bucket named `tts`.
//   3. supabase functions deploy tts
// Until deployed, the client falls back to silent (text-only cutscenes).

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')
const SB_URL = Deno.env.get('SUPABASE_URL')
const SB_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const BUCKET = 'tts'
const MODEL = 'gpt-4o-mini-tts'

// character → OpenAI voice + delivery direction
const VOICES: Record<string, { voice: string; instructions: string }> = {
  gorgoroth: {
    voice: 'onyx',
    instructions:
      'An ancient, monstrous titan. Voice pitched very low and slow, guttural and resonant — a predator who is bored, amused, and utterly unhurried. Menace under near-boredom. Let pauses hang.',
  },
  vera: {
    voice: 'sage',
    instructions:
      'A composed Hunter Association comms operative speaking over an encrypted channel. Cool, measured, dry — professional control with quiet care underneath. Clipped but human.',
  },
  proctor: {
    voice: 'echo',
    instructions: 'A clipped, official licensing examiner. Neutral, bureaucratic, precise.',
  },
  narrator: {
    voice: 'ballad',
    instructions: 'Hushed, cinematic narration. Ominous and unhurried, like the cold open of a dark sci-fi film.',
  },
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } })
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function cacheGet(key: string): Promise<ArrayBuffer | null> {
  if (!SB_URL || !SB_SERVICE) return null
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${key}.mp3`, {
      headers: { Authorization: `Bearer ${SB_SERVICE}` },
    })
    return r.ok ? await r.arrayBuffer() : null
  } catch {
    return null
  }
}

async function cachePut(key: string, bytes: ArrayBuffer): Promise<void> {
  if (!SB_URL || !SB_SERVICE) return
  try {
    await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${key}.mp3`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SB_SERVICE}`, 'content-type': 'audio/mpeg', 'x-upsert': 'true' },
      body: bytes,
    })
  } catch { /* cache is best-effort */ }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  let text = ''
  let voice = 'narrator'
  try {
    const body = await req.json()
    text = String(body.text ?? '').trim().slice(0, 600) // hard cap = abuse guard
    voice = String(body.voice ?? 'narrator')
  } catch {
    return json({ error: 'bad body' }, 400)
  }
  if (!text) return json({ error: 'empty text' }, 400)

  const preset = VOICES[voice] ?? VOICES.narrator
  const key = await sha256Hex(`${MODEL}|${preset.voice}|${voice}|${text}`)

  // 1. cache hit → free
  const cached = await cacheGet(key)
  if (cached) return json({ audio: toBase64(cached), cached: true })

  // 2. generate
  if (!OPENAI_KEY) return json({ error: 'tts-not-configured' }, 501)
  let audioBuf: ArrayBuffer
  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        voice: preset.voice,
        input: text,
        instructions: preset.instructions,
        response_format: 'mp3',
      }),
    })
    if (!r.ok) return json({ error: `tts-upstream-${r.status}` }, 502)
    audioBuf = await r.arrayBuffer()
  } catch (e) {
    return json({ error: 'tts-fetch-failed', detail: String(e) }, 502)
  }

  cachePut(key, audioBuf) // fire-and-forget
  return json({ audio: toBase64(audioBuf), cached: false })
})
