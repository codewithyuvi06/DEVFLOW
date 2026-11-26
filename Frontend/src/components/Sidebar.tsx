import { NavLink } from 'react-router-dom'
import { Activity, BarChart3, Bell, Boxes, ChevronDown, CircleHelp, Code2, Command, GitPullRequest, LayoutDashboard, Settings2, ShieldCheck, SquareKanban, X } from 'lucide-react'

const primaryLinks = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Boxes, count: '4' },
  { to: '/issues', label: 'Issues', icon: SquareKanban, count: '7' },
  { to: '/repositories', label: 'Repositories', icon: Code2 },
  { to: '/pull-requests', label: 'Pull requests', icon: GitPullRequest, count: '4' },
  { to: '/activity', label: 'Activity', icon: Activity },
]
const workspaceLinks = [
  { to: '/settings', label: 'Settings', icon: Settings2 },
]

interface SidebarProps { open: boolean; onClose: () => void }

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Command size={20} strokeWidth={2.5} /></div>
          <div className="brand-wordmark">DEV<span>FLOW</span><small>DEVELOPER WORKSPACE</small></div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Close sidebar"><X size={18}/></button>
        </div>

        <button className="workspace-switcher">
          <div className="workspace-avatar">S</div>
          <div className="workspace-copy"><strong>Stark Industries</strong><span>Free workspace</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </button>

        <div className="nav-section-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {primaryLinks.map(({ to, label, icon: Icon, count }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="nav-section-label nav-label-spaced">MANAGE</div>
        <nav className="sidebar-nav">
          {workspaceLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="upgrade-card">
          <div className="upgrade-icon"><ShieldCheck size={17}/></div>
          <strong>Make your workflow flow.</strong>
          <p>Bring your team, code, and projects together.</p>
          <button onClick={() => window.alert('Workspace plans will be available when billing is connected.')}>Explore workspace <span>↗</span></button>
          <div className="upgrade-glow" />
        </div>
        <button className="help-link" onClick={() => window.alert('Help center will be connected in a future release.')}><CircleHelp size={17}/><span>Help & support</span><span className="help-shortcut">?</span></button>
        <div className="sidebar-footer"><span className="status-dot" /> All systems operational <span className="footer-version">v0.1.0</span></div>
      </aside>
    </>
  )
}
