import { Bell, ChevronDown, Command, Menu, Search, Settings2, Sparkles, LogOut, } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

interface TopbarProps { onMenu: () => void }
const pageNames: Record<string, string> = {
  '/': 'Overview', '/projects': 'Projects', '/issues': 'Issues',
  '/repositories': 'Repositories', '/pull-requests': 'Pull requests',
  '/activity': 'Activity', '/settings': 'Settings',
}

export default function Topbar({ onMenu }: TopbarProps) {
  const { refreshUser } = useAuth()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const title = pageNames[location.pathname] ?? 'Workspace'

  async function handleLogout() {
  setLoggingOut(true)

  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    })

    await refreshUser()
    navigate('/login', { replace: true })
  } catch (error) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to sign out. Please try again.',
    )
  } finally {
    setLoggingOut(false)
  }
}

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={20}/></button>
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{title}</strong></div>
      </div>
      <div className="topbar-actions">
        <button className={`search-trigger ${searchOpen ? 'search-trigger-open' : ''}`} onClick={() => setSearchOpen(!searchOpen)}>
          <Search size={16}/><span>Search anything...</span><kbd><Command size={11}/> K</kbd>
        </button>
        <div className="topbar-popover-wrap">
          <button className={`icon-button notification-button ${notificationsOpen ? 'icon-button-selected' : ''}`} aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}>
            <Bell size={18}/><span className="notification-dot"/>
          </button>
          {notificationsOpen && <div className="popover notifications-popover">
            <div className="popover-heading"><strong>Notifications</strong><span className="unread-label">2 new</span></div>
            <div className="notification-item"><div className="notification-icon purple"><GitPullIcon/></div><div><strong>Review requested</strong><p>Ananya requested your review on PR #82.</p><span>12 minutes ago</span></div></div>
            <div className="notification-item"><div className="notification-icon green"><Sparkles size={15}/></div><div><strong>Sprint is on track</strong><p>Your team's sprint progress reached 72%.</p><span>1 hour ago</span></div></div>
            <button className="popover-footer" onClick={() => setNotificationsOpen(false)}>Mark all as read</button>
          </div>}
        </div>
        <div className="topbar-popover-wrap">
          <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="avatar avatar-user">
  {user?.name?.slice(0, 2).toUpperCase()}
</div>
<span className="profile-name">{user?.name}</span><ChevronDown size={14}/>
          </button>
          {profileOpen && <div className="popover profile-popover">
            <div className="profile-popover-head">
  <div className="avatar avatar-user">
    {user?.name?.slice(0, 2).toUpperCase()}
  </div>
  <div>
    <strong>{user?.name}</strong>
    <span>{user?.email}</span>
  </div>
</div>
            <button onClick={() => { setProfileOpen(false); window.location.href = '/settings' }}><Settings2 size={15}/> Account settings</button>
            <button onClick={handleLogout} disabled={loggingOut}>
  <LogOut size={15} />
  {loggingOut ? 'Signing out...' : 'Sign out'}
</button>
          </div>}
        </div>
      </div>
      {searchOpen && <div className="global-search-panel">
        <div className="global-search-input"><Search size={18}/><input autoFocus placeholder="Search projects, issues, repositories..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false) }}/><kbd>ESC</kbd></div>
        <div className="search-panel-label">{query ? `Results for “${query}”` : 'QUICK NAVIGATION'}</div>
        {[
          { label: 'Go to projects', path: '/projects', icon: '◈' },
          { label: 'Browse issues', path: '/issues', icon: '▤' },
          { label: 'Repositories', path: '/repositories', icon: '⌘' },
          { label: 'Pull requests', path: '/pull-requests', icon: '⑂' },
        ].filter(item => !query || item.label.toLowerCase().includes(query.toLowerCase())).map(item => <button key={item.path} className="search-result" onClick={() => { window.location.href = item.path; setSearchOpen(false) }}><span className="search-result-icon">{item.icon}</span>{item.label}<span className="search-enter">↵</span></button>)}
        <div className="search-panel-bottom">Search is currently limited to navigation in this frontend preview.</div>
      </div>}
    </header>
  )
}
function GitPullIcon() {
  return <span style={{fontWeight: 700, fontSize: 16}}>⑂</span>
}
