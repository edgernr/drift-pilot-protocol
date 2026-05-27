import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ethers } from "npm:ethers@6"

const TOKEN_ADDRESS = "0x60FE1910182602942Bcf297fFF7244f6f4ed8633"
const ABI = ["function burnFrom(address pilot, uint256 amount, string calldata reason) external"]

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS })

  try {
    const { quest_id, reason = "gate_unlock" } = await req.json()
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return new Response("Unauthorized", { status: 401 })

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response("Unauthorized", { status: 401 })

    const { data: profile } = await supabase
      .from("profiles").select("wallet").eq("id", user.id).single()

    if (!profile?.wallet) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_wallet" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )
    const { data: unlock } = await admin
      .from("gate_unlocks")
      .select("drift_cost, chain_burned")
      .eq("user_id", user.id)
      .eq("quest_id", quest_id)
      .single()

    if (!unlock) return new Response("Unlock not found", { status: 404 })
    if (unlock.chain_burned) {
      return new Response(JSON.stringify({ skipped: true, reason: "already_burned" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    const provider = new ethers.JsonRpcProvider(Deno.env.get("ALCHEMY_RPC_URL")!)
    const signer = new ethers.Wallet(Deno.env.get("MINTER_PRIVATE_KEY")!, provider)
    const token = new ethers.Contract(TOKEN_ADDRESS, ABI, signer)

    const tx = await token.burnFrom(
      profile.wallet,
      ethers.parseUnits(String(unlock.drift_cost), 18),
      reason
    )
    await tx.wait()

    await admin
      .from("gate_unlocks")
      .update({ chain_burned: true })
      .eq("user_id", user.id)
      .eq("quest_id", quest_id)

    return new Response(
      JSON.stringify({ success: true, tx: tx.hash }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }
})
