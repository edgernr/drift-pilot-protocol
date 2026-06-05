import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UNLOCK_MS = 6 * 60 * 1000
const FALLBACK_HINT = 'AI hints are unavailable right now — re-read the failing check above and try a small change.'

export default function GateAIHint({ code, checks, gateId, lang, done }) {
  const [ready, setReady]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [hint, setHint]       = useState(null)
  const [used, setUsed]       = useState(0)

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setReady(true), UNLOCK_MS)
    return () => clearTimeout(t)
  }, [done])

  async function ask() {
    if (loading || used >= 3) return
    setLoading(true)
    const failing = checks.filter(c => !c.passed).map(c => ({ label: c.label, hint: c.hint }))
    let aiHint = null
    try {
      const { data, error } = await supabase.functions.invoke('ai-hint', {
        body: { code, failing, gateId, lang },
      })
      if (!error && data?.hint) aiHint = data.hint
    } catch {
      aiHint = null
    }
    setLoading(false)
    setHint(aiHint || FALLBACK_HINT)
    setUsed(u => u + 1)
  }

  if (!ready || done) return null

  return (
    <div className="ag-ai">
      {hint ? (
        <div className="ag-ai-panel">
          <div className="ag-ai-head">
            <span className="ag-ai-icon">◈</span>
            <span>CONSTRUCT AI</span>
            <span className="ag-ai-uses">{3 - used} hint{3 - used !== 1 ? 's' : ''} left</span>
          </div>
          <p className="ag-ai-body">{hint}</p>
          {used < 3 && (
            <button className="ag-ai-refresh" onClick={ask} disabled={loading}>
              {loading ? '⟳ thinking…' : '↻ new hint'}
            </button>
          )}
        </div>
      ) : (
        <button className="ag-ai-btn" onClick={ask} disabled={loading}>
          {loading
            ? <><span className="ag-ai-spin">⟳</span> analyzing your code…</>
            : <><span>◈</span> Ask AI — I've been stuck</>
          }
        </button>
      )}
    </div>
  )
}
