const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { description, user_name, view, url, screenshot_base64, created_at } = await req.json()

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
        { name: 'Seeker', value: user_name ?? 'Unknown', inline: true },
        { name: 'View', value: view ?? '—', inline: true },
        { name: 'Page', value: url ?? '—', inline: false },
      ],
      timestamp: created_at ?? new Date().toISOString(),
      footer: { text: 'Void Shards' },
    }

    if (screenshot_base64) {
      const [header, data] = screenshot_base64.split(',')
      const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/png'
      const ext = mime.split('/')[1] ?? 'png'
      const binary = atob(data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

      embed.image = { url: `attachment://screenshot.${ext}` }

      const form = new FormData()
      form.append('payload_json', JSON.stringify({ embeds: [embed] }))
      form.append('file[0]', new Blob([bytes], { type: mime }), `screenshot.${ext}`)

      await fetch(webhookUrl, { method: 'POST', body: form })
    } else {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
