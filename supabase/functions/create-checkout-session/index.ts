import Stripe from 'npm:stripe@14'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const { user_id, email } = await req.json()
  if (!user_id) return new Response('Missing user_id', { status: 400, headers: cors })

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

  const session = await stripe.checkout.sessions.create({
    customer_email: email ?? undefined,
    payment_method_types: ['card'],
    line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
    mode: 'subscription',
    success_url: `${Deno.env.get('SITE_URL')}/dashboard?checkout=success`,
    cancel_url: `${Deno.env.get('SITE_URL')}/dashboard`,
    metadata: { user_id },
    subscription_data: { metadata: { user_id } },
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
