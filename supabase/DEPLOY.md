# Supabase Edge Functions — deploy & secrets

All functions live in `eva-react/supabase/functions/`. The app calls them fire-and-forget with **graceful fallbacks**, so **none are strictly required** for a friendly test round — deploy the ones whose feature you want live.

> `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically into every Edge Function by Supabase — you do **not** set those. Only the third-party secrets below.

## Functions, what they power, and required secrets

| Function | Powers | Secrets you must set | Needed for test? |
|---|---|---|---|
| `grade-code` | In-gate AI code review (11 call sites) | `ANTHROPIC_API_KEY` | Recommended |
| `ai-hint` | "Ask AI" stuck-hint button | `ANTHROPIC_API_KEY` | Recommended |
| `notify-discord` | Admin Discord ping on bug reports | `DISCORD_WEBHOOK_URL` | Optional |
| `mint-drift` | On-chain $DRIFT mint on gate complete | `ALCHEMY_RPC_URL`, `MINTER_PRIVATE_KEY` | Optional (Sepolia) |
| `burn-drift` | On-chain $DRIFT burn on gate unlock / raid entry | `ALCHEMY_RPC_URL`, `MINTER_PRIVATE_KEY` | Optional |
| `create-checkout-session` | Start Stripe Season Pass checkout | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `SITE_URL` | Only if billing live |
| `verify-checkout` | Confirm checkout → set `is_subscribed` | `STRIPE_SECRET_KEY` | Only if billing live |
| `stripe-webhook` | Subscription lifecycle → `is_subscribed` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Only if billing live |

## Set secrets
```bash
cd eva-react
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
# on-chain (optional):
supabase secrets set ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/... MINTER_PRIVATE_KEY=0x...
# Stripe (optional, only if enabling billing):
supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_PRICE_ID=price_... SITE_URL=https://your-app.com STRIPE_WEBHOOK_SECRET=whsec_...
```

## Deploy
```bash
cd eva-react
supabase functions deploy grade-code
supabase functions deploy ai-hint
supabase functions deploy notify-discord
supabase functions deploy mint-drift
supabase functions deploy burn-drift
supabase functions deploy create-checkout-session
supabase functions deploy verify-checkout
supabase functions deploy stripe-webhook
```

## Known follow-ups
- **`create-checkout-session` uses a single `STRIPE_PRICE_ID`.** The pricing page now has two plans (Monthly $9.99 / Season $24.99). To sell both, pass a plan/price id from the client and map it server-side. Until then, only the one configured price checks out. (Not blocking — checkout shows "unavailable" if unconfigured.)
- **`mint-drift`/`burn-drift` require `chain_minted` (quest_completions) and `chain_burned` (gate_unlocks) columns** — provisioned by `pretest_setup.sql`.
- `mint-drift`'s `DRIFT_REWARDS` map is kept in sync with `src/context/AuthContext.jsx` — update both together.
- The `TOKEN_ADDRESS` in `mint-drift`/`burn-drift` is a Sepolia testnet contract — there is no mainnet $DRIFT token.

> The old `/media/sf_EVA/supabase/functions/{ai-hint,discord-notify}` dirs at the repo root are stale (pre-rename); the live functions are the ones under `eva-react/supabase/functions/`.
