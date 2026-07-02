import './Daemon.css'

export default function Daemon({ ability, state, animKey }) {
  return (
    <div className="d-outer">
      <div className={`d-body d-${state}`} key={animKey}>
        {state === 'attack' && (
          <div className="d-ability-name">{ability}</div>
        )}
        <svg viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer aura hex */}
          <polygon points="68,50 54,74 26,74 12,50 26,26 54,26" className="d-aura" />

          {/* Main body hex */}
          <polygon points="60,50 50,67 30,67 20,50 30,33 50,33" className="d-hex" />

          {/* Inner body hex */}
          <polygon points="55,50 48,63 32,63 25,50 32,37 48,37" className="d-hex-inner" />

          {/* Head diamond */}
          <polygon points="40,16 51,28 40,34 29,28" className="d-head" />

          {/* Top beam + energy node */}
          <line x1="40" y1="16" x2="40" y2="10" className="d-beam" />
          <circle cx="40" cy="8" r="3" className="d-node-top" />

          {/* Eyes — glow ring + core */}
          <circle cx="34" cy="46" r="4" className="d-eye-glow" />
          <circle cx="34" cy="46" r="2.5" className="d-eye" />
          <circle cx="46" cy="46" r="4" className="d-eye-glow" />
          <circle cx="46" cy="46" r="2.5" className="d-eye" />

          {/* Arms */}
          <polygon points="20,44 4,39 4,57 20,56" className="d-arm" />
          <polygon points="60,44 76,39 76,57 60,56" className="d-arm" />

          {/* Trailing energy traces */}
          <line x1="33" y1="67" x2="28" y2="84" className="d-trace" />
          <line x1="47" y1="67" x2="52" y2="84" className="d-trace" />

          {/* Lower nodes */}
          <circle cx="28" cy="86" r="3" className="d-node" />
          <circle cx="52" cy="86" r="3" className="d-node" />
        </svg>
      </div>
    </div>
  )
}
