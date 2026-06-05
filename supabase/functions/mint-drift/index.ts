import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ethers } from "npm:ethers@6"

const TOKEN_ADDRESS = "0x60FE1910182602942Bcf297fFF7244f6f4ed8633"
const ABI = ["function mintReward(address pilot, uint256 amount) external"]

// MUST match src/context/AuthContext.jsx DRIFT_REWARDS (canonical off-chain values).
const DRIFT_REWARDS: Record<string, number> = {
  "act1-ch01": 250, "act1-ch02": 350, "act1-ch03": 700,
  "act1-ch04": 195, "act1-ch05": 225, "act1-ch06": 400,
  "act1-ch07": 280, "act1-ch08": 400, "act1-ch09": 700, "act1-ch10": 1500,
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS })

  try {
    const { quest_id } = await req.json()
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return new Response("Unauthorized", { status: 401 })

    // Derive user from JWT — client cannot spoof this
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response("Unauthorized", { status: 401 })

    // Get pilot wallet
    const { data: profile } = await supabase
      .from("profiles").select("wallet").eq("id", user.id).single()

    if (!profile?.wallet) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_wallet" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    // Service-role client to read + update without RLS
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )
    const { data: completion } = await admin
      .from("quest_completions")
      .select("xp_earned, chain_minted")
      .eq("user_id", user.id)
      .eq("quest_id", quest_id)
      .single()

    if (!completion) return new Response("Completion not found", { status: 404 })
    if (completion.chain_minted) {
      return new Response(JSON.stringify({ skipped: true, reason: "already_minted" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    // Resolve DRIFT amount server-side — never trust client for this
    let driftAmount: number
    if (DRIFT_REWARDS[quest_id] !== undefined) {
      driftAmount = DRIFT_REWARDS[quest_id]
    } else if (quest_id.startsWith("raid:")) {
      driftAmount = completion.xp_earned ?? 0
    } else {
      return new Response(JSON.stringify({ skipped: true, reason: "unknown_quest" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    if (driftAmount === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "zero_amount" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    // Mint on-chain
    const provider = new ethers.JsonRpcProvider(Deno.env.get("ALCHEMY_RPC_URL")!)
    const signer = new ethers.Wallet(Deno.env.get("MINTER_PRIVATE_KEY")!, provider)
    const token = new ethers.Contract(TOKEN_ADDRESS, ABI, signer)

    const tx = await token.mintReward(profile.wallet, ethers.parseUnits(String(driftAmount), 18))
    await tx.wait()

    await admin
      .from("quest_completions")
      .update({ chain_minted: true })
      .eq("user_id", user.id)
      .eq("quest_id", quest_id)

    return new Response(
      JSON.stringify({ success: true, tx: tx.hash, amount: driftAmount }),
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
