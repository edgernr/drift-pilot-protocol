import { useState } from 'react'

/**
 * Click-based block placement canvas.
 * palette: [{ id, label, icon, color, count? }]
 * workspace: [{ id?, label?, placeholder? }]  — initial slots (all empty)
 * onChange: (workspaceState) => void
 */
export default function BlockCanvas({ palette: initPalette, workspace: initWorkspace, onChange }) {
  const [pal, setPal] = useState(() =>
    initPalette.map(b => ({ ...b, avail: b.count ?? 1 }))
  )
  const [ws, setWs] = useState(() =>
    initWorkspace.map((s, i) => ({ id: `sl${i}`, ...s, blockId: null }))
  )
  const [sel, setSel] = useState(null)
  // sel: null | { blockId, from: 'palette'|'workspace', slotId? }

  function block(id) { return pal.find(b => b.id === id) }

  function commit(newWs, newPal) {
    setWs(newWs)
    setPal(newPal)
    onChange?.(newWs)
  }

  function clickPalette(blockId) {
    const b = pal.find(p => p.id === blockId)
    if (!b || b.avail < 1) return
    setSel(s => (s?.blockId === blockId && s.from === 'palette') ? null : { blockId, from: 'palette' })
  }

  function clickSlot(slotId) {
    const idx = ws.findIndex(s => s.id === slotId)
    const slot = ws[idx]

    if (!sel) {
      if (slot.blockId) setSel({ blockId: slot.blockId, from: 'workspace', slotId })
      return
    }

    const newWs  = ws.map(s => ({ ...s }))
    const newPal = pal.map(b => ({ ...b }))

    if (sel.from === 'palette') {
      if (slot.blockId) {
        const pb = newPal.find(b => b.id === slot.blockId)
        if (pb) pb.avail++
      }
      newWs[idx].blockId = sel.blockId
      const pb = newPal.find(b => b.id === sel.blockId)
      if (pb) pb.avail--
    } else {
      const srcIdx = ws.findIndex(s => s.id === sel.slotId)
      const tmp = newWs[srcIdx].blockId
      newWs[srcIdx].blockId = slot.blockId
      newWs[idx].blockId = tmp
    }

    setSel(null)
    commit(newWs, newPal)
  }

  function removeSlot(slotId, e) {
    e?.stopPropagation()
    const idx = ws.findIndex(s => s.id === slotId)
    if (!ws[idx]?.blockId) return
    const newWs  = ws.map(s => ({ ...s }))
    const newPal = pal.map(b => ({ ...b }))
    const pb = newPal.find(b => b.id === newWs[idx].blockId)
    if (pb) pb.avail++
    newWs[idx].blockId = null
    setSel(null)
    commit(newWs, newPal)
  }

  return (
    <div className="bc-root">
      <div className="bc-workspace">
        {ws.map((slot, i) => {
          const b = slot.blockId ? block(slot.blockId) : null
          const isSel = sel?.from === 'workspace' && sel.slotId === slot.id
          const isTarget = sel && !b
          return (
            <div
              key={slot.id}
              className={`bc-slot${b ? ' filled' : ''}${isSel ? ' selected' : ''}${b || sel ? ' clickable' : ''}`}
              onClick={() => (b || sel) && clickSlot(slot.id)}
            >
              <span className="bc-slot-num">{i + 1}</span>
              {slot.label && <span className="bc-slot-lbl">{slot.label}</span>}
              {b ? (
                <>
                  <span className="bc-slot-icon">{b.icon}</span>
                  <span className="bc-slot-name" style={{ color: b.color }}>{b.label}</span>
                  <button className="bc-remove" onClick={e => removeSlot(slot.id, e)}>✕</button>
                </>
              ) : (
                <span className="bc-placeholder" style={{ color: isTarget ? 'var(--teal)' : undefined }}>
                  {isTarget ? '← click to place' : (slot.placeholder ?? 'Select a block below, then click here')}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="bc-palette">
        <div className="bc-pal-label">Blocks</div>
        {pal.map(b => {
          const isSel  = sel?.blockId === b.id && sel.from === 'palette'
          const used   = b.avail < 1
          return (
            <button
              key={b.id}
              className={`bc-block${isSel ? ' selected' : ''}${used ? '' : ''}`}
              style={{ '--bc': b.color }}
              onClick={() => clickPalette(b.id)}
              disabled={used}
            >
              <span className="bc-block-icon">{b.icon}</span>
              <span className="bc-block-name">{b.label}</span>
              {(b.count ?? 1) > 1 && <span className="bc-block-cnt">×{b.avail}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
