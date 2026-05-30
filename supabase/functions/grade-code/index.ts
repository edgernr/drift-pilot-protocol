const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { code, quest_title, requirements, language = 'javascript' } = await req.json()

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const prompt = `You are grading a code challenge. Be strict but fair. Accept any correct approach — multiple valid solutions exist.

Challenge: ${quest_title}
Requirements: ${requirements}
Language: ${language}

Code submitted:
\`\`\`${language}
${code.slice(0, 2000)}
\`\`\`

Reply with JSON only (no markdown, no extra text):
{"passed":true,"score":85,"feedback":"One or two sentences of specific, actionable feedback about this solution."}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const text: string = data.content?.[0]?.text?.trim() ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    const result = match
      ? JSON.parse(match[0])
      : { passed: false, score: 0, feedback: 'Could not parse grade. Try again.' }

    return new Response(JSON.stringify(result), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
