import { useNav } from '../context/NavigationContext'

export default function RouteTransition() {
  const { loading, target, progress } = useNav()
  return (
    <>
      <div className={`route-progress${loading ? ' loading' : ''}`}>
        <div className="bar" style={{ width: `${progress}%` }} />
      </div>
      <div className={`route-overlay${loading ? ' show' : ''}`}>
        <div className="spinner" />
        <div className="label">
          LOADING <span className="target">{target}</span>
        </div>
      </div>
    </>
  )
}
