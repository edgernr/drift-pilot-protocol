const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { description, user_name, view, url, screenshot_url, created_at } = await req.json()

    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'DISCORD_WEBHOOK_URL not set' }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const embed: Record<string, unknown> = {
      title: '🐛 Bug Report',
      description,
      color: 0xe84393,
      fields: [
        { name: 'Pilot', value: user_name ?? 'Unknown', inline: true },
        { name: 'View', value: view ?? '—', inline: true },
        { name: 'Page', value: url ?? '—', inline: false },
      ],
      timestamp: created_at ?? new Date().toISOString(),
      footer: { text: 'Drift Pilot Protocol' },
    }

    if (screenshot_url) embed.image = { url: screenshot_url }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
