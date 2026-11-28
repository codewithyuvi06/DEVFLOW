import { Bell, ChevronDown, Command, Menu, Search, Settings2, Sparkles, LogOut, } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification, } from '../services/notifications'


interface TopbarProps { onMenu: () => void }
const pageNames: Record<string, string> = {
  '/': 'Overview', '/projects': 'Projects', '/issues': 'Issues',
  '/repositories': 'Repositories', '/pull-requests': 'Pull requests',
  '/activity': 'Activity', '/settings': 'Settings','/notifications': 'Notifications',
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [query, setQuery] = useState('')
  const title = pageNames[location.pathname] ?? 'Workspace'
  const unreadCount = notifications.filter(
  (notification) => !notification.read,
).length

  useEffect(() => {

  let active = true

  async function loadNotifications() {
    try {
      setNotificationsLoading(true)
      setNotificationError('')

      const data = await getNotifications()

      if (active) {
        setNotifications(data)
      }
    } catch (err) {
      if (active) {
        setNotificationError(
          err instanceof Error
            ? err.message
            : 'Unable to load notifications.',
        )
      }
    } finally {
      if (active) {
        setNotificationsLoading(false)
      }
    }
  }

  void loadNotifications()

  return () => {
    active = false
  }
}, [notificationsOpen])

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

  async function handleNotificationClick(notification: Notification) {
  try {
    if (!notification.read) {
      await markNotificationRead(notification.id)

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read: true }
            : item,
        ),
      )
    }

    setNotificationsOpen(false)

    if (notification.link) {
      navigate(notification.link)
    }
  } catch (error) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to update notification.',
    )
  }
}

async function handleMarkAllRead() {
  try {
    await markAllNotificationsRead()

    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    )
  } catch (error) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to mark notifications as read.',
    )
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
          <button className={`icon-button notification-button ${notificationsOpen ? 'icon-button-selected' : ''}`} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} onClick={() => setNotificationsOpen(!notificationsOpen)}>
            <Bell size={18} />
{unreadCount > 0 && (
  <span className="notification-dot" />
)}
          </button>
          {notificationsOpen && (
  <div className="popover notifications-popover">
    <div className="popover-heading">
      <strong>Notifications</strong>
      <span className="unread-label">
        {notifications.filter((item) => !item.read).length} new
      </span>
    </div>

    {notificationsLoading ? (
      <div className="notification-item">
        <p>Loading notifications...</p>
      </div>
    ) : notificationError ? (
      <div className="notification-item">
        <p>{notificationError}</p>
      </div>
    ) : notifications.length === 0 ? (
      <div className="notification-item">
        <p>No notifications yet.</p>
      </div>
    ) : (
      notifications.slice(0, 5).map((notification) => (
        <button
          key={notification.id}
          className="notification-item"
          onClick={() => handleNotificationClick(notification)}
          style={{
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            opacity: notification.read ? 0.65 : 1,
          }}
        >
          <div className="notification-icon purple">
            {notification.type === 'review' ? (
              <GitPullIcon />
            ) : (
              <Sparkles size={15} />
            )}
          </div>

          <div>
            <strong>{notification.title}</strong>
            <p>{notification.body}</p>
            <span>
              {new Date(notification.createdAt).toLocaleString()}
            </span>
          </div>
        </button>
      ))
    )}

    {notifications.some((item) => !item.read) && (
      <button
        className="popover-footer"
        onClick={handleMarkAllRead}
      >
        Mark all as read
      </button>
    )}

    <button
      className="popover-footer"
      onClick={() => {
        setNotificationsOpen(false)
        navigate('/notifications')
      }}
    >
      View all notifications
    </button>
  </div>
)}
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
