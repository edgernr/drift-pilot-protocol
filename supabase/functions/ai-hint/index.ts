// ai-hint — returns a nudge (NOT the solution) for a stuck student.
// Client: GateAIHint.jsx invokes with { code, failing, gateId, lang } and reads { hint }.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { code, failing, gateId, lang = 'javascript' } = await req.json()

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const failingList = Array.isArray(failing) ? failing.join('; ') : String(failing ?? 'unknown checks')

    const prompt = `You are a patient coding tutor helping a student who is stuck on a challenge (gate "${gateId}", ${lang}).

The checks they are FAILING: ${failingList}

Their current code:
\`\`\`${lang}
${String(code ?? '').slice(0, 2000)}
\`\`\`

Give ONE short, encouraging hint (max 2 sentences) that points them toward the concept or the line to look at. DO NOT write the solution or give exact code they can paste. Reply with JSON only, no markdown:
{"hint":"..."}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const text: string = data.content?.[0]?.text?.trim() ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    const result = match
      ? JSON.parse(match[0])
      : { hint: 'Re-read the failing check above and focus on the one line it points to.' }

    return new Response(JSON.stringify(result), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
