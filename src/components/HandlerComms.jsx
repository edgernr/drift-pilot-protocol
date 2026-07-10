import './HandlerComms.css'

export default function HandlerComms({ message }) {
  if (!message) return null
  return (
    <div className="hc-panel">
      <div className="hc-header">
        <span className="hc-dot" />
        <span className="hc-label">HANDLER // VERA</span>
        <span className="hc-signal">● ENCRYPTED</span>
      </div>
      <div className="hc-message">{message}</div>
    </div>
  )
}
