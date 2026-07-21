import './HunterSidebar.css'
import HunterSidebar from './HunterSidebar'

// Wraps a standalone screen with the shared nav rail. Applied at the route level
// in App.jsx so screens (Guild / GuildProfile / PilotProfile) don't need to know
// about the sidebar. The rail renders null for anon users, so public pages stay
// full-width for logged-out visitors.
export default function HunterLayout({ active, children }) {
  return (
    <div className="hs-shell">
      <HunterSidebar active={active} />
      <div className="hs-main">{children}</div>
    </div>
  )
}
